'use client'

import { useState, FormEvent } from 'react'
import { useSupabase } from '@/components/SupabaseProvider'
import type { Database } from '@/lib/db/schema'
import LoadingSpinner from './LoadingSpinner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultEmail?: string
}

export default function AuthModal({ isOpen, onClose, defaultEmail = '' }: AuthModalProps) {
  const [email, setEmail] = useState(defaultEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const { supabase } = useSupabase()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      if (authError) {
        setError('Failed to send sign-in link. Please try again.')
      } else {
        setIsSuccess(true)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (authError) {
        throw authError
      }
    } catch {
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-none p-0"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full p-8 md:p-12 relative border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-black hover:bg-black hover:text-white transition-colors p-2"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          // Success state
          <div className="text-center py-8">
            <div className="mx-auto h-20 w-20 border-2 border-black flex items-center justify-center mb-6">
              <svg
                className="h-10 w-10 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Check Email</h2>
            <p className="font-mono text-sm uppercase tracking-wider mb-8 border-b-2 border-black pb-8">
              Link sent to <strong>{email}</strong>
            </p>
            <button 
              onClick={onClose} 
              className="w-full bg-black text-white px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black border-2 border-black transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          // Form state
          <div className="mt-2">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 leading-none">Sign In</h2>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-10">
              Access your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.1em] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="NAME@EXAMPLE.COM"
                  className="w-full bg-gray-50 border-2 border-gray-200 px-4 py-4 font-mono text-sm focus:outline-none focus:border-black focus:ring-0 rounded-none placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-500 p-4">
                  <p className="text-xs font-mono text-red-600 uppercase">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black border-2 border-black transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" />
                    PROCESSING
                  </span>
                ) : (
                  'Continue with Email'
                )}
              </button>
            </form>

            {/* Google Sign In */}
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs ml-0">
                    <span className="bg-white px-2 font-mono text-gray-400 uppercase tracking-widest">
                      OR
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white text-black px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-50 border-2 border-black transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <p className="font-mono text-[10px] text-gray-400 mt-6 text-center uppercase tracking-wide">
              Secure authentication via magic link
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
