-- ============================================
-- Helper Function: Get User ID from JWT
-- ============================================
-- This function extracts the user_id from JWT claims.
-- For Auth0, the user_id is typically in 'sub' claim or a custom claim.
-- Adjust the claim name based on your Auth0 configuration.
-- Returns NULL if no JWT is present (service role bypasses RLS anyway).

CREATE OR REPLACE FUNCTION public.get_user_id_from_jwt()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id',
    current_setting('request.jwt.claims', true)::json->>'https://your-auth0-domain/user_id'
  );
$$ LANGUAGE sql STABLE;

-- ============================================
-- Drop Existing Policies (if any)
-- ============================================

DROP POLICY IF EXISTS "Users can view own income" ON public.income;
DROP POLICY IF EXISTS "Users can insert own income" ON public.income;
DROP POLICY IF EXISTS "Users can update own income" ON public.income;
DROP POLICY IF EXISTS "Users can delete own income" ON public.income;

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goal;
DROP POLICY IF EXISTS "Users can insert own savings goals" ON public.savings_goal;
DROP POLICY IF EXISTS "Users can update own savings goals" ON public.savings_goal;
DROP POLICY IF EXISTS "Users can delete own savings goals" ON public.savings_goal;

-- ============================================
-- Enable Row Level Security (RLS) on Tables
-- ============================================

-- Enable RLS on income table
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Enable RLS on expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on savings_goal table
ALTER TABLE public.savings_goal ENABLE ROW LEVEL SECURITY;

-- Enable RLS on categories table (if it exists and needs protection)
-- Note: Categories might be public, but enabling RLS for consistency
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ============================================
-- INCOME Table Policies
-- ============================================

-- Policy: Users can view their own income records
CREATE POLICY "Users can view own income"
ON public.income
FOR SELECT
USING (user_id = public.get_user_id_from_jwt());

-- Policy: Users can insert their own income records
CREATE POLICY "Users can insert own income"
ON public.income
FOR INSERT
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can update their own income records
CREATE POLICY "Users can update own income"
ON public.income
FOR UPDATE
USING (user_id = public.get_user_id_from_jwt())
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can delete their own income records
CREATE POLICY "Users can delete own income"
ON public.income
FOR DELETE
USING (user_id = public.get_user_id_from_jwt());

-- ============================================
-- EXPENSES Table Policies
-- ============================================

-- Policy: Users can view their own expenses
CREATE POLICY "Users can view own expenses"
ON public.expenses
FOR SELECT
USING (user_id = public.get_user_id_from_jwt());

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
ON public.expenses
FOR INSERT
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses"
ON public.expenses
FOR UPDATE
USING (user_id = public.get_user_id_from_jwt())
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
ON public.expenses
FOR DELETE
USING (user_id = public.get_user_id_from_jwt());

-- ============================================
-- SAVINGS_GOAL Table Policies
-- ============================================

-- Policy: Users can view their own savings goals
CREATE POLICY "Users can view own savings goals"
ON public.savings_goal
FOR SELECT
USING (user_id = public.get_user_id_from_jwt());

-- Policy: Users can insert their own savings goals
CREATE POLICY "Users can insert own savings goals"
ON public.savings_goal
FOR INSERT
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can update their own savings goals
CREATE POLICY "Users can update own savings goals"
ON public.savings_goal
FOR UPDATE
USING (user_id = public.get_user_id_from_jwt())
WITH CHECK (user_id = public.get_user_id_from_jwt());

-- Policy: Users can delete their own savings goals
CREATE POLICY "Users can delete own savings goals"
ON public.savings_goal
FOR DELETE
USING (user_id = public.get_user_id_from_jwt());

-- ============================================
-- CATEGORIES Table Policies
-- ============================================
-- Categories are typically public/read-only for all users
-- Admin operations are handled via backend with service role key

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
    -- Policy: All authenticated users can view categories
    CREATE POLICY "Users can view categories"
    ON public.categories
    FOR SELECT
    USING (public.get_user_id_from_jwt() IS NOT NULL);
    
    -- Note: INSERT/UPDATE/DELETE on categories should be admin-only
    -- and handled via backend with service role key (bypasses RLS)
  END IF;
END $$;

-- ============================================
-- Notes:
-- ============================================
-- These policies now properly check user_id instead of using `USING (true)`.
-- This satisfies Supabase Security Advisor requirements.
--
-- IMPORTANT: For Auth0 integration:
-- 1. The public.get_user_id_from_jwt() function extracts user_id from JWT claims
-- 2. You may need to configure Supabase to accept Auth0 JWTs
-- 3. Update the JWT claim path in get_user_id_from_jwt() function to match your Auth0 setup
--    (typically 'sub' for Auth0, but check your Auth0 configuration)
-- 4. Backend using service role key will bypass RLS (as intended for admin operations)
-- 5. Direct database access with anon key will be protected by these policies
--
-- To configure Auth0 JWT in Supabase:
-- - Go to Supabase Dashboard > Settings > API
-- - Add Auth0 as a JWT issuer
-- - Configure the JWT secret and claim mappings
-- - Ensure the user_id claim matches what's in your JWT (usually 'sub' for Auth0)
