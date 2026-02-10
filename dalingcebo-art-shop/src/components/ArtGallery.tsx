'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

interface ArtGalleryProps {
  zoomLevel?: number
  sizeFilter?: 'large' | 'small' | 'all'
}

export default function ArtGallery({ zoomLevel = 0, sizeFilter = 'all' }: ArtGalleryProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { artworks, isLoading, error, reload, stats } = useArtworks()
  const [showAvailableOnly, setShowAvailableOnly] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getGridColumns = () => {
    switch (zoomLevel) {
      case 0:
        return 'grid-cols-2 md:grid-cols-4'
      case 1:
        return 'grid-cols-1 md:grid-cols-3'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      default:
        return 'grid-cols-2 md:grid-cols-4'
    }
  }

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      // Apply size filter from page-specific prop
      if (sizeFilter !== 'all' && artwork.scale !== sizeFilter) {
        return false
      }
      // Apply availability filter
      if (showAvailableOnly && !artwork.inStock) {
        return false
      }
      return true
    })
  }, [artworks, sizeFilter, showAvailableOnly])

  return (
    <section className="yeezy-section" id="collection">
      <div className="yeezy-container">
        {/* Modern Header with Availability Toggle */}
        <div className="bg-white border border-gray-200 p-6 mb-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Catalogue Overview</p>
              <p className="text-2xl font-light">{stats.total} Works • ${stats.totalValue.toLocaleString()} value</p>
            </div>
            
            {/* Modern Availability Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Show:</span>
              <button
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  showAvailableOnly
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-black hover:shadow-sm'
                }`}
                aria-pressed={showAvailableOnly}
                title={showAvailableOnly ? 'Showing available works only' : 'Showing all works'}
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showAvailableOnly ? 'scale-110' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {showAvailableOnly ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
                <span className="text-xs uppercase tracking-[0.25em] font-medium">
                  {showAvailableOnly ? 'Available Only' : 'All Works'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className={`grid ${getGridColumns()} gap-6 md:gap-8 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {error && !isLoading && (
            <div className="col-span-full text-center py-12">
              <p className="yeezy-body text-gray-500">{error}</p>
              <button
                className="btn-yeezy mt-6"
                onClick={reload}
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading && !error && filteredArtworks.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="yeezy-body text-gray-500">
                {showAvailableOnly ? 'No available works found.' : 'No works found.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredArtworks.map((artwork) => {
            const primaryImage = getArtworkPrimaryImage(artwork)
            const aspectRatio = getArtworkAspectRatio(artwork.size)

            return (
            <div
              key={artwork.id}
              onClick={() => router.push(`/artwork/${artwork.id}`)}
              className="yeezy-grid-item yeezy-transition group cursor-pointer rounded-sm overflow-hidden bg-white"
            >
              <div
                className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-lg"
                style={{ aspectRatio }}
              >
                <Image
                  src={primaryImage}
                  alt={artwork.title}
                  fill
                  className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>

              {/* Overlay with artwork details */}
              <div className="yeezy-overlay">
                <div className="w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="yeezy-title text-black mb-1">
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-gray-700 yeezy-body">
                        {artwork.size} • {artwork.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="yeezy-price text-black">
                        ${artwork.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Load More */}
        <div className={`text-center mt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
          <Link href="/shop" className="btn-yeezy">
            View More ({filteredArtworks.length} of {stats.total})
          </Link>
        </div>
      </div>
    </section>
  )
}
