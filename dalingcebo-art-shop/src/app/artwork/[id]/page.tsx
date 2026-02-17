'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Toast from '@/components/Toast'
import LoadingSpinner from '@/components/LoadingSpinner'
import InquiryModal from '@/components/InquiryModal'
import VariantSelector from '@/components/VariantSelector'
import { VideoGallery } from '@/components/VideoPlayer'
import Breadcrumb from '@/components/Breadcrumb'
import { useCart } from '@/contexts/CartContext'
import { Artwork } from '@/types/artwork'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage, getArtworkPlaceholder } from '@/lib/media'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Bell, CheckCircle, X, ZoomIn, Facebook, Twitter, Link as LinkIcon, ChevronLeft, ChevronRight, MessageSquare, Bookmark } from 'lucide-react'

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

  // Early validation: check if ID is valid
  const isValidId = /^\d+$/.test(params.id) && parseInt(params.id, 10) > 0

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        setIsLightboxOpen(false)
      }
    }
    
    if (isLightboxOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen])

  useEffect(() => {
    // Skip fetch if ID is invalid
    if (!isValidId) {
      setIsLoading(false)
      setError('not-found')
      return
    }

    const controller = new AbortController()
    async function fetchArtwork() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/artworks/${params.id}`, { signal: controller.signal })
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('not-found')
          }
          if (response.status === 400) {
            throw new Error('invalid-link')
          }
          if (response.status >= 500) {
            throw new Error('server-error')
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
  }, [params.id, isValidId])

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

  const handleVariantChange = useCallback((variantData: SelectedVariant) => {
    setSelectedVariant(variantData)
  }, [])

  const handleAddToCart = () => {
    if (!artwork) return
    
    // Get the inventory limit
    // For original artworks (inStock = false when sold), inventory typically defaults to 1
    // For prints or reproductions, artwork.inventory should be set to the available quantity
    // If inventory is not set, we default to 1 to be safe
    const maxQuantity = artwork.inventory ?? 1;
    
    const wasAdded = addToCart({
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
    }, maxQuantity)

    if (wasAdded) {
      setToastMessage(`${artwork.title} added to cart`)
    } else {
      setToastMessage(`Cannot add more - maximum quantity reached`)
    }
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

  const renderFallback = (message: string, description: string, action?: () => void, actionLabel?: string, secondaryAction?: () => void, secondaryLabel?: string) => (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <div className="flex items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="max-w-md">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-3 text-gray-900">{message}</h1>
            <p className="text-gray-600 text-base leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {action && actionLabel && (
              <button 
                onClick={action} 
                className="px-8 py-3 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                aria-label={actionLabel}
              >
                {actionLabel}
              </button>
            )}
            {secondaryAction && secondaryLabel && (
              <button 
                onClick={secondaryAction} 
                className="px-8 py-3 border border-gray-300 rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:border-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                aria-label={secondaryLabel}
              >
                {secondaryLabel}
              </button>
            )}
            {!action && !secondaryAction && (
              <>
                <button 
                  onClick={() => router.push('/shop')} 
                  className="px-8 py-3 bg-black text-white rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="Return to shop"
                >
                  Back to Shop
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className="px-8 py-3 border border-gray-300 rounded-lg text-xs font-medium uppercase tracking-[0.1em] hover:border-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="Return to home page"
                >
                  Go Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )

  if (isLoading || (!artwork && !error)) {
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

  if (error || !artwork) {
    if (error === 'not-found' || !artwork) {
      return renderFallback('Artwork Not Found', "We couldn't find the artwork you're looking for.")
    }
    if (error === 'invalid-link') {
      return renderFallback('Invalid Artwork Link', 'The artwork link appears to be invalid or malformed.')
    }
    if (error === 'server-error') {
      return renderFallback(
        'Server Error',
        'We encountered an issue loading this artwork. Please try again.',
        () => router.refresh(),
        'Try Again',
        () => router.push('/shop'),
        'Back to Shop'
      )
    }
    return renderFallback(
      'Unable to Load Artwork',
      'Something went wrong while loading this artwork.',
      () => router.refresh(),
      'Try Again',
      () => router.push('/shop'),
      'Back to Shop'
    )
  }

  const currentPrice = selectedVariant ? selectedVariant.finalPrice : artwork.price
  const heroAspectRatio = getArtworkAspectRatio(artwork.size)
  const scaleCrumb = artwork.scale === 'large'
    ? { label: 'Large Paintings', href: '/large-paintings' }
    : artwork.scale === 'small'
      ? { label: 'Small Paintings', href: '/small-paintings' }
      : { label: artwork.category, href: '/shop' }
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    scaleCrumb,
    { label: artwork.title }
  ]

  return (
    <>
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
        <section className="border-b border-gray-200 bg-white">
          <div className="yeezy-container py-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </section>
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-5xl mx-auto">
          {/* Centered Image Carousel */}
          <div className={`fade-in-slow ${isVisible ? '' : ''}`}>
            <div className="relative mb-8">
              {/* Main Carousel Image */}
              <div className="relative bg-gray-50 overflow-hidden rounded-xl" style={{ aspectRatio: heroAspectRatio, maxHeight: '70vh' }}>
                <Image
                  src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 80vw"
                  className="object-contain"
                  priority
                />
                
                {/* Arrow Navigation */}
                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-900" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900" aria-hidden="true" />
                    </button>
                  </>
                )}
                
                {/* Zoom button */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-4 right-4 p-2.5 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="View fullscreen"
                >
                  <ZoomIn className="w-4 h-4 text-gray-900" aria-hidden="true" />
                </button>
              </div>

              {/* Pagination Dots */}
              {imageList.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {imageList.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full ${
                        selectedImage === index 
                          ? 'w-8 h-2 bg-black' 
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`View image ${index + 1} of ${imageList.length}`}
                      aria-current={selectedImage === index}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Artwork Info - Centered */}
            <div className="text-center max-w-3xl mx-auto mb-8">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-[0.15em] rounded-full">
                  {artwork.category}
                </span>
                {artwork.inStock ? (
                  <span className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] uppercase tracking-[0.15em] rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Available
                  </span>
                ) : (
                  <span className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] uppercase tracking-[0.15em] rounded-full">
                    Sold
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4 leading-tight">
                {artwork.title}
              </h1>
              
              <div className="flex items-baseline justify-center gap-4 mb-2">
                <p className="text-3xl md:text-4xl font-light">
                  ${currentPrice.toLocaleString()}
                </p>
                {artwork.inventory && artwork.inventory < 5 && artwork.inStock && (
                  <span className="text-xs text-amber-600 font-medium">Only {artwork.inventory} left</span>
                )}
              </div>
              
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-6">
                {artwork.edition} • {artwork.year}
              </p>
              
              {/* Variant Selector - Centered */}
              <div className="max-w-md mx-auto mb-6">
                <VariantSelector 
                  artworkId={artwork.id} 
                  basePrice={artwork.price} 
                  onVariantChange={handleVariantChange} 
                />
              </div>
            </div>

            {/* Action Icons - Horizontal */}
            <div className="flex justify-center gap-8 mb-12 pb-8 border-b border-gray-200">
              {artwork.inStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Add artwork to shopping cart"
                  >
                    <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Add to Cart</span>
                  </button>
                  
                  <button
                    onClick={handleReserve}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Reserve this artwork"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Bookmark className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Reserve</span>
                  </button>
                  
                  <button
                    onClick={handleInquire}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    aria-label="Inquire about this artwork"
                  >
                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Inquire</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleInquire}
                  className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Get notified when artwork becomes available"
                >
                  <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500">Notify Me</span>
                </button>
              )}
            </div>

            {/* Details Section - Compact Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 mb-3">About This Piece</h3>
                <p className="text-sm leading-relaxed text-gray-900 mb-2">
                  {artwork.description}
                </p>
                <p className="text-xs leading-relaxed text-gray-600">
                  {artwork.details}
                </p>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 mb-3">Specifications</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Medium</span>
                    <span className="text-right text-gray-900 font-medium">{artwork.medium}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Size</span>
                    <span className="text-gray-900 font-medium">{artwork.size}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Year</span>
                    <span className="text-gray-900 font-medium">{artwork.year}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500 uppercase tracking-wide">Edition</span>
                    <span className="text-gray-900 font-medium">{artwork.edition}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges - Centered */}
            <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto mb-8 text-[10px] uppercase tracking-wider text-gray-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Certificate of Authenticity
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                Secure Shipping
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                14-day Returns
              </p>
            </div>
          </div>

          {relatedArtworks.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="text-center mb-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-1.5">Explore Similar</p>
                <h2 className="text-xl md:text-2xl font-light tracking-tight">You May Also Like</h2>
              </div>
              <div className="flex justify-center gap-6 max-w-2xl mx-auto">
                {relatedArtworks.slice(0, 2).map((related) => (
                  <button
                    key={related.id}
                    onClick={() => router.push(`/artwork/${related.id}`)}
                    className="group text-left cursor-pointer flex-1 max-w-xs"
                    aria-label={`View artwork ${related.title}`}
                  >
                    <div className="relative w-full h-48 bg-gray-50 overflow-hidden rounded-lg mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                      <Image
                        src={getArtworkPrimaryImage(related)}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 50vw, 300px"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        ${related.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {artwork.videos && artwork.videos.length > 0 && (
            <div className="border-t border-gray-200 mt-8 pt-8">
              <div className="text-center mb-8">
                <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">Studio Footage</p>
                <h2 className="text-2xl md:text-3xl font-light tracking-tight">Process & Installation</h2>
              </div>
              <VideoGallery videos={artwork.videos} />
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
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <Button
            variant="icon"
            size="icon"
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox (Press Escape)"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </Button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageList[selectedImage] ?? getArtworkPlaceholder()}
              alt={`${artwork.title} - Full view`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {imageList.length > 1 && (
            <>
              {/* Navigation buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
              </button>
              {/* Thumbnail indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                {imageList.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(index)
                    }}
                    className={`w-2 h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      selectedImage === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`View image ${index + 1} of ${imageList.length}`}
                    aria-current={selectedImage === index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
