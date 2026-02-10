-- Enable Row Level Security (RLS) on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CUSTOMERS POLICIES
-- ========================================

-- Customers can read their own data
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.uid() = id);

-- Customers can update their own data
CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

-- Anyone can create a customer (for registration)
CREATE POLICY "Anyone can create customer"
  ON customers FOR INSERT
  WITH CHECK (true);

-- ========================================
-- ADDRESSES POLICIES
-- ========================================

-- Customers can view their own addresses
CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = customer_id);

-- Customers can create their own addresses
CREATE POLICY "Customers can create own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own addresses
CREATE POLICY "Customers can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = customer_id);

-- Customers can delete their own addresses
CREATE POLICY "Customers can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = customer_id);

-- ========================================
-- ARTWORKS POLICIES
-- ========================================

-- Everyone can view artworks (public gallery)
CREATE POLICY "Anyone can view artworks"
  ON artworks FOR SELECT
  USING (true);

-- Only service role can modify artworks (admin via API)
-- (Service role bypasses RLS, so no explicit policies needed for admin operations)

-- ========================================
-- ORDERS POLICIES
-- ========================================

-- Authenticated customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

-- Anyone can view orders by email (for guest checkout order tracking)
CREATE POLICY "Anyone can view orders by email for tracking"
  ON orders FOR SELECT
  USING (customer_email = current_setting('app.current_email', true));

-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Service role can update orders (admin operations)
-- No explicit policy needed, handled by service role

-- ========================================
-- ORDER ITEMS POLICIES
-- ========================================

-- Customers can view order items for their orders
CREATE POLICY "Customers can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Anyone can view order items by email (for guest tracking)
CREATE POLICY "Anyone can view order items for tracking"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = current_setting('app.current_email', true)
    )
  );

-- Anyone can create order items (during checkout)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ========================================
-- PAYMENT TRANSACTIONS POLICIES
-- ========================================

-- Customers can view payment transactions for their orders
CREATE POLICY "Customers can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payment_transactions.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Service role creates payment transactions (webhook handlers)
-- No explicit policy needed

-- ========================================
-- INQUIRIES POLICIES
-- ========================================

-- Anyone can create inquiries (contact form)
CREATE POLICY "Anyone can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Customers can view their own inquiries
CREATE POLICY "Customers can view own inquiries"
  ON inquiries FOR SELECT
  USING (email = current_setting('app.current_email', true));

-- Service role can view/update all inquiries (admin dashboard)
-- No explicit policy needed

-- ========================================
-- HELPER FUNCTIONS FOR RLS
-- ========================================

-- Function to set current email for guest order tracking
CREATE OR REPLACE FUNCTION set_current_email(email TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_email', email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION set_current_email(TEXT) TO anon, authenticated;
