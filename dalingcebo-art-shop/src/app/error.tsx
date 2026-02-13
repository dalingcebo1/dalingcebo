'use client'

import { useEffect } from 'react'
import FallbackMessage from '@/components/FallbackMessage'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error)
    }
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <FallbackMessage
        title="ERROR"
        description="Something went wrong. We're working to fix this."
        icon="error"
        primaryAction={{ label: 'Try Again', onClick: reset }}
        secondaryAction={{ label: 'Return Home', href: '/' }}
      />
      
      {process.env.NODE_ENV === 'development' && error.message && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 text-left max-w-md mx-4">
          <p className="text-xs font-mono text-red-800 break-words">
            {error.message}
          </p>
        </div>
      )}
    </div>
  )
}
