
import { useState, useEffect } from "react";
import { Wallet, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMultiUser } from "@/hooks/useMultiUser";
import { supabaseService, Income, Expense } from "@/services/supabaseService";
import { UserSelector } from "@/components/UserSelector";
import { FlexibleIncomeForm } from "@/components/FlexibleIncomeForm";
import { FlexibleExpenseForm } from "@/components/FlexibleExpenseForm";
import { FinanceSummary } from "@/components/FinanceSummary";
import { MonthlyBalance } from "@/components/MonthlyBalance";
import { ExpenseAnalytics } from "@/components/ExpenseAnalytics";

const Index = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    users,
    currentUser,
    loading: userLoading,
    createUser,
    switchUser,
    clearCurrentUser
  } = useMultiUser();

  // Load user data when current user changes
  useEffect(() => {
    if (!currentUser) {
      setIncomes([]);
      setExpenses([]);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        const [incomesData, expensesData] = await Promise.all([
          supabaseService.getIncomesByUser(currentUser.id),
          supabaseService.getExpensesByUser(currentUser.id)
        ]);
        
        console.log('Loaded incomes:', incomesData);
        console.log('Loaded expenses:', expensesData);
        
        setIncomes(incomesData);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "Waduh error! 😔",
          description: "Gagal memuat data keuangan nih",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, toast]);

  const handleNewIncome = async (incomeData: { month: string; monthName: string; salary: number }) => {
    if (!currentUser) return;

    try {
      const newIncome = await supabaseService.createIncome({
        user_id: currentUser.id,
        month: incomeData.month,
        month_name: incomeData.monthName,
        salary: incomeData.salary
      });
      
      console.log('Created income:', newIncome);
      
      setIncomes(prev => {
        const existingIndex = prev.findIndex(inc => inc.month === newIncome.month);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newIncome;
          return updated;
        } else {
          return [newIncome, ...prev];
        }
      });
    } catch (error) {
      console.error('Error creating income:', error);
      toast({
        title: "Aduh gagal! 😔",
        description: "Gagal nyimpen gaji nih",
        variant: "destructive"
      });
    }
  };

  const handleNewExpense = async (expenseData: { 
    month: string; 
    monthName: string; 
    totalExpenses: number;
    expenseItems: { label: string; amount: number }[];
  }) => {
    if (!currentUser) return;

    try {
      const newExpense = await supabaseService.createExpense({
        user_id: currentUser.id,
        month: expenseData.month,
        month_name: expenseData.monthName,
        total_expenses: expenseData.totalExpenses
      });

      console.log('Created expense:', newExpense);

      if (expenseData.expenseItems.length > 0) {
        const expenseItems = expenseData.expenseItems.map(item => ({
          expense_id: newExpense.id,
          label: item.label,
          amount: item.amount
        }));
        
        const createdItems = await supabaseService.createExpenseItems(expenseItems);
        newExpense.expense_items = createdItems;
        console.log('Created expense items:', createdItems);
      }
      
      setExpenses(prev => {
        const existingIndex = prev.findIndex(exp => exp.month === newExpense.month);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newExpense;
          return updated;
        } else {
          return [newExpense, ...prev];
        }
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: "Aduh gagal! 😔",
        description: "Gagal nyimpen pengeluaran nih",
        variant: "destructive"
      });
    }
  };

  const handleUpdateIncome = async (income: any) => {
    if (!currentUser) return;
    
    try {
      console.log('Updating income with data:', income);
      
      // Only send fields that exist in the database
      const updateData = {
        month_name: income.monthName,
        salary: income.salary
      };
      
      const updated = await supabaseService.updateIncome(income.id, updateData);
      console.log('Updated income:', updated);
      
      setIncomes(prev => prev.map(inc => inc.id === income.id ? updated : inc));
      
      toast({
        title: "Yeay berhasil! 🎉",
        description: "Gaji udah diupdate nih!",
      });
    } catch (error) {
      console.error('Error updating income:', error);
      toast({
        title: "Aduh gagal! 😔",
        description: "Gagal update gaji nih",
        variant: "destructive"
      });
    }
  };

  const handleUpdateExpense = async (expense: any) => {
    if (!currentUser) return;
    
    try {
      console.log('Updating expense with data:', expense);
      
      // Update expense record
      const updateData = {
        month_name: expense.monthName,
        total_expenses: expense.totalExpenses
      };
      
      const updated = await supabaseService.updateExpense(expense.id, updateData);
      console.log('Updated expense:', updated);
      
      // Update expense items if they exist
      if (expense.expenses && expense.expenses.length > 0) {
        await supabaseService.updateExpenseItems(expense.id, expense.expenses);
        console.log('Updated expense items');
        
        // Reload the expense with items
        const expensesData = await supabaseService.getExpensesByUser(currentUser.id);
        const updatedExpenseWithItems = expensesData.find(exp => exp.id === expense.id);
        if (updatedExpenseWithItems) {
          updated.expense_items = updatedExpenseWithItems.expense_items;
        }
      }
      
      setExpenses(prev => prev.map(exp => exp.id === expense.id ? updated : exp));
      
      toast({
        title: "Oke sip! 🎉",
        description: "Pengeluaran udah diupdate nih!",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Aduh gagal! 😔",
        description: "Gagal update pengeluaran nih",
        variant: "destructive"
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Finance Tracker Kece 💰</h1>
          </div>
          <p className="text-center text-white/90 text-lg">
            Atur keuangan bareng-bareng dengan mudah dan seru! 🎉
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* User Selection */}
        <section>
          <UserSelector
            users={users}
            currentUser={currentUser}
            onCreateUser={createUser}
            onSwitchUser={switchUser}
            onClearUser={clearCurrentUser}
          />
        </section>

        {currentUser && (
          <>
            {/* Summary Cards */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Ringkasan Keuangan 📊</h2>
              </div>
              <FinanceSummary 
                incomes={incomes.map(inc => ({
                  id: inc.id,
                  month: inc.month,
                  monthName: inc.month_name,
                  salary: inc.salary
                }))} 
                expenses={expenses.map(exp => ({
                  id: exp.id,
                  month: exp.month,
                  monthName: exp.month_name,
                  totalExpenses: exp.total_expenses,
                  expenses: exp.expense_items?.map(item => ({
                    label: item.label,
                    amount: item.amount
                  })) || []
                }))} 
              />
            </section>

            {/* Analytics */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Analisis & Tips Kece 🔥</h2>
              </div>
              <ExpenseAnalytics expenses={expenses} />
            </section>

            {/* Input Forms */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <h3 className="text-xl font-semibold">Input Pemasukan</h3>
                </div>
                <FlexibleIncomeForm onSubmit={handleNewIncome} />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-destructive" />
                  <h3 className="text-xl font-semibold">Input Pengeluaran</h3>
                </div>
                <FlexibleExpenseForm 
                  onSubmit={handleNewExpense} 
                  incomes={incomes}
                />
              </div>
            </section>

            {/* Monthly Balance History */}
            {(incomes.length > 0 || expenses.length > 0) && (
              <section>
                <MonthlyBalance 
                  incomes={incomes.map(inc => ({
                    id: inc.id,
                    month: inc.month,
                    monthName: inc.month_name,
                    salary: inc.salary
                  }))} 
                  expenses={expenses.map(exp => ({
                    id: exp.id,
                    month: exp.month,
                    monthName: exp.month_name,
                    totalExpenses: exp.total_expenses,
                    expenses: exp.expense_items?.map(item => ({
                      label: item.label,
                      amount: item.amount
                    })) || []
                  }))} 
                  onUpdateIncome={handleUpdateIncome}
                  onUpdateExpense={handleUpdateExpense}
                />
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Finance Tracker Kece. Ngatur duit jadi mudah dan seru! 🎉</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
