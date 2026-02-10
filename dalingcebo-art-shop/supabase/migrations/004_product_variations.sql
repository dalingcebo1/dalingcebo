-- ========================================
-- PRODUCT VARIATIONS SYSTEM
-- ========================================
-- Support for frames (framed/unframed) and canvas types (stretched/unstretched)
-- with per-artwork customization and price adjustments

-- Add processing time fields to artworks table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='base_processing_days') THEN
    ALTER TABLE artworks ADD COLUMN base_processing_days INTEGER DEFAULT 7;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='artworks' AND column_name='processing_notes') THEN
    ALTER TABLE artworks ADD COLUMN processing_notes TEXT;
  END IF;
END $$;

-- Create artwork_variants table
CREATE TABLE IF NOT EXISTS artwork_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  variant_type TEXT CHECK(variant_type IN ('frame', 'canvas_type')) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- Can be positive (add cost) or negative (discount)
  processing_days INTEGER DEFAULT 0, -- Additional processing time for this variant
  in_stock BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0, -- For display ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add variant fields to order_items table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='variant_selections') THEN
    ALTER TABLE order_items ADD COLUMN variant_selections JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='variant_price_adjustment') THEN
    ALTER TABLE order_items ADD COLUMN variant_price_adjustment DECIMAL(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='order_items' AND column_name='processing_days') THEN
    ALTER TABLE order_items ADD COLUMN processing_days INTEGER;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artwork_variants_artwork_id ON artwork_variants(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_variants_type ON artwork_variants(variant_type);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_selections ON order_items USING GIN (variant_selections);

-- Add updated_at trigger for artwork_variants
DROP TRIGGER IF EXISTS update_artwork_variants_updated_at ON artwork_variants;
CREATE TRIGGER update_artwork_variants_updated_at BEFORE UPDATE ON artwork_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate final price with variants
CREATE OR REPLACE FUNCTION calculate_variant_price(
  base_price_param DECIMAL,
  variant_ids UUID[]
)
RETURNS DECIMAL AS $$
DECLARE
  total_adjustment DECIMAL := 0;
  variant_record RECORD;
BEGIN
  -- Sum up all variant price adjustments
  FOR variant_record IN
    SELECT price_adjustment
    FROM artwork_variants
    WHERE id = ANY(variant_ids)
  LOOP
    total_adjustment := total_adjustment + variant_record.price_adjustment;
  END LOOP;
  
  RETURN base_price_param + total_adjustment;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total processing days for an order item
CREATE OR REPLACE FUNCTION calculate_item_processing_days(
  artwork_id_param INTEGER,
  variant_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  base_days INTEGER := 7;
  additional_days INTEGER := 0;
  variant_record RECORD;
BEGIN
  -- Get base processing days from artwork
  SELECT base_processing_days INTO base_days
  FROM artworks
  WHERE id = artwork_id_param;
  
  IF base_days IS NULL THEN
    base_days := 7;
  END IF;
  
  -- Add variant processing days
  FOR variant_record IN
    SELECT processing_days
    FROM artwork_variants
    WHERE id = ANY(variant_ids)
  LOOP
    additional_days := additional_days + COALESCE(variant_record.processing_days, 0);
  END LOOP;
  
  RETURN base_days + additional_days;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_variant_price(DECIMAL, UUID[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_item_processing_days(INTEGER, UUID[]) TO anon, authenticated;
