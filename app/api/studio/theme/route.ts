import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { DEFAULT_THEMES, COLOR_LABELS } from '@/lib/templates/realestate/theme';

export const dynamic = 'force-dynamic';

const FILE = join(process.cwd(), 'lib', 'templates', 'realestate', 'theme-overrides.json');

async function readSaved(): Promise<Record<string, Record<string, string>>> {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch { return {}; }
}

// Public read — the studio loads defaults + saved overrides to render the pickers.
export async function GET() {
  return NextResponse.json({ defaults: DEFAULT_THEMES, labels: COLOR_LABELS, saved: await readSaved() });
}

// Password-gated write — persists the full overrides map into the committed JSON.
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, Record<string, string>> | null;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Expected an object of { templateId: { colorKey: value } }' }, { status: 400 });
  }
  try {
    await fs.writeFile(FILE, JSON.stringify(body, null, 2) + '\n', 'utf8');
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Vercel's filesystem is read-only — saving only works on a local dev machine.
    return NextResponse.json({ error: 'Could not write the file (production filesystem is read-only — edit & save locally, then commit).', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
