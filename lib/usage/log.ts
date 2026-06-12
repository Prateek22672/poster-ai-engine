import { createServerClient } from '@/lib/supabase/client';
import type { CallUsage } from '@/lib/ai/cost';

/**
 * Persist a batch of API calls to the `api_usage` table.
 * Non-blocking by design — logging must never break a generation.
 */
export async function persistUsage(
  calls: CallUsage[],
  meta: Record<string, unknown> = {}
): Promise<void> {
  if (!calls.length) return;
  try {
    const supabase = createServerClient();
    const rows = calls.map((c) => ({
      provider: c.provider,
      kind: c.label,
      model: c.model || null,
      input_tokens: c.inputTokens,
      output_tokens: c.outputTokens,
      cost_usd: c.costUsd,
      status: c.status,
      meta,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('api_usage') as any).insert(rows);
    if (error) console.error('[Usage] persist error:', error.message);
  } catch (err) {
    console.error('[Usage] persist failed:', err instanceof Error ? err.message : err);
  }
}
