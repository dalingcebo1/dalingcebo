// Stripe payment integration
import Stripe from 'stripe'

// Server-side Stripe client
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key not configured')
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  })
}

export interface CreatePaymentIntentRequest {
  amount: number // Amount in ZAR
  currency?: string
  metadata: {
    orderId: string
    orderNumber: string
    customerEmail: string
    paymentType: 'full' | 'deposit' | 'balance'
  }
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

/**
 * Create a Stripe Payment Intent
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<PaymentIntentResponse> {
  const stripe = getStripeClient()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(request.amount * 100), // Convert to cents
    currency: request.currency || 'zar',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: request.metadata,
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Retrieve a Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const stripe = getStripeClient()
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Create a refund
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  const stripe = getStripeClient()
  
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })

  return refund
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret not configured')
  }

  const stripe = getStripeClient()
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error}`)
  }
}

/**
 * Format Stripe amount (cents to currency)
 */
export function formatStripeAmount(amountInCents: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amountInCents / 100)
}
