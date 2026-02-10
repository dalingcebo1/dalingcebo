-- ========================================
-- VIDEO CONTENT SYSTEM
-- ========================================
-- Support for artwork process videos, studio tours, exhibitions, and marketing content
-- Videos can be hosted on Supabase Storage or embedded from YouTube

-- Create artwork_videos table (videos tied to specific artworks)
CREATE TABLE IF NOT EXISTS artwork_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artwork_id INTEGER REFERENCES artworks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT CHECK(video_type IN ('process', 'detail', 'installation', 'exhibition')) DEFAULT 'process',
  
  -- Video source (one of these will be populated)
  storage_url TEXT, -- Supabase Storage URL for uploaded videos
  youtube_id TEXT, -- YouTube video ID (not full URL)
  
  -- Metadata
  thumbnail_url TEXT,
  duration INTEGER, -- Duration in seconds
  sort_order INTEGER DEFAULT 0, -- For display ordering
  is_featured BOOLEAN DEFAULT false, -- Show prominently on artwork page
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create standalone_videos table (not tied to specific artworks)
CREATE TABLE IF NOT EXISTS standalone_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_type TEXT CHECK(video_type IN ('interview', 'studio_tour', 'exhibition', 'marketing', 'tutorial')) NOT NULL,
  
  -- Video source
  storage_url TEXT,
  youtube_id TEXT,
  
  -- Metadata
  thumbnail_url TEXT,
  duration INTEGER,
  is_featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  
  -- SEO
  slug TEXT UNIQUE,
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_artwork_videos_artwork_id ON artwork_videos(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_videos_type ON artwork_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_artwork_videos_featured ON artwork_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_standalone_videos_type ON standalone_videos(video_type);
CREATE INDEX IF NOT EXISTS idx_standalone_videos_published ON standalone_videos(published);
CREATE INDEX IF NOT EXISTS idx_standalone_videos_slug ON standalone_videos(slug);

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_artwork_videos_updated_at ON artwork_videos;
CREATE TRIGGER update_artwork_videos_updated_at BEFORE UPDATE ON artwork_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_standalone_videos_updated_at ON standalone_videos;
CREATE TRIGGER update_standalone_videos_updated_at BEFORE UPDATE ON standalone_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate slug for standalone videos
CREATE OR REPLACE FUNCTION set_video_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := TRIM(BOTH '-' FROM NEW.slug);
    
    -- Ensure uniqueness
    IF EXISTS (SELECT 1 FROM standalone_videos WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || SUBSTRING(NEW.id::TEXT FROM 1 FOR 8);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set slug before insert
DROP TRIGGER IF EXISTS set_video_slug_trigger ON standalone_videos;
CREATE TRIGGER set_video_slug_trigger
  BEFORE INSERT ON standalone_videos
  FOR EACH ROW
  EXECUTE FUNCTION set_video_slug();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_video_views(
  video_id_param UUID,
  is_artwork_video BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_artwork_video THEN
    UPDATE artwork_videos
    SET view_count = view_count + 1
    WHERE id = video_id_param;
  ELSE
    UPDATE standalone_videos
    SET view_count = view_count + 1
    WHERE id = video_id_param;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_video_views(UUID, BOOLEAN) TO anon, authenticated;

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE artwork_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_videos ENABLE ROW LEVEL SECURITY;

-- Anyone can view artwork videos (since artworks are public)
DROP POLICY IF EXISTS "Anyone can view artwork videos" ON artwork_videos;
CREATE POLICY "Anyone can view artwork videos"
  ON artwork_videos FOR SELECT
  USING (true);

-- Anyone can view published standalone videos
DROP POLICY IF EXISTS "Anyone can view published videos" ON standalone_videos;
CREATE POLICY "Anyone can view published videos"
  ON standalone_videos FOR SELECT
  USING (published = true);

-- Service role can manage all videos (admin operations)
-- No explicit policies needed, service role bypasses RLS
