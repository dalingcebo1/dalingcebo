'use client'

import { useState, useEffect } from 'react'

interface ArtGalleryProps {
  zoomLevel: number
}

const artworks = [
  {
    id: 1,
    title: "Urban Silence",
    price: "850",
    category: "painting",
    size: "24×36",
    year: "2024"
  },
  {
    id: 2,
    title: "Cultural Echo",
    price: "1200",
    category: "mixed-media",
    size: "30×40",
    year: "2024"
  },
  {
    id: 3,
    title: "Modern Heritage",
    price: "950",
    category: "painting",
    size: "18×24",
    year: "2023"
  },
  {
    id: 4,
    title: "Abstract Form",
    price: "750",
    category: "abstract",
    size: "20×30",
    year: "2024"
  },
  {
    id: 5,
    title: "Digital Nature",
    price: "650",
    category: "digital",
    size: "16×20",
    year: "2024"
  },
  {
    id: 6,
    title: "Minimal Space",
    price: "1100",
    category: "minimalist",
    size: "36×48",
    year: "2023"
  },
  {
    id: 7,
    title: "City Dreams",
    price: "900",
    category: "painting",
    size: "24×32",
    year: "2024"
  },
  {
    id: 8,
    title: "Texture Study",
    price: "800",
    category: "mixed-media",
    size: "22×28",
    year: "2023"
  }
]

export default function ArtGallery() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="yeezy-section">
      <div className="yeezy-container">
        {/* Gallery Grid */}
        <div className={`yeezy-grid fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
          {artworks.map((artwork) => (
            <div key={artwork.id} className="yeezy-grid-item yeezy-transition group">
              {/* Placeholder for artwork image */}
              <div className="yeezy-image bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="text-xs yeezy-title mb-2">
                    {artwork.title}
                  </div>
                  <div className="text-2xl font-thin">
                    {artwork.id.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Overlay with artwork details */}
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
                        ${artwork.price}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className={`text-center mt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
          <button className="btn-yeezy">
            View More
          </button>
        </div>
      </div>
    </section>
  )
}
