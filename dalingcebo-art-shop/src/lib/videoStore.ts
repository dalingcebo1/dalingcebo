import { createServiceRoleClient } from '@/lib/db/supabase'
import { ArtworkVideo } from '@/types/artwork'
import { StandaloneVideo } from '@/types/video'

function mapArtworkVideo(row: any): ArtworkVideo {
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

function mapStandaloneVideo(row: any): StandaloneVideo {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    videoType: row.video_type,
    storageUrl: row.storage_url || undefined,
    youtubeId: row.youtube_id || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    duration: row.duration ?? undefined,
    sortOrder: row.sort_order ?? 0,
    isFeatured: Boolean(row.is_featured),
    published: Boolean(row.published),
    slug: row.slug,
    tags: row.tags || [],
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at || undefined,
  }
}

export async function readArtworkVideos(artworkId: number): Promise<ArtworkVideo[]> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('artwork_videos')
    .select('*')
    .eq('artwork_id', artworkId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching artwork videos:', error)
    return []
  }

  return (data || []).map(mapArtworkVideo)
}

export async function readStandaloneVideos(opts: { featuredOnly?: boolean } = {}): Promise<StandaloneVideo[]> {
  const supabase = createServiceRoleClient()
  const query = supabase
    .from('standalone_videos')
    .select('*')
    .eq('published', true)
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (opts.featuredOnly) {
    query.eq('is_featured', true)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching standalone videos:', error)
    return []
  }

  return (data || []).map(mapStandaloneVideo)
}

export async function getStandaloneVideoBySlug(slug: string): Promise<StandaloneVideo | null> {
  const supabase = createServiceRoleClient()
  const { data, error } = await supabase
    .from('standalone_videos')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return null
  }

  return mapStandaloneVideo(data)
}
