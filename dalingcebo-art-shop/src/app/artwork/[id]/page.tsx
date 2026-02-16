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
import { ShoppingCart, Bell, CheckCircle, X, ZoomIn, Facebook, Twitter, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react'

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
                    <ZoomIn className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
              </button>

              {imageList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageList.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg transition-all bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 flex-shrink-0 w-20 h-20 md:w-24 md:h-24 ${
                        selectedImage === index 
                          ? 'ring-2 ring-black shadow-lg scale-105' 
                          : 'opacity-60 hover:opacity-100 hover:shadow-md'
                      }`}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={selectedImage === index}
                    >
                      <Image
                        src={image}
                        alt={`${artwork.title} detail ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                      {selectedImage === index && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-black/20"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-[0.15em] rounded-full flex-shrink-0">
                    {artwork.category}
                  </span>
                  {artwork.inStock ? (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 text-[10px] uppercase tracking-[0.15em] rounded-full flex items-center gap-1.5 flex-shrink-0">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                      Available
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-red-50 text-red-700 text-[10px] uppercase tracking-[0.15em] rounded-full flex-shrink-0">
                      Sold
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-5 leading-tight">
                  {artwork.title}
                </h1>
                <div className="flex items-baseline gap-4 mb-3">
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
                
                <VariantSelector 
                  artworkId={artwork.id} 
                  basePrice={artwork.price} 
                  onVariantChange={handleVariantChange} 
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-5 md:p-6 border border-gray-200">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 mb-4">About This Piece</h3>
                <p className="text-sm leading-relaxed text-gray-900 mb-3">
                  {artwork.description}
                </p>
                <p className="text-xs leading-relaxed text-gray-600">
                  {artwork.details}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600 mb-4">Specifications</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Medium</span>
                    <span className="text-right text-gray-900 font-medium">{artwork.medium}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Size</span>
                    <span className="text-gray-900 font-medium">{artwork.size}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Year</span>
                    <span className="text-gray-900 font-medium">{artwork.year}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Edition</span>
                    <span className="text-gray-900 font-medium">{artwork.edition}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500 uppercase tracking-wide">Availability</span>
                    <span className="text-gray-900 font-medium">{artwork.inStock ? 'In Stock' : 'Sold'}</span>
                  </div>
                  {artwork.inventory !== undefined && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500 uppercase tracking-wide">Pieces Remaining</span>
                      <span className="text-gray-900 font-medium">{artwork.inventory}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {artwork.inStock ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        size="default"
                        onClick={handleAddToCart}
                        className="flex-[2]"
                        aria-label="Add artwork to shopping cart"
                      >
                        <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="secondary"
                        size="default"
                        onClick={handleReserve}
                        className="flex-1"
                        aria-label="Reserve this artwork"
                      >
                        Reserve
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="default"
                      onClick={handleInquire}
                      className="w-full border border-gray-300"
                      aria-label="Inquire about this artwork"
                    >
                      Inquire About This Piece
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="default"
                    onClick={handleInquire}
                    className="w-full"
                    aria-label="Get notified when artwork becomes available"
                  >
                    <Bell className="w-4 h-4" aria-hidden="true" />
                    Notify When Available
                  </Button>
                )}

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-[10px] uppercase tracking-wider text-gray-600 space-y-2">
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Certificate of Authenticity
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Secure Packaging & Shipping
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    14-day returns
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Share:</span>
                <div className="flex gap-2">
                  <Button
                    variant="icon"
                    size="icon"
                    className="border border-gray-200 hover:border-gray-400"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="icon"
                    size="icon"
                    className="border border-gray-200 hover:border-gray-400"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="icon"
                    size="icon"
                    className="border border-gray-200 hover:border-gray-400"
                    title="Copy link"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {artwork.videos && artwork.videos.length > 0 && (
            <div className="border-t border-gray-200 mt-8 pt-6">
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
            <div className="border-t border-gray-200 mt-8 pt-6">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-1.5">Explore Similar</p>
                  <h2 className="text-xl md:text-2xl font-light tracking-tight">You May Also Like</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {relatedArtworks.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => router.push(`/artwork/${related.id}`)}
                    className="group text-left cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    aria-label={`View artwork ${related.title}`}
                  >
                    <div
                      className="relative w-full h-48 md:h-56 bg-gray-50 overflow-hidden"
                    >
                      <Image
                        src={getArtworkPrimaryImage(related)}
                        alt={related.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400">
                        {related.category}
                      </p>
                      <p className="text-xs font-medium text-gray-900 truncate leading-tight">
                        {related.title}
                      </p>
                      <p className="text-xs text-gray-600 font-light">
                        ${related.price.toLocaleString()}
                      </p>
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
