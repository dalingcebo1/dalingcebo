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
    if (!artwork) return [getArtworkPlaceholder(), getArtworkPlaceholder(), getArtworkPlaceholder(), getArtworkPlaceholder()]
    const gallery = (artwork.images || []).filter(Boolean)
    const baseImages = gallery.length > 0 ? gallery : [getArtworkPrimaryImage(artwork)]
    
    // Ensure we always have 4 placeholders
    const placeholders = [getArtworkPlaceholder(), getArtworkPlaceholder(), getArtworkPlaceholder(), getArtworkPlaceholder()]
    return baseImages.concat(placeholders.slice(baseImages.length)).slice(0, 4)
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
      
      <section className="yeezy-section bg-white">
        <div className="yeezy-container max-w-6xl mx-auto">
          {/* Centered Image Carousel */}
          <div className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Main Carousel Container */}
            <div className="relative mb-4 flex justify-center">
              {/* Main Carousel Image with smooth transitions */}
              <div className="relative bg-gray-50 overflow-hidden rounded-lg" style={{ width: '100%', maxWidth: '900px', aspectRatio: heroAspectRatio, minHeight: '450px', maxHeight: '65vh' }}>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    key={selectedImage}
                    src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                    alt={`${artwork.title} - Image ${selectedImage + 1} of ${imageList.length}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 900px"
                    className="object-contain transition-opacity duration-500 ease-in-out"
                    priority
                  />
                </div>
                
                {/* Arrow Navigation */}
                {imageList.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-900" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-900" aria-hidden="true" />
                    </button>
                  </>
                )}
                
                {/* Zoom button */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  aria-label="View fullscreen"
                >
                  <ZoomIn className="w-4 h-4 text-gray-900" aria-hidden="true" />
                </button>
              </div>

              {/* Pagination Dots */}
              {imageList.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-2.5">
                  {imageList.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full ${
                        selectedImage === index 
                          ? 'w-6 h-1.5 bg-black' 
                          : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`View image ${index + 1} of ${imageList.length}${selectedImage === index ? ' (currently selected)' : ''}`}
                      aria-current={selectedImage === index}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Title and Price - Minimal */}
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
                {artwork.title}
              </h1>
              <p className="text-2xl font-light mb-1">
                ${currentPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                {artwork.edition}
              </p>
            </div>

            {/* Variant Selector - Minimal */}
            {artwork.inStock && (
              <div className="max-w-md mx-auto mb-4">
                <VariantSelector 
                  artworkId={artwork.id} 
                  basePrice={artwork.price} 
                  onVariantChange={handleVariantChange} 
                />
              </div>
            )}

            {/* Action Icons - Horizontal with minimal text - Match Cart Icon Style */}
            <div className="flex justify-center items-center gap-8 mb-5 pb-4 border-b border-gray-100">
              {artwork.inStock ? (
                <>
                  <button
                    onClick={handleReserve}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-1 transition-all"
                    aria-label="Reserve this artwork"
                  >
                    <Bookmark className="w-5 h-5 text-black group-hover:opacity-70 transition-opacity" strokeWidth="1.2" aria-hidden="true" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">Reserve</span>
                  </button>
                  
                  <button
                    onClick={handleInquire}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-1 transition-all"
                    aria-label="Inquire about this artwork"
                  >
                    <MessageSquare className="w-5 h-5 text-black group-hover:opacity-70 transition-opacity" strokeWidth="1.2" aria-hidden="true" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">Inquire</span>
                  </button>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-1 transition-all"
                    aria-label="Add artwork to shopping cart"
                  >
                    <ShoppingCart className="w-5 h-5 text-black group-hover:opacity-70 transition-opacity" strokeWidth="1.2" aria-hidden="true" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">Add to Cart</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleInquire}
                  className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-1 transition-all"
                  aria-label="Get notified when artwork becomes available"
                >
                  <Bell className="w-5 h-5 text-black group-hover:opacity-70 transition-opacity" strokeWidth="1.2" aria-hidden="true" />
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">Notify Me</span>
                </button>
              )}
            </div>

            {/* Details Section - Single Row Compact */}
            <div className="max-w-3xl mx-auto mb-5">
              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                <h3 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gray-500 mb-2">Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs mb-2.5 pb-2.5 border-b border-gray-200">
                  <div>
                    <span className="text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Medium</span>
                    <span className="text-gray-900 font-medium">{artwork.medium}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Size</span>
                    <span className="text-gray-900 font-medium">{artwork.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Year</span>
                    <span className="text-gray-900 font-medium">{artwork.year}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 uppercase tracking-wide text-[10px] block mb-0.5">Status</span>
                    <span className={`font-medium ${artwork.inStock ? 'text-green-700' : 'text-red-700'}`}>
                      {artwork.inStock ? 'Available' : 'Sold'}
                    </span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-gray-700">
                  {artwork.description}
                </p>
              </div>
            </div>

          </div>

          {/* You May Also Like - Minimal */}
          {relatedArtworks.length > 0 && (
            <div className="border-t border-gray-100 pt-5 mt-5">
              <h2 className="text-sm font-light tracking-tight text-center mb-3 text-gray-900 uppercase tracking-wider" style={{ fontSize: '10px', letterSpacing: '0.15em' }}>You May Also Like</h2>
              <div className="flex justify-center gap-3 max-w-md mx-auto">
                {relatedArtworks.slice(0, 2).map((related) => (
                  <button
                    key={related.id}
                    onClick={() => router.push(`/artwork/${related.id}`)}
                    className="group text-left cursor-pointer flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg transition-all"
                    aria-label={`View artwork ${related.title}`}
                  >
                    <div className="relative w-full h-20 bg-gray-50 overflow-hidden rounded-md mb-1.5 border border-gray-100">
                      <Image
                        src={getArtworkPrimaryImage(related)}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, 200px"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium text-gray-900 truncate">
                        {related.title}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ${related.price.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section - Removed to minimize vertical scroll */}
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
