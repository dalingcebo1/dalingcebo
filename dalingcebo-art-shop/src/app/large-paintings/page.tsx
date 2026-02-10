'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import ArtGallery from '@/components/ArtGallery'
import Footer from '@/components/Footer'

export default function LargePaintings() {
  const [zoomLevel, setZoomLevel] = useState(0)

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      {/* Hero Section */}
      <section className="yeezy-hero" style={{ height: '40vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
              LARGE PAINTINGS
            </h1>
          </div>
          <div className="fade-in-slow" style={{ animationDelay: '0.6s' }}>
            <p className="yeezy-body text-gray-600">
              Statement pieces that command attention.
            </p>
          </div>
        </div>
      </section>

      <ArtGallery sizeFilter="large" />
      <Footer />
    </main>
  )
}
