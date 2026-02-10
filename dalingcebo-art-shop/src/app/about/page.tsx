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
                <div className="mb-4">
                  <h3 className="yeezy-title text-xl mb-2">Dalingcebo (Dali) Ngubane</h3>
                  <p className="yeezy-body text-gray-600">Born 1997, Kwa-Ngwanase, South Africa</p>
                  <p className="yeezy-body text-gray-600">Based in Johannesburg, South Africa</p>
                </div>
                <p className="yeezy-body text-lg leading-relaxed">
                  Dalingcebo Ngubane is a self-taught visual artist whose work interrogates emotion 
                  in relation to contemporary life. His practice draws heavily from the people he meets, 
                  their lived experiences, and the stories they share.
                </p>
                <p className="yeezy-body text-lg leading-relaxed">
                  Ngubane works primarily in oil on canvas, using dramatic palettes and bold linework 
                  to explore the complexity of the human journey. His figures often have undetailed or 
                  obscured faces, making them universal representational figures rather than specific individuals.
                </p>
                <p className="yeezy-body text-lg leading-relaxed">
                  In his own words, his artistic approach reflects the tension between motion and stillness 
                  in life—capturing both through figurative painting that allows for freedom, accident, and chance.
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
              Ngubane's work captures the tension between motion and stillness in life. His figurative 
              paintings allow for freedom, accident, and chance—reflecting the spontaneity of human 
              experience while maintaining a strong compositional structure. Working primarily in oil on 
              canvas, he employs dramatic palettes and bold linework to create emotionally charged narratives.
            </p>
            <p className="yeezy-body text-lg leading-relaxed mb-8">
              The artist deliberately obscures or simplifies facial features, transforming his subjects 
              into universal figures that represent collective rather than individual experiences. This 
              approach invites viewers to project their own stories onto the work, creating a deeply 
              personal connection with each piece.
            </p>
            <div className="grid md:grid-cols-2 gap-1 bg-gray-200">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 yeezy-body">Studio Process</p>
              </div>
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 yeezy-body">Work in Progress</p>
              </div>
            </div>
          </div>

          {/* Recognition */}
          <div className={`border-t border-gray-200 pt-16 pb-8 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
            <h2 className="yeezy-subheading text-4xl mb-8">Exhibitions & Recognition</h2>
            <div className="space-y-6 yeezy-body text-gray-600">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <p className="font-bold">CHAOS, A THEORY</p>
                  <p className="text-sm text-gray-500">Solo Exhibition presented by Candice Berman Gallery, Johannesburg</p>
                </div>
                <span className="text-sm whitespace-nowrap ml-4">April 20 – May 10, 2024</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <p className="font-bold">Gallery Representation</p>
                  <p className="text-sm text-gray-500">Candice Berman Gallery, Johannesburg</p>
                </div>
                <span className="text-sm whitespace-nowrap ml-4">Current</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <p className="font-bold">Artist Profile</p>
                  <p className="text-sm text-gray-500">Featured on Artsy</p>
                </div>
                <span className="text-sm whitespace-nowrap ml-4">2024</span>
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
