
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Income } from '@/services/supabaseService';

interface ExpenseItem {
  label: string;
  amount: number;
}

interface FlexibleExpenseFormProps {
  onSubmit: (expense: { 
    month: string; 
    monthName: string; 
    totalExpenses: number;
    expenseItems: ExpenseItem[];
  }) => Promise<void>;
  incomes: Income[];
}

export const FlexibleExpenseForm = ({ onSubmit, incomes }: FlexibleExpenseFormProps) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([{ label: '', amount: 0 }]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, '0');
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear());
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const months = [
    { value: '01', label: 'Januari' },
    { value: '02', label: 'Februari' },
    { value: '03', label: 'Maret' },
    { value: '04', label: 'April' },
    { value: '05', label: 'Mei' },
    { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' },
    { value: '08', label: 'Agustus' },
    { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' }
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 10; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const getMonthName = (month: string, year: string) => {
    const monthObj = months.find(m => m.value === month);
    return `${monthObj?.label} ${year}`;
  };

  const addExpenseItem = () => {
    setExpenses([...expenses, { label: '', amount: 0 }]);
  };

  const removeExpenseItem = (index: number) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((_, i) => i !== index));
    }
  };

  const updateExpenseItem = (index: number, field: keyof ExpenseItem, value: string | number) => {
    const updated = [...expenses];
    updated[index] = { ...updated[index], [field]: value };
    setExpenses(updated);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validExpenses = expenses.filter(exp => exp.label.trim() && exp.amount > 0);
    if (validExpenses.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan minimal satu pengeluaran yang valid",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const month = `${selectedYear}-${selectedMonth}`;
      const monthName = getMonthName(selectedMonth, selectedYear);

      await onSubmit({
        month,
        monthName,
        totalExpenses,
        expenseItems: validExpenses
      });

      // Reset form
      setExpenses([{ label: '', amount: 0 }]);
      
      toast({
        title: "Pengeluaran Berhasil Ditambahkan",
        description: `${monthName} - Total Rp ${totalExpenses.toLocaleString('id-ID')}`,
      });
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengeluaran",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Input Pengeluaran Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Bulan</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year">Tahun</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateYears().map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Daftar Pengeluaran {getMonthName(selectedMonth, selectedYear)}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExpenseItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>

            {expenses.map((expense, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div>
                  <Label>Kategori</Label>
                  <Input
                    placeholder="Contoh: Makanan, Transport..."
                    value={expense.label}
                    onChange={(e) => updateExpenseItem(index, 'label', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Jumlah (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={expense.amount || ''}
                    onChange={(e) => updateExpenseItem(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExpenseItem(index)}
                    disabled={expenses.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {totalExpenses > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold">
                  Total Pengeluaran: Rp {totalExpenses.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
