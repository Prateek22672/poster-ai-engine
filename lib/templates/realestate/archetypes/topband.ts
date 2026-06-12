import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, frame } from '../toolkit';

// TOP BAND — name + price in a solid color band on top; building below;
// specs + CTA in a glass strip near the bottom. The band auto-sizes to the name.
const NAVY = '#0E2436', GOLD = '#D8B26A', WHITE = '#FFFFFF';
const LX = 80, CW = W - 160;

export const topbandLabel = 'Top Band';

export function buildTopBand(c: RealEstateContent, url?: string | null): PosterLayout {
  const L: Layer[] = [photoBg(url)];

  const nameSize = fitFontSize(c.projectName, CW, 92, 50, 2, true);
  let cy = 150;
  const eyebrowY = cy; cy += 40;
  const nameY = cy;
  cy += textHeight(c.projectName, nameSize, CW, 0.98, true) + 20;
  const pillY = cy;
  cy += 64 + 36;
  const bandH = cy;

  // band sits above the photo, below all band text
  L.splice(1, 0, R({ x: 0, y: 0, width: W, height: bandH, fill: NAVY }));

  if (c.brand) L.push(T({ text: c.brand.toUpperCase(), x: LX, y: 70, fontSize: 24, fontWeight: '700', color: WHITE, letterSpacing: 4 }));
  if (c.location) L.push(T({ text: c.location.toUpperCase(), x: W - 480, y: 74, fontSize: 18, fontWeight: '600', color: GOLD, letterSpacing: 4, width: 400, align: 'right' }));
  L.push(T({ text: c.tagline.toUpperCase(), x: LX, y: eyebrowY, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 4, width: CW }));
  L.push(T({ text: c.projectName, x: LX, y: nameY, fontSize: nameSize, fontFamily: 'Oswald', fontWeight: '700', color: WHITE, lineHeight: 0.98, width: CW, role: 'headline' }));
  L.push(R({ x: LX, y: pillY, width: 480, height: 64, fill: 'rgba(255,255,255,0.08)', cornerRadius: 12, stroke: GOLD, strokeWidth: 1 }));
  L.push(T({ text: `${c.priceLabel.toUpperCase()}  ${c.priceValue}`, x: LX + 22, y: pillY + 18, fontSize: 26, fontWeight: '700', color: WHITE, width: 436 }));

  // bottom glass strip
  L.push(scrim(60, 1080, W - 120, 200, '#06101C', 0.55, 24));
  L.push(T({ text: c.configLabel.toUpperCase(), x: 96, y: 1116, fontSize: 16, fontWeight: '600', color: GOLD, letterSpacing: 3, width: 420 }));
  L.push(T({ text: c.configValue, x: 96, y: 1142, fontSize: 28, fontWeight: '700', color: WHITE, width: 460 }));
  L.push(T({ text: c.detailLabel.toUpperCase(), x: 96, y: 1196, fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 2, width: 420 }));
  L.push(T({ text: c.detailValue, x: 96, y: 1216, fontSize: 22, fontWeight: '600', color: WHITE, width: 460 }));
  L.push(...ctaPill(W - 60 - 300, 1138, 300, c.cta, GOLD, '#1A1206'));

  return frame(L, 'topband', 'luxury', [NAVY, GOLD, WHITE, '#888888', '#FFFFFF'], ['Oswald', 'Switzer']);
}
