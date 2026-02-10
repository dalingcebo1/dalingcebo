'use client'

import { Order, OrderStatusHistory, OrderUpdate } from '@/types/order'

interface OrderTimelineProps {
  order: Order
  statusHistory?: OrderStatusHistory[]
  updates?: OrderUpdate[]
}

export default function OrderTimeline({ order, statusHistory = [], updates = [] }: OrderTimelineProps) {
  // Define order status steps with SVG icons
  const statusSteps = [
    { 
      key: 'pending_payment', 
      label: 'Order Placed', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      )
    },
    { 
      key: 'paid', 
      label: 'Payment Received', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
        </svg>
      )
    },
    { 
      key: 'processing', 
      label: 'Processing', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
        </svg>
      )
    },
    { 
      key: 'shipped', 
      label: 'Shipped', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      )
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
        </svg>
      )
    }
  ]

  // Determine current step
  const getCurrentStep = () => {
    const statusIndex = {
      'pending_payment': 0,
      'deposit_paid': 1,
      'paid': 1,
      'reserved': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4,
      'cancelled': -1,
      'refunded': -1
    }
    return statusIndex[order.status] || 0
  }

  const currentStep = getCurrentStep()
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'

  // Combine history and updates into timeline
  const timelineEvents = [
    ...statusHistory.map(h => ({
      type: 'status' as const,
      date: h.createdAt,
      title: `Status: ${h.status.replace(/_/g, ' ')}`,
      description: h.note,
      createdBy: h.createdBy
    })),
    ...updates.map(u => ({
      type: 'update' as const,
      date: u.createdAt,
      title: u.title,
      description: u.message,
      updateType: u.updateType
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      {!isCancelled && (
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    transition-all relative z-10
                    ${index <= currentStep 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-400'
                    }
                  `}
                >
                  {step.icon}
                </div>
                <div
                  className={`
                    text-xs mt-2 text-center uppercase tracking-wide
                    ${index <= currentStep ? 'text-black font-medium' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" style={{ zIndex: 0 }}>
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Cancelled Status */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 p-4 text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="font-medium uppercase tracking-wide text-red-800">
            Order {order.status}
          </div>
          {order.cancelledAt && (
            <div className="text-sm text-red-600 mt-1">
              {new Date(order.cancelledAt).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      )}

      {/* Delivery Estimates */}
      {!isCancelled && order.status !== 'delivered' && (
        <div className="bg-gray-50 p-4 space-y-2">
          {order.estimatedShipDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Ship Date:</span>
              <span className="font-medium">
                {new Date(order.estimatedShipDate).toLocaleDateString('en-ZA', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {order.estimatedDeliveryDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-medium">
                {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-ZA', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
          {order.trackingNumber && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Tracking Number:</div>
              <div className="font-mono text-sm font-medium">{order.trackingNumber}</div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Events */}
      {timelineEvents.length > 0 && (
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wide mb-4">Order Updates</h3>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                  {event.type === 'status' ? 'S' : 'U'}
                </div>
                <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-gray-500 ml-4">
                      {new Date(event.date).toLocaleDateString('en-ZA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  {event.description && (
                    <div className="text-sm text-gray-600 mt-1">{event.description}</div>
                  )}
                  {event.type === 'update' && event.updateType && (
                    <div className="inline-block text-xs uppercase tracking-wide bg-gray-100 px-2 py-1 mt-2">
                      {event.updateType}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deposit Payment Status */}
      {order.paymentType === 'deposit' && order.balanceDue && order.balanceDue > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-medium uppercase tracking-wide text-amber-900">
                Balance Due
              </div>
              <div className="text-sm text-amber-700 mt-1">
                Deposit of R{order.depositAmount?.toFixed(2)} paid
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              R{order.balanceDue.toFixed(2)}
            </div>
          </div>
          {order.balanceDueBy && (
            <div className="text-sm text-amber-700">
              Payment due by:{' '}
              {new Date(order.balanceDueBy).toLocaleDateString('en-ZA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
