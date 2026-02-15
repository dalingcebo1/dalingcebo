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
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="18" height="10" rx="1" />
        <path d="M3 7L12 2l9 5" opacity="0.5" />
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
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="0.5" />
        <rect x="14" y="3" width="7" height="7" rx="0.5" />
        <rect x="3" y="14" width="7" height="7" rx="0.5" />
        <rect x="14" y="14" width="7" height="7" rx="0.5" />
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
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 2L7.2 5M22 5H7H2l2.5 14H19l2.5-14H22ZM10 9h4" />
    <circle cx="10" cy="21" r="1" fill="currentColor" />
    <circle cx="18" cy="21" r="1" fill="currentColor" />
  </svg>
)

const mobileNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Catalogs', href: '/catalogs' },
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
            <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M8 11h6" />
              </svg>
            ) : (
              <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                {itemCount}
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
        <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center px-4">
            {showBackButton ? (
              <button
                type="button"
                onClick={handleBack}
                className="yeezy-nav-link"
                title="Go Back"
                aria-label="Go back to previous page"
              >
                <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35M8 11h6" />
                  </svg>
                ) : (
                  <svg className="icon-nav" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                  </svg>
                )}
              </button>
            )}

            <div className="flex space-x-6">
              {navIconLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="yeezy-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                  title={link.title}
                  aria-label={link.title}
                >
                  {link.renderIcon('icon-nav')}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 px-4 pb-4 space-y-3 text-sm yeezy-body">
            {mobileNavLinks.map(link => (
              <Link key={link.href} href={link.href} className="block text-gray-700" onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-4 pb-6 sm:hidden">
            <AccountButton />
          </div>
        </div>
      )}
    </nav>
  )
}
