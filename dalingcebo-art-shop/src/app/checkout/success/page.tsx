'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'

function SuccessContent() {
  const { clearCart } = useCart()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Clear the cart after successful payment
    clearCart()
  }, [clearCart])

  return (
    <>
      <section className="yeezy-hero" style={{ height: '30vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
              SUCCESS
            </h1>
          </div>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container max-w-3xl text-center">
          <div className="space-y-8">
            <div className="fade-in-slow" style={{ animationDelay: '0.6s' }}>
              <svg 
                className="mx-auto mb-8" 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
              >
                <circle cx="12" cy="12" r="10" stroke="black" />
                <path d="M8 12l2 2 4-4" stroke="black" strokeWidth="2" />
              </svg>
              
              <h2 className="yeezy-heading text-3xl mb-6">
                ORDER CONFIRMED
              </h2>
              
              <p className="yeezy-body text-gray-700 leading-relaxed mb-8">
                Thank you for your purchase! Your order has been successfully placed.
                {sessionId && (
                  <>
                    <br />
                    <span className="text-sm text-gray-600">
                      Order ID: {sessionId.substring(0, 20)}...
                    </span>
                  </>
                )}
              </p>
              
              <p className="yeezy-body text-gray-700 leading-relaxed mb-12">
                You will receive a confirmation email with your order details and tracking 
                information once your artwork ships. If you have any questions, please 
                don&apos;t hesitate to contact us at info@dalingcebo.com.
              </p>
            </div>

            <div className="fade-in-slow flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.9s' }}>
              <Link href="/" className="btn-yeezy-primary">
                Continue Shopping
              </Link>
              <Link href="/about" className="btn-yeezy">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default function CheckoutSuccess() {
  const [zoomLevel, setZoomLevel] = useState(0)

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <Suspense fallback={
        <section className="yeezy-section">
          <div className="yeezy-container max-w-3xl text-center py-20">
            <p className="yeezy-body text-gray-600">Loading...</p>
          </div>
        </section>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </main>
  )
}
