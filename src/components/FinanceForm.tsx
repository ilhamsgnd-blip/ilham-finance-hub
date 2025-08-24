import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  date: string;
  income: number;
  expenses: { label: string; amount: number }[];
  total: number;
}

interface FinanceFormProps {
  onSubmit: (transaction: Transaction) => void;
}

export const FinanceForm = ({ onSubmit }: FinanceFormProps) => {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState([{ label: "", amount: "" }]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

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
    
    const incomeNum = parseFloat(income) || 0;
    const expensesList = expenses
      .filter(exp => exp.label && exp.amount)
      .map(exp => ({
        label: exp.label,
        amount: parseFloat(exp.amount) || 0
      }));

    const totalExpenses = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const total = incomeNum - totalExpenses;

    const transaction: Transaction = {
      id: Date.now().toString(),
      date,
      income: incomeNum,
      expenses: expensesList,
      total
    };

    onSubmit(transaction);
    
    // Reset form
    setIncome("");
    setExpenses([{ label: "", amount: "" }]);
    setDate(new Date().toISOString().split('T')[0]);

    toast({
      title: "Transaksi Berhasil Ditambahkan",
      description: `Saldo: Rp ${total.toLocaleString('id-ID')}`,
      variant: total >= 0 ? "default" : "destructive"
    });
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Input Keuangan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="income">Gaji/Pemasukan Utama (Rp)</Label>
              <Input
                id="income"
                type="number"
                placeholder="0"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
              />
            </div>
          </div>

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
                      placeholder="Nama pengeluaran (contoh: Makan, Transport)"
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

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
            Simpan Transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};