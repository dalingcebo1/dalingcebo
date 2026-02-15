'use client'

import Image from 'next/image'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import Toast from '@/components/Toast'
import { useArtworks } from '@/hooks/useArtworks'
import { Artwork, ArtworkScale } from '@/types/artwork'
import { InquiryRecord, OrderRecord } from '@/types/inquiry'
import { getArtworkPlaceholder, getArtworkPrimaryImage } from '@/lib/media'

interface FormState {
  title: string
  artist: string
  price: string
  category: string
  scale: ArtworkScale
  size: string
  year: string
  medium: string
  description: string
  details: string
  edition: string
  image: string
  imagesInput: string
  tagsInput: string
  inventory: string
  inStock: boolean
}

const defaultForm: FormState = {
  title: '',
  artist: 'Dalingcebo',
  price: '',
  category: '',
  scale: 'large',
  size: '',
  year: new Date().getFullYear().toString(),
  medium: '',
  description: '',
  details: '',
  edition: '',
  image: '',
  imagesInput: '',
  tagsInput: '',
  inventory: '',
  inStock: true,
}

const ADMIN_IMAGE_PLACEHOLDER = getArtworkPlaceholder('admin')
const ADMIN_PREVIEW_PLACEHOLDER = getArtworkPlaceholder('thumb')

export default function AdminPage() {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </main>
      )}
    >
      <AdminDashboard />
    </Suspense>
  )
}

function AdminDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [zoomLevel, setZoomLevel] = useState(0)
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY ?? ''
  const isProtected = adminKey.length > 0
  const [authToken, setAuthToken] = useState(isProtected ? '' : adminKey)
  const [isAuthorized, setIsAuthorized] = useState(!isProtected)
  const [accessCode, setAccessCode] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const { artworks, isLoading, error, reload, stats, categories } = useArtworks()
  const [formState, setFormState] = useState<FormState>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
    const [activeView, setActiveView] = useState<'catalogue' | 'inquiries' | 'orders'>('catalogue')
    const [inquiries, setInquiries] = useState<InquiryRecord[]>([])
    const [orders, setOrders] = useState<OrderRecord[]>([])
    const [secondaryLoading, setSecondaryLoading] = useState(false)
    const [secondaryError, setSecondaryError] = useState<string | null>(null)
  const normalizeInventoryFilters = useCallback(() => {
    const allowedAvailability = ['all', 'available', 'sold']
    const allowedScale = ['all', 'large', 'small']
    const availabilityParam = searchParams.get('invAvailability') ?? 'all'
    const scaleParam = searchParams.get('invScale') ?? 'all'
    return {
      query: searchParams.get('invQ') ?? '',
      availability: allowedAvailability.includes(availabilityParam) ? availabilityParam : 'all',
      scale: allowedScale.includes(scaleParam) ? scaleParam : 'all',
      category: searchParams.get('invCategory') ?? 'all',
    }
  }, [searchParams])
  const [inventoryFilter, setInventoryFilter] = useState(() => normalizeInventoryFilters())
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const formContainerRef = useRef<HTMLDivElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isProtected) return
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem('dalingcebo_admin_key')
    if (stored && stored === adminKey) {
      setAuthToken(stored)
      setIsAuthorized(true)
    }
  }, [isProtected, adminKey])

  useEffect(() => {
    const nextFilters = normalizeInventoryFilters()
    setInventoryFilter((prev) => {
      const isSame = Object.entries(nextFilters).every(([key, value]) => prev[key as keyof typeof prev] === value)
      return isSame ? prev : nextFilters
    })
  }, [normalizeInventoryFilters])

  useEffect(() => {
    if (!isAuthorized) return

    const loadStudioStreams = async () => {
      try {
        setSecondaryLoading(true)
        setSecondaryError(null)

        const [inquiryRes, orderRes] = await Promise.all([
          fetch('/api/inquiries'),
          fetch('/api/orders'),
        ])

        if (!inquiryRes.ok) {
          const { message } = await inquiryRes.json().catch(() => ({ message: 'Unable to load inquiries' }))
          throw new Error(message || 'Unable to load inquiries')
        }

        if (!orderRes.ok) {
          const { message } = await orderRes.json().catch(() => ({ message: 'Unable to load orders' }))
          throw new Error(message || 'Unable to load orders')
        }

        const inquiryData = await inquiryRes.json()
        const orderData = await orderRes.json()

        setInquiries(Array.isArray(inquiryData) ? inquiryData : [])
        setOrders(Array.isArray(orderData) ? orderData : [])
      } catch (err) {
        setSecondaryError((err as Error).message)
      } finally {
        setSecondaryLoading(false)
      }
    }

    void loadStudioStreams()
  }, [isAuthorized])

  const sortedArtworks = useMemo(
    () => [...artworks].sort((a, b) => a.id - b.id),
    [artworks]
  )

  const filteredInventory = useMemo(() => {
    const query = inventoryFilter.query.trim().toLowerCase()
    return sortedArtworks.filter((artwork) => {
      if (query && !`${artwork.title} ${artwork.category}`.toLowerCase().includes(query)) {
        return false
      }
      if (inventoryFilter.scale !== 'all' && artwork.scale !== inventoryFilter.scale) {
        return false
      }
      if (inventoryFilter.category !== 'all' && artwork.category !== inventoryFilter.category) {
        return false
      }
      if (inventoryFilter.availability === 'available' && !artwork.inStock) {
        return false
      }
      if (inventoryFilter.availability === 'sold' && artwork.inStock) {
        return false
      }
      return true
    })
  }, [inventoryFilter, sortedArtworks])

  const handleEdit = (artwork: Artwork) => {
    setEditingId(artwork.id)
    setFormState({
      title: artwork.title,
      artist: artwork.artist,
      price: artwork.price.toString(),
      category: artwork.category,
      scale: artwork.scale,
      size: artwork.size,
      year: artwork.year.toString(),
      medium: artwork.medium,
      description: artwork.description,
      details: artwork.details,
      edition: artwork.edition,
      image: artwork.image,
      imagesInput: artwork.images?.join('\n') ?? artwork.image,
      tagsInput: artwork.tags?.join(', ') ?? '',
      inventory: artwork.inventory?.toString() ?? '',
      inStock: artwork.inStock,
    })

    // Bring the edit form into view and focus the first field
    requestAnimationFrame(() => {
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      titleInputRef.current?.focus()
    })
    showToast('Editing artwork - make your changes below', 'success')
  }

  const handleDuplicate = (artwork: Artwork) => {
    setEditingId(null)
    setFormState({
      title: `${artwork.title} (Copy)`,
      artist: artwork.artist,
      price: artwork.price.toString(),
      category: artwork.category,
      scale: artwork.scale,
      size: artwork.size,
      year: new Date().getFullYear().toString(),
      medium: artwork.medium,
      description: artwork.description,
      details: artwork.details,
      edition: artwork.edition,
      image: artwork.image,
      imagesInput: artwork.images?.join('\n') ?? artwork.image,
      tagsInput: artwork.tags?.join(', ') ?? '',
      inventory: artwork.inventory?.toString() ?? '',
      inStock: true,
    })

    requestAnimationFrame(() => {
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      titleInputRef.current?.select()
    })
    showToast('Duplicating artwork - update details and save', 'success')
  }

  const resetForm = () => {
    setEditingId(null)
    setFormState(defaultForm)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isProtected) {
      setIsAuthorized(true)
      return
    }
    const code = accessCode.trim()
    if (code && code === adminKey) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dalingcebo_admin_key', code)
      }
      setAuthToken(code)
      setIsAuthorized(true)
      setAuthError(null)
      setAccessCode('')
    } else {
      setAuthError('Invalid access code')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    const payload = {
      title: formState.title.trim(),
      artist: formState.artist.trim() || 'Dalingcebo',
      price: Number(formState.price),
      category: formState.category.trim(),
      scale: formState.scale,
      size: formState.size.trim(),
      year: Number(formState.year),
      medium: formState.medium.trim(),
      description: formState.description.trim(),
      details: formState.details.trim(),
      inStock: formState.inStock,
      edition: formState.edition.trim(),
      image: formState.image.trim(),
      images: formState.imagesInput
        ? formState.imagesInput.split('\n').map((line) => line.trim()).filter(Boolean)
        : formState.image
          ? [formState.image.trim()]
          : [],
      tags: formState.tagsInput
        ? formState.tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean)
        : undefined,
      inventory: formState.inventory ? Number(formState.inventory) : undefined,
    }

    try {
      const url = editingId ? `/api/artworks/${editingId}` : '/api/artworks'
      const method = editingId ? 'PUT' : 'POST'
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers['x-admin-key'] = authToken
      }
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const { message } = await response.json()
        throw new Error(message || 'Unable to save artwork. Please try again.')
      }

      showToast(`✓ Artwork ${editingId ? 'updated' : 'created'} successfully!`, 'success')
      reload()
      resetForm()
      // Scroll to top after success
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (artwork: Artwork) => {
    const confirmed = window.confirm(`Delete ${artwork.title}? This cannot be undone.`)
    if (!confirmed) return

    try {
      const headers: HeadersInit = {}
      if (authToken) {
        headers['x-admin-key'] = authToken
      }
      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'DELETE',
        headers,
      })
      if (!response.ok) {
        const { message } = await response.json()
        throw new Error(message || 'Unable to delete artwork.')
      }
      showToast('Artwork deleted.')
      reload()
      if (editingId === artwork.id) {
        resetForm()
      }
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleToggleAvailability = async (artwork: Artwork) => {
    setUpdatingId(artwork.id)
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers['x-admin-key'] = authToken
      }
      const payload = {
        title: artwork.title,
        artist: artwork.artist,
        price: artwork.price,
        category: artwork.category,
        scale: artwork.scale,
        size: artwork.size,
        year: artwork.year,
        medium: artwork.medium,
        description: artwork.description,
        details: artwork.details,
        inStock: !artwork.inStock,
        edition: artwork.edition,
        image: artwork.image,
        images: artwork.images?.length ? artwork.images : artwork.image ? [artwork.image] : [],
        tags: artwork.tags,
        inventory: artwork.inventory,
      }

      const response = await fetch(`/api/artworks/${artwork.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const { message } = await response.json()
        throw new Error(message || 'Unable to update availability.')
      }

      showToast(`Marked as ${artwork.inStock ? 'sold' : 'available'}.`)
      reload()
    } catch (err) {
      showToast((err as Error).message, 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleMarkInquiryContacted = async (inquiryId: string, currentStatus: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers['x-admin-key'] = authToken
      }

      const newStatus = currentStatus === 'contacted' ? 'new' : 'contacted'
      
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const { message } = await response.json().catch(() => ({ message: 'Unable to update inquiry status' }))
        throw new Error(message || 'Unable to update inquiry status.')
      }

      showToast(`Inquiry marked as ${newStatus}.`)
      
      // Refresh inquiries
      const inquiryRes = await fetch('/api/inquiries')
      if (inquiryRes.ok) {
        const inquiryData = await inquiryRes.json()
        setInquiries(Array.isArray(inquiryData) ? inquiryData : [])
      }
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (authToken) {
        headers['x-admin-key'] = authToken
      }

      // Cycle through: new → processing → archived → new
      const statusCycle: Record<string, string> = {
        'new': 'processing',
        'processing': 'archived',
        'archived': 'new'
      }
      const newStatus = statusCycle[currentStatus] || 'processing'
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const { message } = await response.json().catch(() => ({ message: 'Unable to update order status' }))
        throw new Error(message || 'Unable to update order status.')
      }

      showToast(`Order status updated to ${newStatus}.`)
      
      // Refresh orders
      const orderRes = await fetch('/api/orders')
      if (orderRes.ok) {
        const orderData = await orderRes.json()
        setOrders(Array.isArray(orderData) ? orderData : [])
      }
    } catch (err) {
      showToast((err as Error).message, 'error')
    }
  }

  const syncInventoryFiltersToQuery = (nextFilters: typeof inventoryFilter) => {
    setInventoryFilter(nextFilters)
    const params = new URLSearchParams(searchParams.toString())

    if (nextFilters.query.trim().length > 0) {
      params.set('invQ', nextFilters.query)
    } else {
      params.delete('invQ')
    }

    if (nextFilters.availability === 'all') {
      params.delete('invAvailability')
    } else {
      params.set('invAvailability', nextFilters.availability)
    }

    if (nextFilters.scale === 'all') {
      params.delete('invScale')
    } else {
      params.set('invScale', nextFilters.scale)
    }

    if (nextFilters.category === 'all') {
      params.delete('invCategory')
    } else {
      params.set('invCategory', nextFilters.category)
    }

    const queryString = params.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(href, { scroll: false })
  }

  const handleInventoryFilterChange = (key: keyof typeof inventoryFilter, value: string) => {
    if (inventoryFilter[key] === value) return
    syncInventoryFiltersToQuery({ ...inventoryFilter, [key]: value })
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
        <section className="yeezy-section pt-32">
          <div className="yeezy-container max-w-lg mx-auto">
            <div className="bg-white border border-gray-200 p-8 text-center">
              <p className="meta uppercase text-gray-500 mb-4">Restricted</p>
              <h2 className="h2 mb-4">Admin Access</h2>
              <p className="body text-gray-600">
                Enter the studio access code to manage catalogue updates.
              </p>
              <form className="mt-8 space-y-4" onSubmit={handleUnlock}>
                <input
                  type="password"
                  className="w-full border border-gray-300 p-3 text-sm yeezy-body"
                  placeholder="Access code"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value)
                    setAuthError(null)
                  }}
                />
                {authError && (
                  <p className="text-xs text-red-500">{authError}</p>
                )}
                <button type="submit" className="btn-yeezy-primary w-full">
                  Unlock Dashboard
                </button>
                {!isProtected && (
                  <p className="text-xs text-gray-500">
                    Set NEXT_PUBLIC_ADMIN_KEY to require a code.
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />

      <section className="yeezy-section pt-24 pb-20">
        <div className="yeezy-container max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[9px] uppercase tracking-[0.4em] mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Studio Dashboard
                </div>
                <h1 className="h1 font-light mb-2">Dalingcebo Admin</h1>
                <p className="meta text-gray-600">Manage your catalogue, inquiries, and orders</p>
              </div>
              {editingId && (
                <button
                  className="btn-yeezy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  <svg className="inline-block w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14m-7-7h14"/>
                  </svg>
                  Add New Artwork
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { 
                label: 'Total Works', 
                value: stats.total, 
                icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
                color: 'blue'
              },
              { 
                label: 'Available', 
                value: stats.available, 
                icon: <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></>,
                color: 'green'
              },
              { 
                label: 'Large Scale', 
                value: stats.large, 
                icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>,
                color: 'purple'
              },
              { 
                label: 'Avg Price', 
                value: stats.averagePrice ? `$${stats.averagePrice.toLocaleString()}` : '—', 
                icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
                color: 'amber'
              },
            ].map((card) => (
              <div 
                key={card.label} 
                className="relative bg-white rounded-lg border border-gray-200 px-6 py-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-${card.color}-500 to-${card.color}-600`}></div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="meta uppercase text-gray-500 mb-2">{card.label}</p>
                    <p className="h1 font-light text-gray-900">{card.value}</p>
                  </div>
                  <div className="text-gray-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      {card.icon}
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-1.5 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'catalogue', label: 'Catalogue', count: stats.total },
                { id: 'inquiries', label: 'Inquiries', count: inquiries.length },
                { id: 'orders', label: 'Orders', count: orders.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id as 'catalogue' | 'inquiries' | 'orders')}
                  className={`flex-1 px-6 py-3 rounded-md text-sm font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                    activeView === tab.id
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-pressed={activeView === tab.id}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeView === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeView === 'catalogue' && (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              {/* Artwork Form */}
              <div ref={formContainerRef} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="h2 font-light mb-1">
                        {editingId ? 'Edit Artwork' : 'Add New Artwork'}
                      </h2>
                      <p className="meta text-gray-500">
                        {editingId ? `Updating ID ${editingId}` : 'Create a new piece for the collection'}
                      </p>
                    </div>
                    {editingId && (
                      <span className="px-3 py-1 bg-black text-white text-xs uppercase tracking-wider rounded-full">
                        Editing
                      </span>
                    )}
                  </div>
                </div>
                
                <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Basic Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Title <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          ref={titleInputRef}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="Enter artwork title"
                          value={formState.title}
                          onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Artist
                        </span>
                        <input
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="Artist name"
                          value={formState.artist}
                          onChange={(e) => setFormState({ ...formState, artist: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Pricing & Details */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Pricing & Attributes
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Price (USD) <span className="text-red-500">*</span>
                        </span>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            required
                            type="number"
                            className="w-full border border-gray-300 rounded-md pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                            placeholder="0"
                            value={formState.price}
                            onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Year <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="2025"
                          value={formState.year}
                          onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Scale <span className="text-red-500">*</span>
                        </span>
                        <select
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all bg-white"
                          value={formState.scale}
                          onChange={(e) => setFormState({ ...formState, scale: e.target.value as ArtworkScale })}
                        >
                          <option value="large">Large</option>
                          <option value="small">Small</option>
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Inventory
                        </span>
                        <input
                          type="number"
                          min="0"
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="∞"
                          value={formState.inventory}
                          onChange={(e) => setFormState({ ...formState, inventory: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Classification */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Classification
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Category <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="e.g., Abstract, Portrait"
                          value={formState.category}
                          onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Size <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder='e.g., 40" × 30"'
                          value={formState.size}
                          onChange={(e) => setFormState({ ...formState, size: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Edition <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="e.g., Original, 1/10"
                          value={formState.edition}
                          onChange={(e) => setFormState({ ...formState, edition: e.target.value })}
                        />
                      </label>
                    </div>
                    <div className="mt-4">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Medium <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="e.g., Oil on canvas, Mixed media"
                          value={formState.medium}
                          onChange={(e) => setFormState({ ...formState, medium: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Description & Details
                    </h3>
                    <div className="space-y-6">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Description <span className="text-red-500">*</span>
                        </span>
                        <textarea
                          required
                          rows={4}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                          placeholder="Brief description for collectors..."
                          value={formState.description}
                          onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Details <span className="text-red-500">*</span>
                        </span>
                        <textarea
                          required
                          rows={4}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all resize-none"
                          placeholder="Technical details, materials, inspiration..."
                          value={formState.details}
                          onChange={(e) => setFormState({ ...formState, details: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Images
                    </h3>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block">
                          Primary Image URL <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="https://..."
                          value={formState.image}
                          onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                        />
                      </label>
                      
                      {/* Image Preview */}
                      {formState.image && (
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <p className="text-xs uppercase tracking-wider text-gray-600 mb-3">Preview</p>
                          <div className="relative aspect-[4/5] max-w-xs mx-auto bg-white rounded-md overflow-hidden shadow-sm">
                            <Image
                              src={formState.image}
                              alt="Preview"
                              fill
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="object-cover"
                              onError={(e) => {
                                if (e.currentTarget instanceof HTMLImageElement) {
                                  e.currentTarget.src = ADMIN_PREVIEW_PLACEHOLDER
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block flex items-center gap-2">
                          Additional Images
                          <span className="text-[10px] text-gray-400 normal-case">(one URL per line)</span>
                        </span>
                        <textarea
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all resize-none font-mono"
                          placeholder="https://...&#10;https://...&#10;https://..."
                          value={formState.imagesInput}
                          onChange={(e) => setFormState({ ...formState, imagesInput: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      Metadata
                    </h3>
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-xs uppercase tracking-wider text-gray-600 mb-2 block flex items-center gap-2">
                          Tags
                          <span className="text-[10px] text-gray-400 normal-case">(comma-separated)</span>
                        </span>
                        <input
                          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                          placeholder="contemporary, abstract, vibrant"
                          value={formState.tagsInput}
                          onChange={(e) => setFormState({ ...formState, tagsInput: e.target.value })}
                        />
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-black focus:ring-2 focus:ring-black focus:ring-offset-2"
                          checked={formState.inStock}
                          onChange={(e) => setFormState({ ...formState, inStock: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-black">
                          Available for purchase
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg text-sm font-medium uppercase tracking-wider text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all disabled:opacity-50"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 px-6 py-4 bg-black text-white rounded-lg text-sm font-medium uppercase tracking-wider hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <LoadingSpinner size="sm" />
                          Saving...
                        </span>
                      ) : editingId ? (
                        'Update Artwork'
                      ) : (
                        'Create Artwork'
                      )}
                    </button>
                  </div>
              </form>
              </div>

              {/* Inventory List */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-light">Inventory</h2>
                      {isLoading && <LoadingSpinner size="sm" />}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Search */}
                    <div className="relative">
                      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by title or category..."
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                        value={inventoryFilter.query}
                        onChange={(e) => handleInventoryFilterChange('query', e.target.value)}
                      />
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black focus:border-black bg-white"
                        value={inventoryFilter.availability}
                        onChange={(e) => handleInventoryFilterChange('availability', e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="available">✓ Available</option>
                        <option value="sold">✕ Sold</option>
                      </select>
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black focus:border-black bg-white"
                        value={inventoryFilter.scale}
                        onChange={(e) => handleInventoryFilterChange('scale', e.target.value)}
                      >
                        <option value="all">All Scales</option>
                        <option value="large">Large</option>
                        <option value="small">Small</option>
                      </select>
                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-black focus:border-black bg-white"
                        value={inventoryFilter.category}
                        onChange={(e) => handleInventoryFilterChange('category', e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="px-6 pb-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
                        {error}
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <div className="max-h-[70vh] overflow-y-auto">
                      {filteredInventory.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {filteredInventory.map((artwork) => (
                            <div 
                              key={artwork.id} 
                              className={`p-6 hover:bg-gray-50 transition-colors ${editingId === artwork.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            >
                              <div className="flex items-start gap-4 mb-4">
                                {/* Thumbnail */}
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
                                  <Image
                                    src={getArtworkPrimaryImage(artwork, 'admin')}
                                    alt={artwork.title}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                    onError={(e) => {
                                      if (e.currentTarget instanceof HTMLImageElement) {
                                        e.currentTarget.src = ADMIN_IMAGE_PLACEHOLDER
                                      }
                                    }}
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] text-gray-400 tracking-wider">#{artwork.id}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                      artwork.inStock 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${artwork.inStock ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                      {artwork.inStock ? 'Available' : 'Sold'}
                                    </span>
                                    {editingId === artwork.id && (
                                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-medium rounded-full">
                                        EDITING
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="font-medium text-gray-900 mb-1 truncate">{artwork.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 bg-gray-100 rounded">{artwork.category}</span>
                                    <span>•</span>
                                    <span>{artwork.scale.toUpperCase()}</span>
                                    <span>•</span>
                                    <span>{artwork.size}</span>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-lg font-light text-gray-900">${artwork.price.toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">
                                    {artwork.inStock ? (
                                      artwork.inventory ? `${artwork.inventory} in stock` : 'Unlimited'
                                    ) : (
                                      'Out of stock'
                                    )}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white hover:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                  onClick={() => handleEdit(artwork)}
                                  title="Edit this artwork"
                                >
                                  <svg className="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  className="flex-1 px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                  onClick={() => handleDuplicate(artwork)}
                                  title="Duplicate this artwork"
                                >
                                  <svg className="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                  </svg>
                                  Duplicate
                                </button>
                                <button
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-white hover:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all disabled:opacity-50"
                                  onClick={() => handleToggleAvailability(artwork)}
                                  disabled={updatingId === artwork.id}
                                  title={artwork.inStock ? 'Mark as sold' : 'Mark as available'}
                                >
                                  {updatingId === artwork.id ? (
                                    <>
                                      <LoadingSpinner size="sm" />
                                      <span className="ml-1.5">Updating...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {artwork.inStock ? (
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                        ) : (
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                        )}
                                      </svg>
                                      {artwork.inStock ? 'Mark as Sold' : 'Mark Available'}
                                    </>
                                  )}
                                </button>
                                <button
                                  className="px-4 py-2 border border-red-200 bg-red-50 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                  onClick={() => handleDelete(artwork)}
                                >
                                  <svg className="inline-block w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-12 text-center">
                          <svg className="mx-auto w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                          </svg>
                          <p className="text-sm text-gray-500">No artworks match your filters</p>
                          <button 
                            className="mt-4 text-sm text-black hover:underline"
                            onClick={() => setInventoryFilter({ query: '', availability: 'all', scale: 'all', category: 'all' })}
                          >
                            Clear filters
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'inquiries' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="h2 font-light mb-1">Collector Inquiries</h2>
                    <p className="text-sm text-gray-500">
                      {inquiries.length === 0 
                        ? 'No inquiries yet' 
                        : `${inquiries.filter(i => i.status === 'new').length} new, ${inquiries.length} total`}
                    </p>
                  </div>
                  {secondaryLoading && <LoadingSpinner size="sm" />}
                </div>
              </div>

              {secondaryError && (
                <div className="p-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm text-red-600">{secondaryError}</p>
                  </div>
                </div>
              )}

              {!secondaryError && inquiries.length === 0 && !secondaryLoading && (
                <div className="p-12 text-center">
                  <svg className="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiries Yet</h3>
                  <p className="text-sm text-gray-500">
                    Collector inquiries will appear here when visitors reach out through the site.
                  </p>
                </div>
              )}

              {!secondaryError && inquiries.length > 0 && (
                <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-6 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{inquiry.name}</h3>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                inquiry.status === 'new'
                                  ? 'bg-black text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {inquiry.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                              <a href={`mailto:${inquiry.email}`} className="hover:text-black flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                {inquiry.email}
                              </a>
                              {inquiry.phone && (
                                <a href={`tel:${inquiry.phone}`} className="hover:text-black flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                  </svg>
                                  {inquiry.phone}
                                </a>
                              )}
                            </div>
                            {inquiry.artworkTitle && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700 mb-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                {inquiry.artworkTitle}
                              </div>
                            )}
                            <p className="text-xs text-gray-400">
                              {new Date(inquiry.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              inquiry.status === 'contacted'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                            }`}
                            onClick={() => handleMarkInquiryContacted(inquiry.id, inquiry.status)}
                          >
                            {inquiry.status === 'contacted' ? 'Mark Uncontacted' : 'Mark Contacted'}
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {inquiry.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'orders' && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="h2 font-light mb-1">Checkout Requests</h2>
                    <p className="text-sm text-gray-500">
                      {orders.length === 0 
                        ? 'No orders yet' 
                        : `${orders.filter(o => o.status === 'new').length} new, ${orders.length} total`}
                    </p>
                  </div>
                  {secondaryLoading && <LoadingSpinner size="sm" />}
                </div>
              </div>

              {secondaryError && (
                <div className="p-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <svg className="mx-auto w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm text-red-600">{secondaryError}</p>
                  </div>
                </div>
              )}

              {!secondaryError && orders.length === 0 && !secondaryLoading && (
                <div className="p-12 text-center">
                  <svg className="mx-auto w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-sm text-gray-500">
                    Checkout requests from the cart will appear here.
                  </p>
                </div>
              )}

              {!secondaryError && orders.length > 0 && (
                <div className="max-h-[calc(100vh-24rem)] overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-6 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{order.name}</h3>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                order.status === 'new'
                                  ? 'bg-black text-white'
                                  : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                              <a href={`mailto:${order.email}`} className="hover:text-black flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                </svg>
                                {order.email}
                              </a>
                              {order.phone && (
                                <a href={`tel:${order.phone}`} className="hover:text-black flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                  </svg>
                                  {order.phone}
                                </a>
                              )}
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span className="leading-tight">{order.address}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="h2 font-light text-gray-900 mb-1">${order.total.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            </div>
                            <button
                              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                order.status === 'new'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                  : order.status === 'processing'
                                    ? 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500'
                                    : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500'
                              }`}
                              onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                              title={`Current: ${order.status}. Click to advance to next status.`}
                            >
                              {order.status === 'new' ? 'Start Processing' : order.status === 'processing' ? 'Archive Order' : 'Reopen Order'}
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                          <div>
                            <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Order Items</h4>
                            <ul className="space-y-2">
                              {order.items.map((item) => (
                                <li key={item.id} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2">
                                  <div className="flex-1">
                                    <p className="text-gray-900 font-medium">{item.title}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                  <p className="font-medium text-gray-900">${item.price.toLocaleString()}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {order.notes && (
                            <div>
                              <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">Notes</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white rounded px-3 py-2">
                                {order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Footer />
    </main>
  )
}
