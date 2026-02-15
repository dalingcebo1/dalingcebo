'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageShell from '@/components/layout/PageShell'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

export default function SmallPaintings() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
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

              return (
              <div
                key={artwork.id}
                onClick={() => router.push(`/artwork/${artwork.id}`)}
                className="yeezy-grid-item yeezy-transition group cursor-pointer"
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
    </main>
  )
}
