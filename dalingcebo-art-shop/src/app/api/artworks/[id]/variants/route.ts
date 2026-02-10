import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/artworks/[id]/variants - Get all variants for an artwork
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const artworkId = parseInt(id)
    
    if (isNaN(artworkId)) {
      return NextResponse.json({ error: 'Invalid artwork ID' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await (supabase
      .from('artwork_variants') as any)
      .select('*')
      .eq('artwork_id', artworkId)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json({ variants: data })
  } catch (error: unknown) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch variants' },
      { status: 500 }
    )
  }
}

// POST /api/artworks/[id]/variants - Create a new variant
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const artworkId = parseInt(id)
    
    if (isNaN(artworkId)) {
      return NextResponse.json({ error: 'Invalid artwork ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      variantType,
      name,
      description,
      priceAdjustment,
      processingDays,
      inStock,
      sortOrder
    } = body

    if (!variantType || !name) {
      return NextResponse.json(
        { error: 'Variant type and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await (supabase
      .from('artwork_variants') as any)
      .insert({
        artwork_id: artworkId,
        variant_type: variantType,
        name,
        description,
        price_adjustment: priceAdjustment || 0,
        processing_days: processingDays || 0,
        in_stock: inStock !== undefined ? inStock : true,
        sort_order: sortOrder || 0
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ variant: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating variant:', error)
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    )
  }
}
