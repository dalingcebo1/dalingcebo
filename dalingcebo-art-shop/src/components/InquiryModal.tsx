'use client'

import { useEffect, useMemo, useState } from 'react'

export type InquiryMode = 'general' | 'inquiry' | 'reserve'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  artwork?: {
    id: number
    title: string
  }
  startMode?: InquiryMode
  onSuccess?: () => void
}

interface InquiryFormState {
  name: string
  email: string
  phone: string
  message: string
}

const defaultState: InquiryFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export default function InquiryModal({ isOpen, onClose, artwork, startMode, onSuccess }: InquiryModalProps) {
  const [formState, setFormState] = useState<InquiryFormState>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const defaultMessage = useMemo(() => {
    if (!artwork) {
      return ''
    }
    if (startMode === 'reserve') {
      return `I would like to reserve "${artwork.title}". Please provide details on the deposit process.`
    }
    return `Hello, I'm interested in "${artwork.title}". Could you share availability, pricing, and viewing options?`
  }, [artwork, startMode])

  useEffect(() => {
    if (!isOpen) return
    setFeedback(null)
    setIsSubmitting(false)
    setFormState((prev) => ({
      ...defaultState,
      message: artwork ? defaultMessage : prev.message,
    }))
  }, [isOpen, defaultMessage, artwork])

  if (!isOpen) return null

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      // Determine the correct 'kind' based on the mode
      let kind: 'general' | 'artwork' | 'preorder' = 'general'
      if (artwork) {
        kind = startMode === 'reserve' ? 'preorder' : 'artwork'
      }

      const payload = {
        kind,
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim() || undefined,
        message: formState.message.trim() || defaultMessage,
        artworkId: artwork?.id,
        artworkTitle: artwork?.title,
      }

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || 'Unable to send inquiry')
      }

      if (kind === 'preorder') {
        setFeedback({ type: 'success', message: 'Reservation confirmed! Check your email for details.' })
      } else {
        setFeedback({ type: 'success', message: 'Inquiry sent. We will be in touch within 48 hours.' })
      }
      setFormState(defaultState)
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      setTimeout(onClose, 2000)
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getHeaderLabel = () => {
    if (startMode === 'reserve') return 'Reservation Request'
    return 'Artwork Inquiry'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4" onClick={() => !isSubmitting && onClose()}>
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl p-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              {artwork && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs uppercase tracking-wider rounded-full">
                  {getHeaderLabel()}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-light tracking-tight">
              {artwork ? artwork.title : 'General Inquiry'}
            </h2>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 -mt-2" 
            onClick={onClose} 
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={formState.name}
              onChange={(e) => setFormState({ ...formState, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              required
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">
              Phone <span className="text-gray-400 normal-case">(optional)</span>
            </label>
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              value={formState.phone}
              onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">
              Message
            </label>
            <textarea
              required
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
              value={formState.message || defaultMessage}
              onChange={(e) => setFormState({ ...formState, message: e.target.value })}
              placeholder="Tell us about your interest..."
            />
          </div>

          {feedback && (
            <div className={`rounded-lg p-4 text-sm ${
              feedback.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {feedback.message}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full px-6 py-4 bg-black text-white rounded-lg text-sm font-medium uppercase tracking-wider hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Inquiry
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By sending this inquiry you agree to our{' '}
            <a href="/terms" className="underline hover:text-black">Terms of Service</a> and{' '}
            <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  )
}
