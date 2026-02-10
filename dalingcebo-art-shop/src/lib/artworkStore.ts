import { createServiceRoleClient } from '@/lib/db/supabase';
import { Artwork, ArtworkVideo } from '@/types/artwork';

function normalizeGoogleDriveUrl(url: string): string {
  if (!url) return ''
  // Handle sharing URL: https://drive.google.com/file/d/ID/view?usp=sharing
  if (url.includes('drive.google.com') && url.includes('/file/d/')) {
    const id = url.split('/file/d/')[1].split('/')[0]
    return `https://drive.google.com/uc?export=view&id=${id}`
  }
  return url
}

// Helper to map DB response to Artwork type
function mapVideoRow(row: any): ArtworkVideo {
  return {
    id: row.id,
    artworkId: row.artwork_id,
    title: row.title,
    description: row.description || '',
    videoType: row.video_type,
    storageUrl: row.storage_url || undefined,
    youtubeId: row.youtube_id || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    duration: row.duration ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isFeatured: Boolean(row.is_featured),
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRowToArtwork(row: any): Artwork {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    price: Number(row.price),
    category: row.category,
    scale: row.scale,
    size: row.size,
    year: row.year,
    medium: row.medium,
    description: row.description,
    details: row.details || '',
    inStock: row.in_stock,
    edition: row.edition,
    image: normalizeGoogleDriveUrl(row.image),
    images: (row.images || []).map(normalizeGoogleDriveUrl),
    tags: row.tags || [],
    inventory: row.inventory,
    videos: Array.isArray(row.artwork_videos) ? row.artwork_videos.map(mapVideoRow) : []
  }
}

export async function readArtworks(): Promise<Artwork[]> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching artworks:', error)
    return []
  }

  return data.map(mapRowToArtwork)
}

export async function writeArtworks(_artworks: Artwork[]): Promise<void> {
  // This function was used for JSON file overwrites. 
  // With DB, we don't overwrite all. 
  // We'll leave it as a no-op or throw to prevent misuse during migration.
  console.warn('writeArtworks is deprecated with Supabase backend')
}

export async function getArtworkById(id: number): Promise<Artwork | undefined> {
  const supabase = createServiceRoleClient()
  
  const { data, error } = await supabase
    .from('artworks')
    .select('*, artwork_videos(*)')
    .eq('id', id)
    .single()

  if (error || !data) return undefined
  return mapRowToArtwork(data)
}

export async function upsertArtwork(payload: Omit<Artwork, 'id'>, id?: number): Promise<Artwork> {
  const supabase = createServiceRoleClient()
  
  const dbPayload = {
    title: payload.title,
    artist: payload.artist,
    price: payload.price,
    category: payload.category,
    scale: payload.scale,
    size: payload.size,
    year: payload.year,
    medium: payload.medium,
    description: payload.description,
    details: payload.details,
    in_stock: payload.inStock,
    inventory: payload.inventory,
    edition: payload.edition,
    image: payload.image,
    images: payload.images,
    tags: payload.tags
  }

  const query = supabase.from('artworks')
  
  let result
  if (id) {
     result = await query.update(dbPayload as never).eq('id', id).select().single()
  } else {
     result = await query.insert(dbPayload as never).select().single()
  }

  if ((result as any).error) {
    throw new Error((result as any).error.message)
  }

  return mapRowToArtwork((result as any).data)
}

export async function deleteArtwork(id: number): Promise<Artwork> {
  const supabase = createServiceRoleClient()
  const artwork = await getArtworkById(id) // Fetch first to return it
  
  if (!artwork) throw new Error('Artwork not found')

  const { error } = await supabase
    .from('artworks')
    .delete()
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  return artwork
}
