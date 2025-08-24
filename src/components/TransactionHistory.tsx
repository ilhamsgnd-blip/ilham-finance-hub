import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Filter, Coins } from "lucide-react";
import { MonthlyTransaction } from "./FinanceForm";

interface TransactionHistoryProps {
  transactions: MonthlyTransaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [monthFilter, setMonthFilter] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      if (monthFilter) {
        return transaction.month === monthFilter;
      }
      return true;
    });
  }, [transactions, monthFilter]);

  const clearFilters = () => {
    setMonthFilter("");
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Riwayat Bulanan
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              type="month"
              placeholder="Filter berdasarkan bulan"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Reset Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {transactions.length === 0 
              ? "Belum ada data bulanan yang tercatat"
              : "Tidak ada data yang sesuai dengan filter"
            }
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <div 
                key={transaction.id} 
                className="border rounded-lg p-4 bg-gradient-card hover:shadow-soft transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{transaction.monthName}</h3>
                    {transaction.carryOver > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + Sisa bulan sebelumnya: Rp {transaction.carryOver.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={transaction.total >= 0 ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {transaction.total >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {transaction.total >= 0 ? "Surplus" : "Defisit"}: Rp {Math.abs(transaction.total).toLocaleString('id-ID')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-success mb-1">
                      Gaji Bulan Ini
                    </div>
                    <div className="text-lg font-semibold text-success">
                      Rp {transaction.salary.toLocaleString('id-ID')}
                    </div>
                    {transaction.carryOver > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Total tersedia: Rp {(transaction.salary + transaction.carryOver).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium text-destructive mb-1">
                      Pengeluaran
                    </div>
                    {transaction.expenses.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Tidak ada pengeluaran</div>
                    ) : (
                      <div className="space-y-1">
                        {transaction.expenses.map((expense, index) => (
                          <div key={index} className="flex justify-between text-sm">
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
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-semibold text-destructive">
                            <span>Total:</span>
                            <span>
                              Rp {transaction.expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
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