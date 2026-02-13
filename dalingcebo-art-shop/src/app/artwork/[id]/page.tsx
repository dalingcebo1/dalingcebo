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
import { ErrorBoundary } from '@/components/ErrorBoundary'

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
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} showBackButton />
      <div className="yeezy-hero" style={{ height: '60vh' }}>
        <div className="yeezy-hero-content">
          <h1 className="yeezy-heading text-2xl mb-6">{message}</h1>
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
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} showBackButton />
        <div className="yeezy-hero" style={{ height: '60vh' }}>
          <div className="flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
        <Footer />
      </main>
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
    <ErrorBoundary>
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} showBackButton />
        
        {/* Hero Section with Artwork Title */}
        <section className="yeezy-hero" style={{ height: '40vh' }}>
          <div className="yeezy-hero-content">
            <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
              <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}>
                {artwork.title}
              </h1>
            </div>
            <div className="fade-in-slow" style={{ animationDelay: '0.6s' }}>
              <p className="yeezy-body text-gray-600">
                {artwork.artist} • {artwork.year}
              </p>
            </div>
          </div>
        </section>
        {/* Main Content */}
        <section className="yeezy-section">
          <div className="yeezy-container">
            {/* Status and Price Bar */}
            <div className="bg-white border border-gray-200 p-6 mb-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 text-xs uppercase tracking-[0.3em] border border-gray-200">
                    {artwork.category}
                  </span>
                  {artwork.inStock ? (
                    <span className="px-4 py-2 bg-green-50 text-green-700 text-xs uppercase tracking-[0.3em] border border-green-200 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Available
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-red-50 text-red-700 text-xs uppercase tracking-[0.3em] border border-red-200">
                      Sold
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-1">Price</p>
                  <p className="text-3xl font-light">${currentPrice.toLocaleString()}</p>
                  {artwork.inventory && artwork.inventory < 5 && artwork.inStock && (
                    <p className="text-xs text-amber-600 mt-1">Only {artwork.inventory} remaining</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <div className="space-y-4 fade-in-slow" style={{ animationDelay: '0.3s' }}>
                <button 
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative bg-gray-50 overflow-hidden group cursor-zoom-in border border-gray-200"
                  style={{ aspectRatio: heroAspectRatio }}
                >
                  <Image
                    src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                    alt={artwork.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain group-hover:scale-[1.02] transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.3em]">
                      Click to Enlarge
                    </div>
                  </div>
                </button>

                {imageList.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {imageList.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square overflow-hidden transition-all bg-gray-50 border ${
                          selectedImage === index 
                            ? 'border-black' 
                            : 'border-gray-200 opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt={`${artwork.title} view ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details and Actions */}
              <div className="space-y-8 fade-in-slow" style={{ animationDelay: '0.6s' }}>
                {/* Description */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">About This Work</h2>
                  <p className="yeezy-body text-base leading-relaxed text-gray-900 mb-4">
                    {artwork.description}
                  </p>
                  {artwork.details && (
                    <p className="yeezy-body text-sm leading-relaxed text-gray-600">
                      {artwork.details}
                    </p>
                  )}
                </div>

                {/* Specifications */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">Specifications</h2>
                  <div className="space-y-3 yeezy-body text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Medium</span>
                      <span className="text-right">{artwork.medium}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Dimensions</span>
                      <span>{artwork.size}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Year</span>
                      <span>{artwork.year}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-3">
                      <span className="text-gray-600">Edition</span>
                      <span>{artwork.edition}</span>
                    </div>
                    {artwork.inventory !== undefined && (
                      <div className="flex justify-between border-b border-gray-100 pb-3">
                        <span className="text-gray-600">Available</span>
                        <span>{artwork.inventory} piece{artwork.inventory !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Variant Selector */}
                {artwork.inStock && (
                  <div className="border-t border-gray-200 pt-8">
                    <VariantSelector 
                      artworkId={artwork.id} 
                      basePrice={artwork.price} 
                      onVariantChange={handleVariantChange} 
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-8">
                  <div className="space-y-3">
                    {artwork.inStock ? (
                      <>
                        <button 
                          onClick={handleAddToCart} 
                          className="w-full btn-yeezy-primary text-sm py-4"
                        >
                          Add to Cart
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={handleReserve}
                            className="btn-yeezy text-xs py-3"
                          >
                            Reserve
                          </button>
                          <button 
                            onClick={handleInquire} 
                            className="btn-yeezy text-xs py-3"
                          >
                            Inquire
                          </button>
                        </div>
                      </>
                    ) : (
                      <button 
                        onClick={handleInquire} 
                        className="w-full btn-yeezy-primary text-sm py-4"
                      >
                        Notify When Available
                      </button>
                    )}
                  </div>

                  {/* Guarantees */}
                  <div className="mt-6 space-y-2 text-[10px] uppercase tracking-[0.3em] text-gray-600">
                    <p className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Certificate of Authenticity
                    </p>
                    <p className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Secure Packaging & Shipping
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      14-Day Returns
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Videos Section */}
            {artwork.videos && artwork.videos.length > 0 && (
              <div className="border-t border-gray-200 mt-20 pt-16">
                <div className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Studio Footage</p>
                  <h2 className="yeezy-heading text-3xl md:text-4xl">Process & Installation</h2>
                </div>
                <VideoGallery videos={artwork.videos} />
              </div>
            )}

            {/* Related Artworks */}
            {relatedArtworks.length > 0 && (
              <div className="border-t border-gray-200 mt-20 pt-16">
                <div className="mb-12">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">More Works</p>
                  <h2 className="yeezy-heading text-3xl md:text-4xl">You May Also Like</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  {relatedArtworks.map((related) => (
                    <div
                      key={related.id}
                      onClick={() => router.push(`/artwork/${related.id}`)}
                      className="yeezy-grid-item yeezy-transition group cursor-pointer bg-white"
                    >
                      <div
                        className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden"
                        style={{ aspectRatio: getArtworkAspectRatio(related.size) }}
                      >
                        <Image
                          src={getArtworkPrimaryImage(related)}
                          alt={related.title}
                          fill
                          className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <div className="yeezy-overlay">
                        <div className="w-full">
                          <div className="flex justify-between items-end">
                            <div>
                              <h3 className="yeezy-title text-black mb-1">
                                {related.title}
                              </h3>
                              <p className="text-xs text-gray-700 yeezy-body">
                                {related.size} • {related.year}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="yeezy-price text-black">
                                ${related.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        artwork={artwork ? { id: artwork.id, title: artwork.title } : undefined}
        startMode={inquiryMode}
      />

      {/* Image Lightbox */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10 p-2"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className={`h-1 rounded-full transition-all ${
                    selectedImage === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75 w-6'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </ErrorBoundary>
  )
}
