'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AccountButton from './AccountButton'
import { useCart } from '@/contexts/CartContext'

interface HeaderProps {
  zoomLevel?: number
  setZoomLevel?: (value: number | ((prev: number) => number)) => void
  showBackButton?: boolean
}

const navIconLinks = [
  {
    href: '/large-paintings',
    title: 'Large Paintings',
    renderIcon: (className = 'icon-nav') => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <path d="M2 6l10-4 10 4" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: '/small-paintings',
    title: 'Small Paintings',
    renderIcon: (className = 'icon-nav') => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/about',
    title: 'About',
    renderIcon: (className = 'icon-nav') => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

const CartIcon = ({ className = 'icon-nav' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const mobileNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Large Paintings', href: '/large-paintings' },
  { label: 'Small Paintings', href: '/small-paintings' },
  { label: 'About', href: '/about' },
  { label: 'Catalogs', href: '/catalogs' },
  { label: 'Cart', href: '/cart' },
  { label: 'Account', href: '/account' },
  { label: 'Contact', href: '/contact' },
]

export default function Header({ zoomLevel = 0, setZoomLevel, showBackButton = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemCount } = useCart()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 24
      setIsScrolled(prev => prev === scrolled ? prev : scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleZoomToggle = () => {
    if (setZoomLevel) {
      setZoomLevel(prev => (prev + 1) % 3)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <nav className={`yeezy-nav sticky top-0 z-40 bg-white transition-shadow ${isScrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)]' : ''}`}>
      <div className="yeezy-nav-content flex items-center justify-between gap-4">
        {showBackButton ? (
          <button
            type="button"
            onClick={handleBack}
            className="yeezy-nav-link"
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <svg className="icon-nav" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleZoomToggle}
            className="yeezy-nav-link"
            title={zoomLevel >= 2 ? 'Zoom Out' : 'Zoom In'}
            aria-label={zoomLevel >= 2 ? 'Zoom out of artworks grid' : 'Zoom into artworks grid'}
          >
            {zoomLevel >= 2 ? (
              <svg className="icon-nav" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M8 11h6" />
              </svg>
            ) : (
              <svg className="icon-nav" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
              </svg>
            )}
          </button>
        )}

        <div className="yeezy-nav-links">
          {navIconLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="yeezy-nav-link"
              title={link.title}
              aria-label={link.title}
            >
              {link.renderIcon()}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AccountButton />
          </div>

          <Link
            href="/cart"
            className="yeezy-nav-link relative"
            title="Cart"
            aria-label={itemCount > 0 ? `Cart with ${itemCount} items` : 'Cart'}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-medium w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden text-black"
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isMenuOpen}
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block w-5 h-px bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-px' : ''}`}></span>
              <span className={`block w-5 h-px bg-black transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-px' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-6 space-y-1">
            {mobileNavLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="block text-gray-900 hover:text-gray-600 py-3 text-xs uppercase tracking-[0.2em] font-light transition-colors border-b border-gray-100 last:border-0" 
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-gray-50">
            <AccountButton />
          </div>
        </div>
      )}
    </nav>
  )
}
