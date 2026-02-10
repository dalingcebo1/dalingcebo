'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import InquiryModal from '@/components/InquiryModal'
import VariantSelector from '@/components/VariantSelector'
import { VideoGallery } from '@/components/VideoPlayer'
import { useCart } from '@/contexts/CartContext'
import { Artwork } from '@/types/artwork'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage, getArtworkPlaceholder } from '@/lib/media'

interface SelectedVariant {
  frameVariantId?: string
  canvasVariantId?: string
  frameVariantName?: string
  canvasVariantName?: string
  finalPrice: number
  processingDays: number
}

export default function ArtworkDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const { artworks: catalogue } = useArtworks()
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [inquiryMode, setInquiryMode] = useState<'inquiry' | 'reserve'>('inquiry')
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function fetchArtwork() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/artworks/${params.id}`, { signal: controller.signal })
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('not-found')
          }
          throw new Error('Unable to load artwork details.')
        }
        const data: Artwork = await response.json()
        setArtwork(data)
        setSelectedImage(0)
        setError(null)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        const message = (err as Error).message
        setError(message)
        setArtwork(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchArtwork()
    return () => controller.abort()
  }, [params.id])

  const relatedArtworks = useMemo(() => {
    if (!artwork) return []
    return catalogue
      .filter(item => item.id !== artwork.id && item.category === artwork.category)
      .slice(0, 4)
  }, [catalogue, artwork])

  const imageList = useMemo(() => {
    if (!artwork) return [getArtworkPlaceholder()]
    const gallery = (artwork.images || []).filter(Boolean)
    if (gallery.length > 0) {
      return gallery
    }
    return [getArtworkPrimaryImage(artwork)]
  }, [artwork])

  const handleVariantChange = (variantData: SelectedVariant) => {
    setSelectedVariant(variantData)
  }

  const handleAddToCart = () => {
    if (!artwork) return
    
    addToCart({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      price: selectedVariant ? selectedVariant.finalPrice : artwork.price,
      image: getArtworkPrimaryImage(artwork),
      variantSelections: selectedVariant ? {
        frameVariantId: selectedVariant.frameVariantId,
        canvasVariantId: selectedVariant.canvasVariantId,
        frameVariantName: selectedVariant.frameVariantName,
        canvasVariantName: selectedVariant.canvasVariantName,
      } : undefined,
      processingDays: selectedVariant?.processingDays
    })

    setToastMessage(`${artwork.title} added to cart`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleReserve = () => {
    setInquiryMode('reserve')
    setIsInquiryOpen(true)
  }

  const handleInquire = () => {
    setInquiryMode('inquiry')
    setIsInquiryOpen(true)
  }

  const renderFallback = (message: string, action?: () => void, actionLabel?: string) => (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <div className="flex items-center justify-center min-h-[60vh] px-4 text-center">
        <div>
          <h1 className="yeezy-subheading text-2xl mb-4">{message}</h1>
          {action && actionLabel ? (
            <button onClick={action} className="btn-yeezy">
              {actionLabel}
            </button>
          ) : (
            <button onClick={() => router.push('/')} className="btn-yeezy">
              Return Home
            </button>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen">
          <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
          <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <Footer />
        </main>
      </>
    )
  }

  if (error) {
    if (error === 'not-found') {
      return renderFallback('Artwork not found')
    }
    return renderFallback(error, () => router.refresh(), 'Try Again')
  }

  if (!artwork) {
    return renderFallback('Artwork not available')
  }

  const currentPrice = selectedVariant ? selectedVariant.finalPrice : artwork.price
  const heroAspectRatio = getArtworkAspectRatio(artwork.size)

  return (
    <>
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="yeezy-section">
        <div className="yeezy-container">
          <div className={`grid lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 fade-in-slow ${isVisible ? '' : ''}`}>
            {/* Image Gallery */}
            <div className="space-y-4">
              <button 
                onClick={() => setIsLightboxOpen(true)}
                className="relative bg-gray-50 overflow-hidden group cursor-zoom-in rounded-xl shadow-sm hover:shadow-md transition-all duration-500"
                style={{ aspectRatio: heroAspectRatio }}
              >
                <Image
                  src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>

              {imageList.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {imageList.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg transition-all bg-gray-50 ${
                        selectedImage === index 
                          ? 'ring-2 ring-black shadow-md' 
                          : 'opacity-60 hover:opacity-100 hover:shadow-md'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`${artwork.title} detail ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs uppercase tracking-wider rounded-full">
                    {artwork.category}
                  </span>
                  {artwork.inStock ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs uppercase tracking-wider rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs uppercase tracking-wider rounded-full">
                      Sold
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-6">
                  {artwork.title}
                </h1>
                <div className="flex items-baseline gap-4 mb-2">
                  <p className="text-4xl font-light">
                    ${currentPrice.toLocaleString()}
                  </p>
                  {artwork.inventory && artwork.inventory < 5 && artwork.inStock && (
                    <span className="text-sm text-amber-600">Only {artwork.inventory} left</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  {artwork.edition} • {artwork.year}
                </p>
                
                <VariantSelector 
                  artworkId={artwork.id} 
                  basePrice={artwork.price} 
                  onVariantChange={handleVariantChange} 
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4">About This Piece</h3>
                <p className="text-base leading-relaxed text-gray-900 mb-4">
                  {artwork.description}
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  {artwork.details}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-5">Specifications</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Medium</span>
                    <span className="text-right">{artwork.medium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span>{artwork.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year</span>
                    <span>{artwork.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edition</span>
                    <span>{artwork.edition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability</span>
                    <span>{artwork.inStock ? 'In Stock' : 'Sold'}</span>
                  </div>
                  {artwork.inventory !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pieces Remaining</span>
                      <span>{artwork.inventory}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {artwork.inStock ? (
                  <>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleAddToCart} 
                        className="flex-[2] px-6 py-3.5 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 transition-all shadow-sm hover:shadow-md"
                      >
                        <svg className="inline-block w-4 h-4 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </button>
                      <button 
                        onClick={handleReserve}
                        className="flex-1 px-4 py-3.5 bg-white border border-gray-300 text-black rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 transition-all"
                      >
                        Reserve
                      </button>
                    </div>
                    <button 
                      onClick={handleInquire} 
                      className="w-full px-6 py-3 border border-gray-300 rounded-lg text-xs font-medium uppercase tracking-[0.1em] text-gray-600 hover:text-black hover:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    >
                      Inquire About This Piece
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleInquire} 
                    className="w-full px-6 py-3.5 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:ring-offset-2 transition-all"
                  >
                    <svg className="inline-block w-4 h-4 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notify When Available
                  </button>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-[10px] uppercase tracking-wider text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Certificate of Authenticity
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Secure Packaging & Shipping
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    14-day returns
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <span className="text-xs uppercase tracking-wider text-gray-500">Share:</span>
                <div className="flex gap-2">
                  {[
                    { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                    { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                    { name: 'Copy Link', icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71' }
                  ].map(({ name, icon }) => (
                    <button 
                      key={name}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      title={name}
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {artwork.videos && artwork.videos.length > 0 && (
            <div className="border-t border-gray-200 mt-24 pt-16">
              <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Studio Footage</p>
                  <h2 className="yeezy-subheading text-3xl">Process & Installation</h2>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  {artwork.videos.length} video{artwork.videos.length === 1 ? '' : 's'}
                </span>
              </div>
              <VideoGallery videos={artwork.videos} />
            </div>
          )}

          {relatedArtworks.length > 0 && (
            <div className="border-t border-gray-200 mt-24 pt-16">
              <h2 className="yeezy-subheading text-3xl mb-12">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedArtworks.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => router.push(`/artwork/${related.id}`)}
                    className="yeezy-grid-item bg-white cursor-pointer group"
                  >
                    <div
                      className="yeezy-image bg-gray-50 relative overflow-hidden rounded-lg"
                      style={{ aspectRatio: getArtworkAspectRatio(related.size) }}
                    >
                      <Image
                        src={getArtworkPrimaryImage(related)}
                        alt={related.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 20vw"
                      />
                    </div>
                    <div className="yeezy-overlay">
                      <div className="w-full text-left">
                        <h3 className="yeezy-title text-black mb-1">{related.title}</h3>
                        <p className="yeezy-price text-black">${related.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

        <Footer />
      </main>

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        artwork={artwork ? { id: artwork.id, title: artwork.title } : undefined}
        startMode={inquiryMode}
      />

      {/* Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageList[selectedImage] ?? getArtworkPlaceholder()}
              alt={artwork.title}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {imageList.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {imageList.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    selectedImage === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
