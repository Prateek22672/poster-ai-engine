import { createServerClient } from '@/lib/supabase/client';
import { generateEmbeddingsBatch } from './embedder';
import { ALL_TEMPLATES } from '@/lib/templates';
import { persistUsage } from '@/lib/usage/log';
import type { CallUsage } from '@/lib/ai/cost';

/**
 * Seeds all design templates into Supabase with vector embeddings.
 * Run once during setup: POST /api/seed
 */
export async function seedDesignTemplates(): Promise<{
  seeded: number;
  skipped: number;
  errors: string[];
}> {
  const supabase = createServerClient();
  const errors: string[] = [];
  let seeded = 0;
  let skipped = 0;

  console.log(`[Seeder] Seeding ${ALL_TEMPLATES.length} design templates...`);

  // Check which templates already exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('design_templates')
    .select('template_id');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingIds = new Set(((existing ?? []) as any[]).map((e: any) => e.template_id));
  const toSeed = ALL_TEMPLATES.filter((t) => !existingIds.has(t.template_id));

  if (!toSeed.length) {
    console.log('[Seeder] All templates already seeded.');
    return { seeded: 0, skipped: ALL_TEMPLATES.length, errors: [] };
  }

  // Generate embeddings in batch (cheaper than individual calls)
  const texts = toSeed.map((t) => t.embeddingText);
  let embeddings: number[][];
  const usage: CallUsage[] = [];

  try {
    embeddings = await generateEmbeddingsBatch(texts, usage);
    void persistUsage(usage, { flow: 'seed', count: toSeed.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Seeder] Embedding generation failed:', msg);
    return { seeded: 0, skipped: existingIds.size, errors: [msg] };
  }

  // Upsert with embeddings
  for (let i = 0; i < toSeed.length; i++) {
    const template = toSeed[i];
    const embedding = embeddings[i];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('design_templates').upsert({
      template_id: template.template_id,
      industry: template.industry,
      style: template.style,
      layout_type: template.layout_type,
      metadata: template.metadata as unknown as Record<string, unknown>,
      embedding,
    });

    if (error) {
      errors.push(`${template.template_id}: ${error.message}`);
    } else {
      seeded++;
      console.log(`[Seeder] ✓ ${template.template_id}`);
    }
  }

  skipped = existingIds.size;
  console.log(`[Seeder] Done. Seeded: ${seeded}, Skipped: ${skipped}, Errors: ${errors.length}`);

  return { seeded, skipped, errors };
}
