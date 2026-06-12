import { v4 as uuidv4 } from 'uuid';
import { extractIntent } from './intent-extractor';
import { planLayout, generateLayoutVariation } from './layout-planner';
import { searchDesignTemplates } from '@/lib/rag/retriever';
import { searchPosterImage, buildImageQuery } from '@/lib/images/pexels';
import { selectRealEstateLayouts, extractRealEstateContent } from '@/lib/templates/realestate';
import { totalCost, trackEvent, type CallUsage } from '@/lib/ai/cost';
import { persistUsage } from '@/lib/usage/log';
import type { PosterGenerationInput, GeneratedPoster, PosterVariation } from '@/types/poster';

/**
 * Full poster generation pipeline:
 * Input → Intent → Embedding → RAG → Layout Plan → Variations → Output
 */
export async function generatePoster(
  input: PosterGenerationInput
): Promise<GeneratedPoster> {
  console.log('[Orchestrator] Starting generation for:', input.prompt.slice(0, 80));

  // Track real OpenAI token usage + cost across every call this generation makes
  const usage: CallUsage[] = [];

  // 1. Extract structured intent from user prompt
  const intent = await extractIntent(input, usage);
  console.log(`[Orchestrator] Intent extracted: ${intent.category}/${intent.style}`);

  // 2. Build RAG query text from intent
  const ragQuery = [
    `${intent.category} poster`,
    `style: ${intent.style}`,
    `tone: ${intent.tone}`,
    intent.keywords.join(' '),
    `fonts: ${intent.suggestedFonts.join(' ')}`,
  ].join('. ');

  // 3. Retrieve relevant design templates.
  //    Real-estate uses a deterministic template (no RAG needed), so we skip the
  //    embedding call entirely — that means real-estate works even with OpenAI
  //    down / out of credit. For other categories, RAG is best-effort.
  let templates: Awaited<ReturnType<typeof searchDesignTemplates>> = [];
  if (intent.category !== 'realestate') {
    try {
      templates = await searchDesignTemplates(ragQuery, {
        category: intent.category,
        limit: 3,
        threshold: 0.4,
      }, usage);
    } catch (err) {
      console.warn('[Orchestrator] RAG skipped (continuing without templates):',
        err instanceof Error ? err.message : err);
    }
  }
  console.log(`[Orchestrator] Retrieved ${templates.length} design templates`);

  // 3b. Hero photo: use the client-supplied URL if given, else fetch from Pexels.
  let heroImage: Awaited<ReturnType<typeof searchPosterImage>> = null;
  if (input.heroImageUrl?.trim()) {
    const u = input.heroImageUrl.trim();
    heroImage = { url: u, rawUrl: u, width: 1080, height: 1350, avgColor: '#222222', photographer: '', photographerUrl: '', alt: 'client image' };
    console.log('[Orchestrator] Using client-supplied hero image');
  } else {
    const imageQuery = buildImageQuery(intent.category, intent.keywords);
    heroImage = await searchPosterImage(imageQuery, 'portrait');
    trackEvent(usage, 'image-search', 'pexels', heroImage ? 'ok' : 'error');
    console.log(
      heroImage
        ? `[Orchestrator] Hero image: "${imageQuery}" -> ${heroImage.rawUrl}`
        : `[Orchestrator] No hero image (query: "${imageQuery}")`
    );
  }

  // 4. Build the primary layout + variations.
  //    Real-estate uses DETERMINISTIC archetypes — we produce 3 DIFFERENT layouts
  //    (left / overlay / top-band / centered) so the user picks; no gpt-4o cost.
  //    Other categories use the AI planner + programmatic palette variations.
  let primaryLayout;
  let variations: PosterVariation[];
  if (intent.category === 'realestate') {
    const content = extractRealEstateContent(input, intent);
    const designs = selectRealEstateLayouts(content, heroImage?.url, 3);
    primaryLayout = designs[0].layout;
    variations = designs.slice(1).map((d) => ({ id: uuidv4(), label: d.label, layout: d.layout }));
    console.log(`[Orchestrator] Real-estate: ${designs.length} distinct archetypes (${designs.map((d) => d.label).join(', ')})`);
  } else {
    primaryLayout = await planLayout(intent, templates, input, heroImage, usage);
    variations = [
      { id: uuidv4(), label: 'Alternative Palette', layout: generateLayoutVariation(primaryLayout, 1) },
      { id: uuidv4(), label: 'High Contrast', layout: generateLayoutVariation(primaryLayout, 2) },
    ];
  }
  console.log('[Orchestrator] Primary layout generated:', primaryLayout.id);

  const total = totalCost(usage);
  const result: GeneratedPoster = {
    layout: primaryLayout,
    variations,
    templateId: templates[0]?.template_id,
    prompt: input.prompt,
    usage: { calls: usage, totalCostUsd: total },
  };

  // Persist the usage log (non-blocking — never break generation on a log failure)
  void persistUsage(usage, {
    flow: 'generate',
    prompt: input.prompt.slice(0, 120),
    category: intent.category,
  });

  console.log(
    `[Orchestrator] Generation complete. TOTAL COST THIS GENERATION: $${total.toFixed(6)} ` +
    `(${usage.map((u) => `${u.label}=$${u.costUsd.toFixed(6)}`).join(', ')})`
  );
  return result;
}

/**
 * Regenerate only one variation with different AI params (e.g., user-requested regen)
 */
export async function regenerateVariation(
  input: PosterGenerationInput,
  variationIndex: 1 | 2 | 3
): Promise<PosterVariation> {
  const intent = await extractIntent(input);
  const ragQuery = `${intent.category} ${intent.style} ${intent.keywords.join(' ')} ${variationIndex}`;
  const templates = await searchDesignTemplates(ragQuery, {
    category: intent.category,
    limit: 2,
  });

  const heroImage = await searchPosterImage(
    buildImageQuery(intent.category, intent.keywords),
    'portrait'
  );

  // Add variation seed to prompt for diversity
  const modifiedInput = {
    ...input,
    prompt: `${input.prompt} [variation ${variationIndex}, different composition from previous]`,
  };

  const layout = await planLayout(intent, templates, modifiedInput, heroImage);

  return {
    id: uuidv4(),
    label: `Variation ${variationIndex}`,
    layout,
  };
}
