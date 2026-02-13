'use client'

import { useState, useEffect, useRef } from 'react'
import { ArtworkVariant } from '@/types/artwork'

interface VariantSelectorProps {
  artworkId: number
  basePrice: number
  onVariantChange?: (selectedVariants: {
    frameVariantId?: string
    canvasVariantId?: string
    frameVariantName?: string
    canvasVariantName?: string
    finalPrice: number
    processingDays: number
  }) => void
}

export default function VariantSelector({
  artworkId,
  basePrice,
  onVariantChange
}: VariantSelectorProps) {
  const [variants, setVariants] = useState<ArtworkVariant[]>([])
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null)
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Store callback in ref to avoid including it in effect dependencies
  const onVariantChangeRef = useRef(onVariantChange)
  
  useEffect(() => {
    onVariantChangeRef.current = onVariantChange
  }, [onVariantChange])

  useEffect(() => {
    let isCancelled = false

    const fetchVariants = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/artworks/${artworkId}/variants`)
        if (response.ok) {
          const data = await response.json()
          if (!isCancelled) {
            setVariants(data.variants || [])
          }
        }
      } catch (error) {
        console.error('Error fetching variants:', error)
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchVariants()

    return () => {
      isCancelled = true
    }
  }, [artworkId])

  useEffect(() => {
    if (loading) return

    let finalPrice = basePrice
    let processingDays = 0

    const frameVariant = variants.find(v => v.id === selectedFrameId)
    const canvasVariant = variants.find(v => v.id === selectedCanvasId)

    if (frameVariant) {
      finalPrice += frameVariant.priceAdjustment
      processingDays += frameVariant.processingDays
    }

    if (canvasVariant) {
      finalPrice += canvasVariant.priceAdjustment
      processingDays += canvasVariant.processingDays
    }

    onVariantChangeRef.current?.({
      frameVariantId: selectedFrameId || undefined,
      canvasVariantId: selectedCanvasId || undefined,
      frameVariantName: frameVariant?.name,
      canvasVariantName: canvasVariant?.name,
      finalPrice,
      processingDays
    })
  }, [
    basePrice,
    selectedFrameId,
    selectedCanvasId,
    variants,
    loading,
  ])

  const frameVariants = variants.filter(v => v.variantType === 'frame')
  const canvasVariants = variants.filter(v => v.variantType === 'canvas_type')

  if (loading) {
    return <div className="text-sm text-gray-500">Loading options...</div>
  }

  if (variants.length === 0) {
    return null
  }

  const selectedFrame = variants.find(v => v.id === selectedFrameId)
  const selectedCanvas = variants.find(v => v.id === selectedCanvasId)
  
  const priceAdjustment = 
    (selectedFrame?.priceAdjustment || 0) + 
    (selectedCanvas?.priceAdjustment || 0)

  const totalProcessingDays = 
    (selectedFrame?.processingDays || 0) + 
    (selectedCanvas?.processingDays || 0)

  return (
    <div className="space-y-6">
      {/* Frame Options */}
      {frameVariants.length > 0 && (
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 mb-3">
            Frame Selection
          </label>
          <div className="space-y-2">
            {frameVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedFrameId(variant.id)}
                disabled={!variant.inStock}
                className={`
                  w-full p-3 text-left border rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
                  ${selectedFrameId === variant.id 
                    ? 'border-black bg-black text-white ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200 hover:border-black bg-white text-gray-900'
                  }
                  ${!variant.inStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
                aria-label={`${variant.name} frame option, ${variant.priceAdjustment > 0 ? 'adds' : variant.priceAdjustment < 0 ? 'reduces' : 'no change to'} price${variant.processingDays > 0 ? `, adds ${variant.processingDays} days processing time` : ''}`}
                aria-pressed={selectedFrameId === variant.id}
                aria-disabled={!variant.inStock}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide">
                      {variant.name}
                    </div>
                    {variant.description && (
                      <div className={`text-[11px] mt-0.5 ${selectedFrameId === variant.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {variant.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {variant.priceAdjustment !== 0 && (
                      <div className={`text-xs font-medium ${selectedFrameId === variant.id ? 'text-white' : 'text-gray-900'}`}>
                        {variant.priceAdjustment > 0 ? '+' : ''}
                        R{variant.priceAdjustment.toFixed(2)}
                      </div>
                    )}
                    {variant.processingDays > 0 && (
                      <div className={`text-[10px] mt-0.5 ${selectedFrameId === variant.id ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{variant.processingDays} days
                      </div>
                    )}
                  </div>
                </div>
                {!variant.inStock && (
                  <div className="text-[10px] mt-1 uppercase tracking-wide text-red-500 font-medium">
                    Out of Stock
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Options */}
      {canvasVariants.length > 0 && (
        <div>
          <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 mb-3">
            Canvas Type
          </label>
          <div className="space-y-2">
            {canvasVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedCanvasId(variant.id)}
                disabled={!variant.inStock}
                className={`
                  w-full p-3 text-left border rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
                  ${selectedCanvasId === variant.id 
                    ? 'border-black bg-black text-white ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200 hover:border-black bg-white text-gray-900'
                  }
                  ${!variant.inStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
                aria-label={`${variant.name} canvas option, ${variant.priceAdjustment > 0 ? 'adds' : variant.priceAdjustment < 0 ? 'reduces' : 'no change to'} price${variant.processingDays > 0 ? `, adds ${variant.processingDays} days processing time` : ''}`}
                aria-pressed={selectedCanvasId === variant.id}
                aria-disabled={!variant.inStock}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide">
                      {variant.name}
                    </div>
                    {variant.description && (
                      <div className={`text-[11px] mt-0.5 ${selectedCanvasId === variant.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {variant.description}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {variant.priceAdjustment !== 0 && (
                      <div className={`text-xs font-medium ${selectedCanvasId === variant.id ? 'text-white' : 'text-gray-900'}`}>
                        {variant.priceAdjustment > 0 ? '+' : ''}
                        R{variant.priceAdjustment.toFixed(2)}
                      </div>
                    )}
                    {variant.processingDays > 0 && (
                      <div className={`text-[10px] mt-0.5 ${selectedCanvasId === variant.id ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{variant.processingDays} days
                      </div>
                    )}
                  </div>
                </div>
                {!variant.inStock && (
                  <div className="text-[10px] mt-1 uppercase tracking-wide text-red-500 font-medium">
                    Out of Stock
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Summary */}
      {priceAdjustment !== 0 && (
        <div className="pt-4 border-t border-gray-200 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="uppercase tracking-wide text-gray-700">Base Price</span>
            <span className="font-medium">R{basePrice.toFixed(2)}</span>
          </div>
          {selectedFrame && selectedFrame.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm mt-2 text-blue-900">
              <span>{selectedFrame.name}</span>
              <span className="font-medium">
                {selectedFrame.priceAdjustment > 0 ? '+' : ''}
                R{selectedFrame.priceAdjustment.toFixed(2)}
              </span>
            </div>
          )}
          {selectedCanvas && selectedCanvas.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm mt-2 text-blue-900">
              <span>{selectedCanvas.name}</span>
              <span className="font-medium">
                {selectedCanvas.priceAdjustment > 0 ? '+' : ''}
                R{selectedCanvas.priceAdjustment.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t border-blue-200 text-base">
            <span className="uppercase tracking-wide">Total Price</span>
            <span className="text-lg">R{(basePrice + priceAdjustment).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Processing Time Notice */}
      {totalProcessingDays > 0 && (
        <div className="text-sm text-blue-900 bg-blue-50 border border-blue-100 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium uppercase tracking-wide text-xs mb-1">Additional Processing Time</p>
              <p className="text-blue-800">Selected options add {totalProcessingDays} business day{totalProcessingDays !== 1 ? 's' : ''} to fulfillment.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
