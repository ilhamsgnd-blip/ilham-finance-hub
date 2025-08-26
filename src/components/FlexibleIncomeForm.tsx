
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlexibleIncomeFormProps {
  onSubmit: (income: { month: string; month_name: string; salary: number }) => Promise<void>;
}

export const FlexibleIncomeForm = ({ onSubmit }: FlexibleIncomeFormProps) => {
  const [salary, setSalary] = useState('');
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
    for (let year = currentYear - 5; year <= currentYear + 20; year++) {
      years.push(year.toString());
    }
    return years;
  };

  const getMonthName = (month: string, year: string) => {
    const monthObj = months.find(m => m.value === month);
    return `${monthObj?.label} ${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const salaryNum = parseFloat(salary) || 0;
    if (salaryNum <= 0) {
      toast({
        title: "Eh salah nih! 😅",
        description: "Gaji harus lebih dari 0 dong",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const month = `${selectedYear}-${selectedMonth}`;
      const monthName = getMonthName(selectedMonth, selectedYear);

      await onSubmit({
        month: month,
        month_name: monthName,
        salary: salaryNum
      });

      setSalary("");
      
      toast({
        title: "Mantap! 💰",
        description: `Gaji ${monthName} udah tersimpan - Rp ${salaryNum.toLocaleString('id-ID')}`,
      });
    } catch (error) {
      console.error('Error submitting income:', error);
      toast({
        title: "Aduh! 😔",
        description: "Gagal nyimpen gaji nih",
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
          <TrendingUp className="h-5 w-5" />
          Input Gaji Bulanan 💸
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <Label htmlFor="salary">
                Gaji {getMonthName(selectedMonth, selectedYear)} (Rp)
              </Label>
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

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Tunggu sebentar...' : 'Simpan Gaji'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
