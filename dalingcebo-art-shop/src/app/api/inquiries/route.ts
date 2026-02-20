import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInquiries, recordInquiry } from '@/lib/inquiryStore'
import { inquiryPayloadSchema } from '@/lib/validations/schemas'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { sendEnquiryReceived, sendPreorderConfirmation, sendAdminPreorderAlert } from '@/lib/email'

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
  const RESERVATION_DURATION_HOURS = 48

  try {
    const json = await request.json()
    const payload = inquiryPayloadSchema.parse(json)
    
    // Handle preorder logic
    if (payload.kind === 'preorder') {
      if (!payload.artworkId) {
        return NextResponse.json(
          { message: 'Artwork ID is required for preorder' },
          { status: 400 }
        )
      }

      const supabase = createServiceRoleClient()
      
      // Calculate reservation expiry time
      const reservedUntil = new Date()
      reservedUntil.setHours(reservedUntil.getHours() + RESERVATION_DURATION_HOURS)

      // Perform atomic update with optimistic locking to prevent race conditions
      // Only update if status is currently 'available'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any
      const { data: artwork, error: updateError } = await supabaseAny
        .from('artworks')
        .update({
          status: 'reserved',
          reserved_until: reservedUntil.toISOString(),
          reserved_by_email: payload.email
        })
        .eq('id', payload.artworkId)
        .eq('status', 'available') // Optimistic locking: only update if still available
        .select()
        .single()

      if (updateError || !artwork) {
        // Artwork either doesn't exist or is no longer available
        return NextResponse.json(
          { message: 'This artwork is currently unavailable' },
          { status: 409 }
        )
      }

      // Record the preorder inquiry
      const saved = await recordInquiry(payload)

      // Send emails
      const artworkData = {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        price: Number(artwork.price),
        category: artwork.category,
        scale: artwork.scale,
        size: artwork.size,
        year: artwork.year,
        medium: artwork.medium,
        description: artwork.description,
        details: artwork.details || '',
        inStock: artwork.in_stock,
        edition: artwork.edition,
        image: artwork.image,
        images: artwork.images || [],
        tags: artwork.tags || [],
        inventory: artwork.inventory,
        status: 'reserved' as const,
        reservedUntil: reservedUntil.toISOString(),
        reservedByEmail: payload.email
      }

      // Send confirmation to customer
      await sendPreorderConfirmation(artworkData, payload.email, payload.name)
      
      // Send alert to admin
      await sendAdminPreorderAlert(artworkData, payload.email, payload.name, payload.message)

      return NextResponse.json(saved, { status: 201 })
    }

    // Handle regular inquiries (general or artwork)
    const saved = await recordInquiry(payload)
    
    // Send standard inquiry received email
    await sendEnquiryReceived(payload.email, payload.name, payload.artworkTitle)

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
