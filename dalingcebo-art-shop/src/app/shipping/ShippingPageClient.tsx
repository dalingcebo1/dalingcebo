'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Shipping() {
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
            <h1 className="yeezy-subheading text-4xl mb-8">Shipping</h1>
            
            <div className="space-y-12">
              <div>
                <h2 className="yeezy-title text-xl mb-4">Shipping Information</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  All artworks are professionally packaged to ensure safe delivery. We use premium materials and work with trusted carriers to protect your investment.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Delivery Times</h2>
                <div className="space-y-4 yeezy-body">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">South Africa</span>
                    <span>3-5 business days</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Africa</span>
                    <span>7-14 business days</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">International</span>
                    <span>10-21 business days</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Shipping Costs</h2>
                <div className="space-y-4 yeezy-body">
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">South Africa</span>
                    <span>Free for orders over R5,000</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">Africa</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-4">
                    <span className="text-gray-600">International</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">Insurance & Tracking</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed mb-4">
                  All shipments are fully insured and include tracking. You will receive a tracking number once your order ships.
                </p>
                <ul className="yeezy-body text-gray-600 space-y-2">
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
