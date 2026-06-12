import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminToken, verifyAdminPassword } from '@/lib/security/admin-auth';

export async function POST(req: NextRequest) {
  let password = '';
  try {
    ({ password } = (await req.json()) as { password: string });
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Admin not configured (set ADMIN_PASSWORD)' }, { status: 503 });
  }
  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
