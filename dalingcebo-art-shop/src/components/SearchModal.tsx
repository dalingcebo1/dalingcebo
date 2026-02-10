'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useArtworks } from '@/hooks/useArtworks'

interface SearchResult {
  id: string
  title: string
  category: string
  price?: string
  type: 'artwork' | 'page'
  url: string
}

const pageResults: SearchResult[] = [
  { id: 'about', title: 'About', category: 'page', type: 'page', url: '/about' },
  { id: 'contact', title: 'Contact', category: 'page', type: 'page', url: '/contact' },
  { id: 'info', title: 'Information', category: 'page', type: 'page', url: '/info' },
  { id: 'faq', title: 'FAQ', category: 'page', type: 'page', url: '/faq' },
  { id: 'shipping', title: 'Shipping', category: 'page', type: 'page', url: '/shipping' },
]

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { artworks, isLoading: isArtworksLoading } = useArtworks()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const results = useMemo(() => {
    if (query.length <= 1) return []
    const keyword = query.toLowerCase()
    const artworkMatches: SearchResult[] = artworks
      .filter((artwork) =>
        artwork.title.toLowerCase().includes(keyword) ||
        artwork.category.toLowerCase().includes(keyword) ||
        artwork.scale.toLowerCase().includes(keyword)
      )
      .map((artwork) => ({
        id: String(artwork.id),
        title: artwork.title,
        category: artwork.category,
        price: `$${artwork.price.toLocaleString()}`,
        type: 'artwork' as const,
        url: `/artwork/${artwork.id}`,
      }))

    const pageMatches = pageResults.filter((page) =>
      page.title.toLowerCase().includes(keyword) || page.category.toLowerCase().includes(keyword)
    )

    return [...artworkMatches, ...pageMatches]
  }, [artworks, query])

  const isLoading = query.length > 1 && isArtworksLoading

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose}>
      <div className="min-h-screen px-4 text-center flex items-start justify-center pt-20">
        {/* Modal content */}
        <div className="inline-block w-full max-w-2xl text-left align-middle transition-all transform bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* Search Input */}
          <div className="border-b border-gray-200 p-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search artworks, pages..."
                className="w-full bg-transparent text-2xl font-light outline-none placeholder-gray-400 yeezy-body"
              />
              <button
                onClick={onClose}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={result.url}
                    className="block p-4 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                    onClick={onClose}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="yeezy-title text-black mb-1">{result.title}</h3>
                        <p className="text-xs text-gray-500 yeezy-body capitalize">{result.category}</p>
                      </div>
                      {result.price && (
                        <span className="yeezy-price">{result.price}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.length > 1 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="yeezy-body">
                  No results found for <span className="font-semibold">&ldquo;{query}&rdquo;</span>
                </p>
              </div>
            ) : (
              <div>
                <div className="text-center py-8 text-gray-400">
                  <p className="yeezy-body mb-6">Start typing to search...</p>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="yeezy-title text-xs mb-4 text-gray-500">QUICK LINKS</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/shop"
                      onClick={onClose}
                      className="p-3 border border-gray-200 hover:border-black transition-colors"
                    >
                      <span className="yeezy-title text-sm">All Works</span>
                    </Link>
                    <Link
                      href="/large-paintings"
                      onClick={onClose}
                      className="p-3 border border-gray-200 hover:border-black transition-colors"
                    >
                      <span className="yeezy-title text-sm">Large</span>
                    </Link>
                    <Link
                      href="/small-paintings"
                      onClick={onClose}
                      className="p-3 border border-gray-200 hover:border-black transition-colors"
                    >
                      <span className="yeezy-title text-sm">Small</span>
                    </Link>
                    <Link
                      href="/about"
                      onClick={onClose}
                      className="p-3 border border-gray-200 hover:border-black transition-colors"
                    >
                      <span className="yeezy-title text-sm">About</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <p className="text-xs text-gray-500 yeezy-body">Press ESC to close</p>
          </div>
        </div>
      </div>
    </div>
  )
}
