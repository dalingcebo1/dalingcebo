import { NextResponse } from 'next/server'
import { readStandaloneVideos } from '@/lib/videoStore'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const featuredOnly = searchParams.get('featured') === 'true'
    const videos = await readStandaloneVideos({ featuredOnly })
    return NextResponse.json(videos)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch videos'
    return NextResponse.json({ message }, { status: 500 })
  }
}
