import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  if (!process.env.YOCO_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Yoco is not configured' },
      { status: 500 }
    )
  }

  try {
    const { items, shippingInfo, amount } = await request.json()

    // Create Yoco checkout
    const response = await fetch('https://online.yoco.com/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount, // Amount in cents
        currency: 'ZAR',
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
        failureUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout?error=payment_failed`,
        metadata: {
          customerName: shippingInfo.fullName,
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone || '',
          shippingAddress: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingProvince: shippingInfo.province || '',
          shippingPostalCode: shippingInfo.postalCode || '',
          shippingCountry: shippingInfo.country,
          items: JSON.stringify(items.map((item: { artwork: { title: string; price: number }; quantity: number }) => ({
            title: item.artwork.title,
            quantity: item.quantity,
            price: item.artwork.price,
          }))),
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Yoco API error:', data)
      return NextResponse.json(
        { error: 'Failed to create Yoco checkout' },
        { status: response.status }
      )
    }

    return NextResponse.json({ redirectUrl: data.redirectUrl })
  } catch (error) {
    console.error('Yoco checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
