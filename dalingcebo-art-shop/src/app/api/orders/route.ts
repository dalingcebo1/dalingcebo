import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listOrders, recordOrder } from '@/lib/inquiryStore'
import { orderPayloadSchema } from '@/lib/validations/schemas'

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = orderPayloadSchema.parse(json)
    const saved = await recordOrder(payload)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
       return NextResponse.json({ message: 'Invalid order data' }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : 'Unable to submit order'
    const status = message.includes('required') || message.includes('Invalid') ? 400 : 500
    return NextResponse.json({ message }, { status })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const orders = await listOrders()
    return NextResponse.json(orders)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load orders'
    return NextResponse.json({ message }, { status: 500 })
  }
}
