// Yoco payment integration
// Yoco uses inline popup SDK for collecting payment

export interface YocoChargeRequest {
  amount: number // Amount in cents (ZAR)
  currency: string
  metadata: {
    orderId: string
    orderNumber: string
    customerEmail: string
    paymentType: 'full' | 'deposit' | 'balance'
  }
}

export interface YocoChargeResponse {
  id: string
  status: 'successful' | 'failed' | 'pending'
  amount: number
  currency: string
  metadata: Record<string, string>
  created: string
}

/**
 * Initialize Yoco inline popup
 * Returns a promise that resolves when payment is complete
 */
export function initializeYocoPayment(
  amount: number,
  onSuccess: (token: string) => void,
  onCancel: () => void
): void {
  if (typeof window === 'undefined') {
    throw new Error('Yoco can only be initialized in the browser')
  }

  const publicKey = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('Yoco public key not configured')
  }

  // Load Yoco inline script if not already loaded
  if (!(window as any).YocoSDK) {
    const script = document.createElement('script')
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js'
    script.async = true
    script.onload = () => {
      launchYocoPopup(amount, onSuccess, onCancel)
    }
    document.body.appendChild(script)
  } else {
    launchYocoPopup(amount, onSuccess, onCancel)
  }
}

function launchYocoPopup(
  amount: number,
  onSuccess: (token: string) => void,
  onCancel: () => void
): void {
  const publicKey = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY!
  
  const yoco = new (window as any).YocoSDK({
    publicKey,
  })

  yoco.showPopup({
    amountInCents: Math.round(amount * 100),
    currency: 'ZAR',
    name: 'Dalingcebo Art Shop',
    description: 'Artwork Purchase',
    callback: function (result: any) {
      if (result.error) {
        const errorMessage = result.error.message || 'Payment failed'
        console.error('Yoco Error:', errorMessage)
        onCancel()
      } else {
        // result.id is the token to charge
        onSuccess(result.id)
      }
    },
  })
}

/**
 * Server-side: Create charge with Yoco token
 */
export async function createYocoCharge(
  token: string,
  amount: number,
  metadata: YocoChargeRequest['metadata']
): Promise<YocoChargeResponse> {
  const secretKey = process.env.YOCO_SECRET_KEY
  if (!secretKey) {
    throw new Error('Yoco secret key not configured')
  }

  const response = await fetch('https://online.yoco.com/v1/charges/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      amountInCents: Math.round(amount * 100),
      currency: 'ZAR',
      metadata,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create Yoco charge')
  }

  const data = await response.json()
  
  return {
    id: data.id,
    status: data.status === 'successful' ? 'successful' : 
            data.status === 'failed' ? 'failed' : 'pending',
    amount: data.amountInCents / 100,
    currency: data.currency,
    metadata: data.metadata || {},
    created: data.created,
  }
}

/**
 * Verify Yoco webhook signature
 */
export function verifyYocoWebhook(
  signature: string,
  payload: string
): boolean {
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('Yoco webhook secret not configured')
  }

  // Yoco uses HMAC SHA256 for webhook signatures
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return signature === expectedSignature
}

/**
 * Format amount for display
 */
export function formatYocoAmount(amountInCents: number): string {
  return `R ${(amountInCents / 100).toFixed(2)}`
}
