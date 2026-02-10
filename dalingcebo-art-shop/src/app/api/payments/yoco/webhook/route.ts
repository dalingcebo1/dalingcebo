import { NextRequest, NextResponse } from 'next/server'
import { verifyYocoWebhook } from '@/lib/payments/yoco'
import { createServiceRoleClient } from '@/lib/db/supabase'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-yoco-signature')
    const body = await request.text()

    // Verify webhook signature
    if (!signature || !verifyYocoWebhook(signature, body)) {
      console.error('Invalid Yoco webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('Yoco webhook event:', event.type)

    // Handle different webhook events
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(event.data)
        break
      
      case 'refund.succeeded':
        await handleRefundSucceeded(event.data)
        break
      
      default:
        console.log(`Unhandled Yoco webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Yoco webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(charge: any) {
  const supabase = createServiceRoleClient()
  
  const orderId = charge.metadata?.orderId
  const paymentType = charge.metadata?.paymentType || 'full'
  
  if (!orderId) {
    console.error('No orderId in Yoco charge metadata')
    return
  }

  // Record payment transaction
  const { error: txError } = await (supabase
    .from('payment_transactions')
    .insert as any)({
      order_id: orderId,
      transaction_id: charge.id,
      payment_provider: 'yoco' as const,
      amount: charge.amountInCents / 100,
      currency: charge.currency,
      status: 'succeeded' as const,
      payment_type: paymentType as 'full' | 'deposit' | 'balance',
      metadata: charge.metadata || {},
    })

  if (txError) {
    console.error('Error recording Yoco transaction:', txError)
    throw txError
  }

  // Update order status based on payment type
  let newPaymentStatus: string
  let newOrderStatus: string

  if (paymentType === 'full') {
    newPaymentStatus = 'paid'
    newOrderStatus = 'paid'
  } else if (paymentType === 'deposit') {
    newPaymentStatus = 'deposit_paid'
    newOrderStatus = 'reserved'
  } else if (paymentType === 'balance') {
    newPaymentStatus = 'paid'
    newOrderStatus = 'paid'
  } else {
    newPaymentStatus = 'paid'
    newOrderStatus = 'paid'
  }

 const { error: orderError } = await (supabase
    .from('orders')
    .update as any)({
      payment_status: newPaymentStatus as any,
      status: newOrderStatus as any,
      payment_method: 'yoco',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    console.error('Error updating order after Yoco payment:', orderError)
    throw orderError
  }

  console.log(`Yoco payment succeeded for order ${orderId}`)
  
  // TODO: Send confirmation email
}

async function handlePaymentFailed(charge: any) {
  const supabase = createServiceRoleClient()
  
  const orderId = charge.metadata?.orderId
  
  if (!orderId) {
    console.error('No orderId in Yoco charge metadata')
    return
  }

  // Record failed transaction
  const { error: txError } = await (supabase
    .from('payment_transactions')
    .insert as any)({
      order_id: orderId,
      transaction_id: charge.id,
      payment_provider: 'yoco' as const,
      amount: charge.amountInCents / 100,
      currency: charge.currency,
      status: 'failed' as const,
      payment_type: (charge.metadata?.paymentType as 'full' | 'deposit' | 'balance') || 'full',
      metadata: charge.metadata || {},
    })

  if (txError) {
    console.error('Error recording failed Yoco transaction:', txError)
  }

  // Update order status
  const { error: orderError } = await (supabase
    .from('orders')
    .update as any)({
      payment_status: 'failed' as any,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    console.error('Error updating order after failed Yoco payment:', orderError)
  }

  console.log(`Yoco payment failed for order ${orderId}`)
}

async function handleRefundSucceeded(refund: any) {
  const supabase = createServiceRoleClient()
  
  const chargeId = refund.chargeId
  
  // Find the original transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('order_id')
    .eq('transaction_id', chargeId)
    .single() as { data: { order_id: string } | null }

  if (!transaction) {
    console.error('No transaction found for Yoco refund')
    return
  }

  // Update transaction status
  await (supabase
    .from('payment_transactions')
    .update as any)({
      status: 'refunded' as any,
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', chargeId)

  // Update order status
  await (supabase
    .from('orders')
    .update as any)({
      payment_status: 'refunded' as any,
      status: 'refunded' as any,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.order_id)

  console.log(`Yoco refund succeeded for order ${transaction.order_id}`)
  
  // TODO: Restore inventory
  // TODO: Send refund notification email
}
