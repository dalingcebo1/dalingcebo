import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInquiries, recordInquiry } from '@/lib/inquiryStore'
import { inquiryPayloadSchema } from '@/lib/validations/schemas'

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

    const inquiries = await listInquiries()
    return NextResponse.json(inquiries)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load inquiries'
    return NextResponse.json({ message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const payload = inquiryPayloadSchema.parse(json)
    const saved = await recordInquiry(payload)
    return NextResponse.json(saved, { status: 201 })
  } catch (error) {
    // Zod errors usually have a name 'ZodError'
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
       return NextResponse.json({ message: 'Invalid inquiry data' }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Unable to submit inquiry'
    const status = message.includes('required') || message.includes('Invalid') ? 400 : 500
    return NextResponse.json({ message }, { status })
  }
}
