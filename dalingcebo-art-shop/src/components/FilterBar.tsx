'use client'

import { useState, useEffect } from 'react'

export interface FilterState {
  availability: 'all' | 'available' | 'sold'
  priceRange: [number, number]
  sortBy: 'title' | 'price-asc' | 'price-desc' | 'year-desc' | 'year-asc'
  category: string
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
  categories: string[]
  priceRange: [number, number]
  showCategoryFilter?: boolean
}

export default function FilterBar({ 
  onFilterChange, 
  categories, 
  priceRange,
  showCategoryFilter = true 
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    availability: 'all',
    priceRange: priceRange,
    sortBy: 'title',
    category: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      availability: 'all',
      priceRange: priceRange,
      sortBy: 'title',
      category: 'all'
    })
  }

  const hasActiveFilters = 
    filters.availability !== 'all' || 
    filters.category !== 'all' || 
    filters.priceRange[0] !== priceRange[0] || 
    filters.priceRange[1] !== priceRange[1]

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
      {/* Filter Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium uppercase tracking-wider text-gray-700">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-gray-500 hover:text-black underline"
              >
                Clear all
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden p-2 hover:bg-gray-50 rounded-md transition-colors"
            aria-label="Toggle filters"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Filter Controls */}
        <div className={`space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Availability Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value as FilterState['availability'])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="all">All Works</option>
                <option value="available">Available Only</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Category Filter */}
            {showCategoryFilter && categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as FilterState['sortBy'])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="title">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="year-desc">Year (Newest First)</option>
                <option value="year-asc">Year (Oldest First)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
                <span aria-live="polite">
                  Price Range: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const newMin = Number(e.target.value)
                    if (newMin <= filters.priceRange[1]) {
                      handleFilterChange('priceRange', [newMin, filters.priceRange[1]])
                    }
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  aria-label="Minimum price"
                  aria-valuetext={`$${filters.priceRange[0].toLocaleString()}`}
                />
                <input
                  type="range"
                  min={priceRange[0]}
                  max={priceRange[1]}
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const newMax = Number(e.target.value)
                    if (newMax >= filters.priceRange[0]) {
                      handleFilterChange('priceRange', [filters.priceRange[0], newMax])
                    }
                  }}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  aria-label="Maximum price"
                  aria-valuetext={`$${filters.priceRange[1].toLocaleString()}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
