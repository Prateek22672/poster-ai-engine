import type { FontDefinition, TypographyPair, TypeScale } from '@/types/design';

// ─── Font Catalog ─────────────────────────────────────────────────
export const FONTS: Record<string, FontDefinition> = {
  bebasNeue: {
    family: 'Bebas Neue',
    googleName: 'Bebas+Neue',
    weights: [400],
    category: 'display',
    personality: ['bold', 'aggressive', 'impactful', 'sporty'],
    bestFor: ['fitness'],
    styles: ['aggressive'],
  },
  montserrat: {
    family: 'Montserrat',
    googleName: 'Montserrat:wght@400;600;700;800;900',
    weights: [400, 600, 700, 800, 900],
    category: 'sans-serif',
    personality: ['professional', 'versatile', 'modern', 'clean'],
    bestFor: ['fitness', 'sale', 'event'],
    styles: ['minimal', 'corporate', 'aggressive'],
  },
  spaceGrotesk: {
    family: 'Space Grotesk',
    googleName: 'Space+Grotesk:wght@400;500;600;700',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    personality: ['modern', 'tech', 'clean', 'geometric'],
    bestFor: ['event', 'sale'],
    styles: ['minimal', 'corporate'],
  },
  poppins: {
    family: 'Poppins',
    googleName: 'Poppins:wght@400;500;600;700;800',
    weights: [400, 500, 600, 700, 800],
    category: 'sans-serif',
    personality: ['friendly', 'rounded', 'approachable', 'modern'],
    bestFor: ['sale', 'event'],
    styles: ['playful', 'minimal'],
  },
  cormorantGaramond: {
    family: 'Cormorant Garamond',
    googleName: 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400',
    weights: [400, 600, 700],
    category: 'serif',
    personality: ['elegant', 'luxury', 'editorial', 'sophisticated'],
    bestFor: ['event'],
    styles: ['elegant', 'luxury'],
  },
  orbitron: {
    family: 'Orbitron',
    googleName: 'Orbitron:wght@400;600;700;800;900',
    weights: [400, 600, 700, 800, 900],
    category: 'display',
    personality: ['futuristic', 'tech', 'gaming', 'space'],
    bestFor: ['event', 'fitness'],
    styles: ['aggressive'],
  },
  playfairDisplay: {
    family: 'Playfair Display',
    googleName: 'Playfair+Display:ital,wght@0,400;0,700;0,900;1,400',
    weights: [400, 700, 900],
    category: 'serif',
    personality: ['luxury', 'editorial', 'classic', 'premium'],
    bestFor: ['event', 'sale', 'realestate', 'restaurant'],
    styles: ['elegant', 'luxury'],
  },

  // ── Premium bundle ───────────────────────────────────────────────
  switzer: {
    family: 'Switzer',
    googleName: '', // loaded from Fontshare
    source: 'fontshare',
    fontshareName: 'switzer@300,400,500,600,700,800',
    weights: [300, 400, 500, 600, 700, 800],
    category: 'sans-serif',
    personality: ['premium', 'modern', 'clean', 'versatile', 'neutral'],
    bestFor: ['realestate', 'restaurant', 'sale', 'event', 'fitness'],
    styles: ['minimal', 'corporate', 'luxury', 'elegant'],
  },
  inter: {
    family: 'Inter',
    googleName: 'Inter:wght@300;400;500;600;700',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    personality: ['clean', 'modern', 'legible', 'neutral', 'professional'],
    bestFor: ['realestate', 'sale', 'event', 'restaurant'],
    styles: ['minimal', 'corporate'],
  },
  outfit: {
    family: 'Outfit',
    googleName: 'Outfit:wght@300;400;500;600;700',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    personality: ['modern', 'geometric', 'premium', 'rounded'],
    bestFor: ['realestate', 'restaurant', 'sale', 'event'],
    styles: ['minimal', 'corporate', 'luxury'],
  },
  oswald: {
    family: 'Oswald',
    googleName: 'Oswald:wght@300;400;500;600;700',
    weights: [300, 400, 500, 600, 700],
    category: 'sans-serif',
    personality: ['condensed', 'bold', 'impactful', 'editorial'],
    bestFor: ['realestate', 'fitness', 'sale', 'event'],
    styles: ['aggressive', 'corporate', 'minimal'],
  },
  syne: {
    family: 'Syne',
    googleName: 'Syne:wght@400;500;600;700;800',
    weights: [400, 500, 600, 700, 800],
    category: 'display',
    personality: ['distinctive', 'modern', 'artful', 'premium', 'fashion'],
    bestFor: ['restaurant', 'event', 'realestate'],
    styles: ['luxury', 'playful', 'elegant'],
  },
  firaCode: {
    family: 'Fira Code',
    googleName: 'Fira+Code:wght@300;400;500;600',
    weights: [300, 400, 500, 600],
    category: 'monospace',
    personality: ['tech', 'precise', 'modern', 'developer'],
    bestFor: ['event', 'sale'],
    styles: ['minimal', 'corporate'],
  },
};

