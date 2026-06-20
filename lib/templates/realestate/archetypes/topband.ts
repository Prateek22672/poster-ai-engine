import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, photoBg, fadeStrip, forceOpaque, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// TOP BAND — premium "estate brochure" look (Sobha-style): full villa photo, a
// centered serif brand up top, and an elegant lower gradient panel with a serif
// headline, a STARTING FROM price, a KEY FEATURES row with gold dividers, an
// outlined CTA and a brand sign-off. Everything centered, lots of air.
const MX = 110;
export const topbandLabel = 'Estate Premium';

export function buildTopBand(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('topband', theme);
  const SCRIM = forceOpaque(t.navy), GOLD = t.gold, WHITE = t.white, SOFT = 'rgba(255,255,255,0.72)';
  const L: Layer[] = [photoBg(url)];

  // Legibility: darken the top (brand), blend the photo into a solid dark lower
  // panel (so text always reads, regardless of how bright the photo is).
  L.push(...fadeStrip(0, 0, W, 300, SCRIM, 0.55, 0));            // top → brand
  L.push(...fadeStrip(0, 470, W, 300, SCRIM, 0, 0.74));          // photo → panel blend
  L.push(R({ x: 0, y: 752, width: W, height: H - 752, fill: SCRIM, opacity: 0.78 })); // solid panel behind text

  // ── Brand wordmark top-center ──────────────────────────────────
  if (c.developer || c.brand) {
    L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 30, W - 180, false), x: 0, y: 80, fontSize: 30, fontFamily: 'Playfair Display', fontWeight: '600', color: WHITE, letterSpacing: 7, width: W, align: 'center' }));
    L.push(R({ x: W / 2 - 26, y: 128, width: 52, height: 2, fill: GOLD }));
    if (c.location) L.push(T({ text: clampOneLine(c.location.toUpperCase(), 14, W - 180, false), x: 0, y: 144, fontSize: 14, fontWeight: '600', color: SOFT, letterSpacing: 5, width: W, align: 'center' }));
  }

  // ── Bottom content (centered, flows with a y cursor) ───────────
  let y = c.caption ? 768 : 800;
  const ns = fitFontSize(c.projectName, W - 2 * MX, 62, 36, 3, true);
  L.push(T({ text: c.projectName, x: MX, y, fontSize: ns, fontFamily: t.font, fontWeight: '700', color: WHITE, lineHeight: 1.06, width: W - 2 * MX, align: 'center', role: 'headline' }));
  y += textHeight(c.projectName, ns, W - 2 * MX, 1.06, true) + 14;

  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 18, W - 2 * MX, false), x: 0, y, fontSize: 18, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W, align: 'center' }));
  y += 42;
  if (c.caption) { L.push(T({ text: clampOneLine(c.caption, 21, W - 2 * MX, false), x: 0, y, fontSize: 21, fontFamily: 'Playfair Display', fontWeight: '500', color: SOFT, width: W, align: 'center' })); y += 44; }

  // STARTING FROM / price
  L.push(T({ text: c.priceLabel.toUpperCase(), x: 0, y, fontSize: 14, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W, align: 'center' })); y += 24;
  L.push(T({ text: clampOneLine(c.priceValue, 34, W - 2 * MX, false), x: 0, y, fontSize: 34, fontWeight: '700', color: WHITE, width: W, align: 'center' })); y += 60;

  // KEY FEATURES — 3 columns with gold dividers
  L.push(T({ text: 'KEY FEATURES', x: 0, y, fontSize: 14, fontWeight: '600', color: GOLD, letterSpacing: 6, width: W, align: 'center' })); y += 32;
  const feats = (c.amenities && c.amenities.length >= 3) ? c.amenities.slice(0, 3) : [c.configValue, c.detailValue, c.location || 'Enquire'];
  const innerW = W - 2 * MX, colW = innerW / 3;
  feats.forEach((f, i) => {
    const x = MX + i * colW;
    if (i > 0) L.push(R({ x, y: y + 2, width: 1, height: 40, fill: 'rgba(255,255,255,0.28)' }));
    L.push(T({ text: clampOneLine(f, 16, colW - 14, false), x, y: y + 12, fontSize: 17, fontWeight: '600', color: WHITE, width: colW, align: 'center' }));
  });
  y += 74;

  // outlined CTA pill (centered) + brand sign-off
  const cw = 300, cx = W / 2 - cw / 2;
  L.push(R({ x: cx, y, width: cw, height: 60, fill: 'rgba(0,0,0,0)', stroke: GOLD, strokeWidth: 1.5, cornerRadius: 30 }));
  L.push(T({ text: clampOneLine(c.cta.toUpperCase(), 17, cw - 30, false), x: cx, y: y + 20, fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 2, width: cw, align: 'center' }));

  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 16, W - 180, false), x: 0, y: 1304, fontSize: 16, fontFamily: 'Playfair Display', fontWeight: '600', color: SOFT, letterSpacing: 5, width: W, align: 'center' }));

  return frame(L, 'topband', 'luxury', [SCRIM, GOLD, WHITE, SOFT, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
