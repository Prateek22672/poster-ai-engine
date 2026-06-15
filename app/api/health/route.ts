import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Liveness check — no auth, cheap. Lets the Realtor fail fast / fall back to GD. */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'poster-engine',
    version: process.env.ENGINE_VERSION ?? '1.0.0',
    time: Math.floor(Date.now() / 1000),
  });
}
