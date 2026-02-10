'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Artwork } from '@/types/database'
import LoadingSpinner from './LoadingSpinner'
import { useCart } from '@/context/CartContext'
import Toast from './Toast'

interface ArtGalleryProps {
  sizeFilter?: 'small' | 'large' | 'all'
}

export default function ArtGallery({ sizeFilter = 'all' }: ArtGalleryProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { addToCart } = useCart()

  const fetchArtworks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('artworks')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false })

      // Apply size filter if not 'all'
      if (sizeFilter !== 'all') {
        query = query.or(`size_category.eq.${sizeFilter},size_category.eq.all`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching artworks:', fetchError)
        // Fallback to hardcoded data if Supabase fails
        setArtworks(fallbackArtworks)
      } else {
        setArtworks(data || [])
      }
    } catch (err) {
      console.error('Error in fetchArtworks:', err)
      setError('Failed to load artworks')
      // Fallback to hardcoded data
      setArtworks(fallbackArtworks)
    } finally {
      setLoading(false)
    }
  }, [sizeFilter])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    fetchArtworks()
  }, [fetchArtworks])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleArtworkClick = (artworkId: string) => {
    // TODO: Implement artwork detail page navigation
    // Future: router.push(`/artwork/${artworkId}`)
    // For now, this provides the hook for future functionality
  }

  const handleAddToCart = (e: React.MouseEvent, artwork: Artwork) => {
    e.stopPropagation()
    addToCart(artwork)
    setToastMessage(`${artwork.title} added to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  if (loading) {
    return (
      <section className="yeezy-section">
        <div className="yeezy-container flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </section>
    )
  }

  if (error && artworks.length === 0) {
    return (
      <section className="yeezy-section">
        <div className="yeezy-container">
          <div className="text-center text-gray-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="yeezy-section">
      <div className="yeezy-container">
        {/* Gallery Grid */}
        <div className={`yeezy-grid fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
          {artworks.map((artwork, index) => (
            <div 
              key={artwork.id} 
              className="yeezy-grid-item yeezy-transition group cursor-pointer"
              onClick={() => handleArtworkClick(artwork.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleArtworkClick(artwork.id)
                }
              }}
            >
              {/* Placeholder for artwork image */}
              <div className="yeezy-image bg-gray-100 flex items-center justify-center">
                {artwork.image_url ? (
                  <Image 
                    src={artwork.image_url} 
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <div className="text-xs yeezy-title mb-2">
                      {artwork.title}
                    </div>
                    <div className="text-2xl font-thin">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                  </div>
                )}
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
                      <p className="yeezy-price text-black mb-2">
                        R{typeof artwork.price === 'number' 
                          ? artwork.price.toLocaleString() 
                          : artwork.price}
                      </p>
                      <button
                        onClick={(e) => handleAddToCart(e, artwork)}
                        className="btn-yeezy text-xs px-3 py-2"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {artworks.length >= 8 && (
          <div className={`text-center mt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
            <button className="btn-yeezy">
              View More
            </button>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      {showToast && <Toast message={toastMessage} />}
    </section>
  )
}

// Fallback artworks data (used when Supabase is not configured or fails)
const fallbackArtworks: Artwork[] = [
  {
    id: '1',
    title: "Urban Silence",
    price: 850,
    category: "painting",
    size: "24×36",
    year: "2024",
    available: true,
    size_category: 'large',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: "Cultural Echo",
    price: 1200,
    category: "mixed-media",
    size: "30×40",
    year: "2024",
    available: true,
    size_category: 'large',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: "Modern Heritage",
    price: 950,
    category: "painting",
    size: "18×24",
    year: "2023",
    available: true,
    size_category: 'small',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: "Abstract Form",
    price: 750,
    category: "abstract",
    size: "20×30",
    year: "2024",
    available: true,
    size_category: 'large',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: "Digital Nature",
    price: 650,
    category: "digital",
    size: "16×20",
    year: "2024",
    available: true,
    size_category: 'small',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: "Minimal Space",
    price: 1100,
    category: "minimalist",
    size: "36×48",
    year: "2023",
    available: true,
    size_category: 'large',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    title: "City Dreams",
    price: 900,
    category: "painting",
    size: "24×32",
    year: "2024",
    available: true,
    size_category: 'large',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: "Texture Study",
    price: 800,
    category: "mixed-media",
    size: "22×28",
    year: "2023",
    available: true,
    size_category: 'small',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]
