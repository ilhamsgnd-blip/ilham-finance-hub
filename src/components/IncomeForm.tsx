import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface MonthlyIncome {
  id: string;
  month: string; // Format: "2024-08"
  monthName: string; // Format: "Agustus 2024"
  salary: number;
}

interface IncomeFormProps {
  onSubmit: (income: MonthlyIncome) => void;
}

export const IncomeForm = ({ onSubmit }: IncomeFormProps) => {
  const [salary, setSalary] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salaryNum = parseFloat(salary) || 0;

    const income: MonthlyIncome = {
      id: Date.now().toString(),
      month: selectedMonth,
      monthName: getMonthName(selectedMonth),
      salary: salaryNum
    };

    onSubmit(income);
    
    // Reset form
    setSalary("");

    toast({
      title: "Gaji Berhasil Ditambahkan",
      description: `${getMonthName(selectedMonth)} - Rp ${salaryNum.toLocaleString('id-ID')}`,
      variant: "default"
    });
  };

  return (
    <Card className="shadow-medium">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
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

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
            Simpan Gaji
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};