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
import VideoPlayer from '@/components/VideoPlayer'
import Breadcrumb from '@/components/Breadcrumb'
import { useCart } from '@/contexts/CartContext'
import { Artwork } from '@/types/artwork'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage, getArtworkPlaceholder } from '@/lib/media'
import { Button } from '@/components/ui/Button'
import { X, ZoomIn, ChevronLeft, ChevronRight, ShoppingCart, Bookmark, MessageSquare } from 'lucide-react'

interface SelectedVariant {
  frameVariantId?: string
  canvasVariantId?: string
  frameVariantName?: string
  canvasVariantName?: string
  finalPrice: number
  processingDays: number
}

// Grey placeholder data URL for empty image slots
const GREY_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect width="800" height="1000" fill="%23E5E7EB"/%3E%3C/svg%3E'

export default function ArtworkDetail() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const { artworks: catalogue } = useArtworks()
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  // Index across all hero media (images first, then videos)
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

  const placeholderImage = getArtworkPlaceholder()

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
    if (!artwork) return [placeholderImage, placeholderImage, placeholderImage, placeholderImage]
    const gallery = (artwork.images || []).filter(Boolean)
    const baseImages = gallery.length > 0 ? gallery : [getArtworkPrimaryImage(artwork)]
    
    // Ensure we always have 4 placeholders
    const placeholders = [placeholderImage, placeholderImage, placeholderImage, placeholderImage]
    return baseImages.concat(placeholders.slice(baseImages.length)).slice(0, 4)
  }, [artwork, placeholderImage])

  // Videos associated with this artwork (for hero carousel)
  const videoList = useMemo(() => {
    if (!artwork || !Array.isArray(artwork.videos)) return []
    return artwork.videos.filter((video) => video.youtubeId || video.storageUrl)
  }, [artwork])

  const totalMediaItems = imageList.length + videoList.length

  const isVideoSlide = videoList.length > 0 && selectedImage >= imageList.length
  const isPlaceholderSlide = !isVideoSlide && imageList[selectedImage] === placeholderImage

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
        
        {/* Grid Container - 1320px max width, centered */}
        <div className="mx-auto px-4 sm:px-5 lg:px-6" style={{ maxWidth: '1320px' }}>
          
          {/* ROW 1: Breadcrumb - columns 1-12, margin-bottom 32px */}
          <section className="mb-8">
            <Breadcrumb items={breadcrumbs} />
          </section>
          
          {/* Main content with fade-in */}
          <div className={`transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* ROW 2: Artwork Image - columns 3-10, max-height 70vh, margin-bottom 48px */}
            <section className="mb-12">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                  {/* Main Carousel Container */}
                  <div className="relative">
                    {/* Main Carousel Media (images first, then optional video) */}
                    <div className="relative bg-gray-50 overflow-hidden mx-auto" style={{ aspectRatio: heroAspectRatio, maxHeight: '70vh' }}>
                      <div className="relative w-full h-full flex items-center justify-center">
                        {isVideoSlide ? (
                          <div className="w-full h-full flex items-center justify-center bg-black">
                            <div className="w-full h-full max-h-[70vh]">
                              <VideoPlayer
                                video={videoList[selectedImage - imageList.length]}
                                autoplay={false}
                              />
                            </div>
                          </div>
                        ) : isPlaceholderSlide ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200" aria-hidden="true" />
                        ) : (
                          <Image
                            key={selectedImage}
                            src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                            alt={`${artwork.title} - Image ${selectedImage + 1} of ${totalMediaItems}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 66vw"
                            className="object-contain transition-opacity duration-300 ease-in-out"
                            priority
                          />
                        )}
                      </div>
                      
                      {/* Arrow Navigation - aligned to sides of the media */}
                      {totalMediaItems > 1 && (
                        <>
                          <button
                            onClick={() => setSelectedImage((prev) => (prev > 0 ? prev - 1 : totalMediaItems - 1))}
                            className="flex items-center justify-center p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 z-10"
                            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-900" aria-hidden="true" strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => setSelectedImage((prev) => (prev < totalMediaItems - 1 ? prev + 1 : 0))}
                            className="flex items-center justify-center p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 z-10"
                            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-900" aria-hidden="true" strokeWidth={2} />
                          </button>
                        </>
                      )}
                      
                      {/* Zoom button (images only) */}
                      {!isVideoSlide && (
                        <button
                          onClick={() => setIsLightboxOpen(true)}
                          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                          aria-label="View fullscreen"
                        >
                          <ZoomIn className="w-4 h-4 text-gray-900" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Pagination Dots and Image Counter - Centered within columns 5-8 equivalent */}
                    {totalMediaItems > 1 && (
                      <div className="flex flex-col items-center gap-3 mt-6">
                        {/* Image Counter */}
                        <div className="text-sm text-gray-900 font-medium">
                          {selectedImage + 1} / {totalMediaItems}
                        </div>
                        {/* Pagination Dots */}
                        <div className="flex justify-center gap-3">
                          {Array.from({ length: totalMediaItems }).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImage(index)}
                              className={`transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full ${
                                selectedImage === index 
                                  ? 'w-14 h-3.5 bg-black' 
                                  : 'w-3.5 h-3.5 bg-black/30 hover:bg-black'
                              }`}
                              aria-label={
                                index < imageList.length
                                  ? `View image ${index + 1} of ${totalMediaItems}${selectedImage === index ? ' (currently selected)' : ''}`
                                  : `View video ${index - imageList.length + 1} of ${videoList.length}`
                              }
                              aria-current={selectedImage === index}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 3: Title + Price - columns 4-9, centered text, strict spacing */}
            <section>
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-start-4 md:col-span-6 text-center">
                  {/* Title: 40-48px */}
                  <h1 className="text-[40px] md:text-[48px] font-light tracking-tight leading-tight">
                    {artwork.title}
                  </h1>
                  
                  {/* Title → 16px → Price */}
                  <div className="mt-4">
                    {/* Price: 20-24px */}
                    <p className="text-[20px] md:text-[24px] font-light">
                      ${currentPrice.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Price → 8px → Tag */}
                  <div className="mt-2">
                    {/* Tag: 12px uppercase, letter-spacing 0.08em */}
                    <p className="text-[12px] text-gray-500 uppercase tracking-[0.08em]">
                      {artwork.edition}
                    </p>
                  </div>
                  
                  {/* Tag → 32px → Buttons (Variant selector if exists) */}
                  {artwork.inStock && (
                    <div className="mt-8">
                      <VariantSelector 
                        artworkId={artwork.id} 
                        basePrice={artwork.price} 
                        onVariantChange={handleVariantChange} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ROW 4: CTA Buttons - minimal modern icon layout */}
            <section className="mt-8">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-start-4 md:col-span-6">
                  <div className="flex flex-row justify-center items-start gap-8 sm:gap-12">
                    {artwork.inStock ? (
                      <>
                        {/* Add to Cart - Minimal icon with text */}
                        <button
                          onClick={handleAddToCart}
                          className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-2 transition-all duration-200"
                          aria-label="Add artwork to shopping cart"
                        >
                          <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 text-black group-hover:opacity-70 transition-opacity duration-200" strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-gray-600 group-hover:text-black transition-colors duration-200 font-medium">Add to Cart</span>
                        </button>
                        
                        {/* Reserve - Minimal icon with text */}
                        <button
                          onClick={handleReserve}
                          className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-2 transition-all duration-200"
                          aria-label="Reserve this artwork"
                        >
                          <Bookmark className="w-7 h-7 sm:w-8 sm:h-8 text-black group-hover:opacity-70 transition-opacity duration-200" strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-gray-600 group-hover:text-black transition-colors duration-200 font-medium">Reserve</span>
                        </button>
                        
                        {/* Inquire - Minimal icon with text */}
                        <button
                          onClick={handleInquire}
                          className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-2 transition-all duration-200"
                          aria-label="Inquire about this artwork"
                        >
                          <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-black group-hover:opacity-70 transition-opacity duration-200" strokeWidth={1.5} aria-hidden="true" />
                          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-gray-600 group-hover:text-black transition-colors duration-200 font-medium">Inquire</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleInquire}
                        className="flex flex-col items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded p-2 transition-all duration-200"
                        aria-label="Get notified when artwork becomes available"
                      >
                        <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 text-black group-hover:opacity-70 transition-opacity duration-200" strokeWidth={1.5} aria-hidden="true" />
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-gray-600 group-hover:text-black transition-colors duration-200 font-medium">Notify Me</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 5: Details Section - columns 2-11, margin-top 64px, padding-top 48px, border-top 1px */}
            <section className="mt-16 pt-12 border-t border-gray-200">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                  {/* Inner grid: Left column 2-6, Right column 7-11 */}
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-x-6 gap-y-6">
                    {/* Left column details */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Detail group 1 */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-2">Medium</p>
                        <p className="text-[16px] md:text-[18px]">{artwork.medium}</p>
                      </div>
                      
                      {/* Detail group 2 - 24px vertical spacing */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-2">Size</p>
                        <p className="text-[16px] md:text-[18px]">{artwork.size}</p>
                      </div>
                    </div>
                    
                    {/* Right column details */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Detail group 3 */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-2">Year</p>
                        <p className="text-[16px] md:text-[18px]">{artwork.year}</p>
                      </div>
                      
                      {/* Detail group 4 - 24px vertical spacing */}
                      <div>
                        <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-2">Status</p>
                        <p className={`text-[16px] md:text-[18px] ${artwork.inStock ? 'text-green-700' : 'text-red-700'}`}>
                          {artwork.inStock ? 'Available' : 'Sold'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 6: Description - columns 2-11, margin-top 32px, max-width 720px, line-height 1.6 */}
            <section className="mt-8">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-start-2 lg:col-span-10">
                  <div className="mx-auto" style={{ maxWidth: '720px' }}>
                    <p className="text-gray-700 leading-[1.6]">
                      {artwork.description}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ROW 7: Related Works - columns 1-12, margin-top 96px, small thumbnail grid */}
            {relatedArtworks.length > 0 && (
              <section className="mt-24">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12">
                    <h2 className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-8 text-center">Related Works</h2>
                    
                    {/* Horizontal layout with small thumbnails - max 2x2 cm (approx 80px) */}
                    <div className="flex justify-center items-start gap-8 flex-wrap">
                      {relatedArtworks.slice(0, 3).map((related) => (
                        <button
                          key={related.id}
                          onClick={() => router.push(`/artwork/${related.id}`)}
                          className="group text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded transition-all"
                          aria-label={`View artwork ${related.title}`}
                        >
                          {/* Small image - 2x2 cm max (80px) */}
                          <div className="relative bg-gray-50 overflow-hidden mb-2" style={{ width: '80px', height: '80px' }}>
                            <Image
                              src={getArtworkPrimaryImage(related)}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-[1.05] transition-transform duration-300"
                              sizes="80px"
                            />
                          </div>
                          <div className="space-y-1" style={{ maxWidth: '80px' }}>
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
                </div>
              </section>
            )}

          </div>
        </div>

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

      {/* Lightbox (images only) */}
      {isLightboxOpen && selectedImage < imageList.length && (
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
              src={imageList[selectedImage] ?? GREY_PLACEHOLDER}
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
                className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black z-10"
                style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)' }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" aria-hidden="true" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
                }}
                className="flex items-center justify-center p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black z-10"
                style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" aria-hidden="true" strokeWidth={2} />
              </button>
              {/* Thumbnail indicators */}
              <div className="flex gap-3 bg-black/30 backdrop-blur-sm px-4 py-2.5 rounded-full" style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)' }}>
                {imageList.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(index)
                    }}
                    className={`rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      selectedImage === index ? 'bg-white w-14 h-3.5' : 'bg-white/50 hover:bg-white/75 w-3.5 h-3.5'
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
