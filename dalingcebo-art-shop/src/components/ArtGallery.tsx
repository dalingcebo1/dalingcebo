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
        .eq('in_stock', true)
        .order('created_at', { ascending: false })

      // Apply size filter if not 'all'
      if (sizeFilter !== 'all') {
        query = query.eq('scale', sizeFilter)
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
  const handleArtworkClick = (artworkId: number) => {
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
                {artwork.image ? (
                  <Image 
                    src={artwork.image} 
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
    id: 1,
    title: "Urban Silence",
    artist: "Dalingcebo",
    price: 850,
    category: "painting",
    scale: "large",
    size: "24×36",
    year: 2024,
    medium: "Acrylic on Canvas",
    description: "A contemplative piece exploring urban solitude",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["urban", "contemporary"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 2,
    title: "Cultural Echo",
    artist: "Dalingcebo",
    price: 1200,
    category: "mixed-media",
    scale: "large",
    size: "30×40",
    year: 2024,
    medium: "Mixed Media on Canvas",
    description: "Exploring cultural heritage through modern techniques",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["cultural", "mixed-media"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 3,
    title: "Modern Heritage",
    artist: "Dalingcebo",
    price: 950,
    category: "painting",
    scale: "small",
    size: "18×24",
    year: 2023,
    medium: "Oil on Canvas",
    description: "Contemporary interpretation of traditional motifs",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["heritage", "modern"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 4,
    title: "Abstract Form",
    artist: "Dalingcebo",
    price: 750,
    category: "abstract",
    scale: "large",
    size: "20×30",
    year: 2024,
    medium: "Acrylic on Canvas",
    description: "Pure abstraction exploring form and color",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["abstract", "contemporary"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 5,
    title: "Digital Nature",
    artist: "Dalingcebo",
    price: 650,
    category: "digital",
    scale: "small",
    size: "16×20",
    year: 2024,
    medium: "Digital Print",
    description: "Nature reimagined through digital mediums",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["digital", "nature"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 6,
    title: "Minimal Space",
    artist: "Dalingcebo",
    price: 1100,
    category: "minimalist",
    scale: "large",
    size: "36×48",
    year: 2023,
    medium: "Acrylic on Canvas",
    description: "Minimalist exploration of space and void",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["minimalist", "space"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 7,
    title: "City Dreams",
    artist: "Dalingcebo",
    price: 900,
    category: "painting",
    scale: "large",
    size: "24×32",
    year: 2024,
    medium: "Acrylic on Canvas",
    description: "Urban landscapes from the subconscious",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["urban", "landscape"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
  {
    id: 8,
    title: "Texture Study",
    artist: "Dalingcebo",
    price: 800,
    category: "experimental",
    scale: "small",
    size: "20×20",
    year: 2024,
    medium: "Mixed Media",
    description: "Experimental work focusing on texture",
    details: null,
    in_stock: true,
    inventory: 1,
    edition: "Original",
    image: "",
    images: [],
    tags: ["experimental", "texture"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    base_processing_days: 7,
    processing_notes: null,
  },
]
