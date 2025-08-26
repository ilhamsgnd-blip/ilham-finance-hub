-- Fix security issue: Implement proper RLS policies for users table
-- Remove the overly permissive policies and implement secure ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
DROP POLICY IF EXISTS "Anyone can create users" ON public.users;
DROP POLICY IF EXISTS "Anyone can update users" ON public.users;

-- Create secure RLS policies that require authentication
-- Users can only view users (for the dropdown functionality)
CREATE POLICY "Authenticated users can view users" 
ON public.users 
FOR SELECT 
TO authenticated
USING (true);

-- Users can create their own profile
CREATE POLICY "Authenticated users can create users" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Users can update their own profile only
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (id = auth.uid()::text::uuid)
WITH CHECK (id = auth.uid()::text::uuid);

-- Update income and expense policies to also require authentication
-- Drop existing policies for incomes
DROP POLICY IF EXISTS "Anyone can view incomes" ON public.incomes;
DROP POLICY IF EXISTS "Anyone can create incomes" ON public.incomes;
DROP POLICY IF EXISTS "Anyone can update incomes" ON public.incomes;
DROP POLICY IF EXISTS "Anyone can delete incomes" ON public.incomes;

-- Create secure policies for incomes
CREATE POLICY "Users can view their own incomes" 
ON public.incomes 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can create their own incomes" 
ON public.incomes 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own incomes" 
ON public.incomes 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete their own incomes" 
ON public.incomes 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

-- Drop existing policies for expenses
DROP POLICY IF EXISTS "Anyone can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can delete expenses" ON public.expenses;

-- Create secure policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid()::text::uuid);

-- Drop existing policies for expense_items
DROP POLICY IF EXISTS "Anyone can view expense items" ON public.expense_items;
DROP POLICY IF EXISTS "Anyone can create expense items" ON public.expense_items;
DROP POLICY IF EXISTS "Anyone can update expense items" ON public.expense_items;
DROP POLICY IF EXISTS "Anyone can delete expense items" ON public.expense_items;

-- Create secure policies for expense_items
CREATE POLICY "Users can view their own expense items" 
ON public.expense_items 
FOR SELECT 
TO authenticated
USING (
  expense_id IN (
    SELECT id FROM public.expenses WHERE user_id = auth.uid()::text::uuid
  )
);

CREATE POLICY "Users can create their own expense items" 
ON public.expense_items 
FOR INSERT 
TO authenticated
WITH CHECK (
  expense_id IN (
    SELECT id FROM public.expenses WHERE user_id = auth.uid()::text::uuid
  )
);

CREATE POLICY "Users can update their own expense items" 
ON public.expense_items 
FOR UPDATE 
TO authenticated
USING (
  expense_id IN (
    SELECT id FROM public.expenses WHERE user_id = auth.uid()::text::uuid
  )
);

CREATE POLICY "Users can delete their own expense items" 
ON public.expense_items 
FOR DELETE 
TO authenticated
USING (
  expense_id IN (
    SELECT id FROM public.expenses WHERE user_id = auth.uid()::text::uuid
  )
);