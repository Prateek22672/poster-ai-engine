import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, frame } from '../toolkit';

// PHOTO OVERLAY — full-bleed photo, all text in a scrim at the BOTTOM.
const WHITE = '#FFFFFF', GOLD = '#D8B26A', MUTED = 'rgba(255,255,255,0.72)';
const LX = 80, CW = W - 160;

export const overlayLabel = 'Photo Overlay';

export function buildOverlay(c: RealEstateContent, url?: string | null): PosterLayout {
  const L: Layer[] = [photoBg(url), scrim(0, 600, W, 750, '#06101C', 0.64)];

  if (c.brand) L.push(T({ text: c.brand.toUpperCase(), x: LX, y: 74, fontSize: 26, fontWeight: '700', color: WHITE, letterSpacing: 4 }));
  if (c.location) L.push(T({ text: c.location.toUpperCase(), x: W - 480, y: 78, fontSize: 20, fontWeight: '600', color: WHITE, letterSpacing: 4, width: 400, align: 'right' }));

  let y = 720;
  L.push(T({ text: c.tagline.toUpperCase(), x: LX, y, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 4, width: CW })); y += 42;

  const nameSize = fitFontSize(c.projectName, CW, 96, 52, 2, true);
  L.push(T({ text: c.projectName, x: LX, y, fontSize: nameSize, fontFamily: 'Syne', fontWeight: '700', color: WHITE, lineHeight: 0.98, width: CW, role: 'headline' }));
  y += textHeight(c.projectName, nameSize, CW, 0.98, true) + 22;

  L.push(T({ text: c.priceValue, x: LX, y, fontSize: 46, fontWeight: '700', color: GOLD, width: 470 }));
  L.push(T({ text: c.configValue, x: LX + 500, y: y + 14, fontSize: 24, fontWeight: '600', color: MUTED, width: CW - 500 }));
  y += 76;

  L.push(R({ x: LX, y, width: CW, height: 1, fill: 'rgba(255,255,255,0.2)' })); y += 18;
  L.push(T({ text: `${c.detailLabel}: ${c.detailValue}`, x: LX, y, fontSize: 22, fontWeight: '500', color: MUTED, width: CW })); y += 52;

  L.push(...ctaPill(LX, Math.min(y, 1186), 360, c.cta, GOLD, '#1A1206'));
  return frame(L, 'overlay', 'elegant', ['#06101C', GOLD, WHITE, '#1A1206', '#888888'], ['Syne', 'Switzer']);
}
