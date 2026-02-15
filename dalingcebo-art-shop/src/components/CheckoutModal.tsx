'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CartItem } from '@/contexts/CartContext'
import FormInput from '@/components/forms/FormInput'
import FormTextarea from '@/components/forms/FormTextarea'
import { checkoutFormSchema, type CheckoutFormValues } from '@/lib/validations/schemas'
import { X, CheckCircle, Loader2, Info } from 'lucide-react'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onSuccess?: () => void
}

export default function CheckoutModal({ isOpen, onClose, items, total, onSuccess }: CheckoutModalProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset()
      setError(null)
      setSuccess(null)
    }
  }, [isOpen, reset])

  if (!isOpen) return null

  const onSubmit = async (values: CheckoutFormValues) => {
    setError(null)

    try {
      const payload = {
        ...values,
        total,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || 'Unable to submit order')
      }

      setSuccess('Request submitted. Our team will follow up with payment & shipping details.')
      onSuccess?.()
      setTimeout(onClose, 2000)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6" onClick={() => !isSubmitting && onClose()}>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl flex flex-col md:grid md:grid-cols-[1.2fr_1fr] max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 md:p-8 overflow-y-auto order-2 md:order-1">
          <div className="flex items-start justify-between mb-6 md:mb-8">
            <div className="flex-1">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] uppercase tracking-[0.2em] rounded-full inline-block mb-2 md:mb-3">
                Secure Checkout
              </span>
              <h2 className="text-xl md:text-2xl font-light tracking-tight">Collector Details</h2>
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 -mt-2 md:block hidden" 
              onClick={onClose} 
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormInput
              label="Full Name"
              registration={register('name')}
              error={errors.name?.message}
              placeholder="Your full name"
            />

            <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
              <FormInput
                label="Email"
                type="email"
                autoComplete="email"
                registration={register('email')}
                error={errors.email?.message}
                placeholder="your@email.com"
              />

              <FormInput
                label="Phone"
                optionalText="optional"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                registration={register('phone')}
                error={errors.phone?.message}
                placeholder="(555) 123-4567"
              />
            </div>

            <FormTextarea
              label="Shipping Address"
              rows={3}
              registration={register('address')}
              error={errors.address?.message}
              placeholder="Street address, city, state, zip code"
            />

            <FormTextarea
              label="Special Notes"
              optionalText="optional"
              rows={3}
              registration={register('notes')}
              error={errors.notes?.message}
              placeholder="Framing preferences, delivery windows, or other special requests"
            />

            {error && (
              <div className="rounded-lg p-4 text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            
            {success && (
              <div className="rounded-lg p-4 text-sm bg-green-50 text-green-700 border border-green-200">
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full px-6 py-3.5 md:py-4 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                  Confirm Purchase Request
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 md:p-8 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-200 order-1 md:order-2 max-h-48 md:max-h-none">
          <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] mb-6">Order Summary</h3>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs uppercase tracking-wide truncate mb-1">{item.title}</p>
                    <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-light whitespace-nowrap">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 pt-6">
            <div className="flex items-baseline justify-between mb-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500">Total</span>
              <span className="text-2xl font-light">${total.toLocaleString()}</span>
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-[10px] uppercase tracking-wider text-gray-600">
              <p className="flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="normal-case tracking-normal text-[11px]">This is a purchase inquiry. You will receive a secure invoice with shipping quotes and payment instructions within 24 hours.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
