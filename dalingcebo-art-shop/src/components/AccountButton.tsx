'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import type { Database } from '@/lib/db/schema'
import AuthModal from './AuthModal'
import { User } from 'lucide-react'

export default function AccountButton() {
  const router = useRouter()
  const { supabase, isLoading, user } = useSupabase()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email

    const handleSignOut = async () => {
      await supabase.auth.signOut()
      setShowDropdown(false)
      router.push('/')
    }

    // Logged in - show account dropdown
    return (
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 yeezy-nav-link hover:text-black transition-colors whitespace-nowrap"
          aria-label="Account menu"
        >
          <User className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {displayName}
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <Link
                href="/account"
                className="block px-4 py-2 yeezy-body text-sm hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                My Orders
              </Link>
              <Link
                href="/account/addresses"
                className="block px-4 py-2 yeezy-body text-sm hover:bg-gray-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                Saved Addresses
              </Link>
              <hr className="my-1 border-gray-200" />
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 yeezy-body text-sm text-red-600 hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // Not logged in - show sign in button
  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="yeezy-nav-link hover:text-black transition-colors flex items-center gap-2 flex-shrink-0"
        aria-label="Sign in"
      >
        <User className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
        Sign In
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
