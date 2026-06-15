import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { isRealtorEnabled, setRealtorEnabled, logRealtorCall } from '@/lib/realtor/service';
import { getClientIp } from '@/lib/security/guard';
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
  const errors = await countWhere((q: any) => q.in('status', ['error', 'unauthorized']));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const today = await countWhere((q: any) => q.gte('created_at', startOfDay.toISOString()));

  // ── Security: rejected/tampered attempts (bad key, replay, forged signature)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: blockedRows } = await (supabase.from('realtor_calls') as any)
    .select('error_code, created_at, ip')
    .eq('status', 'unauthorized')
    .order('created_at', { ascending: false })
    .limit(100);
  const reasons: Record<string, number> = {};
  for (const r of (blockedRows ?? []) as Array<{ error_code: string | null }>) {
    const k = r.error_code ?? 'UNKNOWN';
    reasons[k] = (reasons[k] ?? 0) + 1;
  }

  return NextResponse.json({
    enabled,
    stats: { total, completed, errors, today },
    security: {
      blocked: (blockedRows ?? []).length,
      reasons,
      lastBlockedAt: (blockedRows ?? [])[0]?.created_at ?? null,
      lastBlockedIp: (blockedRows ?? [])[0]?.ip ?? null,
    },
    calls: calls ?? [],
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { enabled } = (await req.json().catch(() => ({}))) as { enabled?: boolean };
  if (typeof enabled !== 'boolean') return NextResponse.json({ error: 'enabled (boolean) required' }, { status: 400 });

  await setRealtorEnabled(enabled);

  // Audit trail — every on/off flip is logged (who, when, from where) so a
  // mistaken toggle is always traceable in the call log.
  logRealtorCall({
    status: 'admin',
    error_code: enabled ? 'SERVICE_ON' : 'SERVICE_OFF',
    ip: getClientIp(req),
    response: {
      event: enabled
        ? 'Realtor service turned ON by admin — engine now accepts calls.'
        : 'Realtor service turned OFF by admin — engine rejects calls (Realtor falls back to GD).',
    },
  });

  return NextResponse.json({ ok: true, enabled });
}
