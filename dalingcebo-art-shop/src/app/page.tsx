'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

export default function Home() {
  const { artworks, isLoading } = useArtworks()

  const featured = useMemo(() => {
    if (!artworks || artworks.length === 0) return []

    const largeAvailable = artworks.filter(
      (art) => art.inStock && art.scale === 'large'
    )

    const chosen = (largeAvailable.length >= 2
      ? largeAvailable
      : artworks
    ).slice(0, 2)

    return chosen
  }, [artworks])

  return (
    <main className="min-h-screen flex flex-col">
      <Header zoomLevel={0} setZoomLevel={() => {}} />

      {/* Featured works: very simple two-piece layout */}
      <section className="yeezy-section flex-1">
        <div className="yeezy-container">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="yeezy-heading text-3xl md:text-5xl mb-4">
              DALINGCEBO
            </h1>
            <p className="yeezy-body text-sm md:text-base text-gray-600 leading-relaxed">
              Contemporary art that bridges cultures. Each piece is crafted with intention, 
              speaking to the modern soul.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-12">
            {isLoading && (
              <div className="col-span-full h-80 bg-gray-100 animate-pulse rounded" />
            )}

            {!isLoading && featured.map((artwork) => (
              <article
                key={artwork.id}
                className="bg-white border border-gray-200 overflow-hidden flex flex-col"
              >
                <div
                  className="relative w-full bg-gray-50 rounded-xl overflow-hidden"
                  style={{ aspectRatio: getArtworkAspectRatio(artwork.size) }}
                >
                  <Image
                    src={getArtworkPrimaryImage(artwork)}
                    alt={artwork.title}
                    fill
                    className="object-contain"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">
                      {artwork.category} • {artwork.size}
                    </p>
                    <h2 className="yeezy-heading text-xl mb-1">{artwork.title}</h2>
                    <p className="text-xs text-gray-600 mb-3">
                      {artwork.medium} • {artwork.year}
                    </p>
                  </div>
                  <p className="yeezy-price text-lg mt-2">
                    R{artwork.price.toLocaleString()}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="text-center mt-12">
            <a href="/shop" className="btn-yeezy-primary inline-block">
              View All Artworks
            </a>
          </div>
        </div>
      </section>

      {/* Embedded looping studio video under the featured works */}
      <section className="yeezy-section border-t border-gray-200 bg-black text-white">
        <div className="yeezy-container">
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Studio glimpse - a low-fi, soundless loop showing the artist's workspace"
            >
              <source src="/videos/landing-loop.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
            Studio glimpse • low-fi, soundless loop
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
