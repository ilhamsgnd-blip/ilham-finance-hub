import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { MonthlyIncome } from "./IncomeForm";
import { MonthlyExpense } from "./ExpenseForm";

interface MonthlyBalanceProps {
  incomes: MonthlyIncome[];
  expenses: MonthlyExpense[];
}

export interface MonthlyBalance {
  month: string;
  monthName: string;
  income: number;
  totalExpenses: number;
  balance: number;
  savings: number;
  expenseDetails: { label: string; amount: number }[];
}

export const MonthlyBalance = ({ incomes, expenses }: MonthlyBalanceProps) => {
  const monthlyBalances = useMemo(() => {
    const monthMap = new Map<string, MonthlyBalance>();

    // Initialize with incomes
    incomes.forEach(income => {
      monthMap.set(income.month, {
        month: income.month,
        monthName: income.monthName,
        income: income.salary,
        totalExpenses: 0,
        balance: income.salary,
        savings: 0,
        expenseDetails: []
      });
    });

    // Add expenses
    expenses.forEach(expense => {
      const existing = monthMap.get(expense.month);
      if (existing) {
        const savings = expense.expenses
          .filter(exp => exp.label.toLowerCase().includes('tabungan'))
          .reduce((sum, exp) => sum + exp.amount, 0);
        
        existing.totalExpenses = expense.totalExpenses;
        existing.balance = existing.income - expense.totalExpenses;
        existing.savings = savings;
        existing.expenseDetails = expense.expenses;
      }
    });

    return Array.from(monthMap.values())
      .sort((a, b) => new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime());
  }, [incomes, expenses]);

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Saldo Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyBalances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada data bulanan yang tercatat
          </div>
        ) : (
          <div className="space-y-4">
            {monthlyBalances.map(balance => (
              <div 
                key={balance.month} 
                className="border rounded-lg p-4 bg-gradient-card hover:shadow-soft transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{balance.monthName}</h3>
                  </div>
                  <Badge 
                    variant={balance.balance >= 0 ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {balance.balance >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {balance.balance >= 0 ? "Surplus" : "Defisit"}: Rp {Math.abs(balance.balance).toLocaleString('id-ID')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-medium text-success mb-1">
                      Gaji
                    </div>
                    <div className="text-lg font-semibold text-success">
                      Rp {balance.income.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-destructive mb-1">
                      Pengeluaran
                    </div>
                    {balance.expenseDetails.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Tidak ada pengeluaran</div>
                    ) : (
                      <>
                        <div className="text-lg font-semibold text-destructive mb-2">
                          Rp {balance.totalExpenses.toLocaleString('id-ID')}
                        </div>
                        <div className="space-y-1">
                          {balance.expenseDetails.map((expense, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="flex items-center gap-1">
                                {expense.label.toLowerCase().includes('tabungan') && <Coins className="h-3 w-3 text-primary" />}
                                {expense.label}:
                              </span>
                              <span className={`font-medium ${
                                expense.label.toLowerCase().includes('tabungan') ? 'text-primary' : 'text-destructive'
                              }`}>
                                Rp {expense.amount.toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-primary mb-1">
                      Tabungan Bulan Ini
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      Rp {balance.savings.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};