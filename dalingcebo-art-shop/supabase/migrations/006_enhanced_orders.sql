-- ========================================
-- MARKETING UPDATES / BLOG SYSTEM
-- ========================================

-- Create updates table for blog posts and announcements
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  
  -- Organization
  category TEXT CHECK(category IN ('news', 'exhibition', 'studio_update', 'press')) DEFAULT 'news',
  tags TEXT[] DEFAULT '{}',
  
  -- Publishing
  author TEXT DEFAULT 'Dalingcebo',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- SEO
  meta_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT CHECK(status IN ('active', 'unsubscribed')) DEFAULT 'active',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ========================================
-- ENHANCED ORDER MANAGEMENT
-- ========================================

-- Add processing time and delivery estimate fields to orders
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='estimated_processing_days') THEN
    ALTER TABLE orders ADD COLUMN estimated_processing_days INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='estimated_ship_date') THEN
    ALTER TABLE orders ADD COLUMN estimated_ship_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='estimated_delivery_date') THEN
    ALTER TABLE orders ADD COLUMN estimated_delivery_date TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='actual_processing_days') THEN
    ALTER TABLE orders ADD COLUMN actual_processing_days INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='processing_started_at') THEN
    ALTER TABLE orders ADD COLUMN processing_started_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='processing_completed_at') THEN
    ALTER TABLE orders ADD COLUMN processing_completed_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create order_invoices table
CREATE TABLE IF NOT EXISTS order_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_type TEXT CHECK(invoice_type IN ('proforma', 'final', 'deposit', 'balance')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  pdf_url TEXT, -- Supabase Storage URL
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_status_history table (audit trail)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  payment_status TEXT,
  note TEXT,
  created_by TEXT DEFAULT 'system', -- 'system' or admin email
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_updates table (customer-visible timeline)
CREATE TABLE IF NOT EXISTS order_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  update_type TEXT CHECK(update_type IN ('payment', 'shipping', 'production', 'general')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_customer_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_updates_slug ON updates(slug);
CREATE INDEX IF NOT EXISTS idx_updates_published ON updates(published);
CREATE INDEX IF NOT EXISTS idx_updates_category ON updates(category);
CREATE INDEX IF NOT EXISTS idx_updates_published_at ON updates(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

CREATE INDEX IF NOT EXISTS idx_order_invoices_order_id ON order_invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_order_invoices_invoice_number ON order_invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_updates_order_id ON order_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_order_updates_created_at ON order_updates(created_at DESC);

-- ========================================
-- TRIGGERS
-- ========================================

DROP TRIGGER IF EXISTS update_updates_updated_at ON updates;
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug for updates
CREATE OR REPLACE FUNCTION set_update_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    
    -- Ensure uniqueness
    IF EXISTS (SELECT 1 FROM updates WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    END IF;
  END IF;
  
  -- Set published_at when publishing
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_update_slug_trigger ON updates;
CREATE TRIGGER set_update_slug_trigger
  BEFORE INSERT OR UPDATE ON updates
  FOR EACH ROW
  EXECUTE FUNCTION set_update_slug();

-- Auto-log status changes to history
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status or payment_status changed
  IF (OLD.status IS DISTINCT FROM NEW.status) OR (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN
    INSERT INTO order_status_history (order_id, status, payment_status, note)
    VALUES (NEW.id, NEW.status, NEW.payment_status, NEW.admin_notes);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_order_status_change_trigger ON orders;
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_invoice_number TEXT;
  year_part TEXT;
  sequence_part TEXT;
  max_sequence INTEGER;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the max sequence for this year
  SELECT COALESCE(MAX(
    SUBSTRING(invoice_number FROM 'DCINV-' || year_part || '-([0-9]+)')::INTEGER
  ), 0) INTO max_sequence
  FROM order_invoices
  WHERE invoice_number LIKE 'DCINV-' || year_part || '-%';
  
  -- Increment and format
  sequence_part := LPAD((max_sequence + 1)::TEXT, 4, '0');
  
  -- Combine parts
  new_invoice_number := 'DCINV-' || year_part || '-' || sequence_part;
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order processing time
CREATE OR REPLACE FUNCTION calculate_order_processing_time(order_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  max_processing_days INTEGER := 0;
  item_processing_days INTEGER;
BEGIN
  -- Get the longest processing time from all order items
  FOR item_processing_days IN
    SELECT COALESCE(processing_days, 7)
    FROM order_items
    WHERE order_id = order_id_param
  LOOP
    IF item_processing_days > max_processing_days THEN
      max_processing_days := item_processing_days;
    END IF;
  END LOOP;
  
  RETURN max_processing_days;
END;
$$ LANGUAGE plpgsql;

-- Function to estimate delivery dates
CREATE OR REPLACE FUNCTION estimate_delivery_dates(
  order_id_param UUID,
  processing_days_param INTEGER,
  shipping_country_param TEXT
)
RETURNS TABLE(ship_date TIMESTAMPTZ, delivery_date TIMESTAMPTZ) AS $$
DECLARE
  shipping_days INTEGER := 3; -- Default domestic shipping
  order_created_at TIMESTAMPTZ;
BEGIN
  -- Get order creation date
  SELECT created_at INTO order_created_at
  FROM orders
  WHERE id = order_id_param;
  
  -- Adjust shipping days for international
  IF shipping_country_param != 'South Africa' THEN
    shipping_days := 10;
  END IF;
  
  -- Calculate dates (excluding weekends - simplified)
  ship_date := order_created_at + (processing_days_param || ' days')::INTERVAL;
  delivery_date := ship_date + (shipping_days || ' days')::INTERVAL;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to create order update
CREATE OR REPLACE FUNCTION create_order_update(
  order_id_param UUID,
  update_type_param TEXT,
  title_param TEXT,
  message_param TEXT
)
RETURNS UUID AS $$
DECLARE
  update_id UUID;
BEGIN
  INSERT INTO order_updates (order_id, update_type, title, message)
  VALUES (order_id_param, update_type_param, title_param, message_param)
  RETURNING id INTO update_id;
  
  RETURN update_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_order_processing_time(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION estimate_delivery_dates(UUID, INTEGER, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_order_update(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_updates ENABLE ROW LEVEL SECURITY;

-- Updates policies
CREATE POLICY "Anyone can view published updates"
  ON updates FOR SELECT
  USING (published = true);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Invoice policies
CREATE POLICY "Customers can view own invoices"
  ON order_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_invoices.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view invoices for order tracking"
  ON order_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_invoices.order_id
      AND orders.customer_email = current_setting('app.current_email', true)
    )
  );

-- Status history policies (read-only for customers)
CREATE POLICY "Customers can view own order history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND orders.customer_id = auth.uid()
    )
  );

-- Order updates policies
CREATE POLICY "Customers can view own order updates"
  ON order_updates FOR SELECT
  USING (
    is_customer_visible = true AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_updates.order_id
      AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view updates for order tracking"
  ON order_updates FOR SELECT
  USING (
    is_customer_visible = true AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_updates.order_id
      AND orders.customer_email = current_setting('app.current_email', true)
    )
  );
