import { NextResponse } from 'next/server';
import { ensureAdminRequest } from '../../artworks/helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Validates the admin key without performing any operations
 * Used by the admin UI to verify credentials before granting access
 */
export async function POST(request: Request) {
  try {
    ensureAdminRequest(request);
    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const errorName = error instanceof Error ? error.name : '';
    // Use error.name to determine the status code
    const status = errorName === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ valid: false, message }, { status });
  }
}
