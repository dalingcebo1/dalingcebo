'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'

export default function Cart() {
  const [zoomLevel, setZoomLevel] = useState(0)
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  const handleQuantityChange = (artworkId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(artworkId, newQuantity)
    }
  }

  return (
    <main className="min-h-screen">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      {/* Hero Section */}
      <section className="yeezy-hero" style={{ height: '30vh' }}>
        <div className="yeezy-hero-content">
          <div className="fade-in-slow" style={{ animationDelay: '0.3s' }}>
            <h1 className="yeezy-main-logo text-black" style={{ fontSize: 'clamp(2rem, 6vw, 6rem)' }}>
              CART
            </h1>
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="yeezy-section">
        <div className="yeezy-container max-w-4xl">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="yeezy-body text-gray-600 mb-8">Your cart is empty</p>
              <Link href="/" className="btn-yeezy-primary">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="space-y-4">
                {items.map(({ artwork, quantity }) => (
                  <div 
                    key={artwork.id} 
                    className="flex flex-col md:flex-row gap-6 p-6 border border-gray-200"
                  >
                    {/* Artwork Image */}
                    <div className="w-full md:w-48 h-48 relative bg-gray-100">
                      {artwork.image && (
                        <Image
                          src={artwork.image}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Artwork Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="yeezy-heading text-lg mb-2">{artwork.title}</h3>
                        {artwork.description && (
                          <p className="yeezy-body text-gray-600 text-sm mb-4">
                            {artwork.description}
                          </p>
                        )}
                        <p className="yeezy-price text-lg">
                          R {artwork.price?.toLocaleString() || '0'}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-gray-300">
                          <button
                            onClick={() => handleQuantityChange(artwork.id, quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(artwork.id, quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(artwork.id)}
                          className="text-gray-600 hover:text-black text-sm uppercase tracking-wider"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="yeezy-price text-lg font-medium">
                        R {((artwork.price || 0) * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-8">
                <div className="max-w-md ml-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="yeezy-body text-gray-600">Subtotal</span>
                    <span className="yeezy-price text-lg">R {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="yeezy-body text-gray-600">Shipping</span>
                    <span className="yeezy-price text-lg">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="yeezy-heading text-lg">Total</span>
                      <span className="yeezy-heading text-2xl">R {totalPrice.toLocaleString()}</span>
                    </div>
                    <Link href="/checkout" className="block w-full">
                      <button className="btn-yeezy-primary w-full py-4">
                        Proceed to Checkout
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
