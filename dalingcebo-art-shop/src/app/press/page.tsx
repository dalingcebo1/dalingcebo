'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageShell from '@/components/layout/PageShell'

export default function PressPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <PageShell
        title="PRESS KIT"
        subtitle="Media resources and information"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Press' }]}
        maxWidth="narrow"
      >
        <div className={`fade-in-slow`} style={{ animationDelay: '0.3s' }}>
          <div className="space-y-8">
            <div className="border-t border-gray-200 pt-8">
              <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">ABOUT THE ARTIST</h2>
              <p className="yeezy-body text-base text-gray-700 leading-relaxed">
                Dalingcebo is a contemporary artist working at the intersection of traditional and modern techniques. 
                Based in Johannesburg, South Africa, their work explores themes of cultural identity, heritage, and 
                the contemporary African experience.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">PRESS INQUIRIES</h2>
              <p className="yeezy-body text-base text-gray-700 leading-relaxed mb-4">
                For press inquiries, interviews, and media requests:
              </p>
              <p className="yeezy-body text-base text-gray-700">
                Email: <a href="mailto:press@dalingcebo.art" className="underline hover:no-underline">press@dalingcebo.art</a>
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">MEDIA RESOURCES</h2>
              <div className="space-y-3">
                <p className="yeezy-body text-base text-gray-700">
                  High-resolution images and additional press materials are available upon request.
                </p>
                <p className="yeezy-body text-sm text-gray-600">
                  Please contact us with your media outlet information and intended use.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="yeezy-subheading text-sm mb-4 tracking-[0.3em] text-gray-600">RECENT COVERAGE</h2>
              <p className="yeezy-body text-base text-gray-600">
                Press coverage will be updated here.
              </p>
            </div>
          </div>
        </div>
      </PageShell>

      <Footer />
    </main>
  )
}
