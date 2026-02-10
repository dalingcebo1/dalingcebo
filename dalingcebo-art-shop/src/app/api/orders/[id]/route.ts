import { NextRequest, NextResponse } from 'next/server'
import { updateOrderStatus } from '@/lib/inquiryStore'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const { status } = await request.json()
    
    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      )
    }
    
    if (status !== 'new' && status !== 'processing' && status !== 'archived') {
      return NextResponse.json(
        { message: 'Invalid status value. Must be "new", "processing", or "archived"' },
        { status: 400 }
      )
    }
    
    const updated = await updateOrderStatus(id, status)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update order'
    const status = message === 'Order not found' ? 404 : 500
    return NextResponse.json({ message }, { status })
  }
}
