const ARTWORK_PLACEHOLDERS = {
  card: 'https://placehold.co/840x1120.png?text=Artwork',
  thumb: 'https://placehold.co/420x560.png?text=Preview',
  admin: 'https://placehold.co/200x200.png?text=No+Image'
} as const

const DEFAULT_ASPECT_RATIO = 0.8

export type ArtworkPlaceholderVariant = keyof typeof ARTWORK_PLACEHOLDERS

interface ImageLike {
  image?: string | null
  images?: string[] | null
}

export function getArtworkPlaceholder(variant: ArtworkPlaceholderVariant = 'card'): string {
  return ARTWORK_PLACEHOLDERS[variant]
}

export function getArtworkPrimaryImage<T extends ImageLike>(
  artwork: T | null | undefined,
  variant: ArtworkPlaceholderVariant = 'card'
): string {
  if (!artwork) {
    return ARTWORK_PLACEHOLDERS[variant]
  }

  const candidates: string[] = []
  if (artwork.image) candidates.push(artwork.image)
  if (Array.isArray(artwork.images)) {
    candidates.push(...artwork.images.filter(Boolean))
  }

  return candidates.find(Boolean) ?? ARTWORK_PLACEHOLDERS[variant]
}

export function getArtworkAspectRatio(size?: string | null, fallback = DEFAULT_ASPECT_RATIO): number {
  if (!size) return fallback
  const matches = size.replace(/,/g, '.').match(/(\d+(?:\.\d+)?)/g)
  if (!matches || matches.length < 2) {
    return fallback
  }

  const width = parseFloat(matches[0])
  const height = parseFloat(matches[1])

  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return fallback
  }

  const ratio = width / height
  const clamped = Math.min(Math.max(ratio, 0.45), 1.75)
  return Number.isFinite(clamped) ? clamped : fallback
}
