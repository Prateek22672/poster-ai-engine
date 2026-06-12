// ─── Dimensions ──────────────────────────────────────────────────
export interface PosterDimensions {
  width: number;
  height: number;
}

// ─── Layer types ──────────────────────────────────────────────────
export type LayerType = 'background' | 'text' | 'shape' | 'image';
export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type PosterCategory = 'fitness' | 'sale' | 'event' | 'realestate' | 'restaurant';
export type PosterStyle = 'aggressive' | 'minimal' | 'elegant' | 'playful' | 'corporate' | 'luxury';

export interface BaseLayer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  name?: string;
}

// ─── Background layer ─────────────────────────────────────────────
export interface GradientStop {
  color: string;
  stop: number; // 0-1
}

export interface BackgroundLayer extends BaseLayer {
  type: 'background';
  fillType: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    stops: GradientStop[];
    angle?: number;           // degrees for linear
    centerX?: number;         // 0-1 for radial
    centerY?: number;
    radius?: number;
  };
  imageUrl?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

// ─── Text layer ───────────────────────────────────────────────────
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: FontWeight;
  fontStyle?: 'normal' | 'italic';
  color: string;
  align?: TextAlign;
  letterSpacing?: number;
  lineHeight?: number;
  textDecoration?: string;
  wrap?: boolean;
  // Effects
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  strokeColor?: string;
  strokeWidth?: number;
  // Layout
  maxWidth?: number;
  uppercase?: boolean;
  // Semantic role
  role?: 'headline' | 'subheadline' | 'body' | 'cta' | 'label' | 'price' | 'date';
}

// ─── Shape layer ──────────────────────────────────────────────────
export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'line' | 'triangle';
  fill?: string;
  fillType?: 'solid' | 'gradient';
  gradient?: {
    type: 'linear' | 'radial';
    stops: GradientStop[];
    angle?: number;
  };
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  // Effects
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

// ─── Image layer ──────────────────────────────────────────────────
export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  fit?: 'cover' | 'contain' | 'fill';
  filters?: {
    brightness?: number;   // 0-2
    contrast?: number;     // 0-2
    saturation?: number;   // 0-2
    blur?: number;         // pixels
  };
  cornerRadius?: number;
}

export type Layer = BackgroundLayer | TextLayer | ShapeLayer | ImageLayer;

// ─── Full poster layout ──────────────────────────────────────────
export interface PosterLayout {
  id: string;
  version: string;
  dimensions: PosterDimensions;
  category: PosterCategory;
  style: PosterStyle;
  palette: string[];
  fonts: string[];
  layers: Layer[];
}

// ─── Generated poster with variations ────────────────────────────
export interface PosterVariation {
  id: string;
  label: string;
  layout: PosterLayout;
  thumbnailDataUrl?: string;
}

export interface GeneratedPoster {
  layout: PosterLayout;
  variations: PosterVariation[];
  templateId?: string;
  prompt: string;
  /** DB row id (posters table) — used to attach the rendered image after canvas render. */
  posterId?: string;
  /** Real OpenAI usage + cost for this generation (from API token counts). */
  usage?: {
    calls: Array<{ label: string; model: string; inputTokens: number; outputTokens: number; costUsd: number }>;
    totalCostUsd: number;
  };
}

// ─── User input ───────────────────────────────────────────────────
export interface PosterGenerationInput {
  prompt: string;
  category?: PosterCategory;
  style?: PosterStyle;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  colorPreference?: string;
  referenceImageBase64?: string;
  referenceImageMimeType?: string;
  targetAspectRatio?: '1:1' | '4:5' | '9:16';
  // ── Branding (client customization) ──
  /** Company / brand name to show as a text logo (used when no logo image). */
  brandText?: string;
  /** Uploaded logo as a data URL (SVG or PNG). Rendered as the brand mark. */
  logoDataUrl?: string;
  /** Client-supplied background photo URL. When set, used instead of Pexels. */
  heroImageUrl?: string;
}
