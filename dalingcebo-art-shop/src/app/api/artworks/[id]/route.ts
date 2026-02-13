import { NextResponse } from 'next/server';
import { deleteArtwork, getArtworkById, upsertArtwork } from '@/lib/artworkStore';
import { sanitizeArtworkPayload, ensureAdminRequest } from '../helpers';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseId(param: string | string[]): number {
  const id = Number(Array.isArray(param) ? param[0] : param);
  if (Number.isNaN(id)) {
    throw new Error('Invalid artwork id');
  }
  return id;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: param } = await context.params;
    const id = parseId(param);
    const artwork = await getArtworkById(id);
    if (!artwork) {
      return NextResponse.json({ message: 'Artwork not found' }, { status: 404 });
    }
    return NextResponse.json(artwork);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch artwork';
    const status = message.includes('Invalid') ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  let artworkId: number | undefined;
  
  try {
    ensureAdminRequest(request);
    const { id: param } = await context.params;
    const id = parseId(param);
    artworkId = id;
    const payload = sanitizeArtworkPayload(await request.json());
    const updated = await upsertArtwork(payload, id);
    
    logger.info('Artwork updated', {
      method: 'PUT',
      route: `/api/artworks/${id}`,
      artworkId: id,
      status: 200,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update artwork';
    const lower = message.toLowerCase();
    const status = lower.includes('unauthorized')
      ? 401
      : lower.includes('invalid') || lower.includes('missing') || lower.includes('must')
        ? 400
        : lower.includes('not found')
          ? 404
          : 500;
    
    logger.error('Failed to update artwork', {
      method: 'PUT',
      route: `/api/artworks/${artworkId || 'unknown'}`,
      artworkId,
      status,
      error: message,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  let artworkId: number | undefined;
  
  try {
    ensureAdminRequest(_request);
    const { id: param } = await context.params;
    const id = parseId(param);
    artworkId = id;
    const removed = await deleteArtwork(id);
    
    logger.info('Artwork deleted', {
      method: 'DELETE',
      route: `/api/artworks/${id}`,
      artworkId: id,
      status: 200,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json(removed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete artwork';
    const lower = message.toLowerCase();
    const status = lower.includes('unauthorized')
      ? 401
      : lower.includes('invalid')
        ? 400
        : lower.includes('not found')
          ? 404
          : 500;
    
    logger.error('Failed to delete artwork', {
      method: 'DELETE',
      route: `/api/artworks/${artworkId || 'unknown'}`,
      artworkId,
      status,
      error: message,
      duration: Date.now() - startTime,
    });
    
    return NextResponse.json({ message }, { status });
  }
}
