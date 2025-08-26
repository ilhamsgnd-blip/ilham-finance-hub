import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PieChart, Coins } from "lucide-react";
import { Income, Expense } from "@/services/supabaseService";

interface FinanceSummaryProps {
  incomes: Income[];
  expenses: Expense[];
}

export const FinanceSummary = ({ incomes, expenses }: FinanceSummaryProps) => {
  const summary = useMemo(() => {
    const safeIncomes = incomes || [];
    const safeExpenses = expenses || [];
    
    const totalSalary = safeIncomes.reduce((sum, income) => {
      return sum + (typeof income.salary === 'number' ? income.salary : 0);
    }, 0);
    
    const totalExpenses = safeExpenses.reduce((sum, expense) => {
      return sum + (typeof expense.total_expenses === 'number' ? expense.total_expenses : 0);
    }, 0);
    
    // Calculate total savings from expenses labeled "Tabungan"
    const totalSavings = safeExpenses.reduce((sum, expense) => {
      const expenseItems = expense.expense_items || [];
      return sum + expenseItems
        .filter(exp => exp.label && exp.label.toLowerCase().includes('tabungan'))
        .reduce((savingsSum, exp) => savingsSum + (typeof exp.amount === 'number' ? exp.amount : 0), 0);
    }, 0
    );
    
    const currentBalance = totalSalary - totalExpenses;
    const avgSalary = safeIncomes.length > 0 ? totalSalary / safeIncomes.length : 0;
    const avgExpenses = safeExpenses.length > 0 ? totalExpenses / safeExpenses.length : 0;

    return {
      totalSalary,
      totalExpenses,
      currentBalance,
      totalSavings,
      avgSalary,
      avgExpenses,
      transactionCount: Math.max(safeIncomes.length, safeExpenses.length)
    };
  }, [incomes, expenses]);

  const cards = [
    {
      title: "Total Gaji",
      value: summary.totalSalary,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Total Pengeluaran", 
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Saldo Saat Ini",
      value: summary.currentBalance,
      icon: Wallet,
      color: summary.currentBalance >= 0 ? "text-success" : "text-destructive",
      bgColor: summary.currentBalance >= 0 ? "bg-success/10" : "bg-destructive/10"
    },
    {
      title: "Total Tabungan",
      value: summary.totalSavings,
      icon: Coins,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="shadow-medium hover:shadow-strong transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              Rp {Math.abs(card.value).toLocaleString('id-ID')}
            </div>
            {card.title === "Saldo" && summary.transactionCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Dari {summary.transactionCount} transaksi
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};