import { NextResponse } from 'next/server';
import { readArtworks, upsertArtwork } from '@/lib/artworkStore';
import { sanitizeArtworkPayload, ensureAdminRequest } from './helpers';
import { createErrorResponse, handleUnknownError, ErrorCodes } from './errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const artworks = await readArtworks();
    return NextResponse.json(artworks);
  } catch (error) {
    return handleUnknownError(error);
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
    if (error instanceof Error) {
      const lower = error.message.toLowerCase();
      if (error.name === 'UNAUTHORIZED' || lower.includes('unauthorized')) {
        return createErrorResponse(
          ErrorCodes.UNAUTHORIZED,
          error.message,
          401
        );
      }
      if (lower.includes('missing') || lower.includes('must')) {
        return createErrorResponse(
          ErrorCodes.BAD_REQUEST,
          error.message,
          400
        );
      }
    }
    return handleUnknownError(error);
  }
}
