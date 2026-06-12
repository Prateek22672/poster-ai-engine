import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

/**
 * Minimal stateless admin auth: a single ADMIN_PASSWORD gates /admin.
 * The session cookie holds sha256("salt::password") so it can be verified
 * without any session store. No users table needed (one operator).
 */
export const ADMIN_COOKIE = 'admin_session';

export function adminToken(): string {
  const pw = process.env.ADMIN_PASSWORD ?? '';
  return createHash('sha256').update(`poster-admin::${pw}`).digest('hex');
}

export function verifyAdminPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  return expected.length > 0 && pw === expected;
}

export function isAdminAuthed(req: NextRequest): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  const v = req.cookies.get(ADMIN_COOKIE)?.value;
  return !!v && v === adminToken();
}
