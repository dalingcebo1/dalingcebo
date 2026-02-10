import { NextRequest, NextResponse } from 'next/server'
import { createYocoCharge } from '@/lib/payments/yoco'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, amount, metadata } = body

    // Validate required fields
    if (!token || !amount || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields: token, amount, metadata' },
        { status: 400 }
      )
    }

    // Create charge with Yoco
    const charge = await createYocoCharge(token, amount, metadata)

    if (charge.status === 'successful') {
      return NextResponse.json({
        success: true,
        chargeId: charge.id,
        status: charge.status,
        amount: charge.amount,
      })
    } else {
      return NextResponse.json(
        {
          error: 'Payment was not successful',
          status: charge.status,
        },
        { status: 402 }
      )
    }
  } catch (error) {
    console.error('Yoco charge error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process payment',
      },
      { status: 500 }
    )
  }
}
