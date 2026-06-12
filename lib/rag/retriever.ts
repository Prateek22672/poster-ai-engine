import { createServerClient } from '@/lib/supabase/client';
import { generateEmbedding } from './embedder';
import type { CallUsage } from '@/lib/ai/cost';
import type { RAGSearchResult } from '@/types/rag';
import type { PosterCategory, PosterStyle } from '@/types/poster';

/**
 * Search design templates using semantic similarity.
 * Returns the most relevant design systems for the given query.
 */
export async function searchDesignTemplates(
  queryText: string,
  options: {
    category?: PosterCategory;
    style?: PosterStyle;
    limit?: number;
    threshold?: number;
  } = {},
  usage?: CallUsage[]
): Promise<RAGSearchResult[]> {
  const { limit = 5, threshold = 0.5 } = options;

  // Generate embedding for the query
  const embedding = await generateEmbedding(queryText, usage);

  // Vector similarity search via Supabase RPC
  const supabase = createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('search_design_templates', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit * 2,
  });

  if (error) {
    console.error('[RAG] search_design_templates error:', error);
    return [];
  }

  let results = (data ?? []) as RAGSearchResult[];

  // Optional category/style filters (post-search)
  if (options.category) {
    results = results.filter((r) => r.industry === options.category);
  }
  if (options.style) {
    results = results.filter((r) => r.style === options.style);
  }

  return results.slice(0, limit);
}

/**
 * Format retrieved templates into a concise context string for the AI.
 */
export function formatTemplatesForAI(templates: RAGSearchResult[]): string {
  if (!templates.length) return 'No specific templates retrieved. Use general design principles.';

  return templates
    .map((t, i) => {
      const m = t.metadata;
      return [
        `Template ${i + 1} (${t.industry}/${t.style}, similarity: ${t.similarity.toFixed(2)}):`,
        `  Layout: headline at ${m.headline_position}, CTA at ${m.cta_position}`,
        `  Fonts: ${m.font_pair.join(' + ')}`,
        `  Palette: ${m.palette.join(', ')}`,
        `  Spacing: ${m.spacing_style}`,
        `  Notes: ${m.composition_notes}`,
        `  Rules: ${m.design_rules.slice(0, 3).join('; ')}`,
      ].join('\n');
    })
    .join('\n\n');
}
