import type { Layer, PosterLayout, TextLayer } from '@/types/poster';
import type { DesignTemplateMetadata } from '@/types/rag';

type FW = TextLayer['fontWeight'];
import type { RealEstateContent } from './content';
import { W, H, T, R, photoBg, img, ctaPill, fitFontSize, clampOneLine, frame } from './toolkit';

/**
 * Data-driven templates. A "spec" is JSON describing a list of BLOCKS placed on
 * the 1080×1350 canvas. `buildFromSpec` turns it into a PosterLayout using the
 * same toolkit as the hand-coded archetypes — so user-built templates render
 * identically and can never produce invalid layouts.
 */
export type BlockType = 'eyebrow' | 'heading' | 'text' | 'price' | 'banner' | 'button' | 'image';

export interface Block {
  id: string;
  type: BlockType;
  x: number; y: number; w: number;
  height?: number;            // banner / image
  bind?: keyof RealEstateContent | ''; // pull text from content, else use `text`
  text?: string;              // static text (when no bind)
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  letterSpacing?: number;
  color?: string;             // text colour
  fill?: string;              // banner / button background
  textColor?: string;         // button label colour
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
  radius?: number;
  opacity?: number;
  photoIndex?: number;        // which uploaded photo (image block)
}

export interface TemplateSpec {
  id: string;
  label: string;
  bg: string;                 // 'photo' = hero photo full-bleed, else a colour
  scrim?: { y: number; h: number; color: string; opacity: number };
  blocks: Block[];
  custom?: true;              // marks user-built (kept out of the auto rotation)
}

const val = (c: RealEstateContent, b: Block): string => {
  const t = b.bind ? String((c as unknown as Record<string, unknown>)[b.bind] ?? '') : (b.text ?? '');
  return b.uppercase ? t.toUpperCase() : t;
};

export function buildFromSpec(
  spec: TemplateSpec,
  c: RealEstateContent,
  url?: string | null,
  photos?: string[],
): PosterLayout {
  const L: Layer[] = [];
  if (spec.bg === 'photo') L.push(photoBg(url));
  else L.push(R({ x: 0, y: 0, width: W, height: H, fill: spec.bg || '#0A1B2E' }));
  if (spec.scrim) L.push(R({ x: 0, y: spec.scrim.y, width: W, height: spec.scrim.h, fill: spec.scrim.color, opacity: spec.scrim.opacity }));

  for (const b of spec.blocks) {
    const w = b.w || W - b.x * 2;
    const align = b.align || 'left';
    if (b.type === 'banner') {
      L.push(R({ x: b.x, y: b.y, width: w, height: b.height ?? 80, fill: b.fill || '#0E2436', cornerRadius: b.radius ?? 0, opacity: b.opacity ?? 1 }));
      continue;
    }
    if (b.type === 'button') {
      L.push(...ctaPill(b.x, b.y, w, val(c, b) || 'Enquire Now', b.fill || '#D8B26A', b.textColor || '#1A1206', align === 'right' ? 'center' : align));
      continue;
    }
    if (b.type === 'image') {
      const src = (photos && photos[b.photoIndex ?? 0]) || url;
      if (src) L.push(img(src, b.x, b.y, w, b.height ?? 300, b.radius ?? 0));
      continue;
    }
    if (b.type === 'heading') {
      const t = val(c, b);
      const size = fitFontSize(t, w, b.fontSize ?? 96, 38, 3, true);
      L.push(T({ text: t, x: b.x, y: b.y, fontSize: size, fontFamily: b.fontFamily || 'Playfair Display', fontWeight: (b.fontWeight || '700') as FW, color: b.color || '#FFFFFF', width: w, align, letterSpacing: b.letterSpacing ?? 0, lineHeight: 1.0, role: 'headline' }));
      continue;
    }
    // eyebrow / text / price → single-line auto-clamped text
    const t = clampOneLine(val(c, b), b.fontSize ?? 22, w, false);
    L.push(T({
      text: t, x: b.x, y: b.y, fontSize: b.fontSize ?? (b.type === 'price' ? 44 : 22),
      fontFamily: b.fontFamily || 'Switzer', fontWeight: (b.fontWeight || (b.type === 'price' ? '700' : '600')) as FW,
      color: b.color || (b.type === 'price' ? '#D8B26A' : '#FFFFFF'), width: w, align,
      letterSpacing: b.letterSpacing ?? (b.type === 'eyebrow' ? 4 : 0),
    }));
  }
  return frame(L, spec.id, 'luxury', undefined, ['Playfair Display', 'Switzer']);
}

