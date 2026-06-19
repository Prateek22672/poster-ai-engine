import { v4 as uuidv4 } from 'uuid';
import type {
  PosterLayout, Layer, BackgroundLayer, TextLayer, ShapeLayer, ImageLayer, PosterStyle,
} from '@/types/poster';

/**
 * Shared toolkit for real-estate archetypes.
 *
 * The important part for clean layouts: TEXT AUTO-FITS and we flow elements with
 * a running Y cursor, so a long headline can never overlap the blocks below it.
 * Build archetypes from these helpers — see GUIDE.md.
 */

export const W = 1080;
export const H = 1350;

// ── Text measurement (estimate — no canvas needed) ───────────────
// Average glyph advance as a fraction of font size. Measured from the actual
// bundled fonts (Playfair .518, Cormorant .476, Oswald .414, Syne .510,
// Switzer .551) with a safety margin so we never UNDER-reserve space.
function avgCharW(fontSize: number, serif: boolean) {
  return fontSize * (serif ? 0.53 : 0.57);
}
/**
 * Lines a string takes — simulates WORD wrapping exactly like the renderer
 * (a whole word that doesn't fit moves to the next line; long words aren't
 * split). This is the bit that prevents headlines colliding with the blocks
 * below them: char-based counting under-predicted lines for multi-word names.
 */
export function estLines(text: string, fontSize: number, maxWidth: number, serif = false): number {
  if (!text) return 0;
  if (!maxWidth) return text.split('\n').length;
  const cw = avgCharW(fontSize, serif);
  let total = 0;
  for (const para of text.split('\n')) {
    let line = '';
    let count = 0;
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (test.length * cw > maxWidth && line) { count++; line = word; }
      else line = test;
    }
    total += count + 1; // + the last (or only) line
  }
  return Math.max(1, total);
}
/** Shrink a font size until the text fits within `maxLines`. */
export function fitFontSize(
  text: string, maxWidth: number, base: number, min: number, maxLines: number, serif = false
): number {
  let size = base;
  while (size > min && estLines(text, size, maxWidth, serif) > maxLines) size -= 2;
  return size;
}
/** Estimated rendered height of a text block. */
export function textHeight(
  text: string, fontSize: number, maxWidth: number, lineHeight = 1.06, serif = false
): number {
  return estLines(text, fontSize, maxWidth, serif) * fontSize * lineHeight;
}
/**
 * Truncate to a single line (with an ellipsis) so long Realtor strings — agent
 * names, phone numbers, full addresses dumped into one field — can never wrap
 * and overlap the next element.
 */
export function clampOneLine(text: string, fontSize: number, maxWidth: number, serif = false): string {
  if (!text) return text;
  const maxChars = Math.max(4, Math.floor(maxWidth / avgCharW(fontSize, serif)));
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars - 1).trimEnd()}…`;
}

// ── Layer factories ──────────────────────────────────────────────
export function T(o: Partial<TextLayer> & { text: string; x: number; y: number; fontSize: number }): TextLayer {
  return {
    id: uuidv4(), type: 'text', name: o.role ?? 'text',
    fontFamily: 'Switzer', color: '#FFFFFF', align: 'left', ...o,
  } as TextLayer;
}
export function R(o: Partial<ShapeLayer> & { x: number; y: number; width: number; height: number }): ShapeLayer {
  return { id: uuidv4(), type: 'shape', shapeType: 'rect', name: 'shape', ...o } as ShapeLayer;
}
/** A photo placed in a box (cover-fit, optionally rounded). For collages. */
export function img(src: string, x: number, y: number, w: number, h: number, cornerRadius = 0): ImageLayer {
  return { id: uuidv4(), type: 'image', name: 'Photo', src, x, y, width: w, height: h, fit: 'cover', cornerRadius } as ImageLayer;
}
export function photoBg(url?: string | null): BackgroundLayer {
  if (url) {
    return { id: uuidv4(), type: 'background', name: 'Hero Photo', fillType: 'image', imageUrl: url, x: 0, y: 0, width: W, height: H } as BackgroundLayer;
  }
  return {
    id: uuidv4(), type: 'background', name: 'Background', fillType: 'gradient', x: 0, y: 0, width: W, height: H,
    gradient: { type: 'linear', angle: 160, stops: [{ color: '#16344F', stop: 0 }, { color: '#0A1B2E', stop: 1 }] },
  } as BackgroundLayer;
}
/** Semi-transparent panel/scrim for legibility. */
export function scrim(x: number, y: number, w: number, h: number, fill = '#06101C', opacity = 0.6, cornerRadius = 0): ShapeLayer {
  return R({ x, y, width: w, height: h, fill, opacity, cornerRadius });
}
/** CTA pill = rounded rect + centered label. */
export function ctaPill(x: number, y: number, w: number, label: string, fill: string, textColor: string, align: 'left' | 'center' = 'center'): Layer[] {
  return [
    R({ x, y, width: w, height: 82, fill, cornerRadius: 41 }),
    T({ text: label, x, y: y + 25, width: w, fontSize: 28, fontWeight: '700', color: textColor, align, role: 'cta' }),
  ];
}
/** Info block: small accent line + label + value. Returns [layers, heightUsed]. */
export function infoBlock(
  x: number, y: number, label: string, value: string,
  accent: string, labelColor: string, valueColor: string, w = 500
): Layer[] {
  return [
    R({ x, y, width: 5, height: 68, fill: accent, cornerRadius: 2 }),
    T({ text: label.toUpperCase(), x: x + 22, y, fontSize: 18, fontWeight: '600', color: labelColor, letterSpacing: 3, width: w - 22, role: 'label' }),
    T({ text: value, x: x + 22, y: y + 28, fontSize: 32, fontWeight: '700', color: valueColor, lineHeight: 1.05, width: w - 22, role: 'body' }),
  ];
}

export function frame(
  layers: Layer[],
  archetype: string,
  style: PosterStyle = 'luxury',
  palette?: string[],
  fonts: string[] = ['Playfair Display', 'Switzer'],
): PosterLayout {
  return {
    id: `poster-${archetype}-${uuidv4().slice(0, 6)}`,
    version: '1.0',
    dimensions: { width: W, height: H },
    category: 'realestate',
    style,
    palette: palette ?? ['#0E2A47', '#3E7CA8', '#C8A85A', '#F5F8FB', '#FFFFFF'],
    fonts,
    layers,
  };
}
