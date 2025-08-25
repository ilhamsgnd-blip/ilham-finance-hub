
-- Create tables for multi-user finance tracking
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  month_name TEXT NOT NULL,
  salary DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  month_name TEXT NOT NULL,
  total_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.expense_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0
);

-- Enable RLS but allow public access (no authentication required)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public access (no auth required)
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can create users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Anyone can view incomes" ON public.incomes FOR SELECT USING (true);
CREATE POLICY "Anyone can create incomes" ON public.incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update incomes" ON public.incomes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete incomes" ON public.incomes FOR DELETE USING (true);

CREATE POLICY "Anyone can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can create expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Anyone can view expense items" ON public.expense_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create expense items" ON public.expense_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update expense items" ON public.expense_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete expense items" ON public.expense_items FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_incomes_updated_at BEFORE UPDATE ON public.incomes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
