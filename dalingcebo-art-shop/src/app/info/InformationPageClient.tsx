'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const highlightCards = [
  {
    title: 'STUDIO VISITS',
    body: 'Private appointments are available weekly in Johannesburg. Expect a guided walkthrough of current works, sketches, and works-in-progress tailored to collectors and curators.',
    cta: { label: 'Schedule a Visit', href: '/contact' },
  },
  {
    title: 'COMMISSIONED WORK',
    body: 'Collaborate directly with Dalingcebo on bespoke pieces. We explore scale, palette, and story to craft art that reflects your space and collection goals.',
    cta: { label: 'Start a Commission', href: '/contact' },
  },
  {
    title: 'COLLECTOR SERVICES',
    body: 'We assist with framing, installation guidance, art shipping, and provenance documentation so every acquisition feels effortless.',
    cta: { label: 'Learn About Services', href: '/shipping' },
  },
]

const quickLinks = [
  { label: 'Shipping & Delivery', href: '/shipping' },
  { label: 'Returns & Care', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Press Kit', href: '/press' },
]

export default function InformationPage() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

      <section className="yeezy-hero bg-black text-white">
        <div className={`yeezy-hero-content fade-in-slow ${isVisible ? '' : ''}`}>
          <p className="text-xs tracking-[0.4em] text-gray-400 mb-6">INFORMATION</p>
          <h1 className="yeezy-main-logo text-white mb-6">COLLECTOR SERVICES</h1>
          <p className="yeezy-body text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about acquisitions, studio visits, commissions, and caring for your artworks.
          </p>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container grid gap-8 md:grid-cols-3">
          {highlightCards.map((card) => (
            <div key={card.title} className="border border-gray-200 p-6 flex flex-col gap-4 bg-white">
              <p className="text-xs tracking-[0.4em] text-gray-500">{card.title}</p>
              <p className="yeezy-body text-gray-700 leading-relaxed flex-1">{card.body}</p>
              <Link href={card.cta.href} className="yeezy-nav-link text-black">
                {card.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="yeezy-section bg-gray-100">
        <div className="yeezy-container grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">PROCESS</p>
            <h2 className="yeezy-subheading text-4xl mb-6">How we collaborate</h2>
            <div className="space-y-4 text-gray-700 yeezy-body">
              <p>1. Share your intent—whether it is for a residential space, hospitality project, or institutional collection.</p>
              <p>2. Receive a tailored dossier including sketches, palette studies, and timelines.</p>
              <p>3. Approve the direction, then follow progress updates straight from the studio until delivery.</p>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">QUICK LINKS</p>
            <div className="grid gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="p-4 border border-gray-200 bg-white hover:border-black transition-colors"
                >
                  <span className="yeezy-title text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl text-center">
          <p className="text-xs tracking-[0.4em] text-gray-500 mb-4">STAY CONNECTED</p>
          <h2 className="yeezy-subheading text-3xl mb-6">Need something specific?</h2>
          <p className="yeezy-body text-gray-600 mb-8">
            Reach out for tailored proposals, catalogues, or viewing appointments. We respond to all inquiries within 48 hours.
          </p>
          <Link href="/contact" className="btn-yeezy-primary inline-block">Contact Studio</Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
