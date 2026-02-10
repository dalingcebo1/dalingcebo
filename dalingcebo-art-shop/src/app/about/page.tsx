'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function About() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      {/* Hero Section */}
      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <h1 className="yeezy-main-logo text-white mb-8">
            ABOUT
          </h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            Contemporary art that bridges cultures and speaks to the modern soul.
          </p>
        </div>
      </section>

      {/* Artist Statement */}
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <h2 className="yeezy-subheading text-4xl mb-8">The Artist</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 yeezy-body">Artist Portrait</p>
              </div>
              <div className="space-y-6">
                <p className="yeezy-body text-lg leading-relaxed">
                  Dalingcebo is a contemporary artist whose work explores the intersection of 
                  traditional African aesthetics and modern minimalism. Each piece is a dialogue 
                  between past and present, culture and innovation.
                </p>
                <p className="yeezy-body text-lg leading-relaxed">
                  Based in South Africa, Dalingcebo&rsquo;s work has been exhibited internationally, 
                  gaining recognition for its bold use of color, texture, and symbolic imagery 
                  that challenges conventional narratives.
                </p>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className={`border-t border-gray-200 pt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.6s' }}>
            <h2 className="yeezy-subheading text-4xl mb-8">Philosophy</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div>
                <h3 className="yeezy-title text-xl mb-4">INTENTION</h3>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  Every brushstroke carries purpose. Each work is created with deep intention, 
                  reflecting a moment of clarity and cultural expression.
                </p>
              </div>
              <div>
                <h3 className="yeezy-title text-xl mb-4">HERITAGE</h3>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  Rooted in African traditions while embracing contemporary techniques, 
                  creating a unique visual language that transcends borders.
                </p>
              </div>
              <div>
                <h3 className="yeezy-title text-xl mb-4">SIMPLICITY</h3>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  Less is more. Through minimalist compositions, complex emotions and 
                  narratives emerge with powerful clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className={`border-t border-gray-200 pt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
            <h2 className="yeezy-subheading text-4xl mb-8">Process</h2>
            <p className="yeezy-body text-lg leading-relaxed mb-8">
              Each artwork begins with meditation and reflection. The creative process is 
              intuitive yet disciplined, balancing spontaneity with technical precision. 
              Using mixed media, acrylics, and digital elements, the work evolves organically, 
              revealing its final form through layers of meaning and texture.
            </p>
            <div className="grid md:grid-cols-2 gap-1 bg-gray-200">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 yeezy-body">Studio Process 1</p>
              </div>
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 yeezy-body">Studio Process 2</p>
              </div>
            </div>
          </div>

          {/* Recognition */}
          <div className={`border-t border-gray-200 pt-16 pb-8 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
            <h2 className="yeezy-subheading text-4xl mb-8">Recognition</h2>
            <div className="space-y-6 yeezy-body text-gray-600">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span>Featured in Contemporary African Art Magazine</span>
                <span className="text-sm">2024</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span>Solo Exhibition - Johannesburg Art Fair</span>
                <span className="text-sm">2023</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span>Emerging Artist Award</span>
                <span className="text-sm">2023</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span>Group Exhibition - Cape Town International</span>
                <span className="text-sm">2022</span>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className={`text-center mt-16 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.5s' }}>
            <h3 className="yeezy-subheading text-2xl mb-4">Interested in Commissioning?</h3>
            <p className="yeezy-body text-gray-600 mb-8">
              Custom pieces available for collectors and institutions.
            </p>
            <Link href="/contact" className="btn-yeezy-primary inline-block">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
