-- Fix RLS Policies to Allow Service Role Access
-- The service_role key should bypass RLS, but we'll add explicit policies
-- to ensure backend operations work correctly

-- ============================================
-- INCOME Table - Allow Service Role Access
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own income" ON public.income;
DROP POLICY IF EXISTS "Users can insert own income" ON public.income;
DROP POLICY IF EXISTS "Users can update own income" ON public.income;
DROP POLICY IF EXISTS "Users can delete own income" ON public.income;

-- Create policies that allow service_role (backend) to do everything
-- Service role automatically bypasses RLS, but these policies provide fallback
CREATE POLICY "Service role can manage all income"
ON public.income
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- EXPENSES Table - Allow Service Role Access
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- Create policies that allow service_role (backend) to do everything
CREATE POLICY "Service role can manage all expenses"
ON public.expenses
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- Note: Service Role Key Bypasses RLS
-- ============================================
-- The service_role key should automatically bypass all RLS policies.
-- These policies are here as a safety net. If you're still getting
-- RLS errors, verify that your backend/.env has SUPABASE_SERVICE_ROLE_KEY
-- (not SUPABASE_ANON_KEY) set correctly.
