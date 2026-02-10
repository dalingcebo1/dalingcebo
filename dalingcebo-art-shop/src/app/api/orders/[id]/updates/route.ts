import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id]/updates - Get all updates for an order
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const searchParams = request.nextUrl.searchParams
    const includeInternal = searchParams.get('includeInternal') === 'true'

    const supabase = createServiceRoleClient()

    let query = (supabase
      .from('order_updates') as any)
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false })

    // Filter out internal updates for customers
    if (!includeInternal) {
      query = query.eq('is_customer_visible', true)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ updates: data })
  } catch (error: unknown) {
    console.error('Error fetching order updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch updates' },
      { status: 500 }
    )
  }
}

// POST /api/orders/[id]/updates - Create a new order update (admin only)
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const {
      updateType,
      title,
      message,
      isCustomerVisible
    } = body

    if (!title || !message || !updateType) {
      return NextResponse.json(
        { error: 'Update type, title, and message are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await (supabase
      .from('order_updates') as any)
      .insert({
        order_id: id,
        update_type: updateType,
        title,
        message,
        is_customer_visible: isCustomerVisible !== undefined ? isCustomerVisible : true
      } as any)
      .select()
      .single()

    if (error) throw error

    // TODO: Send email notification to customer if visible

    return NextResponse.json({ update: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating order update:', error)
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    )
  }
}
