'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AccountButton from './AccountButton'
import { useCart } from '@/contexts/CartContext'

interface HeaderProps {
  zoomLevel: number
  setZoomLevel: (value: number | ((prev: number) => number)) => void
}

const navIconLinks = [
  {
    href: '/large-paintings',
    title: 'Large Paintings',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2 4h2l-2 4 2 4h2l-2 4-2-4-2 4-2-4 2-4-2-4h2l2-4z" />
        <circle cx="12" cy="6" r="1" />
        <circle cx="8" cy="10" r="1" />
        <circle cx="16" cy="10" r="1" />
        <circle cx="10" cy="14" r="1" />
        <circle cx="14" cy="14" r="1" />
        <path d="M6 20h12v2H6z" />
      </svg>
    ),
  },
  {
    href: '/small-paintings',
    title: 'Small Paintings',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="3" />
        <path d="M12 11v5" />
        <path d="M8 16h8" />
        <path d="M6 20h12v2H6z" />
      </svg>
    ),
  },
  {
    href: '/about',
    title: 'About',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
  },
  {
    href: '/cart',
    title: 'Cart',
    renderIcon: (className = 'w-6 h-6') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57L23 6H6" />
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

export default function Header({ zoomLevel, setZoomLevel }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { itemCount } = useCart()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
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
    setZoomLevel(prev => (prev + 1) % 3)
  }

  return (
    <nav className={`yeezy-nav sticky top-0 z-40 bg-white transition-shadow ${isScrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)]' : ''}`}>
      <div className="yeezy-nav-content flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleZoomToggle}
          className="yeezy-nav-link"
          title={zoomLevel >= 2 ? 'Zoom Out' : 'Zoom In'}
          aria-label={zoomLevel >= 2 ? 'Zoom out of artworks grid' : 'Zoom into artworks grid'}
        >
          {zoomLevel >= 2 ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" />
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14" />
            </svg>
          )}
        </button>

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
            <button
              type="button"
              onClick={handleZoomToggle}
              className="yeezy-nav-link"
              title={zoomLevel >= 2 ? 'Zoom Out' : 'Zoom In'}
              aria-label={zoomLevel >= 2 ? 'Zoom out of artworks grid' : 'Zoom into artworks grid'}
            >
              {zoomLevel >= 2 ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14m-7-7h14" />
                </svg>
              )}
            </button>

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
