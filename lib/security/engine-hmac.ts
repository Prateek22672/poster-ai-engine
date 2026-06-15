import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Shared-secret HMAC auth for the Realtor integration (CI4 PHP ↔ this engine).
 * Both sides hold POSTER_ENGINE_API_KEY + POSTER_ENGINE_HMAC_SECRET.
 *
 * Request:  X-Api-Key, X-Timestamp (unix seconds), X-Signature = HMAC(secret, `${ts}.${sha256(rawBody)}`)
 * Response: X-Signature = HMAC(secret, sha256(body))
 */
const WINDOW_SECONDS = 300;

const sha256hex = (s: string) => createHash('sha256').update(s).digest('hex');
const hmacHex = (secret: string, msg: string) => createHmac('sha256', secret).update(msg).digest('hex');

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export interface VerifyResult { ok: boolean; code?: string }

/** Verify a request against the raw body bytes. Order: key → timestamp → signature. */
export function verifyEngineRequest(headers: Headers, rawBody: string): VerifyResult {
  const apiKey = process.env.POSTER_ENGINE_API_KEY ?? '';
  const secret = process.env.POSTER_ENGINE_HMAC_SECRET ?? '';
  if (!apiKey || !secret) return { ok: false, code: 'ENGINE_NOT_CONFIGURED' };

  const reqKey = headers.get('x-api-key') ?? '';
  if (!safeEq(reqKey, apiKey)) return { ok: false, code: 'UNAUTHORIZED' };

  const ts = headers.get('x-timestamp') ?? '';
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum) || Math.abs(Date.now() / 1000 - tsNum) > WINDOW_SECONDS) {
    return { ok: false, code: 'STALE_TIMESTAMP' };
  }

  const sig = headers.get('x-signature') ?? '';
  const expected = hmacHex(secret, `${ts}.${sha256hex(rawBody)}`);
  if (!safeEq(sig, expected)) return { ok: false, code: 'BAD_SIGNATURE' };

  return { ok: true };
}

/** Sign a response body so the Realtor can verify it came from us. */
export function signEngineResponse(body: string): string {
  const secret = process.env.POSTER_ENGINE_HMAC_SECRET ?? '';
  if (!secret) return '';
  return hmacHex(secret, sha256hex(body));
}
