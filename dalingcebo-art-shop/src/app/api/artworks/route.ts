import { NextResponse } from 'next/server';
import { readArtworks, upsertArtwork } from '@/lib/artworkStore';
import { sanitizeArtworkPayload, ensureAdminRequest } from './helpers';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const artworks = await readArtworks();
    return NextResponse.json(artworks);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load artworks';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    ensureAdminRequest(request);
    const payload = sanitizeArtworkPayload(await request.json());
    const created = await upsertArtwork(payload);
    
    logger.info('Artwork created', {
      method: 'POST',
      route: '/api/artworks',
      artworkId: created.id,
      status: 201,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create artwork';
    const lower = message.toLowerCase();
    const status = lower.includes('unauthorized')
      ? 401
      : lower.includes('missing') || lower.includes('must')
        ? 400
        : 500;
    
    logger.error('Failed to create artwork', {
      method: 'POST',
      route: '/api/artworks',
      status,
      error: message,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json({ message }, { status });
  }
}
