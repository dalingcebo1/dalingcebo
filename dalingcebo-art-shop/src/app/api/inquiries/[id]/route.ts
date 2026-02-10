import { NextRequest, NextResponse } from 'next/server'
import { updateInquiryStatus } from '@/lib/inquiryStore'

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
    
    if (status !== 'new' && status !== 'contacted') {
      return NextResponse.json(
        { message: 'Invalid status value. Must be "new" or "contacted"' },
        { status: 400 }
      )
    }
    
    const updated = await updateInquiryStatus(id, status)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update inquiry'
    const status = message === 'Inquiry not found' ? 404 : 500
    return NextResponse.json({ message }, { status })
  }
}
