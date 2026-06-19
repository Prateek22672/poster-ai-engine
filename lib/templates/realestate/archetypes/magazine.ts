import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, img, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// MAGAZINE — solid colour column on the left (brand, headline, price, CTA), a
// full-height photo on the right. Editorial, high-contrast.
const COLW = 470, PAD = 64;
export const magazineLabel = 'Magazine';

export function buildMagazine(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('magazine', theme);
  const COL = t.col, GOLD = t.gold, WHITE = t.white, MUTED = t.muted;
  const L: Layer[] = [];
  if (url) L.push(img(url, 0, 0, W, H));                       // photo fills, column sits on the left
  L.push(R({ x: 0, y: 0, width: COLW, height: H, fill: COL })); // solid left column
  L.push(R({ x: COLW, y: 0, width: 4, height: H, fill: GOLD })); // gold seam

  const tw = COLW - 2 * PAD;
  let y = 100;
  if (c.developer || c.brand) { L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 20, tw, false), x: PAD, y, fontSize: 20, fontWeight: '700', color: WHITE, letterSpacing: 3, width: tw })); y += 36; }
  L.push(R({ x: PAD, y, width: 48, height: 3, fill: GOLD })); y += 30;
  if (c.location) { L.push(T({ text: clampOneLine(c.location.toUpperCase(), 16, tw, false), x: PAD, y, fontSize: 16, fontWeight: '600', color: GOLD, letterSpacing: 4, width: tw })); y += 40; }

  const ns = fitFontSize(c.projectName, tw, 84, 40, 4, true);
  L.push(T({ text: c.projectName, x: PAD, y, fontSize: ns, fontFamily: 'Playfair Display', fontWeight: '700', color: WHITE, lineHeight: 1.02, width: tw, role: 'headline' }));
  y += textHeight(c.projectName, ns, tw, 1.02, true) + 18;
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 18, tw, false), x: PAD, y, fontSize: 18, fontWeight: '600', color: MUTED, letterSpacing: 2, width: tw }));

  // price + config stacked lower in the column
  L.push(T({ text: c.priceLabel.toUpperCase(), x: PAD, y: 920, fontSize: 14, fontWeight: '600', color: GOLD, letterSpacing: 3, width: tw }));
  L.push(T({ text: clampOneLine(c.priceValue, 36, tw, true), x: PAD, y: 944, fontSize: 38, fontWeight: '700', color: WHITE, width: tw }));
  L.push(T({ text: c.configLabel.toUpperCase(), x: PAD, y: 1018, fontSize: 13, fontWeight: '600', color: GOLD, letterSpacing: 2, width: tw }));
  L.push(T({ text: clampOneLine(c.configValue, 24, tw, false), x: PAD, y: 1040, fontSize: 22, fontWeight: '700', color: WHITE, width: tw }));

  L.push(...ctaPill(PAD, 1150, tw, c.cta, t.cta, t.ctaText));
  return frame(L, 'magazine', 'luxury', [COL, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
