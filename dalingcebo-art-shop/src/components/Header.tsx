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
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="1" />
        <path d="M2 8h20M7 4v16" />
        <circle cx="14" cy="14" r="2" />
      </svg>
    ),
  },
  {
    href: '/small-paintings',
    title: 'Small Paintings',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="7" width="14" height="10" rx="1" />
        <path d="M5 11h14M9 7v10" />
        <circle cx="14.5" cy="14" r="1.5" />
      </svg>
    ),
  },
  {
    href: '/about',
    title: 'About',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-1.5 0-2.7 1.2-2.7 2.7 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7c0-1.5-1.2-2.7-2.7-2.7zM12 10.5c-3.3 0-6 2.7-6 6v4.5h12v-4.5c0-3.3-2.7-6-6-6z" />
      </svg>
    ),
  },
  {
    href: '/cart',
    title: 'Cart',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h14l-1.5 9H8L6 4H2" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M6 4L8 13h11.5" />
      </svg>
    ),
  },
]

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
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="6" height="6" />
                <rect x="14" y="4" width="6" height="6" />
                <rect x="4" y="14" width="6" height="6" />
                <rect x="14" y="14" width="6" height="6" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            )}
          </button>
        )}

        <div className="yeezy-nav-links">
          {navIconLinks.map(link => {
            const isCart = link.href === '/cart'
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`yeezy-nav-link ${isCart ? 'relative' : ''}`}
                title={link.title} 
                aria-label={isCart && itemCount > 0 ? `Cart with ${itemCount} items` : link.title}
              >
                {link.renderIcon()}
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <AccountButton />
          </div>

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
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="6" height="6" />
                    <rect x="14" y="4" width="6" height="6" />
                    <rect x="4" y="14" width="6" height="6" />
                    <rect x="14" y="14" width="6" height="6" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                )}
              </button>
            )}

            <div className="flex space-x-6">
              {navIconLinks.map(link => {
                const isCart = link.href === '/cart'
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`yeezy-nav-link ${isCart ? 'relative' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                    title={link.title}
                    aria-label={isCart && itemCount > 0 ? `Cart with ${itemCount} items` : link.title}
                  >
                    {link.renderIcon('w-6 h-6')}
                    {isCart && itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )
              })}
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
