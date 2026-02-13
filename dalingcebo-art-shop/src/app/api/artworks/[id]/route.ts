import { NextResponse } from 'next/server';
import { deleteArtwork, getArtworkById, upsertArtwork } from '@/lib/artworkStore';
import { sanitizeArtworkPayload, ensureAdminRequest } from '../helpers';
import { createErrorResponse, handleUnknownError, ErrorCodes, ApiErrorResponse } from '../errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function parseId(param: string | string[]): number {
  const id = Number(Array.isArray(param) ? param[0] : param);
  if (Number.isNaN(id) || id < 1) {
    throw new ApiErrorResponse(
      ErrorCodes.INVALID_ID,
      'Invalid artwork ID provided',
      400
    );
  }
  return id;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: param } = await context.params;
    const id = parseId(param);
    const artwork = await getArtworkById(id);
    if (!artwork) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        'Artwork not found',
        404
      );
    }
    return NextResponse.json(artwork);
  } catch (error) {
    return handleUnknownError(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    ensureAdminRequest(request);
    const { id: param } = await context.params;
    const id = parseId(param);
    const payload = sanitizeArtworkPayload(await request.json());
    const updated = await upsertArtwork(payload, id);
    return NextResponse.json(updated);
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
      if (lower.includes('invalid') || lower.includes('missing') || lower.includes('must')) {
        return createErrorResponse(
          ErrorCodes.BAD_REQUEST,
          error.message,
          400
        );
      }
      if (lower.includes('not found')) {
        return createErrorResponse(
          ErrorCodes.NOT_FOUND,
          error.message,
          404
        );
      }
    }
    return handleUnknownError(error);
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    ensureAdminRequest(_request);
    const { id: param } = await context.params;
    const id = parseId(param);
    const removed = await deleteArtwork(id);
    return NextResponse.json(removed);
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
      if (lower.includes('not found')) {
        return createErrorResponse(
          ErrorCodes.NOT_FOUND,
          error.message,
          404
        );
      }
    }
    return handleUnknownError(error);
  }
}