// ── RAG conversion ───────────────────────────────────────────────
// Every saved template becomes a RAG reference so the engine can learn from /
// reference it during generation (it gets seeded alongside the curated set).
function place(x: number, y: number, w: number): string {
  const cx = x + w / 2;
  const horiz = cx < W * 0.4 ? 'left' : cx > W * 0.6 ? 'right' : 'center';
  const vert = y < 460 ? 'top' : y < 950 ? 'center' : 'bottom';
  return vert === 'center' ? 'center' : `${vert}-${horiz}`;
}
export function specToRag(spec: TemplateSpec): DesignTemplateMetadata {
  const heading = spec.blocks.find((b) => b.type === 'heading');
  const button = spec.blocks.find((b) => b.type === 'button');
  const palette = Array.from(new Set(spec.blocks.flatMap((b) => [b.color, b.fill, b.textColor]).filter(Boolean) as string[])).slice(0, 5);
  let headPos = (heading ? place(heading.x, heading.y, heading.w) : 'center');
  if (headPos === 'bottom-right') headPos = 'bottom-center';
  if (headPos.startsWith('center')) headPos = 'center';
  let ctaPos = (button ? place(button.x, button.y, button.w) : 'bottom-center');
  if (ctaPos.startsWith('top')) ctaPos = 'top';
  else if (ctaPos === 'center') ctaPos = 'center';
  else if (!['bottom-left', 'bottom-center', 'bottom-right'].includes(ctaPos)) ctaPos = 'bottom-center';

  return {
    headline_position: headPos as DesignTemplateMetadata['headline_position'],
    cta_position: ctaPos as DesignTemplateMetadata['cta_position'],
    font_pair: ['Playfair Display', 'Switzer'],
    palette: palette.length ? palette : ['#0A1B2E', '#D8B26A', '#FFFFFF'],
    spacing_style: 'balanced',
    visual_density: spec.blocks.length >= 7 ? 'high' : spec.blocks.length >= 4 ? 'medium' : 'low',
    background_type: spec.bg === 'photo' ? 'image' : 'solid',
    composition_notes:
      `User-built template "${spec.label}". ${spec.bg === 'photo' ? 'Full-bleed hero photo' : `Solid ${spec.bg} background`}` +
      `${spec.scrim ? ' with a dark scrim panel for legibility' : ''}. Elements: ` +
      spec.blocks.map((b) => `${b.type}${b.bind ? ` (${b.bind})` : ''} ${place(b.x, b.y, b.w)}`).join('; ') + '.',
    layer_order: [spec.bg === 'photo' ? 'background-photo' : 'background', ...(spec.scrim ? ['scrim'] : []), ...spec.blocks.map((b) => (b.bind ? `${b.type}-${b.bind}` : b.type))],
    design_rules: [
      `Headline at ${headPos}; CTA at ${ctaPos}`,
      'Built in the Template Studio — auto-fit + one-line clamp guards prevent overlap',
      `${spec.blocks.length} elements, ${spec.blocks.filter((b) => b.type === 'banner').length} banner(s)`,
    ],
    example_prompt: `${spec.label} style real-estate poster`,
  };
}

/** A sensible starter so "Create new" opens with something on the canvas. */
export function starterSpec(id: string): TemplateSpec {
  return {
    id, label: 'My Template', bg: 'photo', custom: true,
    scrim: { y: 820, h: 530, color: '#06101C', opacity: 0.62 },
    blocks: [
      { id: 'eyebrow', type: 'eyebrow', x: 80, y: 90, w: 920, bind: 'location', color: '#D8B26A', align: 'left', uppercase: true, fontSize: 20 },
      { id: 'heading', type: 'heading', x: 80, y: 130, w: 920, bind: 'projectName', color: '#FFFFFF', align: 'left', fontSize: 96 },
      { id: 'tagline', type: 'text', x: 80, y: 880, w: 920, bind: 'tagline', color: '#FFFFFF', align: 'left', uppercase: true, fontSize: 24, letterSpacing: 3 },
      { id: 'price', type: 'price', x: 80, y: 940, w: 600, bind: 'priceValue', color: '#D8B26A', align: 'left', fontSize: 48 },
      { id: 'cta', type: 'button', x: 80, y: 1180, w: 360, bind: 'cta', fill: '#D8B26A', textColor: '#1A1206' },
    ],
  };
}
