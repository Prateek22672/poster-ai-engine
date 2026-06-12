import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

interface Check { name: string; ok: boolean; detail: string }

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const checks: Check[] = [];

  // Engine (in-process)
  checks.push({ name: 'Design Engine', ok: true, detail: 'running' });

  // Supabase
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r: any = await withTimeout((createServerClient().from('api_usage') as any).select('id').limit(1), 6000);
    checks.push({ name: 'Supabase (DB)', ok: !r?.error, detail: r?.error ? String(r.error.message) : 'connected' });
  } catch (e) {
    checks.push({ name: 'Supabase (DB)', ok: false, detail: e instanceof Error ? e.message : 'error' });
  }

  // OpenAI — models list is free (no token cost); reveals key/quota state
  try {
    const r = await withTimeout(
      fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}` } }),
      8000
    );
    checks.push({
      name: 'OpenAI',
      ok: r.ok,
      detail: r.ok ? 'key valid' : r.status === 401 ? 'invalid key' : r.status === 429 ? 'quota/limit (429)' : `HTTP ${r.status}`,
    });
  } catch (e) {
    checks.push({ name: 'OpenAI', ok: false, detail: e instanceof Error ? e.message : 'error' });
  }

  // Cloudinary
  try {
    const { v2 } = await import('cloudinary');
    v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const ping = await withTimeout(v2.api.ping(), 8000);
    checks.push({ name: 'Cloudinary', ok: ping?.status === 'ok', detail: ping?.status ?? 'unknown' });
  } catch (e) {
    checks.push({ name: 'Cloudinary', ok: false, detail: e instanceof Error ? e.message : 'error' });
  }

  // Pexels
  try {
    const r = await withTimeout(
      fetch('https://api.pexels.com/v1/search?query=building&per_page=1', { headers: { Authorization: process.env.PEXELS_API_KEY ?? '' } }),
      8000
    );
    checks.push({ name: 'Pexels (images)', ok: r.ok, detail: r.ok ? 'ok' : `HTTP ${r.status}` });
  } catch (e) {
    checks.push({ name: 'Pexels (images)', ok: false, detail: e instanceof Error ? e.message : 'error' });
  }

  return NextResponse.json({ checks });
}
