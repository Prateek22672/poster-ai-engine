import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { isRealtorEnabled, setRealtorEnabled } from '@/lib/realtor/service';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerClient();
  const enabled = await isRealtorEnabled();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: calls } = await (supabase.from('realtor_calls') as any)
    .select('id, created_at, request_id, tenant_id, status, error_code, posters_count, images_count, logos_count, total_ms, property, response, ip')
    .order('created_at', { ascending: false })
    .limit(40);

  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const countWhere = async (build: (q: unknown) => unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (build((supabase.from('realtor_calls') as any).select('id', { count: 'exact', head: true })) as any);
    return count ?? 0;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const total = await countWhere((q: any) => q);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completed = await countWhere((q: any) => q.eq('status', 'completed'));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const today = await countWhere((q: any) => q.gte('created_at', startOfDay.toISOString()));

  return NextResponse.json({
    enabled,
    stats: { total, completed, errors: total - completed, today },
    calls: calls ?? [],
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { enabled } = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  if (typeof enabled !== 'boolean') return NextResponse.json({ error: 'enabled (boolean) required' }, { status: 400 });
  await setRealtorEnabled(enabled);
  return NextResponse.json({ ok: true, enabled });
}
