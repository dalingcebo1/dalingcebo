'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Artwork } from '@/types/artwork'

interface ArtworkStats {
  total: number
  available: number
  sold: number
  large: number
  small: number
  recent: number
  totalValue: number
  averagePrice: number
}

interface ArtworksContextValue {
  artworks: Artwork[]
  isLoading: boolean
  error: string | null
  stats: ArtworkStats
  categories: string[]
  reload: () => void
}

const ArtworksContext = createContext<ArtworksContextValue | undefined>(undefined)

export function ArtworksProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArtworks = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/artworks', { signal })
      if (!response.ok) {
        throw new Error('Unable to load artworks. Please try again soon.')
      }
      const data: Artwork[] = await response.json()
      setArtworks(data)
      setError(null)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchArtworks(controller.signal)
    return () => controller.abort()
  }, [fetchArtworks])

  const reload = useCallback(() => {
    fetchArtworks()
  }, [fetchArtworks])

  const stats = useMemo<ArtworkStats>(() => {
    const total = artworks.length
    if (total === 0) {
      return {
        total: 0,
        available: 0,
        sold: 0,
        large: 0,
        small: 0,
        recent: 0,
        totalValue: 0,
        averagePrice: 0,
      }
    }

    const available = artworks.filter(item => item.inStock).length
    const large = artworks.filter(item => item.scale === 'large').length
    const small = artworks.filter(item => item.scale === 'small').length
    const recentThreshold = new Date().getFullYear() - 1
    const recent = artworks.filter(item => item.year >= recentThreshold).length
    const totalValue = artworks.reduce((sum, item) => sum + item.price, 0)

    return {
      total,
      available,
      sold: total - available,
      large,
      small,
      recent,
      totalValue,
      averagePrice: Math.round(totalValue / total),
    }
  }, [artworks])

  const categories = useMemo(() => {
    const set = new Set<string>()
    artworks.forEach(item => {
      if (item.category) {
        set.add(item.category)
      }
    })
    return Array.from(set).sort()
  }, [artworks])

  const value = useMemo(
    () => ({ artworks, isLoading, error, reload, stats, categories }),
    [artworks, isLoading, error, reload, stats, categories]
  )

  return (
    <ArtworksContext.Provider value={value}>
      {children}
    </ArtworksContext.Provider>
  )
}

export function useArtworks(): ArtworksContextValue {
  const context = useContext(ArtworksContext)
  if (!context) {
    throw new Error('useArtworks must be used within an ArtworksProvider')
  }
  return context
}
