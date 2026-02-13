'use client'

import { Suspense, useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ArtGallery from '@/components/ArtGallery'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Breadcrumb from '@/components/Breadcrumb'

export default function Shop() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const mobileNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Catalogs', href: '/catalogs' },
    { label: 'Cart', href: '/cart' },
    { label: 'Account', href: '/account' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop' }]} />
        </div>
      </section>
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
