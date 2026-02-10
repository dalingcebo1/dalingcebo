"use client"

import Image from 'next/image'
import { useState } from 'react'
import { Order } from '@/types/order'
import OrderTimeline from '@/components/OrderTimeline'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function TrackOrderPage() {
  const [email, setEmail] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)
    setLoading(true)

    try {
      const response = await fetch(
        `/api/orders/track?email=${encodeURIComponent(email)}&orderNumber=${encodeURIComponent(orderNumber)}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to find order')
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your email and order number.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!order) return

    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`)
      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        }
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-4">
          TRACK YOUR ORDER
        </h1>
        <p className="text-gray-600">
          Enter your email and order number to view your order status
        </p>
      </div>

      {/* Track Form */}
      {!order && (
        <div className="max-w-md mx-auto">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium uppercase tracking-wide mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium uppercase tracking-wide mb-2">
                Order Number
              </label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:border-black focus:outline-none font-mono"
                placeholder="DCART-2026-0001"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-yeezy btn-yeezy-black"
            >
              {loading ? <LoadingSpinner /> : 'TRACK ORDER'}
            </button>
          </form>
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="space-y-8">
          {/* Order Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wide">
                  {order.orderNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setOrder(null)}
                className="text-sm underline hover:no-underline"
              >
                Track Different Order
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownloadInvoice}
                className="btn-yeezy btn-yeezy-outline flex-1"
              >
                DOWNLOAD INVOICE
              </button>
              {order.status === 'deposit_paid' && order.balanceDue && order.balanceDue > 0 && (
                <button className="btn-yeezy btn-yeezy-black flex-1">
                  PAY BALANCE (R{order.balanceDue.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <OrderTimeline
            order={order}
            statusHistory={order.statusHistory}
            updates={order.updates}
          />

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium uppercase tracking-wide mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 border border-gray-200 p-4">
                  {item.image && (
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-gray-600">by {item.artist}</p>
                    {item.variantSelections && (
                      <div className="text-sm text-gray-600 mt-1">
                        {item.variantSelections.frameVariantName && (
                          <div>Frame: {item.variantSelections.frameVariantName}</div>
                        )}
                        {item.variantSelections.canvasVariantName && (
                          <div>Canvas: {item.variantSelections.canvasVariantName}</div>
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-sm">
                      Quantity: {item.quantity} × R{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right font-medium">
                    R{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>R{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>R{order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (15%):</span>
                  <span>R{order.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>TOTAL:</span>
                  <span>R{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-medium uppercase tracking-wide mb-4">Shipping Address</h3>
            <div className="border border-gray-200 p-4">
              <p className="font-medium">{order.shippingName}</p>
              <p className="text-gray-600 mt-1">
                {order.shippingAddress}<br />
                {order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}<br />
                {order.shippingCountry}
              </p>
              {order.shippingPhone && (
                <p className="text-gray-600 mt-2">Phone: {order.shippingPhone}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
