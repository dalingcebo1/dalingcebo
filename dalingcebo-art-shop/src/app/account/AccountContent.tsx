'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/components/SupabaseProvider'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/db/schema'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { OrderRecord } from '@/types/inquiry'

export default function AccountContent({ user }: { user: User }) {
  const [zoomLevel, setZoomLevel] = useState(0)
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders')
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      fetchOrders()
    }
  }, [user?.email])

  return (
    <main className="min-h-screen bg-white">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="max-w-6xl mx-auto space-y-20">
          <header className="space-y-6 animate-fade-in">
            <h1 className="yeezy-heading text-5xl md:text-8xl tracking-tight">ACCOUNT</h1>
            <p className="yeezy-subheading text-lg md:text-xl text-gray-500">
              WELCOME BACK, {user?.user_metadata?.full_name || user?.email}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
            <section className="space-y-8">
              <h2 className="yeezy-subheading text-xl md:text-2xl border-b border-black pb-4 flex justify-between items-center">
                <span>MY ORDERS</span>
                <span className="text-sm text-gray-400">{orders.length}</span>
              </h2>
              
              {loading ? (
                 <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100">
                   <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                 </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-black p-6 space-y-4 hover:bg-zinc-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xs uppercase text-gray-500 tracking-widest mb-1">Order ID</p>
                           <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs uppercase text-gray-500 tracking-widest mb-1">Date</p>
                           <p className="font-mono text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs uppercase text-gray-500 tracking-widest mb-2">Items</p>
                        {order.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between text-sm py-1">
                             <span>{item.title} (x{item.quantity})</span>
                             <span>R {item.price.toLocaleString()}</span>
                           </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                        <span className={`text-xs uppercase px-2 py-1 ${
                          order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'archived' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        <span className="font-bold">Total: R {order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-100">
                  <p className="yeezy-body text-gray-400 uppercase tracking-widest text-sm">
                    NO ORDERS FOUND
                  </p>
                  <button className="mt-6 text-xs uppercase underline underline-offset-4 hover:text-gray-600 transition-colors">
                    START SHOPPING
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-8">
              <h2 className="yeezy-subheading text-xl md:text-2xl border-b border-black pb-4">
                ACCOUNT DETAILS
              </h2>
              <div className="space-y-8 yeezy-body">
                <div className="group">
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 group-hover:text-black transition-colors">Name</label>
                  <p className="text-lg md:text-xl border-b border-transparent group-hover:border-gray-200 pb-1 transition-all">
                    {user?.user_metadata?.full_name || 'Not provided'}
                  </p>
                </div>
                <div className="group">
                  <label className="block text-gray-400 text-xs uppercase tracking-widest mb-2 group-hover:text-black transition-colors">Email</label>
                  <p className="text-lg md:text-xl border-b border-transparent group-hover:border-gray-200 pb-1 transition-all lowercase">
                    {user?.email}
                  </p>
                </div>
                <div className="pt-8">
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push('/')
                    }}
                    className="text-xs uppercase text-red-500 hover:text-red-600 underline underline-offset-4 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
