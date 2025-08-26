-- Fix security warnings: Set search_path for existing functions

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix update_total_expenses function  
CREATE OR REPLACE FUNCTION public.update_total_expenses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.expenses
  SET total_expenses = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.expense_items
    WHERE expense_id = NEW.expense_id
  )
  WHERE id = NEW.expense_id;
  RETURN NEW;
END;
$function$;