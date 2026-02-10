export type StandaloneVideoType = 'interview' | 'studio_tour' | 'exhibition' | 'marketing' | 'tutorial';

export interface StandaloneVideo {
  id: string;
  title: string;
  description?: string;
  videoType: StandaloneVideoType;
  storageUrl?: string; // Supabase Storage URL
  youtubeId?: string; // YouTube video ID
  thumbnailUrl?: string;
  duration?: number; // Duration in seconds
  sortOrder?: number; // Optional for standalone videos
  isFeatured: boolean;
  published: boolean;
  slug: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
