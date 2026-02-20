'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageShell from '@/components/layout/PageShell'

export default function Care() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <PageShell
        title="ARTWORK CARE"
        subtitle="Preserve your investment for generations to come."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Care' }]}
        maxWidth="narrow"
      >
        <div className={`fade-in-slow`} style={{ animationDelay: '0.3s' }}>
          <div className="space-y-12">
              <div>
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">GENERAL GUIDELINES</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed mb-4">
                  Proper care will ensure your artwork remains in pristine condition for generations. Follow these guidelines to protect your investment.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">HANDLING</h2>
                <ul className="yeezy-body text-base text-gray-700 space-y-3">
                  <li>• Always handle artwork with clean, dry hands</li>
                  <li>• Hold by the edges or frame, never touch the painted surface</li>
                  <li>• Wear cotton gloves when handling unframed works</li>
                  <li>• Never place objects on top of artwork</li>
                  <li>• Avoid folding, rolling, or bending works on paper</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">DISPLAY</h2>
                <ul className="yeezy-body text-base text-gray-700 space-y-3">
                  <li>• Avoid direct sunlight to prevent fading</li>
                  <li>• Keep away from heat sources and radiators</li>
                  <li>• Maintain stable temperature (18-24°C / 65-75°F)</li>
                  <li>• Keep humidity levels between 40-60%</li>
                  <li>• Use UV-protective glass when framing</li>
                  <li>• Ensure proper wall mounting with appropriate hardware</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">CLEANING</h2>
                <div className="space-y-4 yeezy-body text-base text-gray-700">
                  <p><strong>Canvas Works:</strong> Gently dust with a soft, clean brush. Never use water or cleaning products.</p>
                  <p><strong>Works on Paper:</strong> Keep in protective sleeves. Only dust the frame or glass, never the artwork itself.</p>
                  <p><strong>Frames & Glass:</strong> Clean glass with a soft cloth and glass cleaner (spray cloth, not glass directly).</p>
                  <p><strong>Never:</strong> Use water, solvents, or cleaning products directly on artwork.</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">STORAGE</h2>
                <ul className="yeezy-body text-base text-gray-700 space-y-3">
                  <li>• Store in a cool, dry place away from dampness</li>
                  <li>• Use acid-free materials for wrapping and storage</li>
                  <li>• Store flat, never lean artwork at an angle</li>
                  <li>• Use spacers between stacked works</li>
                  <li>• Avoid attics, basements, and garages</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">PROFESSIONAL CONSERVATION</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                  For significant damage or conservation needs, always consult a professional art conservator. Never attempt repairs yourself. Contact us for conservator recommendations.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">INSURANCE</h2>
                <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                  We recommend insuring valuable artworks. Keep your certificate of authenticity and purchase receipt in a safe place for insurance purposes.
                </p>
              </div>
            </div>
          </div>
        </PageShell>

      <Footer />
    </main>
  )
}
