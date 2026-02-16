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
      <div className="yeezy-hero-content space-y-8 md:space-y-10">
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-black/10 uppercase tracking-[0.35em] text-[10px] flex-shrink-0">
            Studio Drop
            <span className="inline-block w-2 h-2 bg-black rounded-full animate-pulse flex-shrink-0"></span>
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.4s' }}>
          <h1 className="yeezy-main-logo text-black text-5xl md:text-7xl">
            DALINGCEBO
          </h1>
        </div>
        
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.6s' }}>
          <p className="yeezy-body text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Contemporary statements in oil, mixed media, and sound. Crafted in Johannesburg, collected worldwide.
          </p>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.8s' }}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1s' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {heroMetrics.map(metric => (
              <div
                key={metric.label}
                className="border border-black/10 bg-white/80 backdrop-blur-sm px-6 py-5 text-center transition-colors hover:bg-white hover:border-black/20"
              >
                <p className="text-2xl md:text-3xl font-light mb-2">
                  {isLoading ? '—' : metric.value}
                </p>
                <p className="text-[9px] uppercase tracking-[0.35em] text-gray-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.1s' }}>
          <div className="flex items-center justify-center mt-8 mb-8">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-gray-700 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 py-2 px-4"
              onClick={scrollToGallery}
              aria-label="Scroll down to artworks collection"
            >
              Explore Collection
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {heroNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group border border-gray-200 bg-white/80 px-5 py-5 flex flex-col gap-2 hover:border-black hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gray-900 font-medium group-hover:text-black">
                    {item.label}
                  </p>
                  <svg className="text-gray-400 group-hover:text-black transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="16" height="16">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7m10 0v10" />
                  </svg>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
