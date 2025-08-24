import { useState } from "react";
import { IncomeForm, MonthlyIncome } from "@/components/IncomeForm";
import { ExpenseForm, MonthlyExpense } from "@/components/ExpenseForm";
import { MonthlyBalance } from "@/components/MonthlyBalance";
import { FinanceSummary } from "@/components/FinanceSummary";
import { Wallet, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

const Index = () => {
  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);

  const handleNewIncome = (income: MonthlyIncome) => {
    setIncomes(prev => {
      // Check if income for this month already exists
      const existingIndex = prev.findIndex(inc => inc.month === income.month);
      if (existingIndex >= 0) {
        // Update existing month
        const updated = [...prev];
        updated[existingIndex] = income;
        return updated;
      } else {
        // Add new month
        return [income, ...prev];
      }
    });
  };

  const handleNewExpense = (expense: MonthlyExpense) => {
    setExpenses(prev => {
      // Check if expense for this month already exists
      const existingIndex = prev.findIndex(exp => exp.month === expense.month);
      if (existingIndex >= 0) {
        // Update existing month
        const updated = [...prev];
        updated[existingIndex] = expense;
        return updated;
      } else {
        // Add new month
        return [expense, ...prev];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Wallet className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold">Ilham Finance</h1>
          </div>
          <p className="text-center text-white/90 text-lg">
            Kelola keuangan Anda dengan mudah dan powerful
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">Ringkasan Keuangan</h2>
          </div>
          <FinanceSummary incomes={incomes} expenses={expenses} />
        </section>

        {/* Input Forms */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-xl font-semibold">Input Pemasukan</h3>
            </div>
            <IncomeForm onSubmit={handleNewIncome} />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h3 className="text-xl font-semibold">Input Pengeluaran</h3>
            </div>
            <ExpenseForm onSubmit={handleNewExpense} incomes={incomes} />
          </div>
        </section>

        {/* Monthly Balance History */}
        <section>
          <MonthlyBalance incomes={incomes} expenses={expenses} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Ilham Finance. Mengelola keuangan dengan cerdas.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;