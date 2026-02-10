import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { sendEmail } from '@/lib/email'

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

    // Send email notification to customer if visible
    if (isCustomerVisible !== false) {
      try {
        const { data: order } = await supabase
          .from('orders')
          .select('customer_email, customer_name, order_number')
          .eq('id', id)
          .single() as { data: any }

        if (order) {
          await sendEmail({
            to: order.customer_email,
            subject: `Order Update - ${order.order_number}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="text-align: center; letter-spacing: 2px;">DALINGCEBO</h1>
                <div style="background: #000; color: white; padding: 24px; text-align: center; margin: 24px 0;">
                  <h2>${title}</h2>
                  <p>Order ${order.order_number}</p>
                </div>
                <p>Dear ${order.customer_name},</p>
                <p>${message}</p>
                <p style="margin-top: 24px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://dalingcebo.art'}/orders/track?email=${encodeURIComponent(order.customer_email)}&orderNumber=${order.order_number}" 
                     style="color: #000; text-decoration: underline;">
                    Track your order
                  </a>
                </p>
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5; text-align: center; color: #666; font-size: 14px;">
                  <p>Questions? Contact us at info@dalingcebo.art</p>
                </div>
              </div>
            `
          })
          console.log(`Update notification email sent for order ${id}`)
        }
      } catch (emailError) {
        console.error('Error sending update notification:', emailError)
        // Don't throw - email failure shouldn't fail the update
      }
    }

    return NextResponse.json({ update: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating order update:', error)
    return NextResponse.json(
      { error: 'Failed to create update' },
      { status: 500 }
    )
  }
}
