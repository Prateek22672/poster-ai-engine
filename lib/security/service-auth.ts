import { createHash, randomBytes } from 'node:crypto';
import { createServerClient } from '@/lib/supabase/client';
import { getClientIp } from '@/lib/security/guard';

/**
 * Per-client service API keys for the /api/v1 endpoints (e.g. their PHP backend).
 * We store only the SHA-256 hash of each key — the raw key is shown once at creation.
 */

export interface MintedKey {
  raw: string;   // show this to the client ONCE; never stored
  hash: string;  // stored
  prefix: string; // shown for identification
}

export function mintServiceKey(): MintedKey {
  const raw = 'sk_live_' + randomBytes(24).toString('hex'); // sk_live_ + 48 hex
  const hash = createHash('sha256').update(raw).digest('hex');
  const prefix = raw.slice(0, 16) + '…';
  return { raw, hash, prefix };
}

export interface VerifiedKey {
  ok: boolean;
  keyId?: string;
  name?: string;
}

/** Verify the Authorization: Bearer <key> header against active service keys. */
export async function verifyServiceKey(req: Request): Promise<VerifiedKey> {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return { ok: false };

  const hash = createHash('sha256').update(token).digest('hex');
  try {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('service_keys') as any)
      .select('id, name, active, allowed_ips')
      .eq('key_hash', hash)
      .maybeSingle();
    if (!data || !data.active) return { ok: false };

    // IP allowlist — if set, the key only works from those IPs (defeats a stolen key)
    if (typeof data.allowed_ips === 'string' && data.allowed_ips.trim()) {
      const allowed = data.allowed_ips.split(',').map((s: string) => s.trim()).filter(Boolean);
      const ip = getClientIp(req);
      if (!allowed.includes(ip)) {
        console.warn(`[service-auth] IP ${ip} not allowed for key "${data.name}"`);
        return { ok: false };
      }
    }

    // touch last_used_at (fire-and-forget)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.from('service_keys') as any)
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    return { ok: true, keyId: data.id as string, name: data.name as string };
  } catch (err) {
    console.error('[service-auth] verify failed:', err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
