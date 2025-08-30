'use client'

import { useState, useEffect, useRef } from 'react'

interface SearchResult {
  id: number
  title: string
  category: string
  price: string
  type: 'artwork' | 'page'
}

const mockResults: SearchResult[] = [
  { id: 1, title: "Urban Silence", category: "painting", price: "$850", type: 'artwork' },
  { id: 2, title: "Cultural Echo", category: "mixed-media", price: "$1,200", type: 'artwork' },
  { id: 3, title: "About", category: "page", price: "", type: 'page' },
  { id: 4, title: "Contact", category: "page", price: "", type: 'page' },
]

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 1) {
      setIsLoading(true)
      setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
        )
        setResults(filtered)
        setIsLoading(false)
      }, 200)
    } else {
      setResults([])
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-black border border-gray-800 w-full max-w-2xl mx-6 overflow-hidden">
        {/* Search Input */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full text-xl bg-transparent border-none outline-none placeholder-gray-500 text-white yeezy-body"
            />
            <button
              onClick={onClose}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 yeezy-body text-sm">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-900 cursor-pointer transition-colors yeezy-transition"
                  onClick={onClose}
                >
                  <div className="w-10 h-10 bg-gray-800 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500 yeezy-title">
                      {result.id.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white yeezy-title">{result.title}</h4>
                    <p className="text-gray-500 text-xs yeezy-body uppercase">{result.category}</p>
                  </div>
                  {result.price && (
                    <div className="text-white yeezy-price">{result.price}</div>
                  )}
                </div>
              ))}
            </div>
          ) : query.length > 1 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 yeezy-body">No results for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 yeezy-body">Start typing to search</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {query.length === 0 && (
          <div className="p-6 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "All Works", category: "collection" },
                { title: "New", category: "recent" },
                { title: "About", category: "info" },
                { title: "Contact", category: "support" }
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={onClose}
                  className="text-left p-3 hover:bg-gray-900 transition-colors yeezy-transition"
                >
                  <span className="yeezy-title text-white text-sm">{item.title}</span>
                  <br />
                  <span className="text-gray-500 text-xs yeezy-body uppercase">{item.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
