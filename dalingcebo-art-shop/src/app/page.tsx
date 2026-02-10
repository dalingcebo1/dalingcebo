'use client'

import { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'
import { createClient } from '@/lib/supabase/client'

interface FeaturedVideo {
  id: string
  title: string
  description: string | null
  video_type: string
  storage_url: string | null
  youtube_id: string | null
  thumbnail_url: string | null
  duration: number | null
  is_featured: boolean
  published: boolean
  created_at: string
  updated_at: string
}

// Placeholder artworks shown when database is empty
// Using negative IDs to distinguish from real artworks
const PLACEHOLDER_ARTWORKS = [
  {
    id: -1,
    title: 'Cultural Echo',
    artist: 'Dalingcebo',
    price: 1200,
    category: 'mixed-media',
    scale: 'large' as const,
    size: '30×40',
    year: 2024,
    medium: 'Mixed Media on Canvas',
    description: 'Bridging traditional African motifs with contemporary abstraction.',
    details: '',
    inStock: true,
    edition: 'Original',
    image: 'https://placehold.co/800x1000/e5e5e5/666666?text=Cultural+Echo',
    images: [],
  },
  {
    id: -2,
    title: 'Urban Silence',
    artist: 'Dalingcebo',
    price: 850,
    category: 'painting',
    scale: 'large' as const,
    size: '24×36',
    year: 2024,
    medium: 'Acrylic on Canvas',
    description: 'A meditation on quiet moments within urban chaos.',
    details: '',
    inStock: true,
    edition: 'Original',
    image: 'https://placehold.co/800x1000/e5e5e5/666666?text=Urban+Silence',
    images: [],
  },
  {
    id: -3,
    title: 'Heritage Lines',
    artist: 'Dalingcebo',
    price: 950,
    category: 'painting',
    scale: 'small' as const,
    size: '18×24',
    year: 2024,
    medium: 'Acrylic on Canvas',
    description: 'Geometric patterns inspired by traditional African textiles.',
    details: '',
    inStock: true,
    edition: 'Original',
    image: 'https://placehold.co/800x1000/e5e5e5/666666?text=Heritage+Lines',
    images: [],
  },
  {
    id: -4,
    title: 'Reflection',
    artist: 'Dalingcebo',
    price: 750,
    category: 'painting',
    scale: 'small' as const,
    size: '16×20',
    year: 2024,
    medium: 'Mixed Media',
    description: 'A contemplative piece exploring identity and self.',
    details: '',
    inStock: true,
    edition: 'Original',
    image: 'https://placehold.co/800x1000/e5e5e5/666666?text=Reflection',
    images: [],
  },
]

export default function Home() {
  const { artworks, isLoading } = useArtworks()
  const [zoomLevel, setZoomLevel] = useState(0)
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null)

  useEffect(() => {
    // Fetch featured video from Supabase
    const fetchVideo = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('standalone_videos')
          .select('*')
          .eq('is_featured', true)
          .eq('published', true)
          .maybeSingle()
        
        if (data && !error) {
          setFeaturedVideo(data as FeaturedVideo)
        }
      } catch (err) {
        console.error('Error fetching featured video:', err)
      }
    }
    fetchVideo()
  }, [])

  const featured = useMemo(() => {
    if (!artworks || artworks.length === 0) {
      // Return placeholder artworks when database is empty
      return PLACEHOLDER_ARTWORKS
    }

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

            {!isLoading && featured.map((artwork) => {
              // Negative IDs indicate placeholder artworks
              const isPlaceholder = artwork.id < 0
              
              // Render placeholder artworks as non-clickable divs
              if (isPlaceholder) {
                return (
                  <div key={artwork.id} className="group cursor-default" aria-disabled="true">
                    <article className="bg-white border border-gray-200 overflow-hidden flex flex-col">
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
                  </div>
                )
              }
              
              // Render real artworks as clickable links
              return (
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
              )
            })}
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
