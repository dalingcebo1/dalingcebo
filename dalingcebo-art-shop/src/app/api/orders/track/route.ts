import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'

// GET /api/orders/track?email=&orderNumber= - Track order by email and order number
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const orderNumber = searchParams.get('orderNumber')

    if (!email || !orderNumber) {
      return NextResponse.json(
        { error: 'Email and order number are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Get order with items
    const { data: order, error: orderError } = await (supabase
      .from('orders') as any)
      .select('*')
      .eq('customer_email', email)
      .eq('order_number', orderNumber)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Get order items with variant info
    const { data: items, error: itemsError } = await (supabase
      .from('order_items') as any)
      .select('*')
      .eq('order_id', order.id)

    if (itemsError) throw itemsError

    // Get customer-visible updates
    const { data: updates, error: updatesError } = await (supabase
      .from('order_updates') as any)
      .select('*')
      .eq('order_id', order.id)
      .eq('is_customer_visible', true)
      .order('created_at', { ascending: false })

    if (updatesError) throw updatesError

    // Get status history
    const { data: history, error: historyError } = await (supabase
      .from('order_status_history') as any)
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true })

    if (historyError) throw historyError

    // Get invoices
    const { data: invoices, error: invoicesError } = await (supabase
      .from('order_invoices') as any)
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })

    if (invoicesError) throw invoicesError

    return NextResponse.json({
      order: {
        ...order,
        items,
        updates,
        statusHistory: history,
        invoices
      }
    })
  } catch (error: unknown) {
    console.error('Error tracking order:', error)
    return NextResponse.json(
      { error: 'Failed to track order' },
      { status: 500 }
    )
  }
}
