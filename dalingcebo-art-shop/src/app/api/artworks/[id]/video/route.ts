import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { ensureAdminRequest } from '../helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function parseId(param: string | string[]): number {
  const id = Number(Array.isArray(param) ? param[0] : param)
  if (Number.isNaN(id)) {
    throw new Error('Invalid artwork id')
  }
  return id
}

function parseVideoUrl(raw: string): { youtubeId?: string; storageUrl?: string } {
  const url = raw.trim()
  if (!url) return {}

  // Support common YouTube URL formats
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v')
      if (v) return { youtubeId: v }
      const parts = parsed.pathname.split('/')
      const embedIndex = parts.indexOf('embed')
      if (embedIndex !== -1 && parts[embedIndex + 1]) {
        return { youtubeId: parts[embedIndex + 1] }
      }
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '')
      if (id) return { youtubeId: id }
    }
  } catch {
    // If URL constructor fails, fall through and treat as storage URL
  }

  // Fallback: treat as direct storage URL
  return { storageUrl: url }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: param } = await context.params
    const artworkId = parseId(param)

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('artwork_videos')
      .select('*')
      .eq('artwork_id', artworkId)
      .order('sort_order', { ascending: true })
      .limit(1)

    if (error) {
      throw new Error(error.message)
    }

    const video = Array.isArray(data) && data.length > 0 ? data[0] : null
    return NextResponse.json({ artworkId, video })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch artwork video'
    const status = message.toLowerCase().includes('invalid') ? 400 : 500
    return NextResponse.json({ message }, { status })
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    ensureAdminRequest(request)
    const { id: param } = await context.params
    const artworkId = parseId(param)

    const body = await request.json().catch(() => ({} as any))

    const rawVideos: unknown = body?.videos ?? body?.videoUrl ?? body?.url ?? []

    type InputVideo = { url: string; title?: string; videoType?: string }

    const normalizeVideos = (input: unknown): InputVideo[] => {
      const coerceType = (value: string | undefined): 'process' | 'detail' | 'installation' | 'exhibition' | undefined => {
        if (!value) return undefined
        const lower = value.toLowerCase()
        if (lower === 'process' || lower === 'detail' || lower === 'installation' || lower === 'exhibition') {
          return lower
        }
        return undefined
      }

      if (Array.isArray(input)) {
        return input
          .map((item) => {
            if (typeof item === 'string') {
              return { url: item.trim() }
            }
            if (item && typeof item === 'object' && 'url' in item) {
              const obj = item as any
              return {
                url: String(obj.url || '').trim(),
                title: obj.title ? String(obj.title) : undefined,
                videoType: coerceType(typeof obj.videoType === 'string' ? obj.videoType : undefined),
              }
            }
            return null
          })
          .filter((v): v is InputVideo => !!v && !!v.url)
      }

      const asString = String(input || '')
      if (!asString.trim()) return []
      const urls = asString
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      return urls.map((url) => ({ url }))
    }

    const inputVideos = normalizeVideos(rawVideos)

    const fallbackTitle: string = (body?.title as string | undefined)?.trim() || 'Artwork video'
    const fallbackDescription: string | null = (body?.description as string | undefined)?.trim() || null
    const fallbackType: 'process' | 'detail' | 'installation' | 'exhibition' =
      body?.videoType === 'process' ||
      body?.videoType === 'installation' ||
      body?.videoType === 'exhibition'
        ? body.videoType
        : 'detail'

    const supabase = createServiceRoleClient()

    // If no URLs provided, remove any existing videos for this artwork
    if (inputVideos.length === 0) {
      const { error } = await supabase
        .from('artwork_videos')
        .delete()
        .eq('artwork_id', artworkId)

      if (error) {
        throw new Error(error.message)
      }

      return NextResponse.json({ artworkId, videos: [] })
    }

    const parsedVideos = inputVideos
      .map((video) => ({
        video,
        parsed: parseVideoUrl(video.url),
      }))
      .filter(({ parsed }) => parsed.youtubeId || parsed.storageUrl)

    if (parsedVideos.length === 0) {
      throw new Error('Unsupported video URL')
    }

    // Replace existing video(s) with the provided list
    const deleteResult = await supabase
      .from('artwork_videos')
      .delete()
      .eq('artwork_id', artworkId)

    if (deleteResult.error) {
      throw new Error(deleteResult.error.message)
    }

    const records = parsedVideos.map(({ video, parsed }, index) => ({
      artwork_id: artworkId,
      title: video.title?.trim() || fallbackTitle,
      description: fallbackDescription,
      video_type: (video.videoType as 'process' | 'detail' | 'installation' | 'exhibition') || fallbackType,
      storage_url: parsed.storageUrl ?? null,
      youtube_id: parsed.youtubeId ?? null,
      sort_order: index + 1,
      is_featured: index === 0,
    }))

    const { data, error } = await supabase
      .from('artwork_videos')
      .insert(records)
      .select('*')

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ artworkId, videos: data ?? [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update artwork video'
    const lower = message.toLowerCase()
    const status = lower.includes('unauthorized')
      ? 401
      : lower.includes('invalid') || lower.includes('unsupported')
        ? 400
        : 500
    return NextResponse.json({ message }, { status })
  }
}
