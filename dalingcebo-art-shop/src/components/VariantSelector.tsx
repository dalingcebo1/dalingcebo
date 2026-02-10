'use client'

import { useState, useEffect } from 'react'
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

    onVariantChange?.({
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
    onVariantChange,
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
                  w-full p-3 text-left border rounded-lg transition-all duration-200
                  ${selectedFrameId === variant.id 
                    ? 'border-black bg-black text-white ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200 hover:border-black bg-white text-gray-900'
                  }
                  ${!variant.inStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
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
                      <div className="text-xs font-medium">
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
                  <div className="text-[10px] mt-1 uppercase tracking-wide text-red-500">
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
                  w-full p-3 text-left border rounded-lg transition-all duration-200
                  ${selectedCanvasId === variant.id 
                    ? 'border-black bg-black text-white ring-1 ring-black ring-offset-1' 
                    : 'border-gray-200 hover:border-black bg-white text-gray-900'
                  }
                  ${!variant.inStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                `}
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
                      <div className="text-xs font-medium">
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
                  <div className="text-[10px] mt-1 uppercase tracking-wide text-red-500">
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
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="uppercase tracking-wide">Base Price</span>
            <span>R{basePrice.toFixed(2)}</span>
          </div>
          {selectedFrame && selectedFrame.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm mt-2 opacity-75">
              <span>{selectedFrame.name}</span>
              <span>
                {selectedFrame.priceAdjustment > 0 ? '+' : ''}
                R{selectedFrame.priceAdjustment.toFixed(2)}
              </span>
            </div>
          )}
          {selectedCanvas && selectedCanvas.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm mt-2 opacity-75">
              <span>{selectedCanvas.name}</span>
              <span>
                {selectedCanvas.priceAdjustment > 0 ? '+' : ''}
                R{selectedCanvas.priceAdjustment.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-200">
            <span className="uppercase tracking-wide">Total Price</span>
            <span>R{(basePrice + priceAdjustment).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Processing Time Notice */}
      {totalProcessingDays > 0 && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3">
          <strong>Processing Time:</strong> Additional {totalProcessingDays} business day{totalProcessingDays !== 1 ? 's' : ''} for selected options.
        </div>
      )}
    </div>
  )
}
