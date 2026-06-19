import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// CENTERED — full-bleed photo with a soft scrim, everything centered.
export const centeredLabel = 'Centered';

export function buildCentered(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('centered', theme);
  const GOLD = t.gold, WHITE = t.white;
  const L: Layer[] = [photoBg(url), scrim(0, 0, W, 1350, t.scrim, 0.42)];

  let y = 150;
  if (c.location) { L.push(T({ text: clampOneLine(c.location.toUpperCase(), 22, W - 200, false), x: 0, y, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 6, width: W, align: 'center' })); y += 46; }
  if (c.brand) { L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 18, W - 200, false), x: 0, y, fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 4, width: W, align: 'center' })); }

  // hero name centered (auto-fit). Long titles drop the start point up a bit.
  const nameSize = fitFontSize(c.projectName, W - 160, 108, 52, 3, true);
  const nameLines = textHeight(c.projectName, nameSize, W - 160, 1.0, true);
  y = Math.max(360, 470 - nameLines / 2);
  L.push(T({ text: c.projectName, x: 80, y, fontSize: nameSize, fontFamily: 'Cormorant Garamond', fontWeight: '700', color: WHITE, lineHeight: 1.0, width: W - 160, align: 'center', role: 'headline' }));
  y += nameLines + 24;
  

  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 26, W - 160, false), x: 0, y, fontSize: 26, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W, align: 'center' })); y += 56;

  L.push(R({ x: W / 2 - 240, y, width: 480, height: 74, fill: 'rgba(255,255,255,0.1)', cornerRadius: 14, stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }));
  L.push(T({ text: clampOneLine(`${c.priceLabel.toUpperCase()}  ${c.priceValue}`, 30, 456, false), x: 0, y: y + 22, fontSize: 30, fontWeight: '700', color: WHITE, width: W, align: 'center' })); y += 100;

  L.push(T({ text: clampOneLine(`${c.configValue}   ·   ${c.detailValue}`, 24, W - 160, false), x: 0, y, fontSize: 24, fontWeight: '500', color: 'rgba(255,255,255,0.85)', width: W, align: 'center' }));
  L.push(...ctaPill(W / 2 - 180, 1140, 360, c.cta, t.cta, t.ctaText));

  return frame(L, 'centered', 'luxury', [t.scrim, GOLD, WHITE, '#888888', '#FFFFFF'], ['Cormorant Garamond', 'Switzer']);
}