import { NextRequest, NextResponse } from 'next/server'
import { verifyYocoWebhook } from '@/lib/payments/yoco'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

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
  
  // Send confirmation email
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single() as { data: any }

    if (order) {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId) as { data: any[] }

      if (items && items.length > 0) {
        const emailContent = orderConfirmationEmail(order, items)
        await sendEmail({
          to: order.customer_email,
          subject: emailContent.subject,
          html: emailContent.html
        })
        console.log(`Confirmation email sent for order ${orderId}`)
      }
    }
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError)
    // Don't throw - email failure shouldn't fail the webhook
  }
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
  
  // Restore inventory for refunded items
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('artwork_id')
      .eq('order_id', transaction.order_id)

    if (orderItems && Array.isArray(orderItems)) {
      for (const item of orderItems) {
        await supabase
          .from('artworks')
          .update({ in_stock: true } as never)
          .eq('id', (item as { artwork_id: string }).artwork_id)
      }
      console.log(`Inventory restored for refunded order ${transaction.order_id}`)
    }
  } catch (inventoryError) {
    console.error('Error restoring inventory:', inventoryError)
  }

  // Send refund notification email
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('customer_email, customer_name, order_number')
      .eq('id', transaction.order_id)
      .single() as { data: any }

    if (order) {
      await sendEmail({
        to: order.customer_email,
        subject: `Refund Processed - ${order.order_number}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="text-align: center; letter-spacing: 2px;">DALINGCEBO</h1>
            <div style="background: #10b981; color: white; padding: 24px; text-align: center; margin: 24px 0;">
              <h2>Refund Processed</h2>
              <p>Order ${order.order_number}</p>
            </div>
            <p>Dear ${order.customer_name},</p>
            <p>Your refund has been processed and should appear in your account within 5-10 business days.</p>
            <p>If you have any questions, please contact us at info@dalingcebo.art</p>
          </div>
        `
      })
      console.log(`Refund notification email sent for order ${transaction.order_id}`)
    }
  } catch (emailError) {
    console.error('Error sending refund notification:', emailError)
  }
}
