'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Artwork } from '@/types/artwork'
import { getArtworkPrimaryImage } from '@/lib/media'
import Toast from '@/components/Toast'
import InquiryModal from '@/components/InquiryModal'
import VariantSelector from '@/components/VariantSelector'

interface SelectedVariant {
  frameVariantId?: string
  canvasVariantId?: string
  frameVariantName?: string
  canvasVariantName?: string
  finalPrice: number
  processingDays: number
}

interface ArtworkActionsProps {
  artwork: Artwork
}

export default function ArtworkActions({ artwork }: ArtworkActionsProps) {
  const { addToCart } = useCart()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isInquiryOpen, setIsInquiryOpen] = useState(false)
  const [inquiryMode, setInquiryMode] = useState<'inquiry' | 'reserve'>('inquiry')
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant | null>(null)

  const handleVariantChange = (variantData: SelectedVariant) => {
    setSelectedVariant(variantData)
  }

  const handleAddToCart = () => {
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

  const currentPrice = selectedVariant ? selectedVariant.finalPrice : artwork.price

  return (
    <>
      <div className="space-y-8 fade-in-slow" style={{ animationDelay: '0.6s' }}>
        {/* Price and Status Bar */}
        <div className="bg-white border border-gray-200 p-6">
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
        artwork={{ id: artwork.id, title: artwork.title }}
        startMode={inquiryMode}
      />
    </>
  )
}