// ─── Typography Pairs ─────────────────────────────────────────────
export const TYPOGRAPHY_PAIRS: TypographyPair[] = [
  {
    id: 'power-duo',
    headline: FONTS.bebasNeue,
    body: FONTS.montserrat,
    description: 'Aggressive sports/fitness pairing',
    bestFor: ['fitness'],
    styles: ['aggressive'],
  },
  {
    id: 'clean-pro',
    headline: FONTS.montserrat,
    body: FONTS.spaceGrotesk,
    description: 'Clean, professional, versatile',
    bestFor: ['sale', 'event'],
    styles: ['minimal', 'corporate'],
  },
  {
    id: 'modern-event',
    headline: FONTS.spaceGrotesk,
    body: FONTS.poppins,
    description: 'Modern event aesthetic',
    bestFor: ['event', 'sale'],
    styles: ['minimal', 'playful'],
  },
  {
    id: 'luxury-editorial',
    headline: FONTS.playfairDisplay,
    body: FONTS.cormorantGaramond,
    accent: FONTS.montserrat,
    description: 'High-end editorial luxury',
    bestFor: ['event'],
    styles: ['elegant', 'luxury'],
  },
  {
    id: 'tech-forward',
    headline: FONTS.orbitron,
    body: FONTS.spaceGrotesk,
    description: 'Futuristic tech gaming',
    bestFor: ['fitness', 'event'],
    styles: ['aggressive'],
  },
  {
    id: 'sale-blast',
    headline: FONTS.montserrat,
    body: FONTS.poppins,
    description: 'High-energy sale announcements',
    bestFor: ['sale'],
    styles: ['playful', 'aggressive'],
  },
  // ── Premium pairs ──────────────────────────────────────────────
  {
    id: 'estate-modern-premium',
    headline: FONTS.oswald,
    body: FONTS.inter,
    accent: FONTS.switzer,
    description: 'Condensed editorial headline + clean premium body',
    bestFor: ['realestate', 'sale'],
    styles: ['minimal', 'corporate'],
  },
  {
    id: 'fashion-syne',
    headline: FONTS.syne,
    body: FONTS.outfit,
    description: 'Distinctive display + modern geometric body',
    bestFor: ['restaurant', 'event', 'realestate'],
    styles: ['playful', 'luxury', 'elegant'],
  },
  {
    id: 'premium-sans',
    headline: FONTS.switzer,
    body: FONTS.inter,
    description: 'Premium neutral sans system',
    bestFor: ['realestate', 'restaurant', 'sale', 'event'],
    styles: ['minimal', 'corporate', 'luxury'],
  },
];

// ─── Type Scale Presets ───────────────────────────────────────────
export const TYPE_SCALES: Record<string, TypeScale> = {
  fitness: {
    headline: 96,
    subheadline: 42,
    body: 28,
    label: 20,
    cta: 32,
  },
  sale: {
    headline: 120,
    subheadline: 48,
    body: 28,
    label: 22,
    cta: 36,
    price: 140,
  },
  event: {
    headline: 80,
    subheadline: 36,
    body: 26,
    label: 20,
    cta: 30,
    price: 40,
  },
};

// ─── Helper: pair selector ────────────────────────────────────────
export function selectTypographyPair(
  category: string,
  style: string
): TypographyPair {
  const match = TYPOGRAPHY_PAIRS.find(
    (p) =>
      (p.bestFor.includes(category as never) || p.bestFor.length === 0) &&
      (p.styles.includes(style as never) || p.styles.length === 0)
  );
  return match ?? TYPOGRAPHY_PAIRS[1];
}

// ─── Font lookup helpers ──────────────────────────────────────────
export function getFontDef(family: string): FontDefinition | undefined {
  return Object.values(FONTS).find((fd) => fd.family === family);
}

export function getFontSource(family: string): 'google' | 'fontshare' {
  return getFontDef(family)?.source ?? 'google';
}

// ─── Google Fonts URL builder ─────────────────────────────────────
// Only families whose source is 'google' (or unknown families) are included.
export function buildGoogleFontsUrl(families: string[]): string | null {
  const known = Object.values(FONTS);
  const googleFamilies = families.filter((f) => {
    const def = known.find((fd) => fd.family === f);
    return !def || (def.source ?? 'google') === 'google';
  });
  if (!googleFamilies.length) return null;
  const queries = googleFamilies
    .map((f) => known.find((fd) => fd.family === f)?.googleName || f.replace(/\s+/g, '+'))
    .join('&family=');
  return `https://fonts.googleapis.com/css2?family=${queries}&display=swap`;
}

// ─── Fontshare URL builder (Switzer + other Fontshare faces) ──────
export function buildFontshareUrl(families: string[]): string | null {
  const known = Object.values(FONTS);
  const slugs = families
    .map((f) => known.find((fd) => fd.family === f))
    .filter((def): def is FontDefinition => !!def && def.source === 'fontshare' && !!def.fontshareName)
    .map((def) => `f[]=${def.fontshareName}`);
  if (!slugs.length) return null;
  return `https://api.fontshare.com/v2/css?${slugs.join('&')}&display=swap`;
}
