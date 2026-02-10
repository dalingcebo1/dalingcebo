import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-01-28.clover',
    })
  : null

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  try {
    const { items, shippingInfo } = await request.json()

    // Create line items for Stripe
    const lineItems = items.map((item: { artwork: { title: string; description?: string; image_url?: string; price?: number }; quantity: number }) => ({
      price_data: {
        currency: 'zar',
        product_data: {
          name: item.artwork.title,
          description: item.artwork.description || '',
          images: item.artwork.image_url ? [item.artwork.image_url] : [],
        },
        unit_amount: Math.round((item.artwork.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
      customer_email: shippingInfo.email,
      shipping_address_collection: {
        allowed_countries: ['ZA'], // South Africa
      },
      metadata: {
        customerName: shippingInfo.fullName,
        customerPhone: shippingInfo.phone || '',
        shippingAddress: shippingInfo.address,
        shippingCity: shippingInfo.city,
        shippingProvince: shippingInfo.province || '',
        shippingPostalCode: shippingInfo.postalCode || '',
        shippingCountry: shippingInfo.country,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
