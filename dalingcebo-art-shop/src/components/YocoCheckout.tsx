'use client'

import { useState } from 'react'
import { initializeYocoPayment } from '@/lib/payments/yoco'
import LoadingSpinner from './LoadingSpinner'

interface YocoCheckoutProps {
  amount: number
  orderId: string
  orderNumber: string
  customerEmail: string
  paymentType: 'full' | 'deposit' | 'balance'
  onSuccess: (chargeId: string) => void
  onError: (error: string) => void
}

export default function YocoCheckout({
  amount,
  orderId,
  orderNumber,
  customerEmail,
  paymentType,
  onSuccess,
  onError,
}: YocoCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = () => {
    setIsProcessing(true)

    initializeYocoPayment(
      amount,
      async (token) => {
        try {
          // Send token to our API to create the charge
          const response = await fetch('/api/payments/yoco/create-charge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              amount,
              metadata: {
                orderId,
                orderNumber,
                customerEmail,
                paymentType,
              },
            }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            onSuccess(data.chargeId)
          } else {
            onError(data.error || 'Payment failed')
          }
        } catch (error) {
          onError('Failed to process payment. Please try again.')
        } finally {
          setIsProcessing(false)
        }
      },
      () => {
        // User cancelled
        setIsProcessing(false)
        onError('Payment cancelled')
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="yeezy-title text-gray-600">Payment Amount</span>
          <span className="yeezy-price">R {amount.toFixed(2)}</span>
        </div>
        <p className="yeezy-body text-xs text-gray-500">
          Secure payment powered by Yoco
        </p>
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="btn-yeezy-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            Processing...
          </span>
        ) : (
          <>Pay with Yoco</>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 text-gray-400">
``` <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 19h20L12 2zm0 5l6 11H6l6-11z"/>
        </svg>
        <span className="yeezy-body text-xs">Secured by Yoco</span>
      </div>
    </div>
  )
}
