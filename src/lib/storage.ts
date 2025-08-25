import { MonthlyIncome } from "@/components/IncomeForm";
import { MonthlyExpense } from "@/components/ExpenseForm";

const STORAGE_KEYS = {
  INCOMES: 'ilham-finance-incomes',
  EXPENSES: 'ilham-finance-expenses'
} as const;

export const storageService = {
  // Income operations
  saveIncomes: (incomes: MonthlyIncome[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    } catch (error) {
      console.error('Error saving incomes:', error);
    }
  },

  loadIncomes: (): MonthlyIncome[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading incomes:', error);
      return [];
    }
  },

  // Expense operations
  saveExpenses: (expenses: MonthlyExpense[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  },

  loadExpenses: (): MonthlyExpense[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading expenses:', error);
      return [];
    }
  },

  // Clear all data
  clearAll: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.INCOMES);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};