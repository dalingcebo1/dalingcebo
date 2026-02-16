'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

interface ArtGalleryProps {
  zoomLevel: number
}

export default function ArtGallery({ zoomLevel }: ArtGalleryProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { artworks, isLoading, error, reload, stats, categories } = useArtworks()
  const [filters, setFilters] = useState({
    scale: 'all',
    availability: 'all',
    category: 'all',
  })
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getGridColumns = () => {
    switch (zoomLevel) {
      case 0:
        // Default view: dense 4-column grid on desktop
        return 'grid-cols-2 md:grid-cols-4'
      case 1:
        // Mid zoom: more breathing room with 2 columns on desktop
        return 'grid-cols-2 md:grid-cols-2'
      case 2:
        // Max zoom: single column for full-width artworks
        return 'grid-cols-1 md:grid-cols-1'
      default:
        return 'grid-cols-2 md:grid-cols-4'
    }
  }

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      if (filters.scale !== 'all' && artwork.scale !== filters.scale) {
        return false
      }
      if (filters.availability === 'available' && !artwork.inStock) {
        return false
      }
      if (filters.availability === 'sold' && artwork.inStock) {
        return false
      }
      if (filters.category !== 'all' && artwork.category !== filters.category) {
        return false
      }
      return true
    })
  }, [artworks, filters])

  const hasFilters = useMemo(() => {
    return filters.scale !== 'all' || filters.availability !== 'all' || filters.category !== 'all'
  }, [filters])

  useEffect(() => {
    const allowedScale = ['all', 'large', 'small']
    const allowedAvailability = ['all', 'available', 'sold']
    const scaleParam = searchParams.get('scale') ?? 'all'
    const availabilityParam = searchParams.get('availability') ?? 'all'
    const categoryParam = searchParams.get('category') ?? 'all'

    const safeCategory =
      categoryParam === 'all' || categories.includes(categoryParam)
        ? categoryParam
        : 'all'

    const urlFilters = {
      scale: allowedScale.includes(scaleParam) ? scaleParam : 'all',
      availability: allowedAvailability.includes(availabilityParam) ? availabilityParam : 'all',
      category: safeCategory,
    }

    setFilters((prev) => {
      const isSame = Object.entries(urlFilters).every(([key, value]) => prev[key as keyof typeof prev] === value)
      return isSame ? prev : urlFilters
    })
  }, [searchParams, categories])

  const syncFiltersToQuery = (nextFilters: typeof filters) => {
    setFilters(nextFilters)
    const params = new URLSearchParams(searchParams.toString())

    const entries: Array<[keyof typeof filters, string]> = [
      ['scale', 'scale'],
      ['availability', 'availability'],
      ['category', 'category'],
    ]

    entries.forEach(([key, queryKey]) => {
      const value = nextFilters[key]
      if (value === 'all') {
        params.delete(queryKey)
      } else {
        params.set(queryKey, value)
      }
    })

    const queryString = params.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(href, { scroll: false })
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    if (filters[key] === value) return
    syncFiltersToQuery({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    syncFiltersToQuery({ scale: 'all', availability: 'all', category: 'all' })
  }

  return (
    <section className="yeezy-section border-t border-gray-200" id="collection">
      <div className="yeezy-container">
        {/* Modern Compact Filter Controls */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 p-4 md:p-6 mb-8 rounded-lg">
          {/* Header Row - Compact */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-lg md:text-xl font-light tracking-tight text-black">
                {stats.total} Works
              </h2>
              <span className="text-xs text-gray-500">
                ${stats.totalValue.toLocaleString()}
              </span>
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-black transition-colors flex items-center gap-1.5 group self-start sm:self-auto"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="14" height="14">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Modern Pill Filters - Responsive */}
          <div className="flex flex-col gap-4">
            {/* Scale Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium whitespace-nowrap min-w-[60px]">Scale</span>
              <div className="flex gap-1.5 flex-wrap">
                {['all', 'large', 'small'].map(option => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange('scale', option)}
                    className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wide font-medium transition-all ${
                      filters.scale === option
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                    aria-pressed={filters.scale === option}
                  >
                    {option === 'all' ? 'All' : option}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium whitespace-nowrap min-w-[60px]">Status</span>
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Available', value: 'available' },
                  { label: 'Sold', value: 'sold' },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange('availability', value)}
                    className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wide font-medium transition-all ${
                      filters.availability === value
                        ? 'bg-black text-white shadow-sm'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                    aria-pressed={filters.availability === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Dropdown - Minimal */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium whitespace-nowrap min-w-[60px]">Category</span>
              <select
                id="category-filter"
                className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wide font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black border-0 focus:outline-none focus:ring-2 focus:ring-black/20 transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-right w-full sm:w-auto sm:min-w-[140px]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: '12px',
                  backgroundPosition: 'right 10px center'
                }}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasFilters && (
            <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Active:</span>
              {filters.scale !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-full text-[9px] text-gray-700 uppercase tracking-wider">
                  {filters.scale} scale
                  <button 
                    onClick={() => handleFilterChange('scale', 'all')}
                    className="hover:text-black ml-0.5 -mr-0.5"
                    aria-label="Remove scale filter"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" width="12" height="12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.availability !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-full text-[9px] text-gray-700 uppercase tracking-wider">
                  {filters.availability}
                  <button 
                    onClick={() => handleFilterChange('availability', 'all')}
                    className="hover:text-black ml-0.5 -mr-0.5"
                    aria-label="Remove availability filter"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" width="12" height="12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-full text-[9px] text-gray-700 uppercase tracking-wider">
                  {filters.category}
                  <button 
                    onClick={() => handleFilterChange('category', 'all')}
                    className="hover:text-black ml-0.5 -mr-0.5"
                    aria-label="Remove category filter"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" width="12" height="12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className={`grid ${getGridColumns()} gap-6 md:gap-8 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {error && !isLoading && (
            <div className="col-span-full text-center py-20 px-4">
              <div className="max-w-md mx-auto">
                <div className="mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                  <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3 tracking-tight">Unable to Load Collection</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{error}</p>
                <button
                  className="btn-yeezy-primary"
                  onClick={reload}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredArtworks.length === 0 && (
            <div className="col-span-full text-center py-20 px-4">
              <div className="max-w-md mx-auto">
                <div className="mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
                  <svg className="text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" width="32" height="32">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3 tracking-tight">No Works Found</h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {hasFilters 
                    ? 'No artworks match your current filters. Try adjusting or clearing them.' 
                    : 'No works are currently available. Please check back soon.'}
                </p>
                {hasFilters && (
                  <button className="btn-yeezy-primary" onClick={resetFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && !error && filteredArtworks.map((artwork) => {
            const primaryImage = getArtworkPrimaryImage(artwork)
            const aspectRatio = getArtworkAspectRatio(artwork.size)

            return (
            <div
              key={artwork.id}
              onClick={() => router.push(`/artwork/${artwork.id}`)}
              className="yeezy-grid-item yeezy-transition group cursor-pointer rounded-sm overflow-hidden bg-white relative"
            >
              {/* Sold Out Badge */}
              {!artwork.inStock && (
                <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black text-white text-[9px] uppercase tracking-[0.3em] font-medium">
                  Sold
                </div>
              )}

              <div
                className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden rounded-lg"
                style={{ aspectRatio }}
              >
                <Image
                  src={primaryImage}
                  alt={artwork.title}
                  fill
                  className={`object-contain transition-all duration-700 ${
                    !artwork.inStock ? 'opacity-60' : 'group-hover:scale-[1.02]'
                  }`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>

              {/* Enhanced overlay with artwork details */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-95 transition-opacity duration-300 flex items-end p-5 rounded-sm pointer-events-none">
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-black mb-1.5 leading-tight">
                        {artwork.title}
                      </h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                        {artwork.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-light text-black">
                        ${artwork.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {artwork.size} • {artwork.year}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-black transition-transform group-hover:translate-x-0.5">
                      View
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Load More */}
        {!isLoading && filteredArtworks.length > 0 && (
          <div className={`text-center mt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 border border-gray-200 bg-white text-xs uppercase tracking-[0.3em] text-gray-600">
              <span>Showing {filteredArtworks.length} of {stats.total} works</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
