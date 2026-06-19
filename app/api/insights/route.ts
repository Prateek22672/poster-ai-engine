import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { cached } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/** Realtor-integration counters straight from the realtor_calls audit table. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function realtorSummary(supabase: any) {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const count = async (build: (q: unknown) => unknown) => {
    const { count } = await (build(supabase.from('realtor_calls').select('id', { count: 'exact', head: true })) as any);
    return count ?? 0;
  };
  const [requests, completed, errors, blocked, today] = await Promise.all([
    count((q: any) => q.in('status', ['completed', 'error', 'disabled'])),
    count((q: any) => q.eq('status', 'completed')),
    count((q: any) => q.eq('status', 'error')),
    count((q: any) => q.eq('status', 'unauthorized')),
    count((q: any) => q.in('status', ['completed', 'error', 'disabled']).gte('created_at', startOfDay.toISOString())),
  ]);

  // posters delivered + render timing (from the completed rows)
  const { data: comp } = await supabase
    .from('realtor_calls')
    .select('posters_count, total_ms, created_at')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1000);
  const rows = (comp ?? []) as Array<{ posters_count: number; total_ms: number | null }>;
  const posters = rows.reduce((s, r) => s + (r.posters_count ?? 0), 0);
  const times = rows.map((r) => r.total_ms).filter((n): n is number => n != null && n > 0);
  const avgMs = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const avgPerPosterMs = posters > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / Math.max(1, posters)) : 0;

  return { requests, completed, errors, blocked, today, posters, avgMs, avgPerPosterMs, lastMs: times[0] ?? 0 };
}

export async function GET() {
  try {
    // Cached for 15s — repeat loads are instant instead of hitting the DB each time.
    const data = await cached('insights:summary', 15, async () => {
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: usage, error } = await (supabase as any).rpc('api_usage_summary');
      if (error) throw new Error(error.message);
      const realtor = await realtorSummary(supabase);
      return { ...usage, realtor };
    });
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load insights';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
