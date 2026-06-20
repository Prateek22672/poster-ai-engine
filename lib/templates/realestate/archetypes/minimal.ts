import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, img, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// MINIMAL — clean paper canvas, serif headline top-left, one inset photo, a tidy
// price/CTA row, lots of whitespace. Architect/brand-statement feel.
const M = 80;
export const minimalLabel = 'Minimal White';

export function buildMinimal(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('minimal', theme);
  const PAPER = t.paper, INK = t.ink, GOLD = t.gold, MUTED = t.muted;
  const L: Layer[] = [R({ x: 0, y: 0, width: W, height: H, fill: PAPER })];

  let y = 110;
  if (c.location) { L.push(T({ text: clampOneLine(c.location.toUpperCase(), 18, W - 2 * M, false), x: M, y, fontSize: 18, fontWeight: '600', color: GOLD, letterSpacing: 5, width: W - 2 * M })); y += 38; }
  const ns = fitFontSize(c.projectName, W - 2 * M, 92, 48, 2, true);
  L.push(T({ text: c.projectName, x: M, y, fontSize: ns, fontFamily: t.font, fontWeight: '700', color: INK, lineHeight: 1.0, width: W - 2 * M, role: 'headline' }));
  y += textHeight(c.projectName, ns, W - 2 * M, 1.0, true) + 16;
  L.push(R({ x: M, y, width: 64, height: 3, fill: GOLD })); y += 22;
  L.push(T({ text: clampOneLine(c.tagline, 22, W - 2 * M, false), x: M, y, fontSize: 22, fontWeight: '500', color: MUTED, width: W - 2 * M }));

  // one calm inset photo
  if (url) L.push(img(url, M, 470, W - 2 * M, 560, 20));

  // price + features + CTA
  L.push(T({ text: c.priceLabel.toUpperCase(), x: M, y: 1080, fontSize: 15, fontWeight: '600', color: GOLD, letterSpacing: 3, width: 500 }));
  L.push(T({ text: clampOneLine(c.priceValue, 40, 500, true), x: M, y: 1106, fontSize: 40, fontWeight: '700', color: INK, width: 500 }));
  L.push(T({ text: c.configLabel.toUpperCase(), x: W - M - 420, y: 1080, fontSize: 15, fontWeight: '600', color: GOLD, letterSpacing: 3, width: 420, align: 'right' }));
  L.push(T({ text: clampOneLine(c.configValue, 26, 420, false), x: W - M - 420, y: 1106, fontSize: 26, fontWeight: '700', color: INK, width: 420, align: 'right' }));

  L.push(...ctaPill(M, 1188, 320, c.cta, t.cta, t.ctaText));
  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 16, 420, false), x: W - M - 420, y: 1212, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 2, width: 420, align: 'right' }));

  return frame(L, 'minimal', 'minimal', [PAPER, INK, GOLD, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
