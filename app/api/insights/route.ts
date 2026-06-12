import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { cached } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Cached for 15s — repeat loads are instant instead of hitting the DB each time.
    const data = await cached('insights:summary', 15, async () => {
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('api_usage_summary');
      if (error) throw new Error(error.message);
      return data;
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load insights';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
