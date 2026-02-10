-- Dalingcebo Art Shop - Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Create artworks table
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  year TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  available BOOLEAN DEFAULT true,
  size_category TEXT CHECK (size_category IN ('small', 'large', 'all')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on size_category for filtering
CREATE INDEX IF NOT EXISTS idx_artworks_size_category ON public.artworks(size_category);
CREATE INDEX IF NOT EXISTS idx_artworks_available ON public.artworks(available);

-- Enable Row Level Security (RLS)
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.artworks
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update (for admin)
CREATE POLICY "Allow authenticated users to insert" ON public.artworks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON public.artworks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO public.artworks (title, price, category, size, year, size_category, available) VALUES
  ('Urban Silence', 850.00, 'painting', '24×36', '2024', 'large', true),
  ('Cultural Echo', 1200.00, 'mixed-media', '30×40', '2024', 'large', true),
  ('Modern Heritage', 950.00, 'painting', '18×24', '2023', 'small', true),
  ('Abstract Form', 750.00, 'abstract', '20×30', '2024', 'large', true),
  ('Digital Nature', 650.00, 'digital', '16×20', '2024', 'small', true),
  ('Minimal Space', 1100.00, 'minimalist', '36×48', '2023', 'large', true),
  ('City Dreams', 900.00, 'painting', '24×32', '2024', 'large', true),
  ('Texture Study', 800.00, 'mixed-media', '22×28', '2023', 'small', true)
ON CONFLICT DO NOTHING;
