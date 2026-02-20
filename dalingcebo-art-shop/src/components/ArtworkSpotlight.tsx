'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import InquiryModal, { type InquiryMode } from '@/components/InquiryModal'
import VariantSelector from '@/components/VariantSelector'
import VideoPlayer from '@/components/VideoPlayer'
import { useCart } from '@/contexts/CartContext'
import { Artwork } from '@/types/artwork'
import { getArtworkAspectRatio, getArtworkPrimaryImage, getArtworkPlaceholder } from '@/lib/media'
import { X, ZoomIn, ChevronLeft, ChevronRight, ShoppingCart, Bookmark, MessageSquare } from 'lucide-react'

interface SelectedVariant {
  frameVariantId?: string
  canvasVariantId?: string
  frameVariantName?: string
  canvasVariantName?: string
  finalPrice: number
  processingDays: number
}

interface ArtworkSpotlightProps {
  artwork: Artwork
  isOpen: boolean
  onClose: () => void
}

const GREY_PLACEHOLDER = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Crect width="800" height="1000" fill="%23E5E7EB"/%3E%3C/svg%3E'

export default function ArtworkSpotlight({ artwork, isOpen, onClose }: ArtworkSpotlightProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>('inquiry')
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)
  const [isMediaFading, setIsMediaFading] = useState(false)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const placeholderImage = getArtworkPlaceholder()

  // Reset state when artwork changes
  useEffect(() => {
    setSelectedImage(0)
    setSelectedVariant(null)
  }, [artwork.id])

  // Handle ESC key to close spotlight
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false)
        } else if (isOpen && !isInquiryOpen) {
          onClose()
        }
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isLightboxOpen, isInquiryOpen, onClose])

  // Maximum number of gallery image slots to display
  const MAX_GALLERY_SLOTS = 4

  const imageList = useMemo(() => {
    const gallery = (artwork.images || []).filter(Boolean)
    const primary = getArtworkPrimaryImage(artwork)
    const uniqueExtras = gallery.filter((src) => src && src !== primary)
    const baseImages = [primary, ...uniqueExtras]
    const placeholders = Array(MAX_GALLERY_SLOTS).fill(placeholderImage)
    return baseImages.concat(placeholders.slice(baseImages.length)).slice(0, MAX_GALLERY_SLOTS)
  }, [artwork, placeholderImage])

  // Count of actual (non-placeholder) images
  const actualImageCount = useMemo(() => {
    return imageList.filter(img => img !== placeholderImage).length
  }, [imageList, placeholderImage])

  const videoList = useMemo(() => {
    if (!artwork.videos || !Array.isArray(artwork.videos)) return []
    return artwork.videos.filter((video) => video.youtubeId || video.storageUrl)
  }, [artwork])

  const totalMediaItems = imageList.length + videoList.length
  const isVideoSlide = videoList.length > 0 && selectedImage >= imageList.length
  const isPlaceholderSlide = !isVideoSlide && imageList[selectedImage] === placeholderImage

  const handleVariantChange = useCallback((variantData: SelectedVariant) => {
    setSelectedVariant(variantData)
  }, [])

  const changeMedia = useCallback((nextIndex: number) => {
    if (nextIndex === selectedImage) return
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current)
    }
    setIsMediaFading(true)
    fadeTimeoutRef.current = setTimeout(() => {
      setSelectedImage(nextIndex)
      requestAnimationFrame(() => setIsMediaFading(false))
    }, 180)
  }, [selectedImage])

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [])

  const handleAddToCart = () => {
    const maxQuantity = artwork.inventory ?? 1
    
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

  const handleViewFullDetails = () => {
    router.push(`/artwork/${artwork.id}`)
  }

  const currentPrice = selectedVariant ? selectedVariant.finalPrice : artwork.price
  const heroAspectRatio = getArtworkAspectRatio(artwork.size)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Spotlight Panel */}
      <div 
        className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label={`Artwork details: ${artwork.title}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
          aria-label="Close spotlight (Press Escape)"
        >
          <X className="w-5 h-5 text-gray-900" aria-hidden="true" />
        </button>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row min-h-full">
            
            {/* Left Side - Image/Video Gallery */}
            <div className="lg:w-3/5 p-6 lg:p-10 flex flex-col items-center justify-center bg-gray-50">
              {/* Main Media Container */}
              <div className="relative w-full max-w-2xl">
                <div
                  className="relative bg-white overflow-hidden mx-auto shadow-sm"
                  style={{ aspectRatio: heroAspectRatio, maxHeight: '60vh' }}
                >
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{ transition: 'opacity 250ms ease', opacity: isMediaFading ? 0 : 1 }}
                  >
                    {isVideoSlide ? (
                      <div className="w-full h-full flex items-center justify-center bg-black">
                        <VideoPlayer
                          video={videoList[selectedImage - imageList.length]}
                          autoplay={true}
                          muted={true}
                          loop={true}
                        />
                      </div>
                    ) : isPlaceholderSlide ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200" aria-hidden="true" />
                    ) : (
                      <Image
                        key={selectedImage}
                        src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                        alt={`${artwork.title} - Image ${selectedImage + 1} of ${totalMediaItems}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 60vw"
                        className="object-contain"
                        priority
                      />
                    )}
                  </div>
                  
                  {/* Arrow Navigation */}
                  {totalMediaItems > 1 && (
                    <>
                      <button
                        onClick={() => changeMedia(selectedImage > 0 ? selectedImage - 1 : totalMediaItems - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-900" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => changeMedia(selectedImage < totalMediaItems - 1 ? selectedImage + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-900" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  
                  {/* Zoom button (images only) */}
                  {!isVideoSlide && !isPlaceholderSlide && (
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                      aria-label="View fullscreen"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-900" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Thumbnail navigation */}
                {totalMediaItems > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    {Array.from({ length: totalMediaItems }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => changeMedia(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                          selectedImage === index
                            ? 'bg-black scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`View image ${index + 1}`}
                        aria-current={selectedImage === index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="lg:w-2/5 p-6 lg:p-10 flex flex-col">
              {/* Title and Price */}
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-2">
                  {artwork.title}
                </h2>
                <p className="text-xl md:text-2xl font-light text-gray-900 mb-1">
                  ${currentPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-[0.08em]">
                  {artwork.edition}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 mb-1">Medium</p>
                  <p className="text-sm">{artwork.medium}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 mb-1">Size</p>
                  <p className="text-sm">{artwork.size}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 mb-1">Year</p>
                  <p className="text-sm">{artwork.year}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 mb-1">Status</p>
                  <p className={`text-sm ${
                    artwork.status === 'reserved' ? 'text-amber-600' :
                    artwork.status === 'sold' || !artwork.inStock ? 'text-red-700' : 
                    'text-green-700'
                  }`}>
                    {artwork.status === 'reserved' ? 'Reserved' :
                     artwork.status === 'sold' || !artwork.inStock ? 'Sold' :
                     'Available'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {artwork.description && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                    {artwork.description}
                  </p>
                </div>
              )}

              {/* Variant Selector */}
              {(artwork.status === 'available' || !artwork.status) && artwork.inStock && (
                <div className="mb-6">
                  <VariantSelector 
                    artworkId={artwork.id} 
                    basePrice={artwork.price} 
                    onVariantChange={handleVariantChange} 
                  />
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-auto pt-6">
                {artwork.status === 'reserved' ? (
                  <div className="text-center py-4 px-6 bg-amber-50 rounded-lg">
                    <Bookmark className="w-6 h-6 text-amber-600 mx-auto mb-2" fill="currentColor" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-amber-600 uppercase tracking-wider block">
                      Reserved
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Currently on hold for another customer
                    </p>
                  </div>
                ) : artwork.status === 'sold' || !artwork.inStock ? (
                  <button
                    onClick={handleInquire}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                    aria-label="Get notified when artwork becomes available"
                  >
                    <MessageSquare className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
                    <span className="text-sm uppercase tracking-[0.08em] font-medium text-gray-700">
                      Notify Me
                    </span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Add to Cart - Primary */}
                    <button
                      onClick={handleAddToCart}
                      className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                      aria-label="Add artwork to shopping cart"
                    >
                      <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                      <span className="text-sm uppercase tracking-[0.08em] font-medium">
                        Add to Cart
                      </span>
                    </button>
                    
                    {/* Reserve and Inquire - Secondary */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleReserve}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 hover:border-black rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        aria-label="Reserve this artwork"
                      >
                        <Bookmark className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-[0.08em] font-medium text-gray-700">
                          Reserve
                        </span>
                      </button>
                      
                      <button
                        onClick={handleInquire}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 hover:border-black rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        aria-label="Inquire about this artwork"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                        <span className="text-xs uppercase tracking-[0.08em] font-medium text-gray-700">
                          Inquire
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* View Full Details Link */}
                <button
                  onClick={handleViewFullDetails}
                  className="w-full mt-4 text-center text-xs uppercase tracking-[0.08em] text-gray-500 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black rounded py-2"
                >
                  View Full Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
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
        artwork={{ id: artwork.id, title: artwork.title }}
        startMode={inquiryMode}
      />

      {/* Lightbox */}
      {isLightboxOpen && selectedImage < imageList.length && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 p-2"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox (Press Escape)"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageList[selectedImage] ?? GREY_PLACEHOLDER}
              alt={`${artwork.title} - Full view`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {actualImageCount > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate only through actual images, not placeholders
                  setSelectedImage((prev) => (prev > 0 ? prev - 1 : actualImageCount - 1))
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Navigate only through actual images, not placeholders
                  setSelectedImage((prev) => (prev < actualImageCount - 1 ? prev + 1 : 0))
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
