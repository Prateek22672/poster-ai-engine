import type { ColorPalette } from '@/types/design';
import type { PosterCategory, PosterStyle } from '@/types/poster';

export const COLOR_PALETTES: ColorPalette[] = [
  // ── Fitness palettes ───────────────────────────────────────────
  {
    id: 'fitness-dark-red',
    name: 'Dark Red Power',
    primary: '#CC0000',
    secondary: '#8B0000',
    accent: '#FF3333',
    background: '#0A0A0A',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#AAAAAA',
    ctaBackground: '#CC0000',
    ctaText: '#FFFFFF',
    mood: ['aggressive', 'power', 'intensity'],
    bestFor: ['fitness'],
    styles: ['aggressive'],
  },
  {
    id: 'fitness-electric',
    name: 'Electric Night',
    primary: '#00D4FF',
    secondary: '#0099CC',
    accent: '#00FFFF',
    background: '#050510',
    surface: '#0D0D2B',
    text: '#FFFFFF',
    textMuted: '#8888BB',
    ctaBackground: '#00D4FF',
    ctaText: '#050510',
    mood: ['futuristic', 'energy', 'tech'],
    bestFor: ['fitness'],
    styles: ['aggressive'],
  },
  {
    id: 'fitness-gold',
    name: 'Champion Gold',
    primary: '#FFD700',
    secondary: '#FFA500',
    accent: '#FFEC6E',
    background: '#000000',
    surface: '#111111',
    text: '#FFFFFF',
    textMuted: '#888888',
    ctaBackground: '#FFD700',
    ctaText: '#000000',
    mood: ['champion', 'elite', 'premium'],
    bestFor: ['fitness'],
    styles: ['elegant', 'aggressive'],
  },

  // ── Sale palettes ──────────────────────────────────────────────
  {
    id: 'sale-red-hot',
    name: 'Red Hot Sale',
    primary: '#FF1744',
    secondary: '#D50000',
    accent: '#FF6D00',
    background: '#FFFFFF',
    surface: '#FFF8F8',
    text: '#1A1A1A',
    textMuted: '#666666',
    ctaBackground: '#FF1744',
    ctaText: '#FFFFFF',
    mood: ['urgency', 'discount', 'hot'],
    bestFor: ['sale'],
    styles: ['aggressive', 'playful'],
  },
  {
    id: 'sale-luxury',
    name: 'Luxury Black',
    primary: '#C9A84C',
    secondary: '#A07A30',
    accent: '#F0D080',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    textMuted: '#999999',
    ctaBackground: '#C9A84C',
    ctaText: '#000000',
    mood: ['premium', 'exclusive', 'elegant'],
    bestFor: ['sale'],
    styles: ['elegant', 'luxury'],
  },
  {
    id: 'sale-fresh',
    name: 'Fresh Deal',
    primary: '#00C853',
    secondary: '#00922A',
    accent: '#69F0AE',
    background: '#F8FFF9',
    surface: '#E8F5E9',
    text: '#1B2A1B',
    textMuted: '#4A7A4A',
    ctaBackground: '#00C853',
    ctaText: '#FFFFFF',
    mood: ['fresh', 'energetic', 'positive'],
    bestFor: ['sale'],
    styles: ['playful', 'minimal'],
  },
  {
    id: 'sale-neon',
    name: 'Neon Pop',
    primary: '#FF00FF',
    secondary: '#CC00CC',
    accent: '#00FFFF',
    background: '#0A000F',
    surface: '#140020',
    text: '#FFFFFF',
    textMuted: '#BB88BB',
    ctaBackground: '#FF00FF',
    ctaText: '#FFFFFF',
    mood: ['bold', 'trendy', 'fun'],
    bestFor: ['sale'],
    styles: ['playful', 'aggressive'],
  },

  // ── Event palettes ─────────────────────────────────────────────
  {
    id: 'event-midnight',
    name: 'Midnight Gala',
    primary: '#8B5CF6',
    secondary: '#6D28D9',
    accent: '#A78BFA',
    background: '#030014',
    surface: '#0D0025',
    text: '#FFFFFF',
    textMuted: '#9999BB',
    ctaBackground: '#8B5CF6',
    ctaText: '#FFFFFF',
    mood: ['luxury', 'exclusive', 'mysterious'],
    bestFor: ['event'],
    styles: ['elegant', 'luxury'],
  },
  {
    id: 'event-vibrant',
    name: 'Vibrant Festival',
    primary: '#FF6B35',
    secondary: '#F7C59F',
    accent: '#EFEFD0',
    background: '#004E89',
    surface: '#1A2F5A',
    text: '#FFFFFF',
    textMuted: '#AABBCC',
    ctaBackground: '#FF6B35',
    ctaText: '#FFFFFF',
    mood: ['festival', 'energetic', 'fun'],
    bestFor: ['event'],
    styles: ['playful', 'aggressive'],
  },
  {
    id: 'event-minimal',
    name: 'Minimal White',
    primary: '#1A1A2E',
    secondary: '#16213E',
    accent: '#E94560',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A2E',
    textMuted: '#666680',
    ctaBackground: '#E94560',
    ctaText: '#FFFFFF',
    mood: ['professional', 'clean', 'modern'],
    bestFor: ['event', 'sale'],
    styles: ['minimal', 'corporate'],
  },

  // ── Real estate palettes ───────────────────────────────────────
  {
    id: 'realestate-luxe',
    name: 'Luxury Estate',
    primary: '#C0A062',
    secondary: '#9C7E45',
    accent: '#E8D5A3',
    background: '#0E1726',
    surface: '#1A2536',
    text: '#FFFFFF',
    textMuted: '#A7B0BF',
    ctaBackground: '#C0A062',
    ctaText: '#0E1726',
    mood: ['premium', 'sophisticated', 'trust', 'exclusive'],
    bestFor: ['realestate'],
    styles: ['luxury', 'elegant'],
  },
  {
    id: 'realestate-modern',
    name: 'Modern Property',
    primary: '#1E6F6A',
    secondary: '#14504C',
    accent: '#3FB6AC',
    background: '#FBFBF9',
    surface: '#F0F1EE',
    text: '#1C2B2A',
    textMuted: '#5E6E6C',
    ctaBackground: '#1E6F6A',
    ctaText: '#FFFFFF',
    mood: ['clean', 'modern', 'trust', 'professional'],
    bestFor: ['realestate'],
    styles: ['minimal', 'corporate'],
  },

  // ── Restaurant palettes ────────────────────────────────────────
  {
    id: 'restaurant-fine',
    name: 'Fine Dining',
    primary: '#C2944B',
    secondary: '#8A6A2F',
    accent: '#E6C786',
    background: '#1A1110',
    surface: '#2A1D1B',
    text: '#FBF3E7',
    textMuted: '#C7B4A3',
    ctaBackground: '#C2944B',
    ctaText: '#1A1110',
    mood: ['elegant', 'warm', 'premium', 'appetizing'],
    bestFor: ['restaurant'],
    styles: ['elegant', 'luxury'],
  },
  {
    id: 'restaurant-fresh',
    name: 'Warm Bistro',
    primary: '#D9542B',
    secondary: '#A63C1B',
    accent: '#F2A65A',
    background: '#FFF7EC',
    surface: '#FBEAD4',
    text: '#2B1A12',
    textMuted: '#7A5C4A',
    ctaBackground: '#D9542B',
    ctaText: '#FFFFFF',
    mood: ['warm', 'inviting', 'fresh', 'appetizing'],
    bestFor: ['restaurant'],
    styles: ['playful', 'minimal'],
  },
];

