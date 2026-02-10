-- ========================================
-- CATALOG LIBRARY
-- ========================================
-- Stores downloadable PDF catalogues and lookbooks

CREATE TABLE IF NOT EXISTS catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  cover_image TEXT,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  release_date DATE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalogs_release_date ON catalogs (release_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_catalogs_featured ON catalogs (is_featured);

DROP TRIGGER IF EXISTS update_catalogs_updated_at ON catalogs;
CREATE TRIGGER update_catalogs_updated_at BEFORE UPDATE ON catalogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();