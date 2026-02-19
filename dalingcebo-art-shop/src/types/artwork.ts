export type ArtworkScale = 'large' | 'small';
export type VariantType = 'frame' | 'canvas_type';
export type VideoType = 'process' | 'detail' | 'installation' | 'exhibition';

export interface ArtworkVariant {
  id: string;
  artworkId: number;
  variantType: VariantType;
  name: string;
  description?: string;
  priceAdjustment: number; // Can be positive or negative
  processingDays: number; // Additional processing time
  inStock: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArtworkVideo {
  id: string;
  artworkId: number;
  title: string;
  description?: string;
  videoType: VideoType;
  storageUrl?: string; // Supabase Storage URL
  youtubeId?: string; // YouTube video ID
  thumbnailUrl?: string;
  duration?: number; // Duration in seconds
  sortOrder: number;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  price: number; // Base price (without variant adjustments)
  category: string;
  scale: ArtworkScale;
  size: string;
  year: number;
  medium: string;
  description: string;
  details: string;
  inStock: boolean;
  edition: string;
  image: string;
  images: string[];
  tags?: string[];
  inventory?: number;
  baseProcessingDays?: number; // Default processing time
  processingNotes?: string;
  status?: 'available' | 'sold' | 'reserved';
  reservedUntil?: string | null;
  reservedByEmail?: string | null;
  variants?: ArtworkVariant[]; // Available frame/canvas options
  videos?: ArtworkVideo[]; // Associated videos
}
