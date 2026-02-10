'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const { artworks, isLoading } = useArtworks()
  const [zoomLevel, setZoomLevel] = useState(0)
  const [featuredVideo, setFeaturedVideo] = useState<any>(null)

  useEffect(() => {
    // Fetch featured video from Supabase
    const fetchVideo = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('standalone_videos')
        .select('*')
        .eq('is_featured', true)
        .eq('published', true)
        .single()
      
      if (data) {
        setFeaturedVideo(data)
      }
    }
    fetchVideo()
  }, [])

  const featured = useMemo(() => {
    if (!artworks || artworks.length === 0) return []

    const availableArtworks = artworks.filter((art) => art.inStock)

    // Return first 4 artworks for the 2x2 grid
    return availableArtworks.slice(0, 4)
  }, [artworks])

  return (
    <main className="min-h-screen flex flex-col">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

      {/* Featured works: 2-column grid */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
            {isLoading && (
              <>
                <div className="col-span-1 h-80 bg-gray-100 animate-pulse rounded" />
                <div className="col-span-1 h-80 bg-gray-100 animate-pulse rounded" />
                <div className="col-span-1 h-80 bg-gray-100 animate-pulse rounded" />
                <div className="col-span-1 h-80 bg-gray-100 animate-pulse rounded" />
              </>
            )}

            {!isLoading && featured.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artwork/${artwork.id}`}
                className="group"
              >
                <article className="bg-white border border-gray-200 overflow-hidden flex flex-col transition-transform hover:scale-[1.02]">
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
              </Link>
            ))}
          </div>

          {/* Simple CTA */}
          <div className="text-center mt-12">
            <Link href="/shop" className="btn-yeezy-primary inline-block">
              View All Artworks
            </Link>
          </div>
        </div>
      </section>

      {/* Soundless video that streams continuously */}
      <section className="yeezy-section border-t border-gray-200 bg-black text-white">
        <div className="yeezy-container">
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            {featuredVideo?.storage_url ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                aria-label={featuredVideo.description || 'Studio video'}
              >
                <source src={featuredVideo.storage_url} type="video/mp4" />
              </video>
            ) : (
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
            )}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-gray-400">
            {featuredVideo?.title || 'Studio glimpse'} • low-fi, soundless loop
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
