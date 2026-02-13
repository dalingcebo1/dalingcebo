import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeWebhook } from '@/lib/payments/stripe'
import { createServiceRoleClient } from '@/lib/db/supabase'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      logger.warn('Stripe webhook missing signature', {
        method: 'POST',
        route: '/api/payments/stripe/webhook',
        status: 400,
        error: 'Missing stripe-signature header',
        duration: Date.now() - startTime,
      });
      
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    const body = await request.text()
    
    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyStripeWebhook(body, signature)
    } catch (error) {
      logger.error('Stripe webhook verification failed', {
        method: 'POST',
        route: '/api/payments/stripe/webhook',
        status: 401,
        error: error instanceof Error ? error.message : 'Invalid signature',
        duration: Date.now() - startTime,
      });
      
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    logger.info('Stripe webhook received', {
      method: 'POST',
      route: '/api/payments/stripe/webhook',
      eventType: event.type,
      status: 200,
    });

    // Handle different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      
      default:
        logger.info('Unhandled Stripe webhook event', {
          method: 'POST',
          route: '/api/payments/stripe/webhook',
          eventType: event.type,
        });
    }

    logger.info('Stripe webhook processed', {
      method: 'POST',
      route: '/api/payments/stripe/webhook',
      eventType: event.type,
      status: 200,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Stripe webhook error', {
      method: 'POST',
      route: '/api/payments/stripe/webhook',
      status: 500,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createServiceRoleClient()
  
  const orderId = paymentIntent.metadata.orderId
  const paymentType = paymentIntent.metadata.paymentType || 'full'
  
  if (!orderId) {
    logger.error('No orderId in Stripe payment intent metadata', {
      route: '/api/payments/stripe/webhook',
      paymentIntentId: paymentIntent.id,
    });
    return
  }

  // Record payment transaction
  const { error: txError } = await (supabase
    .from('payment_transactions')
    .insert as any)({
      order_id: orderId,
      transaction_id: paymentIntent.id,
      payment_provider: 'stripe' as const,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency.toUpperCase(),
      status: 'succeeded' as const,
      payment_type: (paymentType as 'full' | 'deposit' | 'balance') || 'full',
      metadata: paymentIntent.metadata as any,
    })

  if (txError) {
    logger.error('Error recording Stripe transaction', {
      route: '/api/payments/stripe/webhook',
      orderId,
      error: txError.message,
    });
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
      payment_method: 'stripe',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (orderError) {
    logger.error('Error updating order after Stripe payment', {
      route: '/api/payments/stripe/webhook',
      orderId,
      error: orderError.message,
    });
    throw orderError
  }

  logger.info('Stripe payment succeeded', {
    route: '/api/payments/stripe/webhook',
    orderId,
    paymentType,
    amount: paymentIntent.amount / 100,
  });
  
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
        logger.info('Confirmation email sent', {
          route: '/api/payments/stripe/webhook',
          orderId,
        });
      }
    }
  } catch (emailError) {
    logger.error('Error sending confirmation email', {
      route: '/api/payments/stripe/webhook',
      orderId,
      error: emailError instanceof Error ? emailError.message : 'Unknown error',
    });
    // Don't throw - email failure shouldn't fail the webhook
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const supabase = createServiceRoleClient()
  
  const orderId = paymentIntent.metadata.orderId
  
  if (!orderId) {
    logger.error('No orderId in Stripe payment intent metadata', {
      route: '/api/payments/stripe/webhook',
      paymentIntentId: paymentIntent.id,
    });
    return
  }

  // Record failed transaction
  const { error: txError } = await (supabase
    .from('payment_transactions')
    .insert as any)({
      order_id: orderId,
      transaction_id: paymentIntent.id,
      payment_provider: 'stripe' as const,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'failed' as const,
      payment_type: (paymentIntent.metadata.paymentType as 'full' | 'deposit' | 'balance') || 'full',
      metadata: paymentIntent.metadata as any,
    })

  if (txError) {
    logger.error('Error recording failed Stripe transaction', {
      route: '/api/payments/stripe/webhook',
      orderId,
      error: txError.message,
    });
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
    logger.error('Error updating order after failed Stripe payment', {
      route: '/api/payments/stripe/webhook',
      orderId,
      error: orderError.message,
    });
  }

  logger.warn('Stripe payment failed', {
    route: '/api/payments/stripe/webhook',
    orderId,
    amount: paymentIntent.amount / 100,
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const supabase = createServiceRoleClient()
  
  const paymentIntentId = charge.payment_intent as string
  
  if (!paymentIntentId) {
    logger.error('No payment intent ID in Stripe charge', {
      route: '/api/payments/stripe/webhook',
      chargeId: charge.id,
    });
    return
  }

  // Find the original transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('order_id')
    .eq('transaction_id', paymentIntentId)
    .single() as { data: { order_id: string } | null }

  if (!transaction) {
    logger.error('No transaction found for Stripe refund', {
      route: '/api/payments/stripe/webhook',
      paymentIntentId,
    });
    return
  }

  // Update transaction status
  await (supabase
    .from('payment_transactions')
    .update as any)({
      status: 'refunded' as any,
      updated_at: new Date().toISOString(),
    })
    .eq('transaction_id', paymentIntentId)

  // Update order status
  await (supabase
    .from('orders')
    .update as any)({
      payment_status: 'refunded' as any,
      status: 'refunded' as any,
      updated_at: new Date().toISOString(),
    })
    .eq('id', transaction.order_id)

  logger.info('Stripe refund succeeded', {
    route: '/api/payments/stripe/webhook',
    orderId: transaction.order_id,
  });
  
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
      logger.info('Inventory restored for refunded order', {
        route: '/api/payments/stripe/webhook',
        orderId: transaction.order_id,
      });
    }
  } catch (inventoryError) {
    logger.error('Error restoring inventory', {
      route: '/api/payments/stripe/webhook',
      orderId: transaction.order_id,
      error: inventoryError instanceof Error ? inventoryError.message : 'Unknown error',
    });
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
      logger.info('Refund notification email sent', {
        route: '/api/payments/stripe/webhook',
        orderId: transaction.order_id,
      });
    }
  } catch (emailError) {
    logger.error('Error sending refund notification', {
      route: '/api/payments/stripe/webhook',
      orderId: transaction.order_id,
      error: emailError instanceof Error ? emailError.message : 'Unknown error',
    });
  }
}
