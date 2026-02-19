import { createServiceRoleClient } from '@/lib/db/supabase';
import { Artwork, ArtworkVideo } from '@/types/artwork';
import path from 'path';
import fs from 'fs/promises';

// JSON fallback for when Supabase is not available
async function readArtworksFromJSON(): Promise<Artwork[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'artworks.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const artworks: Partial<Artwork>[] = JSON.parse(fileContents);
    return artworks.map((artwork) => ({
      id: artwork.id ?? 0,
      title: artwork.title ?? '',
      artist: artwork.artist ?? '',
      price: artwork.price ?? 0,
      category: artwork.category ?? '',
      scale: (artwork.scale ?? 'large') as 'large' | 'small',
      size: artwork.size ?? '',
      year: artwork.year ?? 0,
      medium: artwork.medium ?? '',
      description: artwork.description ?? '',
      details: artwork.details ?? '',
      inStock: artwork.inStock ?? true,
      edition: artwork.edition ?? '',
      image: artwork.image ?? '',
      images: artwork.images ?? [],
      tags: artwork.tags ?? [],
      inventory: artwork.inventory ?? 0,
      videos: artwork.videos ?? []
    }));
  } catch (error) {
    console.error('Error reading artworks from JSON:', error);
    return [];
  }
}

async function getArtworkByIdFromJSON(id: number): Promise<Artwork | undefined> {
  const artworks = await readArtworksFromJSON();
  return artworks.find(artwork => artwork.id === id);
}

function normalizeGoogleDriveUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()

  const extractId = (): string | null => {
    if (trimmed.includes('/file/d/')) {
      return trimmed.split('/file/d/')[1]?.split('/')[0] ?? null
    }

    const googleUserMatch = trimmed.match(/googleusercontent\.com\/d\/([^/?]+)/)
    if (googleUserMatch?.[1]) {
      return googleUserMatch[1]
    }

    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (idParamMatch?.[1]) {
      return idParamMatch[1]
    }

    return null
  }

  const id = extractId()
  if (id) {
    return `https://drive.google.com/uc?export=view&id=${id}`
  }

  return trimmed
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
  try {
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching artworks from Supabase, falling back to JSON:', error)
      return await readArtworksFromJSON()
    }

    return data.map(mapRowToArtwork)
  } catch (error) {
    console.error('Error in readArtworks, falling back to JSON:', error)
    return await readArtworksFromJSON()
  }
}

export async function getArtworkById(id: number): Promise<Artwork | undefined> {
  try {
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artwork_videos(*)')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching artwork from Supabase, falling back to JSON:', error)
      return await getArtworkByIdFromJSON(id)
    }
    return mapRowToArtwork(data)
  } catch (error) {
    console.error('Error in getArtworkById, falling back to JSON:', error)
    return await getArtworkByIdFromJSON(id)
  }
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
