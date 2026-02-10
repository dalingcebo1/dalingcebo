'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Privacy() {
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
            <h1 className="yeezy-subheading text-4xl mb-8">Privacy Policy</h1>
            <p className="yeezy-body text-sm text-gray-500 mb-12">Last updated: February 2025</p>
            
            <div className="space-y-12 yeezy-body text-gray-600 leading-relaxed">
              <div>
                <h2 className="yeezy-title text-xl text-black mb-4">Introduction</h2>
                <p>
                  Dalingcebo (referred to as we, our, or us) respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Information We Collect</h2>
                <p className="mb-4">We collect information that you provide directly to us, including:</p>
                <ul className="space-y-2">
                  <li>• Name and contact information (email, phone, address)</li>
                  <li>• Payment information (processed securely through third-party providers)</li>
                  <li>• Purchase history and preferences</li>
                  <li>• Communication preferences</li>
                  <li>• Any information you provide when contacting us</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">How We Use Your Information</h2>
                <p className="mb-4">We use the collected information to:</p>
                <ul className="space-y-2">
                  <li>• Process and fulfill your orders</li>
                  <li>• Communicate with you about your purchases</li>
                  <li>• Send you updates about new artworks and exhibitions (with your consent)</li>
                  <li>• Improve our website and services</li>
                  <li>• Prevent fraud and maintain security</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Information Sharing</h2>
                <p>
                  We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and business (e.g., payment processors, shipping companies), but only to the extent necessary and under strict confidentiality agreements.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="space-y-2">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate data</li>
                  <li>• Request deletion of your data</li>
                  <li>• Object to processing of your data</li>
                  <li>• Withdraw consent for marketing communications</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Cookies</h2>
                <p>
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl text-black mb-4">Contact</h2>
                <p>
                  For questions about this privacy policy or to exercise your rights, contact us at privacy@dalingcebo.art.
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
