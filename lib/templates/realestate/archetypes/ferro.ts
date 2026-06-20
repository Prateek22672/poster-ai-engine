import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, photoBg, fadeStrip, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// FERRO — atmospheric "builder vision" poster: airy architectural photo, a
// centered serif hero up top, supporting lines bottom-left with cream HIGHLIGHT
// PILLS on the key words, a small note bottom-right, and a contact bar.
const M = 64;
export const ferroLabel = 'Vision';

// a cream highlight pill with dark text (left-anchored), returns [layers, width]
function pill(x: number, y: number, text: string, size: number, fill: string, ink: string): { layers: Layer[]; w: number } {
  const w = Math.round(text.length * size * 0.6) + 34;
  return {
    layers: [
      R({ x, y, width: w, height: size + 18, fill, cornerRadius: 8 }),
      T({ text, x, y: y + 9, width: w, fontSize: size, fontWeight: '700', color: ink, align: 'center' }),
    ],
    w,
  };
}

export function buildFerro(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('ferro', theme);
  const GOLD = t.gold, WHITE = t.white, INK = t.ink, PILLC = t.pill, MUTED = t.muted;
  const L: Layer[] = [photoBg(url)];
  // faint top (logo/hero) + a soft bottom-left darkening for the supporting copy
  L.push(...fadeStrip(0, 0, W, 380, '#0A1622', 0.32, 0));
  L.push(...fadeStrip(0, 880, W, H - 880, '#070C12', 0, 0.66));

  // ── Brand logo top-right ───────────────────────────────────────
  if (c.developer || c.brand) L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 26, 420, false), x: W - M - 420, y: 70, fontSize: 26, fontWeight: '800', color: WHITE, letterSpacing: 3, width: 420, align: 'right' }));

  // ── Centered hero ──────────────────────────────────────────────
  let y = 150;
  if (c.location) { L.push(T({ text: clampOneLine(c.location.toUpperCase(), 16, W - 200, false), x: 0, y, fontSize: 16, fontWeight: '600', color: GOLD, letterSpacing: 5, width: W, align: 'center' })); y += 38; }
  const ns = fitFontSize(c.projectName, W - 220, 78, 44, 2, true);
  L.push(T({ text: c.projectName, x: 110, y, fontSize: ns, fontFamily: t.font, fontWeight: '700', color: WHITE, lineHeight: 1.04, width: W - 220, align: 'center', role: 'headline' }));
  y += textHeight(c.projectName, ns, W - 220, 1.04, true) + 16;
  L.push(T({ text: clampOneLine(`WITH ${(c.developer || c.brand || 'US').toUpperCase()}`, 16, W - 200, false), x: 0, y, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 6, width: W, align: 'center' }));

  // ── Bottom-left supporting copy + highlight pills ──────────────
  let by = 1006;
  const tag = clampOneLine(c.tagline, 30, W - 2 * M - 260, false);
  L.push(T({ text: tag, x: M, y: by, fontSize: 34, fontFamily: t.font, fontWeight: '600', color: WHITE, lineHeight: 1.1, width: 560 }));
  by += 56;
  // a "Starting from <price>" line with the price in a cream pill
  L.push(T({ text: 'STARTING FROM', x: M, y: by + 12, fontSize: 15, fontWeight: '600', color: GOLD, letterSpacing: 3, width: 240 }));
  const p = pill(M + 210, by, clampOneLine(c.priceValue, 22, 280, false), 22, PILLC, INK);
  L.push(...p.layers);

  // ── Bottom-right note ──────────────────────────────────────────
  if (c.caption || c.detailValue) {
    L.push(T({ text: clampOneLine(c.caption || `${c.detailLabel}: ${c.detailValue}`, 15, 380, false), x: W - M - 380, y: 1018, fontSize: 15, fontWeight: '500', color: MUTED, lineHeight: 1.3, width: 380 }));
  }

  // ── Contact bar (location · CTA) ───────────────────────────────
  L.push(R({ x: M, y: 1196, width: W - 2 * M, height: 1, fill: 'rgba(255,255,255,0.22)' }));
  if (c.configValue) L.push(T({ text: clampOneLine(c.configValue, 22, 520, false), x: M, y: 1226, fontSize: 18, fontWeight: '600', color: WHITE, letterSpacing: 1, width: 520 }));
  L.push(T({ text: clampOneLine(c.cta.toUpperCase(), 16, 420, false), x: W - M - 420, y: 1228, fontSize: 16, fontWeight: '700', color: GOLD, letterSpacing: 2, width: 420, align: 'right' }));

  return frame(L, 'ferro', 'elegant', ['#0A1622', GOLD, WHITE, MUTED, PILLC], ['Cormorant Garamond', 'Switzer']);
}
