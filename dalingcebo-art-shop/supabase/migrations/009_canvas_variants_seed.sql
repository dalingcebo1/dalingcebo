-- ========================================
-- CANVAS TYPE VARIANTS SEED DATA
-- ========================================
-- Add default stretched/unstretched canvas options for artworks
-- This can be run after migration 004_product_variations.sql

-- Example: Add canvas type variants for artwork with ID 1
-- Replace with actual artwork IDs from your database

-- Stretched Canvas (standard - no price adjustment)
INSERT INTO artwork_variants (artwork_id, variant_type, name, description, price_adjustment, processing_days, in_stock, sort_order)
VALUES 
  (1, 'canvas_type', 'Stretched', 'Canvas stretched on wooden frame, ready to hang', 0, 0, true, 1)
ON CONFLICT DO NOTHING;

-- Unstretched Canvas (typically less expensive, rolled for shipping)
INSERT INTO artwork_variants (artwork_id, variant_type, name, description, price_adjustment, processing_days, in_stock, sort_order)
VALUES 
  (1, 'canvas_type', 'Unstretched', 'Canvas rolled without frame - ideal for custom framing', -500, 0, true, 2)
ON CONFLICT DO NOTHING;

-- To add variants for multiple artworks, you can use a loop or repeat the above for each artwork_id
-- Example for artwork ID 2:
INSERT INTO artwork_variants (artwork_id, variant_type, name, description, price_adjustment, processing_days, in_stock, sort_order)
VALUES 
  (2, 'canvas_type', 'Stretched', 'Canvas stretched on wooden frame, ready to hang', 0, 0, true, 1),
  (2, 'canvas_type', 'Unstretched', 'Canvas rolled without frame - ideal for custom framing', -500, 0, true, 2)
ON CONFLICT DO NOTHING;

-- For all existing artworks (adjust price_adjustment as needed):
-- This adds stretched/unstretched options to all artworks that don't already have them
DO $$
DECLARE
  artwork_record RECORD;
BEGIN
  FOR artwork_record IN SELECT id FROM artworks WHERE in_stock = true
  LOOP
    -- Add Stretched variant if it doesn't exist
    INSERT INTO artwork_variants (artwork_id, variant_type, name, description, price_adjustment, processing_days, in_stock, sort_order)
    VALUES 
      (artwork_record.id, 'canvas_type', 'Stretched', 'Canvas stretched on wooden frame, ready to hang', 0, 0, true, 1)
    ON CONFLICT DO NOTHING;
    
    -- Add Unstretched variant if it doesn't exist
    INSERT INTO artwork_variants (artwork_id, variant_type, name, description, price_adjustment, processing_days, in_stock, sort_order)
    VALUES 
      (artwork_record.id, 'canvas_type', 'Unstretched', 'Canvas rolled without frame - ideal for custom framing', -500, 0, true, 2)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Grant select permissions
GRANT SELECT ON artwork_variants TO anon, authenticated;
