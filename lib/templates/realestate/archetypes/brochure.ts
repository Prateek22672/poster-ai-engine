import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, img, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// BROCHURE — "Luxury Home for sale" look: dark canvas, brand + serif headline,
// a hero photo band, a row of CIRCULAR amenity photos, a checklist of features,
// and a Book-now CTA. Multi-photo: hero = photo 1, circles = photos 2-4.
const M = 70, CX = W / 2;
const DEFAULT_AMENITIES = ['Guest Room', '3 Bedrooms', 'Open Kitchen', 'Living Room', 'Natural View', 'Swimming Pool'];

export const brochureLabel = 'Luxury Brochure';

export function buildBrochure(c: RealEstateContent, url?: string | null, photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('brochure', theme);
  const BG = t.bg, GOLD = t.gold, WHITE = t.white, MUTED = t.muted;
  const pics = (photos && photos.length ? photos : url ? [url] : []).filter(Boolean) as string[];
  const hero = pics[0];
  const circ = (i: number) => pics[i + 1] || pics[0] || hero; // fall back to hero

  const L: Layer[] = [R({ x: 0, y: 0, width: W, height: H, fill: BG })];
  // Main image fills the upper half as the BACKGROUND; scrims keep text legible
  // and blend it into the dark lower half.
  if (hero) L.push(img(hero, 0, 0, W, 720));
  L.push(R({ x: 0, y: 0, width: W, height: 410, fill: BG, opacity: 0.52 }));   // top: logo + headline
  L.push(R({ x: 0, y: 560, width: W, height: 200, fill: BG, opacity: 0.5 }));  // blend into the lower half

  // ── Brand / logo ───────────────────────────────────────────────
  let y = 70;
  if (c.developer || c.brand) {
    // small emblem: 3 gold bars
    [[-14, 18], [-2, 26], [10, 18]].forEach(([dx, h]) => L.push(R({ x: CX + dx, y: y + (26 - h), width: 4, height: h, fill: GOLD })));
    L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 24, W - 200, false), x: 0, y: y + 36, fontSize: 24, fontWeight: '700', color: WHITE, letterSpacing: 3, width: W, align: 'center' }));
    y += 92;
  }

  // ── Headline + "for sale" subhead ──────────────────────────────
  const NAME = c.projectName;
  const nameSize = fitFontSize(NAME, W - 2 * M, 78, 44, 2, true);
  L.push(T({ text: NAME, x: M, y, fontSize: nameSize, fontFamily: t.font, fontWeight: '700', color: WHITE, lineHeight: 1.0, width: W - 2 * M, align: 'center', role: 'headline' }));
  y += textHeight(NAME, nameSize, W - 2 * M, 1.0, true) + 8;
  L.push(T({ text: `–  ${clampOneLine(c.tagline, 24, W - 320, false)}  –`, x: 0, y, fontSize: 24, fontWeight: '500', color: GOLD, width: W, align: 'center' }));

  // ── Circular amenity photos (overlap the main background photo) ──
  // (no separate rectangle band — the main image already fills the top)
  const D = 188, gap = 44, total = 3 * D + 2 * gap, sx = (W - total) / 2, cy = 540;
  for (let i = 0; i < 3; i++) {
    const x = sx + i * (D + gap), src = circ(i);
    L.push(R({ x: x - 5, y: cy - 5, width: D + 10, height: D + 10, fill: GOLD, shapeType: 'circle' }));
    if (src) L.push(img(src, x, cy, D, D, D / 2));
  }

  // ── Amenities checklist (3 cols × 2 rows) ──────────────────────
  const ams = (c.amenities && c.amenities.length ? c.amenities : DEFAULT_AMENITIES).slice(0, 6);
  const colX = [120, 446, 772], rowY = [828, 884];
  ams.forEach((a, i) => {
    const x = colX[i % 3], ry = rowY[Math.floor(i / 3)];
    L.push(R({ x, y: ry, width: 24, height: 24, fill: GOLD, shapeType: 'circle' }));
    L.push(T({ text: '✓', x, y: ry + 3, fontSize: 16, fontWeight: '700', color: BG, width: 24, align: 'center' }));
    L.push(T({ text: clampOneLine(a, 15, 244, false), x: x + 34, y: ry + 1, fontSize: 16, fontWeight: '500', color: WHITE, width: 244 }));
  });

  // ── CTA + contact ──────────────────────────────────────────────
  L.push(...ctaPill(CX - 130, 1000, 260, c.cta, GOLD, t.ctaText));
  L.push(R({ x: M, y: 1130, width: W - 2 * M, height: 1, fill: 'rgba(255,255,255,0.12)' }));
  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 16, 420, false), x: M, y: 1166, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 2, width: 420 }));
  if (c.location) L.push(T({ text: clampOneLine(c.location.toUpperCase(), 16, 420, false), x: W - M - 420, y: 1166, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 2, width: 420, align: 'right' }));

  return frame(L, 'brochure', 'luxury', [BG, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
