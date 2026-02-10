import { NextRequest, NextResponse } from 'next/server'
import { createClientComponentClient, createServiceRoleClient } from '@/lib/db/supabase'

type RouteContext = {
  params: Promise<{ slug: string }>
}

// GET /api/updates/[slug] - Get a single update by slug
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params
    const searchParams = request.nextUrl.searchParams
    const admin = searchParams.get('admin') === 'true'

    const supabase = admin ? createServiceRoleClient() : createClientComponentClient()

    let query = (supabase
      .from('updates') as any)
      .select('*')
      .eq('slug', slug)
      .single()

    // Only published for public
    if (!admin) {
      query = query.eq('published', true) as unknown
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Update not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ update: data })
  } catch (error: unknown) {
    console.error('Error fetching update:', error)
    return NextResponse.json(
      { error: 'Failed to fetch update' },
      { status: 500 }
    )
  }
}

// PUT /api/updates/[slug] - Update an update (admin only)
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params
    const body = await request.json()

    const {
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      author,
      published
    } = body

    const supabase = createServiceRoleClient()

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (coverImage !== undefined) updateData.cover_image = coverImage
    if (category !== undefined) updateData.category = category
    if (tags !== undefined) updateData.tags = tags
    if (author !== undefined) updateData.author = author
    if (published !== undefined) updateData.published = published

    const { data, error } = await (supabase
      .from('updates') as any)
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ update: data })
  } catch (error: unknown) {
    console.error('Error updating update:', error)
    return NextResponse.json(
      { error: 'Failed to update update' },
      { status: 500 }
    )
  }
}

// DELETE /api/updates/[slug] - Delete an update (admin only)
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { slug } = await context.params

    const supabase = createServiceRoleClient()

    const { error } = await (supabase
      .from('updates') as any)
      .delete()
      .eq('slug', slug)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting update:', error)
    return NextResponse.json(
      { error: 'Failed to delete update' },
      { status: 500 }
    )
  }
}
