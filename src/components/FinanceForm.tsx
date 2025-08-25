import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MonthlyTransaction {
  id: string;
  month: string; // Format: "2024-08"
  monthName: string; // Format: "Agustus 2024"
  salary: number;
  expenses: { label: string; amount: number }[];
  total: number;
  carryOver: number; // Sisa dari bulan sebelumnya
}

interface FinanceFormProps {
  onSubmit: (transaction: MonthlyTransaction) => void;
  previousMonthBalance: number;
}

export const FinanceForm = ({ onSubmit, previousMonthBalance }: FinanceFormProps) => {
  const [salary, setSalary] = useState("");
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
    
    const salaryNum = parseFloat(salary) || 0;
    const expensesList = expenses
      .filter(exp => exp.label && exp.amount)
      .map(exp => ({
        label: exp.label,
        amount: parseFloat(exp.amount) || 0
      }));

    const totalExpenses = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
    const availableAmount = salaryNum + previousMonthBalance;
    const total = availableAmount - totalExpenses;

    const transaction: MonthlyTransaction = {
      id: Date.now().toString(),
      month: selectedMonth,
      monthName: getMonthName(selectedMonth),
      salary: salaryNum,
      expenses: expensesList,
      total,
      carryOver: previousMonthBalance
    };

    onSubmit(transaction);
    
    // Reset form
    setSalary("");
    setExpenses([{ label: "", amount: "" }]);

    toast({
      title: "Gaji Bulanan Berhasil Ditambahkan",
      description: `${getMonthName(selectedMonth)} - Sisa: Rp ${total.toLocaleString('id-ID')}`,
      variant: total >= 0 ? "default" : "destructive"
    });
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Input Gaji Bulanan
          </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Bulan</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="salary">Gaji Bulan {getMonthName(selectedMonth)} (Rp)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
              />
            </div>
          </div>

          {previousMonthBalance > 0 && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <p className="text-sm text-success">
                💰 Sisa bulan sebelumnya: <span className="font-semibold">Rp {previousMonthBalance.toLocaleString('id-ID')}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total yang tersedia untuk bulan ini: Rp {(parseFloat(salary) + previousMonthBalance || previousMonthBalance).toLocaleString('id-ID')}
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