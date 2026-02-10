'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="yeezy-section">
      <div className="yeezy-container max-w-md mx-auto text-center">
        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          
          <h1 className="yeezy-heading text-2xl mb-4">Check your email</h1>
          
          <p className="yeezy-body text-gray-600 mb-6">
            {email ? (
              <>
                We sent a sign-in link to <strong>{email}</strong>.
                <br />
                Click the link in the email to sign in.
              </>
            ) : (
              <>
                A sign-in link has been sent to your email.
                <br />
                Click the link in the email to sign in.
              </>
            )}
          </p>

          <div className="space-y-4">
            <p className="yeezy-title text-gray-500">
              The link will expire in 24 hours
            </p>
            
            <Link href="/" className="btn-yeezy block w-full">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="yeezy-section">
        <div className="yeezy-container max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <p className="yeezy-title">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
