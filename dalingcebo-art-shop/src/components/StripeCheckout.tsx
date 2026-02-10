'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import LoadingSpinner from './LoadingSpinner'

// Load Stripe outside component to avoid recreating
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  amount: number
  orderId: string
  orderNumber: string
  customerEmail: string
  paymentType: 'full' | 'deposit' | 'balance'
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent on mount
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: props.amount,
            currency: 'zar',
            metadata: {
              orderId: props.orderId,
              orderNumber: props.orderNumber,
              customerEmail: props.customerEmail,
              paymentType: props.paymentType,
            },
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.error || 'Failed to initialize payment')
        }
      } catch {
        setError('Failed to connect to payment server')
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [props.amount, props.orderId, props.orderNumber, props.customerEmail, props.paymentType])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 yeezy-body">{error || 'Failed to load payment form'}</p>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#000000',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'inherit',
            borderRadius: '0.375rem',
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  )
}

function CheckoutForm({
  amount,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        setMessage(error.message || 'Payment failed')
        onError(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else {
        setMessage('Payment processing. Please wait...')
      }
    } catch {
      setMessage('An unexpected error occurred')
      onError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="yeezy-title text-gray-600">Payment Amount</span>
          <span className="yeezy-price">R {amount.toFixed(2)}</span>
        </div>
        <p className="yeezy-body text-xs text-gray-500">
          Secure payment powered by Stripe
        </p>
      </div>

      <PaymentElement />

      {message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="btn-yeezy-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Processing...
          </span>
        ) : (
          <>Pay R {amount.toFixed(2)}</>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-gray-400">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="yeezy-body text-xs">Secured by Stripe</span>
      </div>
    </form>
  )
}
