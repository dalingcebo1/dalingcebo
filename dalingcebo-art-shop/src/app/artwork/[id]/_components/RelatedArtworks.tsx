'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Artwork } from '@/types/artwork'
import { useArtworks } from '@/hooks/useArtworks'
import { getArtworkAspectRatio, getArtworkPrimaryImage } from '@/lib/media'

interface RelatedArtworksProps {
  currentArtwork: Artwork
}

export default function RelatedArtworks({ currentArtwork }: RelatedArtworksProps) {
  const router = useRouter()
  const { artworks: catalogue } = useArtworks()

  const relatedArtworks = useMemo(() => {
    return catalogue
      .filter(item => item.id !== currentArtwork.id && item.category === currentArtwork.category)
      .slice(0, 4)
  }, [catalogue, currentArtwork])

  if (relatedArtworks.length === 0) {
    return null
  }

  return (
    <div className="border-t border-gray-200 mt-20 pt-16">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-2">More Works</p>
        <h2 className="yeezy-heading text-3xl md:text-4xl">You May Also Like</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {relatedArtworks.map((related) => (
          <div
            key={related.id}
            onClick={() => router.push(`/artwork/${related.id}`)}
            className="yeezy-grid-item yeezy-transition group cursor-pointer bg-white"
          >
            <div
              className="yeezy-image bg-gray-50 flex items-center justify-center relative overflow-hidden"
              style={{ aspectRatio: getArtworkAspectRatio(related.size) }}
            >
              <Image
                src={getArtworkPrimaryImage(related)}
                alt={related.title}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <div className="yeezy-overlay">
              <div className="w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="yeezy-title text-black mb-1">
                      {related.title}
                    </h3>
                    <p className="text-xs text-gray-700 yeezy-body">
                      {related.size} • {related.year}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="yeezy-price text-black">
                      ${related.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
