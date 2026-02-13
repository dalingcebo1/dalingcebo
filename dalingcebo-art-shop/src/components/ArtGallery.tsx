'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'
import FilterBar, { FilterState } from '@/components/FilterBar'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

interface ArtGalleryProps {
  zoomLevel?: number
  sizeFilter?: 'large' | 'small' | 'all'
}

export default function ArtGallery({ zoomLevel = 0, sizeFilter = 'all' }: ArtGalleryProps) {
  const { artworks, isLoading, error, reload, stats } = useArtworks()
  const [filters, setFilters] = useState<FilterState | null>(null)
  const router = useRouter()

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

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(artworks.map(a => a.category).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  }, [artworks])

  // Get price range
  const priceRange = useMemo((): [number, number] => {
    if (artworks.length === 0) return [0, 10000]
    const prices = artworks.map(a => a.price)
    return [Math.min(...prices), Math.max(...prices)]
  }, [artworks])

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const filteredArtworks = useMemo(() => {
    let result = artworks.filter((artwork) => {
      // Apply size filter from page-specific prop
      if (sizeFilter !== 'all' && artwork.scale !== sizeFilter) {
        return false
      }
      return true
    })

    // Apply filters if they exist
    if (filters) {
      result = result.filter((artwork) => {
        // Availability filter
        if (filters.availability === 'available' && !artwork.inStock) {
          return false
        }
        if (filters.availability === 'sold' && artwork.inStock) {
          return false
        }

        // Category filter
        if (filters.category !== 'all' && artwork.category !== filters.category) {
          return false
        }

        // Price range filter
        if (artwork.price < filters.priceRange[0] || artwork.price > filters.priceRange[1]) {
          return false
        }

        return true
      })

      // Apply sorting
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'year-desc':
            return parseInt(b.year) - parseInt(a.year)
          case 'year-asc':
            return parseInt(a.year) - parseInt(b.year)
          default:
            return 0
        }
      })
    }

    return result
  }, [artworks, sizeFilter, filters])

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    const total = filteredArtworks.length
    const totalValue = filteredArtworks.reduce((sum, art) => sum + art.price, 0)
    const available = filteredArtworks.filter(a => a.inStock).length
    return { total, totalValue, available }
  }, [filteredArtworks])

  return (
    <section className="yeezy-section" id="collection">
      <div className="yeezy-container">
        {/* Stats Header */}
        <div className="bg-white border border-gray-200 p-6 mb-6 rounded-lg shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Catalogue Overview</p>
              <p className="text-2xl font-light">
                {filteredStats.total} Works • ${filteredStats.totalValue.toLocaleString()} value
                {filteredStats.available !== filteredStats.total && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({filteredStats.available} available)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          onFilterChange={handleFilterChange}
          categories={categories}
          priceRange={priceRange}
          showCategoryFilter={sizeFilter === 'all'}
        />

        {/* Gallery Grid */}
        <div className={`grid ${getGridColumns()} gap-6 md:gap-8 fade-in-slow`} style={{ animationDelay: '0.3s' }}>
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
                No works found matching your filters.
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
        {!isLoading && !error && filteredArtworks.length > 0 && (
          <div className="text-center mt-16 fade-in-slow" style={{ animationDelay: '0.9s' }}>
            <Link href="/shop" className="btn-yeezy">
              View More ({filteredArtworks.length} of {stats.total})
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
