import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listInquiries, recordInquiry } from '@/lib/inquiryStore'
import { inquiryPayloadSchema } from '@/lib/validations/schemas'
import { getArtworkById } from '@/lib/artworkStore'
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
      
      // Fetch the artwork and check availability
      const { data: artwork, error: artworkError } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', payload.artworkId)
        .single()

      if (artworkError || !artwork) {
        return NextResponse.json(
          { message: 'Artwork not found' },
          { status: 404 }
        )
      }

      // Check if artwork is available
      if (artwork.status === 'sold' || artwork.status === 'reserved') {
        return NextResponse.json(
          { message: 'This artwork is currently unavailable' },
          { status: 409 }
        )
      }

      // Perform transaction: Update artwork status and create inquiry
      const reservedUntil = new Date()
      reservedUntil.setHours(reservedUntil.getHours() + 48)

      // Update artwork to reserved status
      const { error: updateError } = await supabase
        .from('artworks')
        .update({
          status: 'reserved',
          reserved_until: reservedUntil.toISOString(),
          reserved_by_email: payload.email
        } as never)
        .eq('id', payload.artworkId)

      if (updateError) {
        console.error('Error updating artwork:', updateError)
        return NextResponse.json(
          { message: 'Failed to reserve artwork' },
          { status: 500 }
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
