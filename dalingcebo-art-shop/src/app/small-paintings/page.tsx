'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageShell from '@/components/layout/PageShell'
import ArtworkSpotlight from '@/components/ArtworkSpotlight'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'
import { Artwork } from '@/types/artwork'

export default function SmallPaintings() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const router = useRouter()
  const { artworks, isLoading, error, reload } = useArtworks()

  const smallArtworks = useMemo(
    () => artworks.filter((artwork) => artwork.scale === 'small'),
    [artworks]
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getGridColumns = () => {
    switch (zoomLevel) {
      case 0:
        // Default view: 3-column grid on desktop
        return 'grid-cols-2 md:grid-cols-3'
      case 1:
        // Mid zoom: 2 columns on desktop
        return 'grid-cols-1 md:grid-cols-2'
      case 2:
        // Max zoom: single column for full-width artworks
        return 'grid-cols-1 md:grid-cols-1'
      default:
        return 'grid-cols-2 md:grid-cols-3'
    }
  }

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <PageShell
        title="SMALL PAINTINGS"
        subtitle="Intimate works perfect for personal spaces and collections."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: 'Small Paintings' }]}
      >
          <div className={`grid ${getGridColumns()} gap-6 md:gap-8 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            {isLoading && (
              <div className="col-span-full flex justify-center py-16">
                <LoadingSpinner />
              </div>
            )}

            {error && !isLoading && (
              <div className="col-span-full text-center py-12">
                <p className="yeezy-body text-gray-600">{error}</p>
                <button className="btn-yeezy mt-6" onClick={reload}>
                  Try Again
                </button>
              </div>
            )}

            {!isLoading && !error && smallArtworks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="yeezy-body text-gray-600">
                  No small-scale works available at this time. Please check back soon.
                </p>
              </div>
            )}

            {!isLoading && !error && smallArtworks.map((artwork) => {
              const primaryImage = getArtworkPrimaryImage(artwork)
              const aspectRatio = getArtworkAspectRatio(artwork.size)
              const hasMultipleImages = artwork.images && artwork.images.length > 1

              return (
              <div
                key={artwork.id}
                onClick={() => setSelectedArtwork(artwork)}
                className="yeezy-grid-item yeezy-transition group cursor-pointer"
              >
                {/* Sold Out Badge */}
                {!artwork.inStock && (
                  <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black text-white text-[9px] uppercase tracking-[0.3em] font-medium">
                    Sold
                  </div>
                )}
                
                {/* Multiple Images Indicator */}
                {hasMultipleImages && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[9px] uppercase tracking-[0.2em] font-medium text-gray-700 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {artwork.images.length}
                  </div>
                )}

                <div
                  className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden"
                  style={{ aspectRatio }}
                >
                  <Image
                    src={primaryImage}
                    alt={artwork.title}
                    fill
                    className={`object-contain transition-transform duration-700 ${
                      !artwork.inStock ? 'opacity-60' : 'group-hover:scale-[1.02]'
                    }`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

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
          {/* Cross-navigation to other category */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Explore More</p>
            <Link href="/large-paintings" className="btn-yeezy inline-block">
              View Large Paintings
            </Link>
          </div>        </PageShell>

      <Footer />

      {/* Artwork Spotlight */}
      {selectedArtwork && (
        <ArtworkSpotlight
          artwork={selectedArtwork}
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </main>
  )
}
