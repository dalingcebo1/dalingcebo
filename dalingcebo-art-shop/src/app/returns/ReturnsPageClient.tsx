'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Returns() {
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
            <h1 className="yeezy-subheading text-4xl mb-8">Returns</h1>
            
            <div className="space-y-12">
              <div>
                <h2 className="yeezy-title text-xl mb-4">14-Day Return Policy</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  We want you to be completely satisfied with your purchase. If for any reason you are not happy with your artwork, you may return it within 14 days of delivery for a full refund.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Return Conditions</h2>
                <ul className="yeezy-body text-gray-600 space-y-3">
                  <li>• Artwork must be in original condition</li>
                  <li>• Original packaging must be used</li>
                  <li>• Certificate of authenticity must be included</li>
                  <li>• Return shipping is the responsibility of the buyer</li>
                  <li>• Refund will be processed within 7 business days of receiving the return</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">How to Return</h2>
                <div className="space-y-4 yeezy-body text-gray-600">
                  <p>1. Contact us at returns@dalingcebo.art with your order number</p>
                  <p>2. Wait for return authorization and instructions</p>
                  <p>3. Carefully package the artwork in original materials</p>
                  <p>4. Ship using a tracked and insured service</p>
                  <p>5. Receive your refund once we confirm the return</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">Damaged or Defective Items</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  If your artwork arrives damaged or defective, please contact us immediately at hello@dalingcebo.art with photos. We will arrange for a replacement or full refund at no cost to you.
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
