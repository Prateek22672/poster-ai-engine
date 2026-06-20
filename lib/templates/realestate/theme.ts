import overrides from './theme-overrides.json';

/**
 * Theme layer — every archetype reads its colours from here instead of
 * hard-coding them. Defaults below reproduce the original look exactly, so
 * with an empty overrides file nothing changes. The studio (/preview/[id])
 * edits these and saves them into theme-overrides.json (committed to the repo),
 * which means colours/buttons are tunable from code OR the UI.
 */
export type ColorMap = Record<string, string>;

// Per-archetype default palettes (keys match what each archetype uses).
export const DEFAULT_THEMES: Record<string, ColorMap> = {
  cove: { panel: '#F6F4EF', navy: '#0B2239', gold: '#A9803F', teal: '#2F6E8F', muted: '#6A7480', cta: '#0B2239', ctaText: '#FFFFFF' },
  overlay: { scrim: '#06101C', gold: '#D8B26A', white: '#FFFFFF', muted: 'rgba(255,255,255,0.72)', cta: '#D8B26A', ctaText: '#1A1206' },
  topband: { navy: '#0E2436', gold: '#D8B26A', white: '#FFFFFF', cta: '#D8B26A', ctaText: '#1A1206' },
  centered: { scrim: '#06101C', gold: '#D8B26A', white: '#FFFFFF', cta: '#D8B26A', ctaText: '#1A1206' },
  cinematic: { scrim: '#05080D', gold: '#CBA85E', white: '#FFFFFF', soft: 'rgba(255,255,255,0.82)' },
  gallery: { navy: '#0B1A2B', gold: '#D8B26A', white: '#FFFFFF', muted: 'rgba(255,255,255,0.7)', cta: '#D8B26A', ctaText: '#1A1206' },
  brochure: { bg: '#161009', gold: '#C9A24B', white: '#FFFFFF', muted: 'rgba(255,255,255,0.6)', cta: '#C9A24B', ctaText: '#161009' },
  minimal: { paper: '#FBFAF7', ink: '#262626', gold: '#C2A35A', muted: '#8A8A8A', cta: '#262626', ctaText: '#FFFFFF' },
  splitpanel: { panel: '#15110C', gold: '#C8A85A', white: '#FFFFFF', muted: 'rgba(255,255,255,0.6)', cta: '#C8A85A', ctaText: '#15110C' },
  glasscards: { scrim: '#06101C', gold: '#D8B26A', white: '#FFFFFF', muted: 'rgba(255,255,255,0.78)', card: 'rgba(255,255,255,0.10)', cta: '#D8B26A', ctaText: '#1A1206' },
  framed: { scrim: '#0A1622', gold: '#CBA85E', white: '#FFFFFF', muted: 'rgba(255,255,255,0.75)', cta: '#CBA85E', ctaText: '#1A1206' },
  magazine: { col: '#14233A', gold: '#D8B26A', white: '#FFFFFF', muted: 'rgba(255,255,255,0.6)', cta: '#D8B26A', ctaText: '#14233A' },
  ferro: { gold: '#C9A24B', white: '#FFFFFF', ink: '#1A1A1A', pill: '#EFE7D6', muted: 'rgba(255,255,255,0.85)' },
};

// Fonts bundled for the server renderer (and loadable in the studio preview).
// Each template has a default headline font; the studio can override it.
export const FONTS = [
  'Playfair Display', 'Cormorant Garamond', 'Oswald', 'Syne', 'Switzer',
  'Space Grotesk', 'Host Grotesk', 'Sansita Swashed', 'Climate Crisis', 'Gnomon', 'Karrik', 'Violet Sans',
  'LT Avocado', 'LT Beverage', 'LT Crow', 'LT Delilah', 'LT Humor', 'LT Institute', 'LT Makeup',
  'LT Oval', 'LT Renovate', 'LT Saeada', 'LT Sonoma', 'LT Soul', 'LT Spaz', 'LT Superior', 'LT Wave',
] as const;
export const DEFAULT_FONT: Record<string, string> = {
  cove: 'LT Soul', overlay: 'Space Grotesk', topband: 'Playfair Display', centered: 'Cormorant Garamond',
  cinematic: 'Cormorant Garamond', gallery: 'LT Superior', brochure: 'LT Soul',
  minimal: 'Host Grotesk', splitpanel: 'LT Wave', glasscards: 'Syne', framed: 'Cormorant Garamond',
  magazine: 'Space Grotesk', ferro: 'LT Soul',
};

// Friendly labels for the studio's colour pickers.
export const COLOR_LABELS: Record<string, string> = {
  panel: 'Panel', navy: 'Primary', gold: 'Accent', teal: 'Secondary', muted: 'Muted',
  scrim: 'Overlay', white: 'Text', soft: 'Soft text', cta: 'Button fill', ctaText: 'Button text', bg: 'Background',
  paper: 'Paper', ink: 'Ink', col: 'Column', card: 'Card',
};

const SAVED = overrides as Record<string, ColorMap>;

/** Resolve a theme: defaults ⊕ saved overrides ⊕ live (studio) override. Always
 *  includes `font` (the headline typeface) so templates can read t.font. */
export function getTheme(id: string, live?: ColorMap | null): ColorMap {
  const base = { ...(DEFAULT_THEMES[id] ?? {}), font: DEFAULT_FONT[id] ?? 'Playfair Display' };
  return { ...base, ...(SAVED[id] ?? {}), ...(live ?? {}) };
}
