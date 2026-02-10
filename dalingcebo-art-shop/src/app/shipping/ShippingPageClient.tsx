'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export default function Shipping() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="border-b border-gray-200 bg-white">
        <div className="yeezy-container py-4">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shipping' }]} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <h1 className="yeezy-main-logo text-white mb-8">
            SHIPPING
          </h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            Professional packaging and worldwide delivery for your artwork.
          </p>
        </div>
      </section>
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <div className="space-y-12">
              <div>
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">SHIPPING INFORMATION</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                  All artworks are professionally packaged to ensure safe delivery. We use premium materials and work with trusted carriers to protect your investment.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">DELIVERY TIMES</h2>
                <div className="space-y-4 yeezy-body">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">South Africa</span>
                    <span className="text-gray-700">3-5 business days</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">Africa</span>
                    <span className="text-gray-700">7-14 business days</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">International</span>
                    <span className="text-gray-700">10-21 business days</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">SHIPPING COSTS</h2>
                <div className="space-y-4 yeezy-body">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">South Africa</span>
                    <span className="text-gray-700">Free for orders over R5,000</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">Africa</span>
                    <span className="text-gray-700">Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-700">International</span>
                    <span className="text-gray-700">Calculated at checkout</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">INSURANCE & TRACKING</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed mb-4">
                  All shipments are fully insured and include tracking. You will receive a tracking number once your order ships.
                </p>
                <ul className="yeezy-body text-base text-gray-700 space-y-2">
                  <li>✓ Full insurance coverage</li>
                  <li>✓ Real-time tracking</li>
                  <li>✓ Signature required on delivery</li>
                  <li>✓ Professional packaging</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
