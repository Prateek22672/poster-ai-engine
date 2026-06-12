import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { createServerClient } from '@/lib/supabase/client';
import { cached } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await cached('insights:summary', 15, async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (createServerClient() as any).rpc('api_usage_summary');
      if (error) throw new Error(error.message);
      return data;
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'failed' }, { status: 500 });
  }
}
