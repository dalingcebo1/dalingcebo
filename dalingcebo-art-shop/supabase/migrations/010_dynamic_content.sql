-- ========================================
-- DYNAMIC CONTENT SYSTEM
-- ========================================
-- Support for managing all text content dynamically from Supabase
-- This allows updating site content without code deployments

-- Create page_content table for managing dynamic text content
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL, -- e.g., 'home', 'about', 'footer'
  section_key TEXT NOT NULL, -- e.g., 'hero', 'artist_portrait', 'philosophy'
  content_key TEXT NOT NULL, -- e.g., 'title', 'description', 'body'
  content_text TEXT NOT NULL,
  content_type TEXT CHECK(content_type IN ('text', 'html', 'markdown')) DEFAULT 'text',
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique content keys per page/section
  UNIQUE(page_key, section_key, content_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);
CREATE INDEX IF NOT EXISTS idx_page_content_section_key ON page_content(section_key);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(is_published);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view published content
CREATE POLICY "Anyone can view published content"
  ON page_content FOR SELECT
  USING (is_published = true);

-- Admin users can manage all content (requires admin role or service_role)
-- Note: Admins should use the service_role key or add custom admin role checks
CREATE POLICY "Service role can manage all content"
  ON page_content FOR ALL
  USING (auth.role() = 'service_role');

-- Insert initial content for the About page
INSERT INTO page_content (page_key, section_key, content_key, content_text, sort_order) VALUES
-- Artist Portrait Section
('about', 'artist_portrait', 'heading', 'The Artist', 1),
('about', 'artist_portrait', 'title', 'Artist Portrait', 2),
('about', 'artist_portrait', 'paragraph_1', 'Dalingcebo is a contemporary artist whose work explores the intersection of traditional African aesthetics and modern minimalism. Each piece is a dialogue between past and present, culture and innovation.', 3),
('about', 'artist_portrait', 'paragraph_2', 'Based in South Africa, Dalingcebo''s work has been exhibited internationally, gaining recognition for its bold use of color, texture, and symbolic imagery that challenges conventional narratives.', 4),

-- Philosophy Section
('about', 'philosophy', 'heading', 'Philosophy', 5),
('about', 'philosophy', 'intention_title', 'INTENTION', 6),
('about', 'philosophy', 'intention_text', 'Every brushstroke carries purpose. Each work is created with deep intention, reflecting a moment of clarity and cultural expression.', 7),
('about', 'philosophy', 'heritage_title', 'HERITAGE', 8),
('about', 'philosophy', 'heritage_text', 'Rooted in African traditions while embracing contemporary techniques, creating a unique visual language that transcends borders.', 9),
('about', 'philosophy', 'simplicity_title', 'SIMPLICITY', 10),
('about', 'philosophy', 'simplicity_text', 'Less is more. Through minimalist compositions, complex emotions and narratives emerge with powerful clarity.', 11),

-- Process Section
('about', 'process', 'heading', 'Process', 12),
('about', 'process', 'description', 'Each artwork begins with meditation and reflection. The creative process is intuitive yet disciplined, balancing spontaneity with technical precision. Using mixed media, acrylics, and digital elements, the work evolves organically, revealing its final form through layers of meaning and texture.', 13),
('about', 'process', 'image_1_alt', 'Studio Process 1', 14),
('about', 'process', 'image_2_alt', 'Studio Process 2', 15),

-- Home Page Content
('home', 'hero', 'title', 'DALINGCEBO', 20),
('home', 'hero', 'subtitle', 'Contemporary art that bridges cultures. Each piece is crafted with intention, speaking to the modern soul.', 21),
('home', 'video', 'caption', 'Studio glimpse • low-fi, soundless loop', 22),

-- Footer Content
('footer', 'main', 'description', 'Contemporary art that bridges cultures and speaks to the modern soul. Each piece crafted with intention and purpose.', 30),
('footer', 'main', 'copyright', '© 2025 Dalingcebo', 31);

-- Insert navigation links content
INSERT INTO page_content (page_key, section_key, content_key, content_text, sort_order) VALUES
('footer', 'links', 'contact', 'Contact', 40),
('footer', 'links', 'press', 'Press', 41),
('footer', 'links', 'support', 'SUPPORT', 42),
('footer', 'links', 'shipping', 'Shipping', 43),
('footer', 'links', 'returns', 'Returns', 44),
('footer', 'links', 'faq', 'FAQ', 45),
('footer', 'links', 'care', 'Care', 46),
('footer', 'links', 'privacy', 'Privacy', 47),
('footer', 'links', 'terms', 'Terms', 48);

-- Insert home page video content (for landing loop)
-- DEPENDENCY: This requires the standalone_videos table from migration 005_video_content.sql
-- If migration 005 hasn't been run, this INSERT will fail with a table not found error.
-- The ON CONFLICT clause ensures this is idempotent and safe to run multiple times.
INSERT INTO standalone_videos (title, description, video_type, storage_url, is_featured, published) VALUES
('Studio Glimpse', 'A low-fi, soundless loop showing the artist''s workspace', 'studio_tour', '/videos/landing-loop.mp4', true, true)
ON CONFLICT DO NOTHING;
