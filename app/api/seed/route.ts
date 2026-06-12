import { NextRequest, NextResponse } from 'next/server';
import { seedDesignTemplates } from '@/lib/rag/seeder';

export const maxDuration = 120; // seeding can take a while

export async function POST(_req: NextRequest) {
  // Basic auth check — seed endpoint should be protected
  const authHeader = _req.headers.get('authorization');
  const expectedToken = process.env.SEED_SECRET ?? 'seed-secret';
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await seedDesignTemplates();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[API/seed] Error:', err);
    const message = err instanceof Error ? err.message : 'Seeding failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
