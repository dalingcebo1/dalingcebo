import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/payments/stripe'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting: 10 requests per minute per IP
  const clientIp = getClientIp(request)
  const rateLimitResult = rateLimit(`payment-intent:${clientIp}`, {
    maxRequests: 10,
    windowMs: 60000
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    )
  }

  try {
    const body = await request.json()
    const { amount, currency, metadata } = body

    // Validate required fields
    if (!amount || !metadata || !metadata.orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, metadata.orderId' },
        { status: 400 }
      )
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      currency: currency || 'zar',
      metadata,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
    })
  } catch (error) {
    console.error('Stripe payment intent creation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      },
      { status: 500 }
    )
  }
}
