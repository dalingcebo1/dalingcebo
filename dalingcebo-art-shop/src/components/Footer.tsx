'use client'

import { useState } from 'react'
import Link from 'next/link'

const footerSections = [
  {
    title: 'Collect',
    links: [
      { label: 'Shop All Works', href: '/shop' },
      { label: 'Catalog Library', href: '/catalogs' },
      { label: 'Large Paintings', href: '/large-paintings' },
      { label: 'Small Paintings', href: '/small-paintings' },
      { label: 'Videos', href: '/videos' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About Dalingcebo', href: '/about' },
      { label: 'Press Kit', href: '/press' },
      { label: 'Information', href: '/info' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Care',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Care Guide', href: '/care' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Track Order', href: '/orders/track' },
    ],
  },
]

const policyLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Studio Admin', href: '/admin' },
]

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="yeezy-container py-12 md:py-16 space-y-14">
        {/* Newsletter */}
        <div className="max-w-4xl mx-auto border border-gray-200 bg-black text-white px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="text-left">
            <h3 className="yeezy-subheading text-sm md:text-base mb-3 tracking-[0.3em] text-gray-300">
              STUDIO UPDATES
            </h3>
            <p className="yeezy-body text-sm md:text-base text-gray-200 max-w-md">
              Get quiet drops, exhibition notes, and new work before it reaches the main gallery.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent border border-gray-500 px-4 py-3 text-sm yeezy-body placeholder-gray-400 focus:outline-none focus:border-white transition-colors"
              required
            />
            <button type="submit" className="btn-yeezy-primary whitespace-nowrap px-6">
              Subscribe
            </button>
          </form>
        </div>

        {/* Primary nav grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-5">
            <h3 className="yeezy-main-logo text-lg tracking-[0.35em]">DALINGCEBO</h3>
            <p className="yeezy-body text-sm text-gray-700 max-w-sm leading-relaxed">
              Contemporary art that bridges cultures and speaks to the modern soul. Each piece is built slowly, with intention.
            </p>
            <div className="flex gap-4 text-gray-500">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Dalingcebo on ${link.label}`}
                  className="hover:text-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="yeezy-title text-xs mb-5 tracking-[0.3em] text-gray-600">{section.title}</h4>
              <div className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <Link key={link.label} href={link.href} className="block text-gray-700 hover:text-black yeezy-body">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 bg-gray-50 p-6 md:p-8 space-y-3">
            <p className="yeezy-title text-xs tracking-[0.3em] text-gray-600">VISIT THE STUDIO</p>
            <h3 className="text-xl yeezy-heading">Schedule a private appointment</h3>
            <p className="yeezy-body text-sm text-gray-600">
              Come view current works, review commissions, or plan placements with the studio team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-black hover:gap-3 transition-all"
            >
              Book a Studio Visit
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="border border-black bg-black text-white p-6 md:p-8 space-y-4">
            <p className="yeezy-title text-xs tracking-[0.3em] text-gray-300">COLLECTOR SUPPORT</p>
            <h3 className="text-xl">Need assistance right now?</h3>
            <p className="yeezy-body text-sm text-gray-200">
              Our studio coordinator can help with orders, framing, and international delivery within 24 hours.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="/contact" className="px-4 py-2 border border-white/40 rounded-full hover:bg-white hover:text-black transition-colors">
                Email the Studio
              </Link>
              <Link href="/inquiries" className="px-4 py-2 border border-white/40 rounded-full hover:bg-white hover:text-black transition-colors">
                Start an Inquiry
              </Link>
              <Link href="/orders/track" className="px-4 py-2 border border-white/40 rounded-full hover:bg-white hover:text-black transition-colors">
                Track an Order
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 yeezy-body">
            <p>© 2025 Dalingcebo Studio</p>
            <div className="flex flex-wrap gap-4">
              {policyLinks.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-black transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs uppercase tracking-[0.3em] yeezy-body text-gray-600 hover:text-black"
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  )
}
