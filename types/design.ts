import type { PosterCategory, PosterStyle } from './poster';

// ─── Typography ───────────────────────────────────────────────────
export interface FontDefinition {
  family: string;
  googleName: string; // Google Fonts css2 name (e.g. "Inter:wght@300;400;600"); ignored for non-google sources
  weights: number[];
  category: 'display' | 'sans-serif' | 'serif' | 'monospace';
  personality: string[];
  bestFor: PosterCategory[];
  styles: PosterStyle[];
  /** Where the webfont loads from. Defaults to 'google'. */
  source?: 'google' | 'fontshare';
  /** Fontshare slug+weights (e.g. "switzer@300,400,500,600,700") when source = 'fontshare'. */
  fontshareName?: string;
}

export interface TypographyPair {
  id: string;
  headline: FontDefinition;
  body: FontDefinition;
  accent?: FontDefinition;
  description: string;
  bestFor: PosterCategory[];
  styles: PosterStyle[];
}

export interface TypeScale {
  headline: number;
  subheadline: number;
  body: number;
  label: number;
  cta: number;
  price?: number;
}

// ─── Color systems ────────────────────────────────────────────────
export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  ctaBackground: string;
  ctaText: string;
  mood: string[];
  bestFor: PosterCategory[];
  styles: PosterStyle[];
}

// ─── Spacing ──────────────────────────────────────────────────────
export interface SpacingSystem {
  id: string;
  name: string;
  safeZone: number;          // outer margin
  sectionGap: number;        // between sections
  elementGap: number;        // between adjacent elements
  ctaMarginBottom: number;   // CTA from bottom
  headlineMarginTop: number; // headline from top
  density: 'compact' | 'balanced' | 'airy';
}

// ─── Design tokens ────────────────────────────────────────────────
export interface DesignTokenSet {
  id: string;
  name: string;
  category: PosterCategory;
  style: PosterStyle;
  typography: TypographyPair;
  palette: ColorPalette;
  spacing: SpacingSystem;
  compositionRules: string[];
  keyAttributes: string[];
}
