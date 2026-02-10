'use client'

import { useEffect } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="yeezy-heading text-4xl md:text-5xl mb-4">ERROR</h1>
        <p className="yeezy-body text-lg text-gray-600 mb-8">
          Something went wrong. We're working to fix this.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-yeezy-primary"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn-yeezy inline-block"
          >
            Return Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 text-left">
            <p className="text-xs font-mono text-red-800 break-words">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