// ─── Selector helpers ─────────────────────────────────────────────
export function getPalettesByCategory(category: PosterCategory): ColorPalette[] {
  return COLOR_PALETTES.filter((p) => p.bestFor.includes(category));
}

export function selectPalette(
  category: PosterCategory,
  style: PosterStyle,
  preference?: string
): ColorPalette {
  const candidates = COLOR_PALETTES.filter(
    (p) => p.bestFor.includes(category) && p.styles.includes(style)
  );
  if (!candidates.length) return COLOR_PALETTES[0];

  if (preference) {
    const pref = preference.toLowerCase();
    const match = candidates.find((c) =>
      c.mood.some((m) => pref.includes(m)) || c.name.toLowerCase().includes(pref)
    );
    if (match) return match;
  }
  return candidates[0];
}

// ─── Variation palette generator ─────────────────────────────────
// Returns 2 alternative palettes for same category (used for variations)
export function getVariationPalettes(
  baseId: string,
  category: PosterCategory
): [ColorPalette, ColorPalette] {
  const pool = getPalettesByCategory(category).filter((p) => p.id !== baseId);
  return [pool[0] ?? COLOR_PALETTES[0], pool[1] ?? COLOR_PALETTES[1]];
}

// ─── Hex utils ────────────────────────────────────────────────────
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
