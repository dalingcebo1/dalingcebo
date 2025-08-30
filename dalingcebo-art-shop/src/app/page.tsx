'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ArtGallery from '@/components/ArtGallery'
import Footer from '@/components/Footer'

export default function Home() {
  const [zoomLevel, setZoomLevel] = useState(0) // 0, 1, 2 for zoom states

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <Hero />
      <ArtGallery zoomLevel={zoomLevel} />
      <Footer />
    </main>
  )
}
