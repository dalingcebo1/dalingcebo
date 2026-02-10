'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Press() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`}>
            <h1 className="yeezy-subheading text-4xl mb-8">Press</h1>
            
            <div className="space-y-12">
              <div>
                <h2 className="yeezy-title text-xl mb-4">Press Kit</h2>
                <p className="yeezy-body text-gray-600 mb-6">
                  Download our complete press kit including high-resolution images, artist biography, and facts.
                </p>
                <button className="btn-yeezy-primary">Download Press Kit</button>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-8">Recent Coverage</h2>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <p className="yeezy-body text-sm text-gray-500 mb-2">Contemporary African Art Magazine • 2024</p>
                    <h3 className="yeezy-title text-lg mb-2">Rising Stars: Dalingcebo and the Minimalist Approach</h3>
                    <p className="yeezy-body text-gray-600">Featured interview discussing the intersection of traditional African motifs and contemporary minimalism.</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <p className="yeezy-body text-sm text-gray-500 mb-2">Art Weekly • 2023</p>
                    <h3 className="yeezy-title text-lg mb-2">Johannesburg Art Fair Highlights</h3>
                    <p className="yeezy-body text-gray-600">Solo exhibition review praising the emotional depth and technical precision.</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-6">
                    <p className="yeezy-body text-sm text-gray-500 mb-2">Modern Art Today • 2023</p>
                    <h3 className="yeezy-title text-lg mb-2">Emerging Artists to Watch</h3>
                    <p className="yeezy-body text-gray-600">Named among the top 10 emerging contemporary artists from Africa.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">Press Inquiries</h2>
                <p className="yeezy-body text-gray-600 mb-4">
                  For interviews, features, or press-related questions, please contact:
                </p>
                <p className="yeezy-body">press@dalingcebo.art</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
