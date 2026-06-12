import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { mintServiceKey } from '@/lib/security/service-auth';
import { createServerClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

// List keys (never returns the raw key — only prefix/metadata)
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createServerClient().from('service_keys') as any)
    .select('id, name, prefix, active, allowed_ips, created_at, last_used_at')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

// Create a key — returns the raw key ONCE
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, allowedIps } = (await req.json().catch(() => ({}))) as { name?: string; allowedIps?: string };
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const k = mintServiceKey();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (createServerClient().from('service_keys') as any)
    .insert({ name: name.trim(), key_hash: k.hash, prefix: k.prefix, allowed_ips: allowedIps?.trim() || null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, raw: k.raw, name: name.trim() });
}

// Update a key: revoke/reactivate and/or set the IP allowlist
export async function PATCH(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, active, allowedIps } = (await req.json().catch(() => ({}))) as { id?: string; active?: boolean; allowedIps?: string };
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof active === 'boolean') patch.active = active;
  if (typeof allowedIps === 'string') patch.allowed_ips = allowedIps.trim() || null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (createServerClient().from('service_keys') as any).update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
