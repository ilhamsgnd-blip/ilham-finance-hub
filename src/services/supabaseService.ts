import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  created_at?: string;
}

export interface UserProfile {
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
  // User profile operations - now works with authenticated users
  async createUserProfile(name: string): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .insert({ 
        id: user.id,
        name 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateUserProfile(name: string): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Income operations - now user-specific
  async createIncome(income: Omit<Income, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Income> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('incomes')
      .insert({ ...income, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserIncomes(): Promise<Income[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
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

  // Expense operations - now user-specific
  async createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Expense> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserExpenses(): Promise<Expense[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_items (*)
      `)
      .eq('user_id', user.id)
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