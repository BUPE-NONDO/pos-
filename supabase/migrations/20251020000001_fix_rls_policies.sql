-- Fix RLS Policies to Allow Anonymous Access
-- POS systems need to work without authentication

-- ============================================================================
-- DROP EXISTING POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.sales_transactions;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.quotations;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow read for anon users" ON public.products;

-- ============================================================================
-- CREATE NEW POLICIES FOR ANONYMOUS ACCESS
-- ============================================================================

-- Sales Transactions: Allow all operations for both authenticated and anonymous users
CREATE POLICY "Allow all operations for all users" 
    ON public.sales_transactions
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Quotations: Allow all operations for both authenticated and anonymous users
CREATE POLICY "Allow all operations for all users" 
    ON public.quotations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Products: Allow all operations for both authenticated and anonymous users
CREATE POLICY "Allow all operations for all users" 
    ON public.products
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "Allow all operations for all users" ON public.sales_transactions IS 
    'POS systems require anonymous access. In production, consider adding API key validation or moving to authenticated users.';

COMMENT ON POLICY "Allow all operations for all users" ON public.quotations IS 
    'POS systems require anonymous access. In production, consider adding API key validation or moving to authenticated users.';

COMMENT ON POLICY "Allow all operations for all users" ON public.products IS 
    'POS systems require anonymous access. In production, consider adding API key validation or moving to authenticated users.';

