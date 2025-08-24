import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { Transaction } from "./FinanceForm";

interface FinanceSummaryProps {
  transactions: Transaction[];
}

export const FinanceSummary = ({ transactions }: FinanceSummaryProps) => {
  const summary = useMemo(() => {
    const totalIncome = transactions.reduce((sum, t) => sum + t.income, 0);
    const totalExpenses = transactions.reduce((sum, t) => 
      sum + t.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
    );
    const balance = totalIncome - totalExpenses;
    const avgIncome = transactions.length > 0 ? totalIncome / transactions.length : 0;
    const avgExpenses = transactions.length > 0 ? totalExpenses / transactions.length : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      avgIncome,
      avgExpenses,
      transactionCount: transactions.length
    };
  }, [transactions]);

  const cards = [
    {
      title: "Total Pemasukan",
      value: summary.totalIncome,
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
      title: "Saldo",
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? "text-success" : "text-destructive",
      bgColor: summary.balance >= 0 ? "bg-success/10" : "bg-destructive/10"
    },
    {
      title: "Rata-rata Pengeluaran",
      value: summary.avgExpenses,
      icon: PieChart,
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