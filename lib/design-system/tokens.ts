import type { DesignTokenSet } from '@/types/design';
import type { PosterCategory, PosterStyle } from '@/types/poster';
import { TYPOGRAPHY_PAIRS } from './typography';
import { COLOR_PALETTES } from './colors';
import { SPACING_SYSTEMS } from './spacing';

export const DESIGN_TOKEN_SETS: DesignTokenSet[] = [
  {
    id: 'fitness-aggressive',
    name: 'Fitness Power',
    category: 'fitness',
    style: 'aggressive',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'power-duo')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'fitness-dark-red')!,
    spacing: SPACING_SYSTEMS.compact,
    compositionRules: [
      'Bold headline dominates top 40% of canvas',
      'High-contrast CTA in bottom quarter',
      'Diagonal or dynamic visual elements',
      'Minimal text — max 4 text elements',
      'Use negative space to emphasize power',
    ],
    keyAttributes: ['power', 'intensity', 'high-contrast', 'action-oriented'],
  },
  {
    id: 'fitness-elite',
    name: 'Fitness Elite',
    category: 'fitness',
    style: 'elegant',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'luxury-editorial')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'fitness-gold')!,
    spacing: SPACING_SYSTEMS.balanced,
    compositionRules: [
      'Sophisticated layout with premium feel',
      'Gold accents on dark background',
      'Centered or slightly off-center composition',
      'Clean typography hierarchy',
    ],
    keyAttributes: ['premium', 'elite', 'gold', 'champion'],
  },
  {
    id: 'sale-urgent',
    name: 'Hot Sale',
    category: 'sale',
    style: 'aggressive',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'sale-blast')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'sale-red-hot')!,
    spacing: SPACING_SYSTEMS.compact,
    compositionRules: [
      'Discount percentage as hero element (very large)',
      'Urgency signals: "TODAY ONLY", countdown style',
      'Original price struck through, new price dominant',
      'CTA must be impossible to miss',
    ],
    keyAttributes: ['urgency', 'discount', 'action', 'bold'],
  },
  {
    id: 'sale-luxury',
    name: 'Luxury Sale',
    category: 'sale',
    style: 'luxury',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'luxury-editorial')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'sale-luxury')!,
    spacing: SPACING_SYSTEMS.airy,
    compositionRules: [
      'Exclusive feel — avoid cheap discount aesthetics',
      'Elegant type hierarchy, generous spacing',
      'Gold on black — premium signal',
      'Subtle discount — let quality speak',
    ],
    keyAttributes: ['exclusive', 'premium', 'limited', 'luxury'],
  },
  {
    id: 'event-gala',
    name: 'Midnight Gala',
    category: 'event',
    style: 'elegant',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'luxury-editorial')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'event-midnight')!,
    spacing: SPACING_SYSTEMS.airy,
    compositionRules: [
      'Date and venue are primary hierarchy (not just title)',
      'Atmosphere creation through typography + color',
      'Stars/geometric accents reinforce luxury',
      'Clear visual separation between event name and details',
    ],
    keyAttributes: ['elegant', 'exclusive', 'date-prominent', 'atmospheric'],
  },
  {
    id: 'event-festival',
    name: 'Festival Energy',
    category: 'event',
    style: 'playful',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'modern-event')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'event-vibrant')!,
    spacing: SPACING_SYSTEMS.compact,
    compositionRules: [
      'Energetic composition with layered elements',
      'Multiple acts/speakers in visual hierarchy',
      'Date/time/venue clearly visible',
      'High energy — use bold shapes and contrast',
    ],
    keyAttributes: ['energetic', 'fun', 'festival', 'multilayer'],
  },
  {
    id: 'event-minimal',
    name: 'Modern Event',
    category: 'event',
    style: 'minimal',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'clean-pro')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'event-minimal')!,
    spacing: SPACING_SYSTEMS.airy,
    compositionRules: [
      'Minimal elements, maximum impact',
      'Single accent color does all the work',
      'Large negative space creates premium feel',
      'Typography-driven design',
    ],
    keyAttributes: ['minimal', 'clean', 'sophisticated', 'typography-first'],
  },

  // ── Real estate ──────────────────────────────────────────────────
  {
    id: 'realestate-luxury',
    name: 'Luxury Listing',
    category: 'realestate',
    style: 'luxury',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'luxury-editorial')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'realestate-luxe')!,
    spacing: SPACING_SYSTEMS.airy,
    compositionRules: [
      'Full-bleed property photo as the hero background',
      'Dark gradient scrim at bottom for text legibility',
      'Property name/price as elegant serif headline over the image',
      'Key specs (beds · baths · sqft) as a clean label row',
      'Agent/brand mark small and refined; strong but tasteful CTA',
    ],
    keyAttributes: ['premium', 'trust', 'aspirational', 'photo-led'],
  },
  {
    id: 'realestate-modern',
    name: 'Modern Property',
    category: 'realestate',
    style: 'minimal',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'estate-modern-premium')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'realestate-modern')!,
    spacing: SPACING_SYSTEMS.balanced,
    compositionRules: [
      'Property photo occupies the top ~60%, solid color panel below',
      'Headline + price sit on the clean panel, not over the photo',
      'Specs aligned to a grid; generous whitespace signals quality',
      'One accent color for CTA and key figures',
    ],
    keyAttributes: ['clean', 'modern', 'professional', 'trust'],
  },

  // ── Restaurant ───────────────────────────────────────────────────
  {
    id: 'restaurant-elegant',
    name: 'Fine Dining',
    category: 'restaurant',
    style: 'elegant',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'luxury-editorial')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'restaurant-fine')!,
    spacing: SPACING_SYSTEMS.balanced,
    compositionRules: [
      'Appetizing food/interior photo as full background',
      'Warm dark scrim so cream/gold text reads cleanly',
      'Restaurant name in refined serif; tagline beneath',
      'Offer or reservation CTA framed with a thin gold rule',
      'Avoid clutter — let the food photography carry the appetite appeal',
    ],
    keyAttributes: ['warm', 'premium', 'appetizing', 'photo-led'],
  },
  {
    id: 'restaurant-playful',
    name: 'Warm Bistro',
    category: 'restaurant',
    style: 'playful',
    typography: TYPOGRAPHY_PAIRS.find((p) => p.id === 'fashion-syne')!,
    palette: COLOR_PALETTES.find((p) => p.id === 'restaurant-fresh')!,
    spacing: SPACING_SYSTEMS.balanced,
    compositionRules: [
      'Bright food photo as hero, energetic and inviting',
      'Bold rounded headline with a warm accent block behind it',
      'Clear offer (e.g. "2-for-1", "Happy Hour") as a strong CTA',
      'Friendly, vibrant, but still organized on a grid',
    ],
    keyAttributes: ['warm', 'inviting', 'fresh', 'energetic'],
  },
];

export function selectTokenSet(
  category: PosterCategory,
  style: PosterStyle
): DesignTokenSet {
  const match = DESIGN_TOKEN_SETS.find(
    (t) => t.category === category && t.style === style
  );
  if (match) return match;
  // Fallback to category match
  const catMatch = DESIGN_TOKEN_SETS.find((t) => t.category === category);
  return catMatch ?? DESIGN_TOKEN_SETS[0];
}
