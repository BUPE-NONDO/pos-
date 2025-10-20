-- Initial POS Database Schema
-- Creates tables for sales transactions, quotations, and products

-- ============================================================================
-- SALES TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sales_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trans_id TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10, 2) NOT NULL CHECK (tax >= 0),
    tax_rate NUMERIC(5, 4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
    items JSONB NOT NULL,
    cashier_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_transactions_timestamp 
    ON public.sales_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_cashier 
    ON public.sales_transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_status 
    ON public.sales_transactions(status);
CREATE INDEX IF NOT EXISTS idx_sales_transactions_trans_id 
    ON public.sales_transactions(trans_id);

-- ============================================================================
-- QUOTATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id TEXT NOT NULL UNIQUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10, 2) NOT NULL CHECK (tax >= 0),
    tax_rate NUMERIC(5, 4) NOT NULL CHECK (tax_rate >= 0 AND tax_rate <= 1),
    items JSONB NOT NULL,
    prepared_by TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Quoted', 'Accepted', 'Declined', 'Expired')),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_quotations_timestamp 
    ON public.quotations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_quotations_prepared_by 
    ON public.quotations(prepared_by);
CREATE INDEX IF NOT EXISTS idx_quotations_status 
    ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_quote_id 
    ON public.quotations(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until 
    ON public.quotations(valid_until);

-- ============================================================================
-- PRODUCTS TABLE (for inventory management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    sku TEXT NOT NULL UNIQUE,
    image TEXT,
    description TEXT,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_sku 
    ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name 
    ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category 
    ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active 
    ON public.products(is_active);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER set_sales_transactions_updated_at
    BEFORE UPDATE ON public.sales_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_quotations_updated_at
    BEFORE UPDATE ON public.quotations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.sales_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" 
    ON public.sales_transactions
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
    ON public.quotations
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" 
    ON public.products
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy: Allow read-only access for anonymous users (for public product catalog)
CREATE POLICY "Allow read for anon users" 
    ON public.products
    FOR SELECT 
    TO anon
    USING (is_active = true);

-- ============================================================================
-- INITIAL SAMPLE DATA (optional - for testing)
-- ============================================================================

-- Insert sample products
INSERT INTO public.products (name, price, sku, category, stock_quantity) VALUES
    ('Paracetamol 500mg', 5.99, 'MED-001', 'Medicine', 100),
    ('Ibuprofen 200mg', 7.49, 'MED-002', 'Medicine', 75),
    ('Vitamin C 1000mg', 12.99, 'SUP-001', 'Supplements', 50),
    ('Hand Sanitizer 500ml', 8.99, 'HYG-001', 'Hygiene', 120),
    ('Face Mask (Box of 50)', 15.99, 'HYG-002', 'Hygiene', 80)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.sales_transactions IS 'Stores completed sales transactions from the POS system';
COMMENT ON TABLE public.quotations IS 'Stores customer quotations/estimates';
COMMENT ON TABLE public.products IS 'Product catalog and inventory management';

COMMENT ON COLUMN public.sales_transactions.items IS 'JSON array of cart items with id, name, price, quantity';
COMMENT ON COLUMN public.quotations.items IS 'JSON array of quoted items with id, name, price, quantity';
COMMENT ON COLUMN public.sales_transactions.status IS 'Transaction status: Completed, Pending, or Cancelled';
COMMENT ON COLUMN public.quotations.status IS 'Quotation status: Quoted, Accepted, Declined, or Expired';

