'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription
    setEmail('')
  }

  return (
    <footer className="bg-black text-white border-t border-gray-900">
      <div className="yeezy-container yeezy-section">
        
        {/* Newsletter */}
        <div className="border-b border-gray-900 pb-16 mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="yeezy-subheading text-2xl mb-4">
              Stay Connected
            </h3>
            <p className="yeezy-body text-gray-400 mb-8">
              Get updates on new releases and exhibitions.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 bg-transparent border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors yeezy-body text-sm"
                required
              />
              <button 
                type="submit"
                className="btn-yeezy-primary"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links - Horizontal Layout with 1 row 6 columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <h3 className="yeezy-logo text-xl mb-4">DALINGCEBO</h3>
            <p className="yeezy-body text-gray-400 text-sm leading-relaxed">
              Contemporary art that bridges cultures and speaks to the modern soul.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="yeezy-title text-white mb-4 text-sm">Shop</h4>
            <Link 
              href="/shop" 
              className="block yeezy-nav-link hover:text-white text-sm"
            >
              All Art
            </Link>
          </div>

          {/* About */}
          <div>
            <h4 className="yeezy-title text-white mb-4 text-sm">About</h4>
            <Link 
              href="/about" 
              className="block yeezy-nav-link hover:text-white text-sm"
            >
              Our Story
            </Link>
          </div>

          {/* Contact */}
          <div>
            <h4 className="yeezy-title text-white mb-4 text-sm">Contact</h4>
            <Link 
              href="/contact" 
              className="block yeezy-nav-link hover:text-white text-sm"
            >
              Get in Touch
            </Link>
          </div>

          {/* Support */}
          <div>
            <h4 className="yeezy-title text-white mb-4 text-sm">Support</h4>
            <Link 
              href="/shipping" 
              className="block yeezy-nav-link hover:text-white text-sm"
            >
              Shipping & Returns
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="flex flex-col md:flex-row gap-6 text-gray-500 text-xs yeezy-body">
              <p>&copy; 2025 DALINGCEBO</p>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
            <div className="flex gap-6">
              {['Instagram', 'Twitter', 'Facebook'].map((social) => (
                <Link 
                  key={social}
                  href="#" 
                  className="yeezy-nav-link hover:text-white"
                >
                  {social}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
