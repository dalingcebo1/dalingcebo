-- Migration: Add reservation fields to support pre-order functionality
-- This migration enables the "Soft Hold" system for artwork reservations

-- Step 1: Add status column to artworks table
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS status TEXT CHECK(status IN ('available', 'sold', 'reserved')) DEFAULT 'available';

-- Step 2: Add reservation tracking fields to artworks table
ALTER TABLE artworks
ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reserved_by_email TEXT;

-- Step 3: Update existing artworks to have 'available' or 'sold' status based on in_stock
UPDATE artworks
SET status = CASE
  WHEN in_stock = true THEN 'available'
  ELSE 'sold'
END
WHERE status IS NULL;

-- Step 4: Drop the existing check constraint on inquiries.kind
ALTER TABLE inquiries
DROP CONSTRAINT IF EXISTS inquiries_kind_check;

-- Step 5: Add new check constraint allowing 'general', 'artwork', 'preorder'
ALTER TABLE inquiries
ADD CONSTRAINT inquiries_kind_check CHECK(kind IN ('general', 'artwork', 'preorder'));

-- Step 6: Create index for status queries
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);

-- Step 7: Create index for reserved artworks expiration checks
CREATE INDEX IF NOT EXISTS idx_artworks_reserved_until ON artworks(reserved_until) WHERE status = 'reserved';

-- Step 8: Create a function to auto-expire reservations
CREATE OR REPLACE FUNCTION expire_artwork_reservations()
RETURNS void AS $$
BEGIN
  UPDATE artworks
  SET status = 'available',
      reserved_until = NULL,
      reserved_by_email = NULL
  WHERE status = 'reserved'
    AND reserved_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add comment for documentation
COMMENT ON COLUMN artworks.status IS 'Current availability status: available, sold, or reserved (48-hour soft hold)';
COMMENT ON COLUMN artworks.reserved_until IS 'Timestamp when reservation expires (NULL if not reserved)';
COMMENT ON COLUMN artworks.reserved_by_email IS 'Email of customer who placed reservation (NULL if not reserved)';
