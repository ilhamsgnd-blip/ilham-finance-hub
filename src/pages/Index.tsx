"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { FinanceCard } from "@/components/FinanceCard";
import { supabaseService } from "@/services/supabaseService";

interface User {
  id: string;
  name: string;
}

interface Income {
  id: string;
  user_id: string;
  month: string;
  month_name: string;
  salary: number;
}

interface ExpenseItem {
  id?: string;
  label: string;
  amount: number;
}

interface Expense {
  id: string;
  user_id: string;
  month: string;
  month_name: string;
  total_expenses: number;
  expense_items: ExpenseItem[];
}

export default function IndexPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil semua data awal
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await supabaseService.getUsers();
        setUsers(users);

        if (users.length > 0) {
          setCurrentUser(users[0]);

          const incomes = await supabaseService.getIncomes(users[0].id);
          const expenses = await supabaseService.getExpenses(users[0].id);

          setIncomes(incomes);
          setExpenses(expenses);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Tambah income
  const handleAddIncome = async (income: Omit<Income, "id">) => {
    if (!currentUser) return;

    try {
      const newIncome = await supabaseService.createIncome({
        ...income,
        user_id: currentUser.id,
      });
      setIncomes((prev) => [...prev, newIncome]);
    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pemasukan",
        variant: "destructive",
      });
    }
  };

  // 🔹 Update income
  const handleUpdateIncome = async (income: Income) => {
    if (!currentUser) return;

    try {
      const updated = await supabaseService.updateIncome(income.id, income);
      setIncomes((prev) =>
        prev.map((inc) => (inc.id === income.id ? updated : inc))
      );
    } catch (error) {
      console.error("Error updating income:", error);
      toast({
        title: "Error",
        description: "Gagal mengupdate pemasukan",
        variant: "destructive",
      });
    }
  };

  // 🔹 Tambah expense
  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    if (!currentUser) return;

    try {
      const newExpense = await supabaseService.createExpense({
        ...expense,
        user_id: currentUser.id,
      });

      if (expense.expense_items && expense.expense_items.length > 0) {
        await supabaseService.addExpenseItems(newExpense.id, expense.expense_items);
      }

      setExpenses((prev) => [...prev, { ...newExpense, expense_items: expense.expense_items || [] }]);
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan pengeluaran",
        variant: "destructive",
      });
    }
  };

  // 🔹 Update expense (✅ fix bug disini)
  const handleUpdateExpense = async (expense: Expense) => {
    if (!currentUser) return;

    try {
      const updated = await supabaseService.updateExpense(expense.id, expense);

      if (expense.expense_items && expense.expense_items.length > 0) {
        await supabaseService.updateExpenseItems(expense.id, expense.expense_items);
      }

      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expense.id ? updated : exp))
      );
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Gagal mengupdate pengeluaran",
        variant: "destructive",
      });
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Income Card */}
      <FinanceCard
        title="Pemasukan"
        data={incomes.map((inc) => ({
          id: inc.id,
          month: inc.month,
          monthName: inc.month_name,
          amount: inc.salary,
        }))}
        onAdd={handleAddIncome}
        onUpdate={handleUpdateIncome}
      />

      {/* Expense Card */}
      <FinanceCard
        title="Pengeluaran"
        data={expenses.map((exp) => ({
          id: exp.id,
          month: exp.month,
          monthName: exp.month_name,
          amount: exp.total_expenses,
          items:
            exp.expense_items?.map((item) => ({
              label: item.label,
              amount: item.amount,
            })) || [],
        }))}
        onAdd={handleAddExpense}
        onUpdate={handleUpdateExpense}
      />
    </div>
  );
}
