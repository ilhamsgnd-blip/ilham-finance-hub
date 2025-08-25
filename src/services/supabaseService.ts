
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  created_at?: string;
}

export interface Income {
  id: string;
  user_id: string;
  month: string;
  month_name: string;
  salary: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseItem {
  id: string;
  expense_id: string;
  label: string;
  amount: number;
}

export interface Expense {
  id: string;
  user_id: string;
  month: string;
  month_name: string;
  total_expenses: number;
  created_at?: string;
  updated_at?: string;
  expense_items?: ExpenseItem[];
}

export const supabaseService = {
  // Users
  async createUser(name: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Incomes
  async createIncome(income: Omit<Income, 'id' | 'created_at' | 'updated_at'>): Promise<Income> {
    const { data, error } = await supabase
      .from('incomes')
      .insert(income)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getIncomesByUser(userId: string): Promise<Income[]> {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateIncome(id: string, updates: Partial<Income>): Promise<Income> {
    const { data, error } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteIncome(id: string): Promise<void> {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Expenses
  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert(expense)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getExpensesByUser(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_items (*)
      `)
      .eq('user_id', userId)
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    // First delete expense items
    await supabase
      .from('expense_items')
      .delete()
      .eq('expense_id', id);

    // Then delete expense
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Expense Items
  async createExpenseItems(items: Omit<ExpenseItem, 'id'>[]): Promise<ExpenseItem[]> {
    const { data, error } = await supabase
      .from('expense_items')
      .insert(items)
      .select();
    
    if (error) throw error;
    return data || [];
  },

  async updateExpenseItems(expenseId: string, items: Omit<ExpenseItem, 'id' | 'expense_id'>[]): Promise<void> {
    // Delete existing items
    await supabase
      .from('expense_items')
      .delete()
      .eq('expense_id', expenseId);

    // Insert new items
    if (items.length > 0) {
      const itemsWithExpenseId = items.map(item => ({ ...item, expense_id: expenseId }));
      await supabase
        .from('expense_items')
        .insert(itemsWithExpenseId);
    }
  }
};
