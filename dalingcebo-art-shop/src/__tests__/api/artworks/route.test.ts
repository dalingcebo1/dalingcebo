import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/artworks/[id]/route'
import * as artworkStore from '@/lib/artworkStore'
import { Artwork } from '@/types/artwork'

// Mock the artworkStore module
vi.mock('@/lib/artworkStore')

// Mock the Supabase client
vi.mock('@/lib/db/supabase', () => ({
  createServiceRoleClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}))

describe('GET /api/artworks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 when id is not numeric', async () => {
    const request = new Request('http://localhost:3000/api/artworks/invalid')
    const context = {
      params: Promise.resolve({ id: 'invalid' }),
    }

    const response = await GET(request, context)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.message).toContain('Invalid')
  })

  it('should return 404 when artwork is not found', async () => {
    // Mock getArtworkById to return undefined
    vi.mocked(artworkStore.getArtworkById).mockResolvedValue(undefined)

    const request = new Request('http://localhost:3000/api/artworks/999')
    const context = {
      params: Promise.resolve({ id: '999' }),
    }

    const response = await GET(request, context)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.message).toBe('Artwork not found')
  })

  it('should return 200 with artwork data when found', async () => {
    const mockArtwork: Artwork = {
      id: 1,
      title: 'Test Artwork',
      artist: 'Test Artist',
      price: 100,
      category: 'Painting',
      scale: 'large',
      size: '20x30',
      year: 2023,
      medium: 'Oil',
      description: 'Test description',
      details: 'Test details',
      inStock: true,
      edition: 'Limited',
      image: 'test.jpg',
      images: ['test.jpg'],
      tags: ['test'],
      inventory: 5,
      videos: [],
    }

    // Mock getArtworkById to return the artwork
    vi.mocked(artworkStore.getArtworkById).mockResolvedValue(mockArtwork)

    const request = new Request('http://localhost:3000/api/artworks/1')
    const context = {
      params: Promise.resolve({ id: '1' }),
    }

    const response = await GET(request, context)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(mockArtwork)
    expect(artworkStore.getArtworkById).toHaveBeenCalledWith(1)
  })

  it('should return 500 when unexpected error occurs', async () => {
    // Mock getArtworkById to throw an unexpected error
    vi.mocked(artworkStore.getArtworkById).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new Request('http://localhost:3000/api/artworks/1')
    const context = {
      params: Promise.resolve({ id: '1' }),
    }

    const response = await GET(request, context)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.message).toBe('Database connection failed')
  })
})
