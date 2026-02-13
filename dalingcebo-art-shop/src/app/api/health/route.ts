import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health check endpoint for monitoring and operational readiness
 * Always returns 200 OK when the application is running
 * 
 * @returns {ok: true, time: ISO timestamp, version: string}
 */
export async function GET() {
  const health = {
    ok: true,
    time: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
