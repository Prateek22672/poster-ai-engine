import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, photoBg, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// CINEMATIC — full-bleed dusk photo, everything centered: a monogram + brand
// wordmark up top, a thin wide hero headline, a "BOOKING | 15%" line, an
// experiential caption, and a 3-column spec footer. Recreates the "Address 17" look.
const M = 90, CX = W / 2;

export const cinematicLabel = 'Cinematic';

export function buildCinematic(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('cinematic', theme);
  const GOLD = t.gold, WHITE = t.white, SOFT = t.soft, SCRIM = t.scrim;
  const L: Layer[] = [photoBg(url)];
  // dusk framing: darken top + bottom so text reads, photo stays bright in the middle
  L.push(R({ x: 0, y: 0, width: W, height: 470, fill: SCRIM, opacity: 0.44 }));
  L.push(R({ x: 0, y: 850, width: W, height: H - 850, fill: SCRIM, opacity: 0.6 }));

  // ── Monogram emblem (3 overlapping vertical strokes) ────────────
  let y = 62;
  [[-16, 42], [-2, 54], [12, 42]].forEach(([dx, h]) =>
    L.push(R({ x: CX + dx, y: y + (54 - h), width: 5, height: h, fill: WHITE }))
  );
  y += 70;

  // ── Brand wordmark + hairline ───────────────────────────────────
  if (c.developer || c.brand) {
    L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 27, W - 200, false), x: 0, y, fontSize: 27, fontWeight: '600', color: WHITE, letterSpacing: 9, width: W, align: 'center' }));
    y += 42;
  }
  L.push(R({ x: CX - 30, y, width: 60, height: 2, fill: GOLD })); y += 54;

  // ── Eyebrow (tagline) ───────────────────────────────────────────
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 21, W - 2 * M, false), x: 0, y, fontSize: 21, fontWeight: '600', color: SOFT, letterSpacing: 5, width: W, align: 'center' }));
  y += 50;

  // ── Hero headline — thin, wide, uppercase (the "APARTMENTS" moment) ─
  const NAME = c.projectName.toUpperCase();
  const nameSize = fitFontSize(NAME, W - 2 * M, 122, 60, 2, true);
  L.push(T({ text: NAME, x: M, y, fontSize: nameSize, fontFamily: 'Cormorant Garamond', fontWeight: '500', color: WHITE, lineHeight: 0.96, letterSpacing: 5, width: W - 2 * M, align: 'center', role: 'headline' }));
  // (headline ends here; the price + caption live in the dark bottom band below)

  // ── Price highlight — FIXED in the bottom band, centered around a gold bar.
  //    Kept on the dark scrim so the gold value never washes out on the photo.
  const g = 20, py = 956;
  const lbl = c.priceLabel.toUpperCase().split(' ');
  const line1 = lbl.length > 1 ? lbl.slice(0, Math.ceil(lbl.length / 2)).join(' ') : lbl[0];
  const line2 = lbl.length > 1 ? lbl.slice(Math.ceil(lbl.length / 2)).join(' ') : '';
  L.push(R({ x: CX - 1, y: py, width: 2, height: 54, fill: GOLD }));
  L.push(T({ text: line1, x: 0, y: py + 6, fontSize: 15, fontWeight: '600', color: SOFT, letterSpacing: 2, width: CX - g, align: 'right' }));
  if (line2) L.push(T({ text: line2, x: 0, y: py + 26, fontSize: 15, fontWeight: '600', color: SOFT, letterSpacing: 2, width: CX - g, align: 'right' }));
  L.push(T({ text: clampOneLine(c.priceValue, 46, CX - g - 20, false), x: CX + g, y: py + 2, fontSize: 46, fontWeight: '700', color: GOLD, width: CX - g, align: 'left' }));

  // ── Experiential caption (the "CHIC ROOFTOP MOMENTS" line) ──────
  if (c.caption) {
    L.push(T({ text: clampOneLine(c.caption.toUpperCase(), 22, W - 2 * M, false), x: 0, y: 1050, fontSize: 20, fontWeight: '500', color: SOFT, letterSpacing: 6, width: W, align: 'center' }));
  }

  // ── Footer: 3 spec columns with hairline dividers ───────────────
  const cols: Array<[string, string]> = [
    [c.detailLabel, c.detailValue],
    [c.configLabel, c.configValue],
    ['Location', c.location || 'Enquire'],
  ];
  const fY = 1148, innerW = W - 2 * M, colW = innerW / 3;
  cols.forEach(([label, value], i) => {
    const x = M + i * colW;
    if (i > 0) L.push(R({ x, y: fY + 4, width: 1, height: 64, fill: 'rgba(255,255,255,0.28)' }));
    L.push(T({ text: clampOneLine(label.toUpperCase(), 14, colW - 12, false), x, y: fY, fontSize: 14, fontWeight: '600', color: GOLD, letterSpacing: 2, width: colW, align: 'center' }));
    L.push(T({ text: clampOneLine(value, 22, colW - 12, false), x, y: fY + 26, fontSize: 22, fontWeight: '700', color: WHITE, width: colW, align: 'center' }));
  });

  // ── Agency sign-off bottom-center ───────────────────────────────
  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 17, W - 200, false), x: 0, y: 1278, fontSize: 17, fontWeight: '600', color: SOFT, letterSpacing: 4, width: W, align: 'center' }));

  return frame(L, 'cinematic', 'luxury', [SCRIM, GOLD, WHITE, SOFT, '#FFFFFF'], ['Cormorant Garamond', 'Switzer']);
}
