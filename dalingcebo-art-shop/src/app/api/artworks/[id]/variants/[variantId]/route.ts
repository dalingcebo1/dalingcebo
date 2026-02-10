import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'

type RouteContext = {
  params: Promise<{ id: string; variantId: string }>
}

// PUT /api/artworks/[id]/variants/[variantId] - Update a variant
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { variantId } = await context.params
    const body = await request.json()

    const {
      name,
      description,
      priceAdjustment,
      processingDays,
      inStock,
      sortOrder
    } = body

    const supabase = createServiceRoleClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (priceAdjustment !== undefined) updateData.price_adjustment = priceAdjustment
    if (processingDays !== undefined) updateData.processing_days = processingDays
    if (inStock !== undefined) updateData.in_stock = inStock
    if (sortOrder !== undefined) updateData.sort_order = sortOrder

    const { data, error } = await (supabase
      .from('artwork_variants') as any)
      .update(updateData)
      .eq('id', variantId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ variant: data })
  } catch (error: unknown) {
    console.error('Error updating variant:', error)
    return NextResponse.json(
      { error: 'Failed to update variant' },
      { status: 500 }
    )
  }
}

// DELETE /api/artworks/[id]/variants/[variantId] - Delete a variant
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { variantId } = await context.params

    const supabase = createServiceRoleClient()

    const { error } = await (supabase
      .from('artwork_variants') as any)
      .delete()
      .eq('id', variantId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting variant:', error)
    return NextResponse.json(
      { error: 'Failed to delete variant' },
      { status: 500 }
    )
  }
}
