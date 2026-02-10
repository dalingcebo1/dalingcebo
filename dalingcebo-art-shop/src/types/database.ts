// Database types for Supabase

export interface Artwork {
  id: number
  title: string
  artist: string
  price: number
  category: string
  scale: string
  size: string
  year: number
  medium: string
  description: string
  details: string | null
  in_stock: boolean
  inventory: number
  edition: string
  image: string
  images: string[]
  tags: string[]
  created_at: string
  updated_at: string
  base_processing_days: number
  processing_notes: string | null
}
