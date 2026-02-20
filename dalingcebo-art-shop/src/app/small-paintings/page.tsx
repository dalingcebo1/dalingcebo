'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageShell from '@/components/layout/PageShell'
import Toast from '@/components/Toast'
import InquiryModal, { type InquiryMode } from '@/components/InquiryModal'
import VariantSelector from '@/components/VariantSelector'
import VideoPlayer from '@/components/VideoPlayer'
import Breadcrumb from '@/components/Breadcrumb'
import { useArtworks } from '@/hooks/useArtworks'
import { useCart } from '@/contexts/CartContext'
import { getArtworkAspectRatio, getArtworkPrimaryImage, getArtworkPlaceholder } from '@/lib/media'
import { Artwork } from '@/types/artwork'
import { ChevronLeft, ChevronRight, ZoomIn, X, ShoppingCart, Bookmark, MessageSquare, ArrowLeft } from 'lucide-react'

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

export default function SmallPaintings() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const { artworks, isLoading, error, reload } = useArtworks()
  const { addToCart } = useCart()

  // Detail view state
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [inquiryMode, setInquiryMode] = useState<InquiryMode>('inquiry')
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)
  const [isMediaFading, setIsMediaFading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const placeholderImage = getArtworkPlaceholder()

  const smallArtworks = useMemo(
    () => artworks.filter((artwork) => artwork.scale === 'small'),
    [artworks]
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle ESC key to close lightbox or return to grid
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false)
        } else if (!showGrid && selectedArtwork) {
          handleBackToGrid()
        }
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isLightboxOpen, showGrid, selectedArtwork])

  // Handle body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isLightboxOpen])

  // Cleanup fade timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current)
      }
    }
  }, [])

  // Image list for detail view
  const imageList = useMemo(() => {
    if (!selectedArtwork) return [placeholderImage]
    const gallery = (selectedArtwork.images || []).filter(Boolean)
    const primary = getArtworkPrimaryImage(selectedArtwork)
    const uniqueExtras = gallery.filter((src) => src && src !== primary)
    return [primary, ...uniqueExtras].filter(Boolean)
  }, [selectedArtwork, placeholderImage])

  // Videos for detail view
  const videoList = useMemo(() => {
    if (!selectedArtwork || !Array.isArray(selectedArtwork.videos)) return []
    return selectedArtwork.videos.filter((video) => video.youtubeId || video.storageUrl)
  }, [selectedArtwork])

  const totalMediaItems = imageList.length + videoList.length
  const isVideoSlide = videoList.length > 0 && selectedImage >= imageList.length
  const isPlaceholderSlide = !isVideoSlide && imageList[selectedImage] === placeholderImage

  const getGridColumns = () => {
    switch (zoomLevel) {
      case 0:
        return 'grid-cols-2 md:grid-cols-3'
      case 1:
        return 'grid-cols-1 md:grid-cols-2'
      case 2:
        return 'grid-cols-1 md:grid-cols-1'
      default:
        return 'grid-cols-2 md:grid-cols-3'
    }
  }

  const handleArtworkClick = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setShowGrid(false)
    setSelectedImage(0)
    setSelectedVariant(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToGrid = () => {
    setSelectedArtwork(null)
    setShowGrid(true)
    setSelectedImage(0)
    setSelectedVariant(null)
  }

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

  const handleAddToCart = () => {
    if (!selectedArtwork) return
    
    const maxQuantity = selectedArtwork.inventory ?? 1
    
    const wasAdded = addToCart({
      id: selectedArtwork.id,
      title: selectedArtwork.title,
      artist: selectedArtwork.artist,
      price: selectedVariant ? selectedVariant.finalPrice : selectedArtwork.price,
      image: getArtworkPrimaryImage(selectedArtwork),
      variantSelections: selectedVariant ? {
        frameVariantId: selectedVariant.frameVariantId,
        canvasVariantId: selectedVariant.canvasVariantId,
        frameVariantName: selectedVariant.frameVariantName,
        canvasVariantName: selectedVariant.canvasVariantName,
      } : undefined,
      processingDays: selectedVariant?.processingDays
    }, maxQuantity)

    if (wasAdded) {
      setToastMessage(`${selectedArtwork.title} added to cart`)
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        router.push('/cart')
      }, 1500)
    } else {
      setToastMessage(`Cannot add more - maximum quantity reached`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleReserve = () => {
    setInquiryMode('reserve')
    setIsInquiryOpen(true)
  }

  const handleInquire = () => {
    setInquiryMode('inquiry')
    setIsInquiryOpen(true)
  }

  const currentPrice = selectedArtwork ? (selectedVariant ? selectedVariant.finalPrice : selectedArtwork.price) : 0
  const heroAspectRatio = selectedArtwork ? getArtworkAspectRatio(selectedArtwork.size) : 0.8

  // Grid View
  const renderGridView = () => (
    <PageShell
      title="SMALL PAINTINGS"
      subtitle="Intimate works perfect for personal spaces and collections."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: 'Small Paintings' }]}
    >
      <div className={`grid ${getGridColumns()} gap-6 md:gap-8 fade-in-slow transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
        {isLoading && (
          <div className="col-span-full flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {error && !isLoading && (
          <div className="col-span-full text-center py-12">
            <p className="yeezy-body text-gray-600">{error}</p>
            <button className="btn-yeezy mt-6" onClick={reload}>
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !error && smallArtworks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="yeezy-body text-gray-600">
              No small-scale works available at this time. Please check back soon.
            </p>
          </div>
        )}

        {!isLoading && !error && smallArtworks.map((artwork) => {
          const primaryImage = getArtworkPrimaryImage(artwork)
          const aspectRatio = getArtworkAspectRatio(artwork.size)
          const hasMultipleImages = artwork.images && artwork.images.length > 1

          return (
            <div
              key={artwork.id}
              onClick={() => handleArtworkClick(artwork)}
              className="yeezy-grid-item yeezy-transition group cursor-pointer"
            >
              {/* Sold Out Badge */}
              {!artwork.inStock && (
                <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black text-white text-[9px] uppercase tracking-[0.3em] font-medium">
                  Sold
                </div>
              )}
              
              {/* Multiple Images Indicator */}
              {hasMultipleImages && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[9px] uppercase tracking-[0.2em] font-medium text-gray-700 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {artwork.images.length}
                </div>
              )}

              <div
                className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden"
                style={{ aspectRatio }}
              >
                <Image
                  src={primaryImage}
                  alt={artwork.title}
                  fill
                  className={`object-contain transition-transform duration-700 ${
                    !artwork.inStock ? 'opacity-60' : 'group-hover:scale-[1.02]'
                  }`}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

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
                      <p className="yeezy-price text-black">
                        R{artwork.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Cross-navigation to other category */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Explore More</p>
        <Link href="/large-paintings" className="btn-yeezy inline-block">
          View Large Paintings
        </Link>
      </div>
    </PageShell>
  )

  // Detail View
  const renderDetailView = () => {
    if (!selectedArtwork) return null

    return (
      <div className="mx-auto px-4 sm:px-5 lg:px-6 fade-in-slow" style={{ maxWidth: '1320px' }}>
        {/* Back to Grid Breadcrumb */}
        <section className="mb-8 pt-6">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-gray-500 hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2"
            aria-label="Back to grid view"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back to Small Paintings
          </button>
        </section>

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="relative">
            {/* Main Carousel Container */}
            <div className="relative">
              <div
                className="relative bg-gray-50 overflow-hidden mx-auto"
                style={{ aspectRatio: heroAspectRatio, maxHeight: '70vh' }}
              >
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ transition: 'opacity 250ms ease', opacity: isMediaFading ? 0 : 1 }}
                >
                  {isVideoSlide ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <div className="w-full h-full max-h-[70vh]">
                        <VideoPlayer
                          video={videoList[selectedImage - imageList.length]}
                          autoplay={true}
                          muted={true}
                          loop={true}
                        />
                      </div>
                    </div>
                  ) : isPlaceholderSlide ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200" aria-hidden="true" />
                  ) : (
                    <Image
                      key={selectedImage}
                      src={imageList[selectedImage] ?? getArtworkPlaceholder()}
                      alt={`${selectedArtwork.title} - Image ${selectedImage + 1} of ${totalMediaItems}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 50vw"
                      className="object-contain transition-opacity duration-300 ease-in-out"
                      priority
                    />
                  )}
                </div>
                
                {/* Arrow Navigation */}
                {totalMediaItems > 1 && (
                  <>
                    <button
                      onClick={() => changeMedia(selectedImage > 0 ? selectedImage - 1 : totalMediaItems - 1)}
                      className="flex items-center justify-center p-2 bg-transparent border-none transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 z-10"
                      style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" aria-hidden="true" strokeWidth={1.8} />
                    </button>
                    <button
                      onClick={() => changeMedia(selectedImage < totalMediaItems - 1 ? selectedImage + 1 : 0)}
                      className="flex items-center justify-center p-2 bg-transparent border-none transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 z-10"
                      style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" aria-hidden="true" strokeWidth={1.8} />
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

              {/* Pagination */}
              {totalMediaItems > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                  {Array.from({ length: totalMediaItems }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => changeMedia(index)}
                      className={`min-w-[44px] h-11 px-3 rounded-lg transition-all duration-200 text-base font-bold border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                        selectedImage === index
                          ? 'bg-black text-white shadow-lg scale-110'
                          : 'bg-transparent text-gray-400 hover:text-black'
                      }`}
                      aria-label={
                        index < imageList.length
                          ? `View image ${index + 1} of ${totalMediaItems}${selectedImage === index ? ' (currently selected)' : ''}`
                          : `View video ${index - imageList.length + 1} of ${videoList.length}`
                      }
                      aria-current={selectedImage === index}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details Panel */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {/* Title */}
            <h1 className="yeezy-heading text-2xl lg:text-3xl text-center mb-4">
              {selectedArtwork.title}
            </h1>
            
            {/* Price */}
            <div className="text-center mb-2">
              <p className="text-xl lg:text-2xl font-light">
                R{currentPrice.toLocaleString()}
              </p>
            </div>
            
            {/* Edition */}
            <div className="text-center mb-8">
              <p className="text-[12px] text-gray-500 uppercase tracking-[0.08em]">
                {selectedArtwork.edition}
              </p>
            </div>

            {/* Variant Selector */}
            {(selectedArtwork.status === 'available' || !selectedArtwork.status) && selectedArtwork.inStock && (
              <div className="mb-8">
                <VariantSelector 
                  artworkId={selectedArtwork.id} 
                  basePrice={selectedArtwork.price} 
                  onVariantChange={handleVariantChange} 
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-8">
              {selectedArtwork.status === 'reserved' ? (
                <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-amber-600" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <span className="text-sm font-medium text-amber-600 uppercase tracking-wider">
                    Reserved
                  </span>
                  <p className="text-xs text-gray-600 text-center">
                    Currently on hold for another customer
                  </p>
                  <button
                    onClick={handleInquire}
                    className="btn-yeezy w-full mt-2"
                    aria-label="Inquire about this artwork"
                  >
                    Inquire
                  </button>
                </div>
              ) : selectedArtwork.status === 'sold' || !selectedArtwork.inStock ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600 text-center">
                    This artwork has been sold
                  </p>
                  <button
                    onClick={handleInquire}
                    className="btn-yeezy w-full"
                    aria-label="Get notified when similar artwork is available"
                  >
                    <MessageSquare className="w-4 h-4 mr-2 inline" strokeWidth={1.5} />
                    Inquire About Similar Works
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="btn-yeezy-primary w-full flex items-center justify-center gap-2"
                    aria-label="Add artwork to shopping cart"
                  >
                    <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
                    Add to Cart
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReserve}
                      className="btn-yeezy flex-1 flex items-center justify-center gap-2"
                      aria-label="Reserve this artwork"
                    >
                      <Bookmark className="w-4 h-4" strokeWidth={1.5} />
                      Reserve
                    </button>
                    <button
                      onClick={handleInquire}
                      className="btn-yeezy flex-1 flex items-center justify-center gap-2"
                      aria-label="Inquire about this artwork"
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                      Inquire
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-1">Medium</p>
                  <p className="text-sm">{selectedArtwork.medium}</p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-1">Size</p>
                  <p className="text-sm">{selectedArtwork.size}</p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-1">Year</p>
                  <p className="text-sm">{selectedArtwork.year}</p>
                </div>
                <div>
                  <p className="text-[12px] uppercase tracking-[0.08em] text-gray-500 mb-1">Status</p>
                  <p className={`text-sm ${
                    selectedArtwork.status === 'reserved' ? 'text-amber-600' :
                    selectedArtwork.status === 'sold' || !selectedArtwork.inStock ? 'text-red-700' : 
                    'text-green-700'
                  }`}>
                    {selectedArtwork.status === 'reserved' ? 'Reserved' :
                     selectedArtwork.status === 'sold' || !selectedArtwork.inStock ? 'Sold' :
                     'Available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedArtwork.description && (
              <div className="border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedArtwork.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cross-navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Explore More</p>
          <Link href="/large-paintings" className="btn-yeezy inline-block">
            View Large Paintings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
        
        {showGrid ? renderGridView() : renderDetailView()}

        <Footer />
      </main>

      {/* Toast notification */}
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
        artwork={selectedArtwork ? { id: selectedArtwork.id, title: selectedArtwork.title } : undefined}
        startMode={inquiryMode}
      />

      {/* Lightbox */}
      {isLightboxOpen && selectedArtwork && selectedImage < imageList.length && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close lightbox (Press Escape)"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={imageList[selectedImage] ?? GREY_PLACEHOLDER}
              alt={`${selectedArtwork.title} - Full view`}
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
