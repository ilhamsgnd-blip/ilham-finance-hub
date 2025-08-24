import { useState } from "react";
import { FinanceForm, Transaction } from "@/components/FinanceForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { FinanceSummary } from "@/components/FinanceSummary";
import { Wallet, BarChart3 } from "lucide-react";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleNewTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
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
          <FinanceSummary transactions={transactions} />
        </section>

        {/* Input Form */}
        <section>
          <FinanceForm onSubmit={handleNewTransaction} />
        </section>

        {/* Transaction History */}
        <section>
          <TransactionHistory transactions={transactions} />
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