// Database types for Supabase

export interface Artwork {
  id: string
  title: string
  price: number
  category: string
  size: string
  year: string
  image_url?: string
  description?: string
  available: boolean
  size_category: 'small' | 'large' | 'all'
  created_at: string
  updated_at: string
}
