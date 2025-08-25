import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Plus, Trash2, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MonthlyExpense } from "./ExpenseForm";

interface EditExpenseDialogProps {
  expense: MonthlyExpense;
  onUpdate: (expense: MonthlyExpense) => void;
  availableBalance: number;
}

export const EditExpenseDialog = ({ expense, onUpdate, availableBalance }: EditExpenseDialogProps) => {
  const [expenses, setExpenses] = useState(
    expense.expenses.map(exp => ({ label: exp.label, amount: exp.amount.toString() }))
  );
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { 
      month: 'long', 
      year: 'numeric' 
    });
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
    const remaining = availableBalance - totalExpenses;

    const updatedExpense: MonthlyExpense = {
      ...expense,
      expenses: expensesList,
      totalExpenses,
      monthName: getMonthName(expense.month)
    };

    onUpdate(updatedExpense);
    setOpen(false);
    
    toast({
      title: "Pengeluaran Berhasil Diperbarui",
      description: `${getMonthName(expense.month)} - Sisa: Rp ${remaining.toLocaleString('id-ID')}`,
      variant: remaining >= 0 ? "default" : "destructive"
    });
  };

  const currentTotalExpenses = expenses.reduce((sum, exp) => 
    sum + (parseFloat(exp.amount) || 0), 0
  );
  const remainingBalance = availableBalance - currentTotalExpenses;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Edit Pengeluaran {getMonthName(expense.month)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-primary">
            💰 Gaji tersedia: 
            <span className="font-semibold"> Rp {availableBalance.toLocaleString('id-ID')}</span>
          </p>
          {currentTotalExpenses > 0 && (
            <p className={`text-xs mt-1 ${remainingBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              Sisa setelah pengeluaran: Rp {remainingBalance.toLocaleString('id-ID')}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                Tambah
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {expenses.map((expense, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder="Nama pengeluaran"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-destructive to-destructive/80 hover:opacity-90"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};