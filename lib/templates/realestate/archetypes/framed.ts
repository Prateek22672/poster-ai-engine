import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// FRAMED — full photo with a thin inset gold border frame, everything centered:
// location, serif name, a price pill and a CTA. Classic, gallery-like.
const F = 44; // frame inset
export const framedLabel = 'Framed Classic';

export function buildFramed(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('framed', theme);
  const GOLD = t.gold, WHITE = t.white, MUTED = t.muted;
  const L: Layer[] = [photoBg(url), scrim(0, 0, W, H, t.scrim, 0.46)];
  // inset frame (4 thin gold bars)
  L.push(R({ x: F, y: F, width: W - 2 * F, height: 2, fill: GOLD }));
  L.push(R({ x: F, y: H - F - 2, width: W - 2 * F, height: 2, fill: GOLD }));
  L.push(R({ x: F, y: F, width: 2, height: H - 2 * F, fill: GOLD }));
  L.push(R({ x: W - F - 2, y: F, width: 2, height: H - 2 * F, fill: GOLD }));

  let y = 150;
  if (c.location) { L.push(T({ text: clampOneLine(c.location.toUpperCase(), 20, W - 240, false), x: 0, y, fontSize: 20, fontWeight: '600', color: GOLD, letterSpacing: 6, width: W, align: 'center' })); y += 44; }
  if (c.developer || c.brand) { L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 18, W - 240, false), x: 0, y, fontSize: 18, fontWeight: '600', color: MUTED, letterSpacing: 4, width: W, align: 'center' })); }

  y = 470;
  const ns = fitFontSize(c.projectName, W - 260, 116, 56, 3, true);
  const nh = textHeight(c.projectName, ns, W - 260, 1.0, true);
  y = Math.max(380, 500 - nh / 2);
  L.push(T({ text: c.projectName, x: 130, y, fontSize: ns, fontFamily: 'Playfair Display', fontWeight: '700', color: WHITE, lineHeight: 1.0, width: W - 260, align: 'center', role: 'headline' }));
  y += nh + 26;
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 22, W - 260, false), x: 0, y, fontSize: 22, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W, align: 'center' })); y += 64;

  // price pill (centered, bordered)
  L.push(R({ x: W / 2 - 230, y, width: 460, height: 76, fill: 'rgba(255,255,255,0.08)', cornerRadius: 14, stroke: GOLD, strokeWidth: 1 }));
  L.push(T({ text: clampOneLine(`${c.priceLabel.toUpperCase()}  ${c.priceValue}`, 28, 420, false), x: 0, y: y + 23, fontSize: 28, fontWeight: '700', color: WHITE, width: W, align: 'center' }));

  L.push(T({ text: clampOneLine(`${c.configValue}   ·   ${c.detailValue}`, 22, W - 260, false), x: 0, y: 1050, fontSize: 22, fontWeight: '500', color: MUTED, width: W, align: 'center' }));
  L.push(...ctaPill(W / 2 - 170, 1130, 340, c.cta, t.cta, t.ctaText));

  return frame(L, 'framed', 'luxury', [t.scrim, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
