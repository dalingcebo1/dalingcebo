'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageShell from '@/components/layout/PageShell'

export default function About() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header showBackButton={false} />
      
      <PageShell
        title="ABOUT"
        subtitle="Contemporary art that bridges cultures and speaks to the modern soul."
        maxWidth="wide"
      >
          <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
            <h2 className="h2 mb-16 tracking-[0.15em] uppercase">THE ARTIST</h2>
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start mb-24">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-sm border border-gray-200 overflow-hidden max-w-[180px] mx-auto md:mx-0">
                <svg className="w-16 h-16 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>\n                  <circle cx="12" cy="10" r="3"/>\n                  <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>\n                </svg>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="h2 font-light mb-4">Dalingcebo (Dali) Ngubane</h3>
                  <div className="space-y-1 meta tracking-wider uppercase text-gray-500">
                    <p>Born 1997, Kwa-Ngwanase, South Africa</p>
                    <p>Based in Johannesburg, South Africa</p>
                  </div>
                </div>
                <div className="space-y-6 body text-gray-700">
                  <p>
                    Dalingcebo Ngubane is a self-taught visual artist whose work interrogates emotion 
                    in relation to contemporary life. His practice draws heavily from the people he meets, 
                    their lived experiences, and the stories they share.
                  </p>
                  <p>
                    Ngubane works primarily in oil on canvas, using dramatic palettes and bold linework 
                    to explore the complexity of the human journey. His figures often have undetailed or 
                    obscured faces, making them universal representational figures rather than specific individuals.
                  </p>
                  <p>
                    In his own words, his artistic approach reflects the tension between motion and stillness 
                    in life—capturing both through figurative painting that allows for freedom, accident, and chance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className={`border-t border-gray-200 pt-24 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.6s' }}>
            <h2 className="h2 mb-16 tracking-[0.15em] uppercase">PHILOSOPHY</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-16 mb-24">
              <div className="space-y-4">
                <h3 className="meta uppercase font-medium">INTENTION</h3>
                <p className="body text-gray-600">
                  Every brushstroke carries purpose. Each work is created with deep intention, 
                  reflecting a moment of clarity and cultural expression.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="meta uppercase font-medium">HERITAGE</h3>
                <p className="body text-gray-600">
                  Rooted in African traditions while embracing contemporary techniques, 
                  creating a unique visual language that transcends borders.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="meta uppercase font-medium">SIMPLICITY</h3>
                <p className="body text-gray-600">
                  Less is more. Through minimalist compositions, complex emotions and 
                  narratives emerge with powerful clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className={`border-t border-gray-200 pt-24 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.9s' }}>
            <h2 className="h2 mb-16 tracking-[0.15em] uppercase">PROCESS</h2>
            <div className="space-y-6 mb-12 body text-gray-700 max-w-4xl">
              <p>
                Ngubane's work captures the tension between motion and stillness in life. His figurative 
                paintings allow for freedom, accident, and chance—reflecting the spontaneity of human 
                experience while maintaining a strong compositional structure. Working primarily in oil on 
                canvas, he employs dramatic palettes and bold linework to create emotionally charged narratives.
              </p>
              <p>
                The artist deliberately obscures or simplifies facial features, transforming his subjects 
                into universal figures that represent collective rather than individual experiences. This 
                approach invites viewers to project their own stories onto the work, creating a deeply 
                personal connection with each piece.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-12">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-sm border border-gray-200 max-w-xs mx-auto md:mx-0">
                <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>\n                </svg>
              </div>
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-sm border border-gray-200 max-w-xs mx-auto md:mx-0">
                <svg className="w-12 h-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>\n                  <path d="M9 3v18M3 9h18M3 15h18M15 3v18"/>\n                </svg>
              </div>
            </div>
          </div>

          {/* Recognition */}
          <div className={`border-t border-gray-200 pt-24 pb-12 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
            <h2 className="h2 mb-16 tracking-[0.15em] uppercase">EXHIBITIONS & RECOGNITION</h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-200 pb-6 gap-3">
                <div className="flex-1">
                  <h3 className="body font-medium text-black uppercase mb-2">CHAOS, A THEORY</h3>
                  <p className="body text-gray-500">Solo Exhibition presented by Candice Berman Gallery, Johannesburg</p>
                </div>
                <span className="meta text-gray-400 tracking-wider md:whitespace-nowrap">APRIL 20 – MAY 10, 2024</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-200 pb-6 gap-3">
                <div className="flex-1">
                  <h3 className="body font-medium text-black uppercase mb-2">GALLERY REPRESENTATION</h3>
                  <p className="body text-gray-500">Candice Berman Gallery, Johannesburg</p>
                </div>
                <span className="meta text-gray-400 tracking-wider md:whitespace-nowrap">CURRENT</span>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-200 pb-6 gap-3">
                <div className="flex-1">
                  <h3 className="body font-medium text-black uppercase mb-2">ARTIST PROFILE</h3>
                  <p className="body text-gray-500">Featured on Artsy</p>
                </div>
                <span className="meta text-gray-400 tracking-wider md:whitespace-nowrap">2024</span>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className={`text-center mt-24 mb-12 fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.5s' }}>
            <h3 className="h2 mb-8 tracking-[0.15em] uppercase">INTERESTED IN COMMISSIONING?</h3>
            <p className="body text-gray-600 mb-10 max-w-2xl mx-auto">
              Custom pieces available for collectors and institutions.
            </p>
            <Link href="/contact" className="btn-yeezy-primary inline-block">
              Get in Touch
            </Link>
          </div>
      </PageShell>

      <Footer />
    </main>
  )
}
