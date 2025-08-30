'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="yeezy-hero">
      <div className="yeezy-hero-content">
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.3s' }}>
          <h1 className="yeezy-main-logo text-black">
            DALINGCEBO
          </h1>
        </div>
        
        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '0.8s' }}>
          <p className="yeezy-body text-gray-600">
            Contemporary art that speaks to the modern soul.
            <br />
            Each piece crafted with purpose and intention.
          </p>
        </div>

        <div className={`fade-in-slow ${isVisible ? '' : ''}`} style={{ animationDelay: '1.2s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="btn-yeezy-primary">
              View Collection
            </button>
            <button className="btn-yeezy">
              Learn More
            </button>
          </div>
        </div>

        {/* Minimal scroll indicator */}
        <div 
          className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 fade-in-slow ${isVisible ? '' : ''}`}
          style={{ animationDelay: '1.6s' }}
        >
          <div className="w-px h-16 bg-gray-400 opacity-40"></div>
        </div>
      </div>
    </section>
  )
}
