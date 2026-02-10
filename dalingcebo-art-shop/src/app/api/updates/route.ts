import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient, createServiceRoleClient } from '@/lib/db/supabase'

// GET /api/updates - Get all published updates (public) or all updates (admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const admin = searchParams.get('admin') === 'true'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = admin ? createServiceRoleClient() : createClientComponentClient()

    let query = (supabase
      .from('updates') as any)
      .select('*')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    // Only show published posts for public
    if (!admin) {
      query = query.eq('published', true)
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ updates: data })
  } catch (error: unknown) {
    console.error('Error fetching updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}

// POST /api/updates - Create a new update (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      author,
      published
    } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const insertData: any = {
      title,
      content,
      excerpt,
      cover_image: coverImage,
      category: category || 'news',
      tags: tags || [],
      author: author || 'Dalingcebo',
      published: published || false
    }

    // Only set slug if provided, otherwise trigger will generate it
    if (slug) {
      insertData.slug = slug
    }

    const { data, error } = await (supabase
      .from('updates') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ update: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating update:', error)
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    )
  }
}
