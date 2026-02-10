'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  zoomLevel: number
  setZoomLevel: (value: number | ((prev: number) => number)) => void
}

export default function Header({ zoomLevel, setZoomLevel }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleZoomToggle = () => {
    setZoomLevel(prev => (prev + 1) % 3)
  }

  return (
    <>
      <nav className="yeezy-nav">
        <div className="yeezy-nav-content">
          {/* Zoom toggle button on far left */}
          <div className="yeezy-nav-left">
            <button 
              onClick={handleZoomToggle}
              className="yeezy-nav-link"
              title={zoomLevel >= 2 ? "Zoom Out" : "Zoom In"}
            >
              {zoomLevel >= 2 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
              )}
            </button>
          </div>

          {/* Center Navigation */}
          <div className="yeezy-nav-links">
            <Link href="/large-paintings" className="yeezy-nav-link" title="Large Paintings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* Chess Queen */}
                <path d="M12 2l2 4h2l-2 4 2 4h2l-2 4-2-4-2 4-2-4 2-4-2-4h2l2-4z"/>
                <circle cx="12" cy="6" r="1"/>
                <circle cx="8" cy="10" r="1"/>
                <circle cx="16" cy="10" r="1"/>
                <circle cx="10" cy="14" r="1"/>
                <circle cx="14" cy="14" r="1"/>
                <path d="M6 20h12v2H6z"/>
              </svg>
            </Link>
            <Link href="/small-paintings" className="yeezy-nav-link" title="Small Paintings">
              <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* Chess Pawn */}
                <circle cx="12" cy="8" r="3"/>
                <path d="M12 11v5"/>
                <path d="M8 16h8"/>
                <path d="M6 20h12v2H6z"/>
              </svg>
            </Link>
            <Link href="/about" className="yeezy-nav-link" title="About">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4m0-4h.01"/>
              </svg>
            </Link>
          </div>

          {/* Cart on far right */}
          <div className="yeezy-nav-right hidden md:flex">
            <button className="yeezy-nav-link" title="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57L23 6H6"/>
              </svg>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block w-5 h-px bg-black transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-px' : ''
              }`}></span>
              <span className={`block w-5 h-px bg-black transition-all duration-300 mt-1 ${
                isMenuOpen ? '-rotate-45 -translate-y-px' : ''
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center px-4">
              {/* Zoom toggle */}
              <button 
                onClick={handleZoomToggle}
                className="yeezy-nav-link"
                title={zoomLevel >= 2 ? "Zoom Out" : "Zoom In"}
              >
                {zoomLevel >= 2 ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 5v14m-7-7h14"/>
                  </svg>
                )}
              </button>

              {/* Center icons */}
              <div className="flex space-x-6">
              <Link 
                href="/large-paintings" 
                className="yeezy-nav-link"
                onClick={() => setIsMenuOpen(false)}
                title="Large Paintings"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Chess Queen */}
                  <path d="M12 2l2 4h2l-2 4 2 4h2l-2 4-2-4-2 4-2-4 2-4-2-4h2l2-4z"/>
                  <circle cx="12" cy="6" r="1"/>
                  <circle cx="8" cy="10" r="1"/>
                  <circle cx="16" cy="10" r="1"/>
                  <circle cx="10" cy="14" r="1"/>
                  <circle cx="14" cy="14" r="1"/>
                  <path d="M6 20h12v2H6z"/>
                </svg>
              </Link>
              <Link 
                href="/small-paintings" 
                className="yeezy-nav-link"
                onClick={() => setIsMenuOpen(false)}
                title="Small Paintings"
              >
                <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Chess Pawn */}
                  <circle cx="12" cy="8" r="3"/>
                  <path d="M12 11v5"/>
                  <path d="M8 16h8"/>
                  <path d="M6 20h12v2H6z"/>
                </svg>
              </Link>
              <Link 
                href="/about" 
                className="yeezy-nav-link"
                onClick={() => setIsMenuOpen(false)}
                title="About"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4m0-4h.01"/>
                </svg>
              </Link>
              </div>

              {/* Cart */}
              <button 
                className="yeezy-nav-link"
                title="Cart"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="21" r="1"/>
                  <circle cx="19" cy="21" r="1"/>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57L23 6H6"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
