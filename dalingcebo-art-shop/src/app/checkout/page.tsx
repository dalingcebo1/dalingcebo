'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'

export default function Checkout() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const { items, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'yoco'>('stripe')
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleStripeCheckout = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert('Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingInfo,
        }),
      })

      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe checkout URL
        window.location.href = url
      } else {
        alert('Payment initialization failed. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleYocoCheckout = async () => {
    if (!process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY) {
      alert('Yoco is not configured. Please add NEXT_PUBLIC_YOCO_PUBLIC_KEY to your .env.local file.')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/checkout/yoco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingInfo,
          amount: totalPrice * 100, // Convert to cents
        }),
      })

      const data = await response.json()
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        alert('Payment initialization failed. Please try again.')
      }
    } catch (error) {
      console.error('Yoco checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.address) {
      alert('Please fill in all required fields.')
      return
    }

    if (paymentMethod === 'stripe') {
      await handleStripeCheckout()
    } else {
      await handleYocoCheckout()
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
        
        <section className="yeezy-hero" style={{ height: '30vh' }}>
          <div className="yeezy-hero-content">
            <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
              <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
                CHECKOUT
              </h1>
            </div>
          </div>
        </section>

        <section className="yeezy-section">
          <div className="yeezy-container max-w-4xl text-center py-20">
            <p className="yeezy-body text-gray-600 mb-8">Your cart is empty</p>
            <Link href="/" className="btn-yeezy-primary">
              Continue Shopping
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <section className="yeezy-hero" style={{ height: '30vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
              CHECKOUT
            </h1>
          </div>
        </div>
      </section>

      <section className="yeezy-section">
        <div className="yeezy-container max-w-6xl">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Shipping Information */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="yeezy-heading text-xl mb-6">SHIPPING INFORMATION</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="yeezy-body text-sm block mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="yeezy-body text-sm block mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingInfo.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="yeezy-body text-sm block mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingInfo.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="yeezy-body text-sm block mb-2">Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="yeezy-body text-sm block mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="yeezy-body text-sm block mb-2">Province</label>
                        <input
                          type="text"
                          name="province"
                          value={shippingInfo.province}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="yeezy-body text-sm block mb-2">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingInfo.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="yeezy-body text-sm block mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black bg-gray-50"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h2 className="yeezy-heading text-xl mb-6">PAYMENT METHOD</h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:border-black">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                        className="mr-3"
                      />
                      <div>
                        <div className="yeezy-body font-medium">Stripe</div>
                        <div className="text-xs text-gray-600">Credit/Debit Card via Stripe</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-300 cursor-pointer hover:border-black">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="yoco"
                        checked={paymentMethod === 'yoco'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'yoco')}
                        className="mr-3"
                      />
                      <div>
                        <div className="yeezy-body font-medium">Yoco</div>
                        <div className="text-xs text-gray-600">South African payment via Yoco</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-gray-200 p-6 sticky top-24">
                  <h2 className="yeezy-heading text-xl mb-6">ORDER SUMMARY</h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map(({ artwork, quantity }) => (
                      <div key={artwork.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="yeezy-body">{artwork.title}</div>
                          <div className="text-gray-600 text-xs">Qty: {quantity}</div>
                        </div>
                        <div className="yeezy-price">
                          R {((artwork.price || 0) * quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="yeezy-body text-gray-600">Subtotal</span>
                      <span className="yeezy-price">R {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="yeezy-body text-gray-600">Shipping</span>
                      <span className="yeezy-price">TBD</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="yeezy-heading text-lg">Total</span>
                        <span className="yeezy-heading text-xl">R {totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-yeezy-primary w-full py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Pay with ${paymentMethod === 'stripe' ? 'Stripe' : 'Yoco'}`}
                  </button>

                  <Link href="/cart" className="block text-center mt-4">
                    <button type="button" className="text-sm text-gray-600 hover:text-black">
                      ← Back to Cart
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
