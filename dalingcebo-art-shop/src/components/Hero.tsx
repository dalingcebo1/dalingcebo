'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useArtworks } from '@/hooks/useArtworks'

const heroNavLinks = [
  {
    label: 'Shop Works',
    description: 'Browse every available piece in the collection.',
    href: '/shop',
  },
  {
    label: 'Catalog Library',
    description: 'Download seasonal catalogues and curatorial notes.',
    href: '/catalogs',
  },
  {
    label: 'Large Scale',
    description: 'Explore statement paintings suited for expansive spaces.',
    href: '/large-paintings',
  },
  {
    label: 'Small Works',
    description: 'Discover intimate studies ideal for personal collections.',
    href: '/small-paintings',
  },
]

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const { stats, isLoading } = useArtworks()

  const heroMetrics = useMemo(
    () => [
      { label: 'Available Works', value: stats.available },
      { label: 'Large Scale Pieces', value: stats.large },
      { label: 'New This Season', value: stats.recent },
    ],
    [stats]
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToGallery = () => {
    const gallerySection = document.getElementById('collection')
    gallerySection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="yeezy-hero relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 w-[420px] h-[420px] -translate-x-1/2 bg-gradient-to-br from-gray-900 via-gray-600 to-gray-200 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[260px] h-[260px] bg-gradient-to-br from-amber-200 via-white to-gray-200 opacity-40 blur-3xl"></div>
      </div>
      <div className="yeezy-hero-content space-y-12">
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 uppercase tracking-[0.35em] text-[10px] flex-shrink-0">
            Studio Drop
            <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse flex-shrink-0"></span>
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.4s' }}>
          <h1 className="yeezy-main-logo text-black text-6xl md:text-8xl">
            DALINGCEBO
          </h1>
        </div>
        
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.8s' }}>
          <p className="yeezy-body text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Contemporary statements in oil, mixed media, and sound. Crafted in Johannesburg, collected worldwide.
          </p>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={scrollToGallery}
              className="btn-yeezy-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Scroll to the current collection"
            >
              View Collection
            </button>
            <Link
              href="/about"
              className="btn-yeezy inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Learn more about Dalingcebo and the studio"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {heroMetrics.map(metric => (
              <div
                key={metric.label}
                className="border border-black/10 bg-white/70 backdrop-blur-sm px-6 py-5 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-3">{metric.label}</p>
                <p className="text-3xl font-light">
                  {isLoading ? '—' : metric.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-xs uppercase tracking-[0.3em] text-gray-500">
            <div className="inline-flex items-center gap-3 px-5 py-2 border border-gray-300 bg-white/80 flex-shrink-0">
              <span className="whitespace-nowrap">Catalogue Value</span>
              <span className="text-black whitespace-nowrap">{isLoading ? 'Calculating…' : `$${stats.totalValue.toLocaleString()}`}</span>
            </div>
            <button
              type="button"
              className="yeezy-nav-link focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              onClick={scrollToGallery}
              aria-label="Scroll down to artworks grid"
            >
              Scroll to works ↓
            </button>
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.4s' }}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {heroNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-gray-200 bg-white/80 px-5 py-4 flex items-start justify-between gap-4 hover:border-black hover:bg-white transition-colors"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-1">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-600 leading-snug">
                    {item.description}
                  </p>
                </div>
                <span className="text-sm tracking-widest text-gray-400 group-hover:text-black" aria-hidden>
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div 
          className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 fade-in-slow ${isVisible ? '' : ''}`}
          style={{ animationDelay: '1.6s' }}
        >
          <div className="w-px h-16 bg-gray-400 opacity-40"></div>
        </div>
      </div>
    </section>
  )
}
