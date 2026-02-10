'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function About() {
  const [zoomLevel, setZoomLevel] = useState(0)

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      {/* Hero Section */}
      <section className="yeezy-hero" style={{ height: '40vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
              ABOUT
            </h1>
          </div>
          <div className="fade-in-slow" style={{ animationDelay: '0.6s' }}>
            <p className="yeezy-body text-gray-600">
              The story behind the art.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="yeezy-section">
        <div className="yeezy-container max-w-3xl">
          <div className="space-y-12">
            <div className="fade-in-slow" style={{ animationDelay: '0.8s' }}>
              <h2 className="yeezy-heading text-2xl mb-6">THE ARTIST</h2>
              <p className="yeezy-body text-gray-700 leading-relaxed">
                Dalingcebo is a contemporary artist whose work explores the intersection of modern minimalism 
                and cultural expression. Each piece is crafted with meticulous attention to detail, creating 
                art that resonates with the modern soul while maintaining a timeless quality.
              </p>
            </div>

            <div className="fade-in-slow" style={{ animationDelay: '1s' }}>
              <h2 className="yeezy-heading text-2xl mb-6">THE PHILOSOPHY</h2>
              <p className="yeezy-body text-gray-700 leading-relaxed mb-4">
                Every piece tells a story. The artistic process is one of intention and purpose, where each 
                brushstroke is deliberate, and every color choice meaningful. The goal is to create works 
                that transcend mere decoration and become part of the viewer's life and space.
              </p>
              <p className="yeezy-body text-gray-700 leading-relaxed">
                Art should be accessible yet exclusive, contemporary yet timeless. This philosophy drives 
                the creation of both large statement pieces and intimate smaller works, ensuring there's 
                something for every collector and every space.
              </p>
            </div>

            <div className="fade-in-slow" style={{ animationDelay: '1.2s' }}>
              <h2 className="yeezy-heading text-2xl mb-6">THE COLLECTION</h2>
              <p className="yeezy-body text-gray-700 leading-relaxed">
                The collection spans from bold large paintings that command attention to smaller, more 
                intimate pieces perfect for personal spaces. Each artwork is available for purchase, 
                with secure payment options including Stripe and Yoco for your convenience.
              </p>
            </div>

            <div className="fade-in-slow" style={{ animationDelay: '1.4s' }}>
              <h2 className="yeezy-heading text-2xl mb-6">GET IN TOUCH</h2>
              <p className="yeezy-body text-gray-700 leading-relaxed mb-6">
                For commissions, inquiries, or just to connect, reach out through the contact information below.
              </p>
              <div className="space-y-2">
                <p className="yeezy-body text-gray-700">
                  <span className="font-medium">Email:</span> info@dalingcebo.com
                </p>
                <p className="yeezy-body text-gray-700">
                  <span className="font-medium">Instagram:</span> @dalingcebo_art
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
