import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { newsletterSchema } from '@/lib/validations/schemas'
import { z } from 'zod'

// POST /api/newsletter/subscribe - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    // Extend schema to include optional name which is supported by the DB
    const payload = newsletterSchema.extend({ name: z.string().optional() }).parse(json)
    const { email, name } = payload

    const supabase = createServiceRoleClient()

    // Check if already subscribed
    const { data: existing } = await (supabase
      .from('newsletter_subscribers') as any)
      .select('*')
      .eq('email', email)
      .single()

    if (existing) {
      // If unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        const { error } = await (supabase
          .from('newsletter_subscribers') as any)
          .update({
            status: 'active',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null
          } as any)
          .eq('email', email)

        if (error) throw error

        return NextResponse.json({
          message: 'Resubscribed successfully',
          subscriber: { email, status: 'active' }
        })
      }

      return NextResponse.json({
        message: 'Already subscribed',
        subscriber: existing
      })
    }

    // Create new subscription
    const { data, error } = await (supabase
      .from('newsletter_subscribers') as any)
      .insert({
        email,
        name,
        status: 'active'
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      message: 'Subscribed successfully',
      subscriber: data
    }, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
       return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
