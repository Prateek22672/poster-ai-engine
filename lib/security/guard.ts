import { createServerClient } from '@/lib/supabase/client';

/**
 * Defense-in-depth guards for the AI endpoints.
 *
 * IMPORTANT: these protect OUR backend endpoint from abuse and runaway spend.
 * They do NOT protect a LEAKED key — a stolen key is used directly against
 * api.openai.com, bypassing this code. The defenses against a leaked key are
 * OpenAI-side: rotate the key, enable IP allowlisting, set a project budget.
 * (See security.txt.)
 */

const RATE_LIMIT_PER_MIN = Number(process.env.RATE_LIMIT_PER_MIN ?? 12);
const DAILY_BUDGET_USD = Number(process.env.DAILY_BUDGET_USD ?? 5);
const MAX_PROMPT_LEN = Number(process.env.MAX_PROMPT_LEN ?? 2000);
const ALLOWED_CATEGORIES = ['fitness', 'sale', 'event', 'realestate', 'restaurant'];

// ── Client IP (best-effort, behind proxies) ──────────────────────
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// ── Rate limiting (in-memory sliding window, per Node instance) ──
// For multi-instance / serverless, swap this for Upstash Redis (same interface).
const hits = new Map<string, number[]>();
export function checkRateLimit(
  key: string,
  limit = RATE_LIMIT_PER_MIN,
  windowMs = 60_000
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

// ── Daily spend kill-switch (DB-backed via api_usage; 30s cache) ─
let budgetCache: { at: number; spent: number } | null = null;
export async function checkDailyBudget(): Promise<{ ok: boolean; spent: number; cap: number }> {
  const cap = DAILY_BUDGET_USD;
  if (!cap || cap <= 0) return { ok: true, spent: 0, cap: 0 }; // disabled
  const now = Date.now();
  if (budgetCache && now - budgetCache.at < 30_000) {
    return { ok: budgetCache.spent < cap, spent: budgetCache.spent, cap };
  }
  try {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc('api_usage_summary');
    const spent = Number(data?.today?.cost ?? 0);
    budgetCache = { at: now, spent };
    return { ok: spent < cap, spent, cap };
  } catch (err) {
    console.warn('[guard] budget check failed (fail-open):', err instanceof Error ? err.message : err);
    return { ok: true, spent: 0, cap }; // fail-open on a DB hiccup
  }
}

// ── Input validation ─────────────────────────────────────────────
export function validateGenerateInput(
  body: unknown
): { ok: boolean; error?: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request body' };
  const b = body as Record<string, unknown>;
  if (typeof b.prompt !== 'string' || !b.prompt.trim()) return { ok: false, error: 'Prompt is required' };
  if (b.prompt.length > MAX_PROMPT_LEN) return { ok: false, error: `Prompt too long (max ${MAX_PROMPT_LEN} chars)` };
  if (b.category && !ALLOWED_CATEGORIES.includes(b.category as string)) {
    return { ok: false, error: 'Invalid category' };
  }
  // Reject obviously oversized payloads (e.g. abusive base64 reference images)
  const logoLen = typeof b.logoDataUrl === 'string' ? b.logoDataUrl.length : 0;
  const refLen = typeof b.referenceImageBase64 === 'string' ? b.referenceImageBase64.length : 0;
  if (logoLen > 3_000_000 || refLen > 8_000_000) {
    return { ok: false, error: 'Uploaded image too large' };
  }
  return { ok: true };
}

/** Run all request guards in order. Returns null if allowed, or an error response shape. */
export async function guardAiRequest(
  req: Request,
  body: unknown
): Promise<{ status: number; error: string; retryAfter?: number } | null> {
  const ip = getClientIp(req);

  const rl = checkRateLimit(ip);
  if (!rl.ok) {
    return { status: 429, error: 'Too many requests — please slow down.', retryAfter: rl.retryAfter };
  }

  const valid = validateGenerateInput(body);
  if (!valid.ok) return { status: 400, error: valid.error ?? 'Invalid input' };

  const budget = await checkDailyBudget();
  if (!budget.ok) {
    console.warn(`[guard] daily budget reached: $${budget.spent.toFixed(2)} / $${budget.cap}`);
    return { status: 429, error: 'Daily generation limit reached. Please try again tomorrow.' };
  }

  return null; // allowed
}
