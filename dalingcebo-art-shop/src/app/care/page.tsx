'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Care() {
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
            <h1 className="yeezy-subheading text-4xl mb-8">Artwork Care</h1>
            
            <div className="space-y-12">
              <div>
                <h2 className="yeezy-title text-xl mb-4">General Guidelines</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed mb-4">
                  Proper care will ensure your artwork remains in pristine condition for generations. Follow these guidelines to protect your investment.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Handling</h2>
                <ul className="yeezy-body text-gray-600 space-y-3">
                  <li>• Always handle artwork with clean, dry hands</li>
                  <li>• Hold by the edges or frame, never touch the painted surface</li>
                  <li>• Wear cotton gloves when handling unframed works</li>
                  <li>• Never place objects on top of artwork</li>
                  <li>• Avoid folding, rolling, or bending works on paper</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Display</h2>
                <ul className="yeezy-body text-gray-600 space-y-3">
                  <li>• Avoid direct sunlight to prevent fading</li>
                  <li>• Keep away from heat sources and radiators</li>
                  <li>• Maintain stable temperature (18-24°C / 65-75°F)</li>
                  <li>• Keep humidity levels between 40-60%</li>
                  <li>• Use UV-protective glass when framing</li>
                  <li>• Ensure proper wall mounting with appropriate hardware</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Cleaning</h2>
                <div className="space-y-4 yeezy-body text-gray-600">
                  <p><strong>Canvas Works:</strong> Gently dust with a soft, clean brush. Never use water or cleaning products.</p>
                  <p><strong>Works on Paper:</strong> Keep in protective sleeves. Only dust the frame or glass, never the artwork itself.</p>
                  <p><strong>Frames & Glass:</strong> Clean glass with a soft cloth and glass cleaner (spray cloth, not glass directly).</p>
                  <p><strong>Never:</strong> Use water, solvents, or cleaning products directly on artwork.</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-6">Storage</h2>
                <ul className="yeezy-body text-gray-600 space-y-3">
                  <li>• Store in a cool, dry place away from dampness</li>
                  <li>• Use acid-free materials for wrapping and storage</li>
                  <li>• Store flat, never lean artwork at an angle</li>
                  <li>• Use spacers between stacked works</li>
                  <li>• Avoid attics, basements, and garages</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">Professional Conservation</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  For significant damage or conservation needs, always consult a professional art conservator. Never attempt repairs yourself. Contact us for conservator recommendations.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-12">
                <h2 className="yeezy-title text-xl mb-4">Insurance</h2>
                <p className="yeezy-body text-gray-600 leading-relaxed">
                  We recommend insuring valuable artworks. Keep your certificate of authenticity and purchase receipt in a safe place for insurance purposes.
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
