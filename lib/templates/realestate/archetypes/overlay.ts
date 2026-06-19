import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// PHOTO OVERLAY — full-bleed photo, all text in a scrim at the BOTTOM.
const LX = 80, CW = W - 160;

export const overlayLabel = 'Photo Overlay';

export function buildOverlay(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('overlay', theme);
  const WHITE = t.white, GOLD = t.gold, MUTED = t.muted, SCRIM = t.scrim;
  const L: Layer[] = [photoBg(url), scrim(0, 600, W, 750, SCRIM, 0.64)];

  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 26, 560, false), x: LX, y: 74, fontSize: 26, fontWeight: '700', color: WHITE, letterSpacing: 4, width: 560 }));
  if (c.location) L.push(T({ text: clampOneLine(c.location.toUpperCase(), 20, 400, false), x: W - 480, y: 78, fontSize: 20, fontWeight: '600', color: WHITE, letterSpacing: 4, width: 400, align: 'right' }));

  let y = 720;
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 22, CW, false), x: LX, y, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 4, width: CW })); y += 42;

  const nameSize = fitFontSize(c.projectName, CW, 90, 44, 3, true);
  L.push(T({ text: c.projectName, x: LX, y, fontSize: nameSize, fontFamily: 'Syne', fontWeight: '700', color: WHITE, lineHeight: 1.0, width: CW, role: 'headline' }));
  y += textHeight(c.projectName, nameSize, CW, 1.0, true) + 22;

  L.push(T({ text: clampOneLine(c.priceValue, 46, 470, false), x: LX, y, fontSize: 46, fontWeight: '700', color: GOLD, width: 470 }));
  L.push(T({ text: clampOneLine(c.configValue, 24, CW - 500, false), x: LX + 500, y: y + 14, fontSize: 24, fontWeight: '600', color: MUTED, width: CW - 500 }));
  y += 76;

  L.push(R({ x: LX, y, width: CW, height: 1, fill: 'rgba(255,255,255,0.2)' })); y += 18;
  L.push(T({ text: clampOneLine(`${c.detailLabel}: ${c.detailValue}`, 22, CW, false), x: LX, y, fontSize: 22, fontWeight: '500', color: MUTED, width: CW })); y += 52;

  L.push(...ctaPill(LX, Math.min(y, 1186), 360, c.cta, t.cta, t.ctaText));
  return frame(L, 'overlay', 'elegant', [SCRIM, GOLD, WHITE, t.ctaText, '#888888'], ['Syne', 'Switzer']);
}
