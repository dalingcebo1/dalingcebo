'use client'

import { Suspense, useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ArtGallery from '@/components/ArtGallery'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Shop() {
  const [zoomLevel, setZoomLevel] = useState(0)

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <Hero />
      <Suspense
        fallback={(
          <section className="yeezy-section" id="collection">
            <div className="yeezy-container flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          </section>
        )}
      >
        <ArtGallery zoomLevel={zoomLevel} />
      </Suspense>
      <Footer />
    </main>
  )
}
