import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, frame } from '../toolkit';

// CENTERED — full-bleed photo with a soft scrim, everything centered.
const GOLD = '#D8B26A', WHITE = '#FFFFFF';

export const centeredLabel = 'Centered';

export function buildCentered(c: RealEstateContent, url?: string | null): PosterLayout {
  const L: Layer[] = [photoBg(url), scrim(0, 0, W, 1350, '#06101C', 0.42)];

  let y = 150;
  if (c.location) { L.push(T({ text: c.location.toUpperCase(), x: 0, y, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 6, width: W, align: 'center' })); y += 46; }
  if (c.brand) { L.push(T({ text: c.brand.toUpperCase(), x: 0, y, fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 4, width: W, align: 'center' })); }

  // hero name centered (auto-fit)
  y = 430;
  const nameSize = fitFontSize(c.projectName, W - 160, 116, 60, 2, true);
  L.push(T({ text: c.projectName, x: 80, y, fontSize: nameSize, fontFamily: 'Cormorant Garamond', fontWeight: '700', color: WHITE, lineHeight: 0.96, width: W - 160, align: 'center', role: 'headline' }));
  y += textHeight(c.projectName, nameSize, W - 160, 0.96, true) + 24;

  L.push(T({ text: c.tagline.toUpperCase(), x: 0, y, fontSize: 26, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W, align: 'center' })); y += 56;

  L.push(R({ x: W / 2 - 240, y, width: 480, height: 74, fill: 'rgba(255,255,255,0.1)', cornerRadius: 14, stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }));
  L.push(T({ text: `${c.priceLabel.toUpperCase()}  ${c.priceValue}`, x: 0, y: y + 22, fontSize: 30, fontWeight: '700', color: WHITE, width: W, align: 'center' })); y += 100;

  L.push(T({ text: `${c.configValue}   ·   ${c.detailValue}`, x: 0, y, fontSize: 24, fontWeight: '500', color: 'rgba(255,255,255,0.85)', width: W, align: 'center' }));
  L.push(...ctaPill(W / 2 - 180, 1140, 360, c.cta, GOLD, '#1A1206'));

  return frame(L, 'centered', 'luxury', ['#06101C', GOLD, WHITE, '#888888', '#FFFFFF'], ['Cormorant Garamond', 'Switzer']);
}
