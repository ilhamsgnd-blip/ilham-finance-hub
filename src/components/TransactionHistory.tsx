import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Transaction } from "./FinanceForm";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [dateFilter, setDateFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      let matchesDate = true;
      let matchesWeek = true;

      if (dateFilter) {
        matchesDate = transaction.date === dateFilter;
      }

      if (weekFilter) {
        const transactionDate = new Date(transaction.date);
        const filterDate = new Date(weekFilter);
        const weekStart = new Date(filterDate);
        weekStart.setDate(filterDate.getDate() - filterDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        matchesWeek = transactionDate >= weekStart && transactionDate <= weekEnd;
      }

      return matchesDate && matchesWeek;
    });
  }, [transactions, dateFilter, weekFilter]);

  const clearFilters = () => {
    setDateFilter("");
    setWeekFilter("");
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Riwayat Transaksi
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              type="date"
              placeholder="Filter berdasarkan tanggal"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Input
              type="week"
              placeholder="Filter berdasarkan minggu"
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
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
              ? "Belum ada transaksi yang tercatat"
              : "Tidak ada transaksi yang sesuai dengan filter"
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
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
                    Rp {Math.abs(transaction.total).toLocaleString('id-ID')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-success mb-1">
                      Pemasukan
                    </div>
                    <div className="text-lg font-semibold text-success">
                      Rp {transaction.income.toLocaleString('id-ID')}
                    </div>
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
                            <span>{expense.label}:</span>
                            <span className="text-destructive font-medium">
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