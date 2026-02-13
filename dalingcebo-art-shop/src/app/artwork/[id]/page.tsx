import { notFound } from 'next/navigation';
import { getArtworkById } from '@/lib/artworkStore';
import ArtworkPageClient from './ArtworkPageClient';
import ErrorPage from './ErrorPage';
import type { ApiError } from '@/app/api/artworks/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchArtwork(id: string) {
  try {
    // First try to get from database directly (server-side)
    const numericId = Number(id);
    if (Number.isNaN(numericId) || numericId < 1) {
      return { error: { code: 'invalid_id', message: 'Invalid artwork ID' } as ApiError['error'] };
    }

    const artwork = await getArtworkById(numericId);
    if (!artwork) {
      return { error: { code: 'not_found', message: 'Artwork not found' } as ApiError['error'] };
    }

    return { artwork };
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return { 
      error: { 
        code: 'internal_error', 
        message: 'An unexpected error occurred while loading the artwork' 
      } as ApiError['error'] 
    };
  }
}

export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params;
  const result = await fetchArtwork(id);

  // Handle not_found with Next.js notFound()
  if (result.error && result.error.code === 'not_found') {
    notFound();
  }

  // Handle other errors with a friendly error page
  if (result.error) {
    return <ErrorPage error={result.error} />;
  }

  // Ensure artwork is present before rendering
  if (!result.artwork) {
    return <ErrorPage error={{ 
      code: 'internal_error', 
      message: 'Failed to load artwork data' 
    }} />;
  }

  // Render the client component with the fetched artwork
  return <ArtworkPageClient artwork={result.artwork} />;
}
