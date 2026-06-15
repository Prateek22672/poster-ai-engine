import { createServerClient } from '@/lib/supabase/client';

/**
 * Realtor service control + call logging.
 * - on/off kill-switch (engine_settings.realtor_enabled)
 * - logs every /api/posters/generate call (request summary + response) for the admin
 */

let enabledCache: { at: number; value: boolean } | null = null;

export async function isRealtorEnabled(): Promise<boolean> {
  const now = Date.now();
  if (enabledCache && now - enabledCache.at < 15_000) return enabledCache.value;
  try {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('engine_settings') as any).select('realtor_enabled').eq('id', 1).maybeSingle();
    const value = data?.realtor_enabled !== false; // default ON
    enabledCache = { at: now, value };
    return value;
  } catch {
    return true; // fail-open
  }
}

export async function setRealtorEnabled(value: boolean): Promise<void> {
  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('engine_settings') as any).update({ realtor_enabled: value, updated_at: new Date().toISOString() }).eq('id', 1);
  enabledCache = { at: Date.now(), value };
}

export interface RealtorCallLog {
  request_id?: string | null;
  tenant_id?: string | null;
  status: string;        // completed | error | disabled | unauthorized
  error_code?: string | null;
  posters_count?: number;
  images_count?: number;
  logos_count?: number;
  total_ms?: number;
  property?: Record<string, unknown> | null;
  response?: Record<string, unknown> | null;
  ip?: string | null;
}

/** Fire-and-forget — logging must never break a request. */
export function logRealtorCall(rec: RealtorCallLog): void {
  (async () => {
    try {
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('realtor_calls') as any).insert({
        request_id: rec.request_id ?? null,
        tenant_id: rec.tenant_id ?? null,
        status: rec.status,
        error_code: rec.error_code ?? null,
        posters_count: rec.posters_count ?? 0,
        images_count: rec.images_count ?? 0,
        logos_count: rec.logos_count ?? 0,
        total_ms: rec.total_ms ?? null,
        property: rec.property ?? null,
        response: rec.response ?? null,
        ip: rec.ip ?? null,
      });
    } catch (e) {
      console.error('[realtor] log failed:', e instanceof Error ? e.message : e);
    }
  })();
}
