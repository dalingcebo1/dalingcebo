import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'

type RouteContext = {
  params: Promise<{ id: string }>
}

// PUT /api/orders/[id]/processing-time - Update processing time estimates (admin only)
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const {
      estimatedProcessingDays,
      estimatedShipDate,
      estimatedDeliveryDate
    } = body

    const supabase = createServiceRoleClient()

    const updateData: any = {}
    if (estimatedProcessingDays !== undefined) {
      updateData.estimated_processing_days = estimatedProcessingDays
    }
    if (estimatedShipDate !== undefined) {
      updateData.estimated_ship_date = estimatedShipDate
    }
    if (estimatedDeliveryDate !== undefined) {
      updateData.estimated_delivery_date = estimatedDeliveryDate
    }

    const { data, error } = await (supabase
      .from('orders') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ order: data })
  } catch (error: unknown) {
    console.error('Error updating processing time:', error)
    return NextResponse.json(
      { error: 'Failed to update processing time' },
      { status: 500 }
    )
  }
}
