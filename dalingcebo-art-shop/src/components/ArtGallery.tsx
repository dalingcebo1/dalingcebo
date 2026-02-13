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

    const urlFilters = {
      scale: allowedScale.includes(scaleParam) ? scaleParam : 'all',
      availability: allowedAvailability.includes(availabilityParam) ? availabilityParam : 'all',
      category: searchParams.get('category') ?? 'all',
    }

    setFilters((prev) => {
      const isSame = Object.entries(urlFilters).every(([key, value]) => prev[key as keyof typeof prev] === value)
      return isSame ? prev : urlFilters
    })
  }, [searchParams])

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
    <section className="yeezy-section" id="collection">
      <div className="yeezy-container">
        <div className="bg-white border border-gray-200 p-6 mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Catalogue Overview</p>
              <p className="text-2xl font-light">{stats.total} Works • ${stats.totalValue.toLocaleString()} value</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['all', 'large', 'small'].map(option => (
                <button
                  key={option}
                  onClick={() => handleFilterChange('scale', option)}
                  className={`px-4 py-2 text-xs tracking-[0.25em] uppercase border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    filters.scale === option
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:bg-black hover:text-white'
                  }`}
                >
                  {option === 'all' ? 'All Scales' : option}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Availability</p>
              <div className="flex gap-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Available', value: 'available' },
                  { label: 'Sold', value: 'sold' },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => handleFilterChange('availability', value)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-[0.3em] border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                      filters.availability === value
                        ? 'border-black text-black'
                        : 'border-gray-300 text-gray-500 hover:bg-black hover:text-white'
                    }`}
                    aria-pressed={filters.availability === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gray-500">
              Category
              <select
                className="flex-1 border border-gray-300 px-3 py-2 text-xs uppercase tracking-[0.2em] bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-end">
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs uppercase tracking-[0.3em] text-gray-500 hover:text-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Reset Filters
                </button>
              )}
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
              <p className="yeezy-body text-gray-500">No works match these filters yet.</p>
              {hasFilters && (
                <button className="btn-yeezy mt-6" onClick={resetFilters}>Clear Filters</button>
              )}
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
