'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getArtworkPlaceholder } from '@/lib/media'

interface ArtworkImageGalleryProps {
  images: string[]
  title: string
  aspectRatio: number
}

export default function ArtworkImageGallery({
  images,
  title,
  aspectRatio
}: ArtworkImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const imageList = images.length > 0 ? images : [getArtworkPlaceholder()]

  return (
    <>
      <div className="space-y-4 fade-in-slow" style={{ animationDelay: '0.3s' }}>
        <button 
          onClick={() => setIsLightboxOpen(true)}
          className="relative bg-gray-50 overflow-hidden group cursor-zoom-in border border-gray-200"
          style={{ aspectRatio }}
        >
          <Image
            src={imageList[selectedImage] ?? getArtworkPlaceholder()}
            alt={title}
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
                  alt={`${title} view ${index + 1}`}
                  fill
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

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
              alt={title}
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
    </>
  )
}
