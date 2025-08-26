import { useState, useEffect } from "react";
import { Wallet, BarChart3, TrendingUp, TrendingDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabaseService, Income, Expense } from "@/services/supabaseService";
import { FlexibleIncomeForm } from "@/components/FlexibleIncomeForm";
import { FlexibleExpenseForm } from "@/components/FlexibleExpenseForm";
import { FinanceSummary } from "@/components/FinanceSummary";
import { MonthlyBalance } from "@/components/MonthlyBalance";
import { ExpenseAnalytics } from "@/components/ExpenseAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, createProfile, hasProfile } = useUserProfile();

  // Load user data when profile exists
  useEffect(() => {
    if (!hasProfile) {
      setIncomes([]);
      setExpenses([]);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const [incomesData, expensesData] = await Promise.all([
          supabaseService.getUserIncomes(),
          supabaseService.getUserExpenses()
        ]);
        
        console.log('Loaded incomes:', incomesData);
        console.log('Loaded expenses:', expensesData);
        
        setIncomes(incomesData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Waduh! 😅",
          description: "Gagal memuat data keuangan nih",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [hasProfile, toast]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setIsCreatingProfile(true);
    try {
      await createProfile(profileName.trim());
      setProfileName("");
    } catch (error) {
      // Error handled in useUserProfile
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleAddIncome = async (incomeData: { month: string; month_name: string; salary: number }) => {
    if (!incomeData.month || !incomeData.month_name || incomeData.salary <= 0) {
      toast({
        title: "Waduh! 😅",
        description: "Data pendapatan tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      const newIncome = await supabaseService.createIncome(incomeData);
      setIncomes(prev => [newIncome, ...prev]);
      
      toast({
        title: "Mantap! 💰",
        description: `Pendapatan ${incomeData.month_name} berhasil ditambah!`,
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal nambahin pendapatan nih",
        variant: "destructive"
      });
    }
  };

  const handleAddExpense = async (expenseData: { month: string; month_name: string; expense_items: Array<{ label: string; amount: number }> }) => {
    if (!expenseData.month || !expenseData.month_name || !expenseData.expense_items.length) {
      toast({
        title: "Waduh! 😅",
        description: "Data pengeluaran tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      const total_expenses = expenseData.expense_items.reduce((sum, item) => sum + item.amount, 0);
      
      const newExpense = await supabaseService.createExpense({
        month: expenseData.month,
        month_name: expenseData.month_name,
        total_expenses
      });

      // Add expense items
      const expenseItems = expenseData.expense_items.map(item => ({
        expense_id: newExpense.id,
        label: item.label,
        amount: item.amount
      }));

      await supabaseService.createExpenseItems(expenseItems);

      // Reload expenses to get the complete data with items
      const updatedExpenses = await supabaseService.getUserExpenses();
      setExpenses(updatedExpenses);
      
      toast({
        title: "Sip! 📝",
        description: `Pengeluaran ${expenseData.month_name} berhasil ditambah!`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal nambahin pengeluaran nih",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIncome = async (id: string, updates: Partial<Income>) => {
    if (!id) {
      toast({
        title: "Error! 😔",
        description: "ID pendapatan tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.updateIncome(id, updates);
      
      // Reload data to get fresh state
      const updatedIncomes = await supabaseService.getUserIncomes();
      setIncomes(updatedIncomes);
      
      toast({
        title: "Oke sip! 👍",
        description: "Pendapatan berhasil diupdate!",
      });
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal update pendapatan nih",
        variant: "destructive"
      });
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>, expenseItems?: Array<{ label: string; amount: number }>) => {
    if (!id) {
      toast({
        title: "Error! 😔",
        description: "ID pengeluaran tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.updateExpense(id, updates);
      
      // Update expense items if provided
      if (expenseItems) {
        await supabaseService.updateExpenseItems(id, expenseItems);
      }
      
      // Reload data to get fresh state
      const updatedExpenses = await supabaseService.getUserExpenses();
      setExpenses(updatedExpenses);
      
      toast({
        title: "Oke sip! 👍",
        description: "Pengeluaran berhasil diupdate!",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal update pengeluaran nih",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!id) {
      toast({
        title: "Error! 😔",
        description: "ID pendapatan tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.deleteIncome(id);
      setIncomes(prev => prev.filter(income => income.id !== id));
      
      toast({
        title: "Oke deh! 🗑️",
        description: "Pendapatan berhasil dihapus!",
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal hapus pendapatan nih",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!id) {
      toast({
        title: "Error! 😔",
        description: "ID pengeluaran tidak valid!",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: "Oke deh! 🗑️",
        description: "Pengeluaran berhasil dihapus!",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Waduh! 😅",
        description: "Gagal hapus pengeluaran nih",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show profile creation form if user doesn't have a profile yet
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  💰 CuanTracker
                </CardTitle>
                <CardDescription>
                  Halo {user?.email}! Yuk buat profil dulu
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Nama Profil</Label>
                <Input
                  id="profile-name"
                  placeholder="Misal: John Doe"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreatingProfile || !profileName.trim()}
              >
                {isCreatingProfile ? "Tunggu sebentar..." : "Buat Profil! 🎉"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-primary p-3 rounded-xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                CuanTracker
              </h1>
              <p className="text-sm text-muted-foreground">
                Halo {profile?.name}! 👋
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
              <User className="h-4 w-4" />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Tunggu sebentar ya...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FinanceSummary incomes={incomes} expenses={expenses} />
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Total Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {incomes.reduce((sum, income) => sum + income.salary, 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground">{incomes.length} bulan tercatat</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    Rp {expenses.reduce((sum, expense) => sum + expense.total_expenses, 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground">{expenses.length} bulan tercatat</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics */}
            <ExpenseAnalytics expenses={expenses} />

            {/* Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FlexibleIncomeForm onSubmit={handleAddIncome} />
              <FlexibleExpenseForm onSubmit={handleAddExpense} />
            </div>

            {/* Monthly Balance */}
            <MonthlyBalance 
              incomes={incomes} 
              expenses={expenses}
              onUpdateIncome={handleUpdateIncome}
              onUpdateExpense={handleUpdateExpense}
              onDeleteIncome={handleDeleteIncome}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;