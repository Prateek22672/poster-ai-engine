import type { PosterLayout } from '@/types/poster';
import type { RealEstateContent } from './content';
import { buildCove, coveLabel } from './archetypes/cove';
import { buildOverlay, overlayLabel } from './archetypes/overlay';
import { buildTopBand, topbandLabel } from './archetypes/topband';
import { buildCentered, centeredLabel } from './archetypes/centered';
import { buildGallery, galleryLabel } from './archetypes/gallery';
import { buildCinematic, cinematicLabel } from './archetypes/cinematic';
import { buildBrochure, brochureLabel } from './archetypes/brochure';
import { buildMinimal, minimalLabel } from './archetypes/minimal';
import { buildSplitPanel, splitpanelLabel } from './archetypes/splitpanel';
import { buildGlassCards, glasscardsLabel } from './archetypes/glasscards';
import { buildFramed, framedLabel } from './archetypes/framed';
import { buildMagazine, magazineLabel } from './archetypes/magazine';
import { buildFerro, ferroLabel } from './archetypes/ferro';
import { buildFromSpec, type TemplateSpec } from './spec';
import customSpecs from './custom-templates.json';

// Re-exports so callers can import everything real-estate from '@/lib/templates/realestate'
export * from './content';
export * from './toolkit';
export * from './spec';
export { REALESTATE_TEMPLATE_METADATA } from './rag';

import type { ColorMap } from './theme';

export interface Archetype {
  id: string;
  label: string;
  build: (c: RealEstateContent, url?: string | null, photos?: string[], theme?: ColorMap) => PosterLayout;
}

// ════════════════════════════════════════════════════════════════
//  ARCHETYPE REGISTRY — add your new archetype here (see GUIDE.md)
// ════════════════════════════════════════════════════════════════
const GALLERY_ID = 'gallery';
export const ARCHETYPES: Archetype[] = [
  { id: 'cove', label: coveLabel, build: buildCove },
  { id: 'overlay', label: overlayLabel, build: buildOverlay },
  { id: 'topband', label: topbandLabel, build: buildTopBand },
  { id: 'centered', label: centeredLabel, build: buildCentered },
  { id: 'cinematic', label: cinematicLabel, build: buildCinematic },
  { id: 'brochure', label: brochureLabel, build: buildBrochure },
  { id: 'minimal', label: minimalLabel, build: buildMinimal },
  { id: 'splitpanel', label: splitpanelLabel, build: buildSplitPanel },
  { id: 'glasscards', label: glasscardsLabel, build: buildGlassCards },
  { id: 'framed', label: framedLabel, build: buildFramed },
  { id: 'magazine', label: magazineLabel, build: buildMagazine },
  { id: 'ferro', label: ferroLabel, build: buildFerro },
  { id: GALLERY_ID, label: galleryLabel, build: buildGallery },
];

// User-built templates (from the studio) — rendered by the generic spec engine.
// Kept in a SEPARATE list so they're previewable/selectable-by-name but DON'T
// enter the random production rotation until promoted.
export const CUSTOM_SPECS = customSpecs as unknown as TemplateSpec[];
export const CUSTOM_ARCHETYPES: Archetype[] = CUSTOM_SPECS.map((spec) => ({
  id: spec.id,
  label: spec.label,
  build: (c, url, photos) => buildFromSpec(spec, c, url, photos),
}));

/** Built-in + custom — for the studio/preview and explicit selection by id. */
export const ALL_ARCHETYPES: Archetype[] = [...ARCHETYPES, ...CUSTOM_ARCHETYPES];
export const findArchetype = (id: string): Archetype | undefined => ALL_ARCHETYPES.find((a) => a.id === id);

// Curated RAG references + one derived from every saved custom template, so the
// engine can reference user-built layouts during generation (re-seed to apply).
import { REALESTATE_TEMPLATE_METADATA as CURATED_RAG } from './rag';
import { specToRag } from './spec';
export const ALL_RAG_METADATA = [...CURATED_RAG, ...CUSTOM_SPECS.map(specToRag)];

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/** One archetype, chosen deterministically per project (consistent per project). */
export function selectRealEstateLayout(c: RealEstateContent, url?: string | null): PosterLayout {
  return ARCHETYPES[hashIndex(c.projectName + c.tagline, ARCHETYPES.length)].build(c, url);
}

/**
 * Map a prompt/keyword to a specific archetype id so the user can ask for a
 * named look ("cinematic", "gallery", "centered" …). Returns null if no hint.
 */
export function archetypeFromText(text?: string | null): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const map: Array<[RegExp, string]> = [
    [/brochure|luxury home|for sale|circular|amenit|checklist/, 'brochure'],
    [/cinematic|dusk|rooftop|skyline/, 'cinematic'],
    [/gallery|collage|multiple photos|grid/, 'gallery'],
    [/overlay|full[-\s]?bleed|full photo/, 'overlay'],
    [/centered|center|minimal|elegant serif/, 'centered'],
    [/top[-\s]?band|banner|header band/, 'topband'],
    [/left column|side panel|editorial|magazine/, 'cove'],
  ];
  for (const [re, id] of map) if (re.test(t)) return id;
  return null;
}

/**
 * N DIFFERENT archetypes for the same content — the user picks one.
 * `rotate` shifts the starting archetype so repeated generations vary.
 * `photos` enables MULTI-PHOTO: ≥2 photos lead with the Photo Gallery.
 * `prefer` (an archetype id, e.g. from a keyword) is placed FIRST.
 */
export function selectRealEstateLayouts(
  c: RealEstateContent,
  url?: string | null,
  count = 3,
  rotate = 0,
  photos?: string[],
  prefer?: string | null,
  themeOverride?: ColorMap | null
): Array<{ label: string; layout: PosterLayout }> {
  const pics = ((photos && photos.length ? photos : url ? [url] : []) as string[]).filter(Boolean);
  const multi = pics.length >= 2;

  const out: Array<{ label: string; layout: PosterLayout }> = [];
  const used = new Set<string>();
  const add = (a: Archetype | undefined) => {
    if (!a || used.has(a.id)) return;
    used.add(a.id);
    const pic = pics.length ? pics[out.length % pics.length] : url ?? null;
    out.push({ label: a.label, layout: a.build(c, pic, pics, themeOverride ?? undefined) });
  };

  if (prefer) add(findArchetype(prefer));                            // requested look first (incl. custom)
  if (multi) add(ARCHETYPES.find((a) => a.id === GALLERY_ID));        // then the multi-photo gallery

  const singles = ARCHETYPES.filter((a) => a.id !== GALLERY_ID);
  const start = (hashIndex(c.projectName + c.tagline, singles.length) + rotate) % singles.length;
  for (let i = 0; out.length < count && i < singles.length; i++) add(singles[(start + i) % singles.length]);
  return out;
}

// Back-compat alias
export const createRealEstateCoveLayout = selectRealEstateLayout;
