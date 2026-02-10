-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
  year_part TEXT;
  sequence_part TEXT;
  max_sequence INTEGER;
BEGIN
  -- Get current year
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get the max sequence for this year
  SELECT COALESCE(MAX(
    SUBSTRING(order_number FROM 'DCART-' || year_part || '-([0-9]+)')::INTEGER
  ), 0) INTO max_sequence
  FROM orders
  WHERE order_number LIKE 'DCART-' || year_part || '-%';
  
  -- Increment and format
  sequence_part := LPAD((max_sequence + 1)::TEXT, 4, '0');
  
  -- Combine parts
  new_order_number := 'DCART-' || year_part || '-' || sequence_part;
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set order number before insert
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Function to decrement artwork inventory
CREATE OR REPLACE FUNCTION decrement_artwork_inventory(
  artwork_id_param INTEGER,
  quantity_param INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_inventory INTEGER;
BEGIN
  -- Get current inventory
  SELECT inventory INTO current_inventory
  FROM artworks
  WHERE id = artwork_id_param
  FOR UPDATE; -- Lock the row
  
  -- Check if sufficient inventory
  IF current_inventory IS NULL OR current_inventory < quantity_param THEN
    RETURN FALSE;
  END IF;
  
  -- Decrement inventory
  UPDATE artworks
  SET inventory = inventory - quantity_param,
      in_stock = CASE
        WHEN inventory - quantity_param <= 0 THEN FALSE
        ELSE TRUE
      END,
      updated_at = NOW()
  WHERE id = artwork_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to restore artwork inventory (for cancellations/refunds)
CREATE OR REPLACE FUNCTION restore_artwork_inventory(
  artwork_id_param INTEGER,
  quantity_param INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE artworks
  SET inventory = inventory + quantity_param,
      in_stock = TRUE,
      updated_at = NOW()
  WHERE id = artwork_id_param;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check and expire reservations
CREATE OR REPLACE FUNCTION expire_reservations()
RETURNS TABLE(expired_order_id UUID, order_number TEXT) AS $$
DECLARE
  expired_order RECORD;
BEGIN
  -- Find orders with expired reservations
  FOR expired_order IN
    SELECT id, order_number, customer_email
    FROM orders
    WHERE status IN ('deposit_paid', 'reserved')
    AND reservation_expires_at < NOW()
    AND payment_status = 'deposit_paid'
  LOOP
    -- Cancel the order
    UPDATE orders
    SET status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW(),
        admin_notes = COALESCE(admin_notes, '') || E'\n' || 'Auto-cancelled: Reservation expired'
    WHERE id = expired_order.id;
    
    -- Restore inventory for each order item
    PERFORM restore_artwork_inventory(oi.artwork_id, oi.quantity)
    FROM order_items oi
    WHERE oi.order_id = expired_order.id
    AND oi.artwork_id IS NOT NULL;
    
    -- Return the expired order
    expired_order_id := expired_order.id;
    order_number := expired_order.order_number;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  subtotal_param DECIMAL,
  country_param TEXT
)
RETURNS DECIMAL AS $$
DECLARE
  free_shipping_threshold DECIMAL := 5000.00;
  flat_rate DECIMAL := 150.00;
  international_rate DECIMAL := 500.00;
BEGIN
  -- Free shipping over threshold
  IF subtotal_param >= free_shipping_threshold THEN
    RETURN 0;
  END IF;
  
  -- International shipping
  IF country_param != 'South Africa' THEN
    RETURN international_rate;
  END IF;
  
  -- Domestic flat rate
  RETURN flat_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate VAT
CREATE OR REPLACE FUNCTION calculate_vat(amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(amount * 0.15, 2);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_artwork_inventory(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION restore_artwork_inventory(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_shipping_cost(DECIMAL, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_vat(DECIMAL) TO anon, authenticated;
