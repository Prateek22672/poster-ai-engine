import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { isAdminAuthed } from '@/lib/security/admin-auth';
import { specToRag, type TemplateSpec } from '@/lib/templates/realestate/spec';

export const dynamic = 'force-dynamic';

const FILE = join(process.cwd(), 'lib', 'templates', 'realestate', 'custom-templates.json');

async function readSpecs(): Promise<TemplateSpec[]> {
  try { return JSON.parse(await fs.readFile(FILE, 'utf8')); } catch { return []; }
}

// Public read — the studio lists existing custom templates.
export async function GET() {
  return NextResponse.json({ templates: await readSpecs() });
}

// Password-gated upsert — saves the FULL list, derives a RAG reference for each
// so saved layouts feed the engine's design knowledge (re-seed to embed them).
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { templates?: TemplateSpec[] } | null;
  const templates = body?.templates;
  if (!Array.isArray(templates)) return NextResponse.json({ error: 'Expected { templates: TemplateSpec[] }' }, { status: 400 });

  // Basic validation so a broken spec can never be saved.
  for (const t of templates) {
    if (!t.id || !t.label || !Array.isArray(t.blocks)) {
      return NextResponse.json({ error: `Invalid template "${t?.id ?? '?'}" — needs id, label and blocks[]` }, { status: 400 });
    }
    t.custom = true;
  }

  try {
    await fs.writeFile(FILE, JSON.stringify(templates, null, 2) + '\n', 'utf8');
    // The derived RAG references (so the caller can confirm they were registered).
    const rag = templates.map((t) => ({ id: t.id, label: t.label, rag: specToRag(t) }));
    return NextResponse.json({ ok: true, count: templates.length, rag });
  } catch (e) {
    return NextResponse.json({ error: 'Could not write the file (production filesystem is read-only — build templates locally, then commit).', detail: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
