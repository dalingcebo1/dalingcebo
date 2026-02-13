'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Terms() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          <div className={`fade-in-slow ${isVisible ? '' : ''}`}>
            <h1 className="yeezy-subheading text-4xl mb-8">Terms & Conditions</h1>
            <p className="yeezy-body text-sm text-gray-500 mb-12">Last updated: February 2025</p>
            
            <div className="space-y-12 yeezy-body text-gray-600 leading-relaxed">
              <div>
                <h2 className="yeezy-title text-xl text-black mb-4">Agreement to Terms</h2>
                <p>
                  By accessing and using this website, you accept and agree to be bound by these terms and conditions. If you do not agree to these terms, please do not use this website.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Intellectual Property</h2>
                <p>
                  All artwork, images, text, and content on this website are the intellectual property of Dalingcebo and are protected by copyright laws. Unauthorized reproduction, distribution, or use of any content is strictly prohibited.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Purchases</h2>
                <p className="mb-4">When you purchase artwork from us:</p>
                <ul className="space-y-2">
                  <li>• All sales are final unless otherwise stated in our returns policy</li>
                  <li>• Prices are subject to change without notice</li>
                  <li>• We reserve the right to refuse or cancel any order</li>
                  <li>• Ownership transfers only upon full payment</li>
                  <li>• Copyright and reproduction rights remain with the artist unless explicitly transferred</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Authenticity</h2>
                <p>
                  All original artworks come with a certificate of authenticity signed by the artist. This certificate must accompany the artwork in any future sale or transfer.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Reproduction Rights</h2>
                <p>
                  Unless explicitly granted in writing, buyers do not receive reproduction rights to purchased artworks. You may not reproduce, photograph for commercial purposes, or create derivative works without written permission.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Shipping & Delivery</h2>
                <p>
                  Estimated delivery times are approximate. We are not responsible for delays caused by shipping carriers or customs. Risk of loss passes to the buyer upon delivery.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Returns</h2>
                <p>
                  Returns are accepted within 14 days of delivery under the conditions outlined in our returns policy. Custom commissions are non-refundable.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, Dalingcebo shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of this website or purchase of artworks.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Governing Law</h2>
                <p>
                  These terms are governed by the laws of South Africa. Any disputes shall be resolved in the courts of South Africa.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Continued use of the website constitutes acceptance of modified terms.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Contact</h2>
                <p>
                  For questions about these terms, contact us at legal@dalingcebo.art.
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
