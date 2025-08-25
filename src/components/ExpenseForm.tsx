import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MonthlyIncome } from "./IncomeForm";

export interface MonthlyExpense {
  id: string;
  month: string; // Format: "2024-08"
  monthName: string; // Format: "Agustus 2024"
  expenses: { label: string; amount: number }[];
  totalExpenses: number;
}

interface ExpenseFormProps {
  onSubmit: (expense: MonthlyExpense) => void;
  incomes: MonthlyIncome[];
}

export const ExpenseForm = ({ onSubmit, incomes }: ExpenseFormProps) => {
  const [expenses, setExpenses] = useState([{ label: "", amount: "" }]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const { toast } = useToast();

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getAvailableBalance = () => {
    const income = incomes.find(inc => inc.month === selectedMonth);
    return income?.salary || 0;
  };

  const addExpense = () => {
    setExpenses([...expenses, { label: "", amount: "" }]);
  };

  const removeExpense = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpense = (index: number, field: 'label' | 'amount', value: string) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const expensesList = expenses
      .filter(exp => exp.label && exp.amount)
      .map(exp => ({
        label: exp.label,
        amount: parseFloat(exp.amount) || 0
      }));

    const totalExpenses = expensesList.reduce((sum, exp) => sum + exp.amount, 0);

    const expense: MonthlyExpense = {
      id: Date.now().toString(),
      month: selectedMonth,
      monthName: getMonthName(selectedMonth),
      expenses: expensesList,
      totalExpenses
    };

    onSubmit(expense);
    
    // Reset form
    setExpenses([{ label: "", amount: "" }]);

    const availableBalance = getAvailableBalance();
    const remaining = availableBalance - totalExpenses;

    toast({
      title: "Pengeluaran Berhasil Ditambahkan",
      description: `${getMonthName(selectedMonth)} - Sisa: Rp ${remaining.toLocaleString('id-ID')}`,
      variant: remaining >= 0 ? "default" : "destructive"
    });
  };

  const availableBalance = getAvailableBalance();
  const currentTotalExpenses = expenses.reduce((sum, exp) => 
    sum + (parseFloat(exp.amount) || 0), 0
  );
  const remainingBalance = availableBalance - currentTotalExpenses;

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-to-r from-destructive to-destructive/80 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Input Pengeluaran Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="expenseMonth">Bulan Pengeluaran</Label>
            <Input
              id="expenseMonth"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
            />
          </div>

          {availableBalance > 0 ? (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-primary">
                💰 Gaji tersedia bulan {getMonthName(selectedMonth)}: 
                <span className="font-semibold"> Rp {availableBalance.toLocaleString('id-ID')}</span>
              </p>
              {currentTotalExpenses > 0 && (
                <p className={`text-xs mt-1 ${remainingBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  Sisa setelah pengeluaran: Rp {remainingBalance.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive">
                ⚠️ Belum ada gaji yang tercatat untuk bulan {getMonthName(selectedMonth)}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Pengeluaran</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpense}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Pengeluaran
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Nama pengeluaran (contoh: Makan, Transport, Tabungan)"
                      value={expense.label}
                      onChange={(e) => updateExpense(index, 'label', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Jumlah (Rp)"
                      value={expense.amount}
                      onChange={(e) => updateExpense(index, 'amount', e.target.value)}
                    />
                  </div>
                  {expenses.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeExpense(index)}
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-destructive to-destructive/80 hover:opacity-90"
            disabled={availableBalance === 0}
          >
            Simpan Pengeluaran
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};