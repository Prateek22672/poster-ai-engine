import type { PosterLayout } from '@/types/poster';
import type { RealEstateContent } from './content';
import { buildCove, coveLabel } from './archetypes/cove';
import { buildOverlay, overlayLabel } from './archetypes/overlay';
import { buildTopBand, topbandLabel } from './archetypes/topband';
import { buildCentered, centeredLabel } from './archetypes/centered';

// Re-exports so callers can import everything real-estate from '@/lib/templates/realestate'
export * from './content';
export * from './toolkit';
export { REALESTATE_TEMPLATE_METADATA } from './rag';

export interface Archetype {
  id: string;
  label: string;
  build: (c: RealEstateContent, url?: string | null) => PosterLayout;
}

// ════════════════════════════════════════════════════════════════
//  ARCHETYPE REGISTRY — add your new archetype here (see GUIDE.md)
// ════════════════════════════════════════════════════════════════
export const ARCHETYPES: Archetype[] = [
  { id: 'cove', label: coveLabel, build: buildCove },
  { id: 'overlay', label: overlayLabel, build: buildOverlay },
  { id: 'topband', label: topbandLabel, build: buildTopBand },
  { id: 'centered', label: centeredLabel, build: buildCentered },
];

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
 * N DIFFERENT archetypes for the same content — the user picks one.
 * `rotate` shifts the starting archetype so repeated generations of the same
 * property don't always lead with the same design.
 */
export function selectRealEstateLayouts(
  c: RealEstateContent,
  url?: string | null,
  count = 3,
  rotate = 0
): Array<{ label: string; layout: PosterLayout }> {
  const start = (hashIndex(c.projectName + c.tagline, ARCHETYPES.length) + rotate) % ARCHETYPES.length;
  const n = Math.min(count, ARCHETYPES.length);
  const out: Array<{ label: string; layout: PosterLayout }> = [];
  for (let i = 0; i < n; i++) {
    const a = ARCHETYPES[(start + i) % ARCHETYPES.length];
    out.push({ label: a.label, layout: a.build(c, url) });
  }
  return out;
}

// Back-compat alias
export const createRealEstateCoveLayout = selectRealEstateLayout;
