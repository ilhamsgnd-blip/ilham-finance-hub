
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MonthlyIncome {
  id: string;
  month: string;
  monthName: string;
  salary: number;
}

interface EditIncomeDialogProps {
  income: MonthlyIncome;
  onUpdate: (income: MonthlyIncome) => void;
}

export const EditIncomeDialog = ({ income, onUpdate }: EditIncomeDialogProps) => {
  const [salary, setSalary] = useState(income.salary.toString());
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const salaryNum = parseFloat(salary) || 0;

    const updatedIncome: MonthlyIncome = {
      ...income,
      salary: salaryNum,
      monthName: getMonthName(income.month)
    };

    console.log('Updating income:', updatedIncome);
    onUpdate(updatedIncome);
    setOpen(false);
    
    toast({
      title: "Gaji udah diupdate! 🎉",
      description: `${getMonthName(income.month)} - Rp ${salaryNum.toLocaleString('id-ID')}`,
      variant: "default"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Edit Gaji {getMonthName(income.month)}
          </DialogTitle>
          <DialogDescription>
            Update gaji buat bulan {getMonthName(income.month)}. Masukin jumlah yang bener ya!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="editSalary">Gaji (Rp)</Label>
            <Input
              id="editSalary"
              type="number"
              placeholder="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
