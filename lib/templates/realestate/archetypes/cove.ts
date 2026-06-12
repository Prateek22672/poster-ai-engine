import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { H, T, R, photoBg, ctaPill, infoBlock, fitFontSize, textHeight, frame } from '../toolkit';

// COVE — clean LEFT text column on a frosted panel, building photo on the right.
const NAVY = '#0E2A47', TEAL = '#3E7CA8', PANEL = '#F5F8FB', MUTED = '#5B7187';
const LX = 76, PW = 660, TW = 520;

export const coveLabel = 'Left Column';

export function buildCove(c: RealEstateContent, url?: string | null): PosterLayout {
  const L: Layer[] = [photoBg(url), R({ x: 0, y: 0, width: PW, height: H, fill: PANEL, opacity: 0.93 })];
  let y = 92;

  // Project name — auto-fits to max 2 lines so it never overflows
  const nameSize = fitFontSize(c.projectName, TW, 86, 46, 2, true);
  L.push(T({ text: c.projectName, x: LX, y, fontSize: nameSize, fontFamily: 'Playfair Display', fontWeight: '700', color: NAVY, lineHeight: 0.98, width: TW, role: 'headline' }));
  y += textHeight(c.projectName, nameSize, TW, 0.98, true) + 22;

  if (c.developer) { L.push(T({ text: `BY ${c.developer.toUpperCase()}`, x: LX, y, fontSize: 22, fontWeight: '600', color: MUTED, letterSpacing: 5, width: TW })); y += 34; }
  if (c.location) { L.push(T({ text: c.location.toUpperCase(), x: LX, y, fontSize: 18, fontWeight: '600', color: TEAL, letterSpacing: 4, width: TW })); y += 30; }
  y += 26;

  const tagSize = fitFontSize(c.tagline.toUpperCase(), TW, 50, 30, 2);
  L.push(T({ text: c.tagline.toUpperCase(), x: LX, y, fontSize: tagSize, fontWeight: '700', color: NAVY, lineHeight: 1.0, width: TW, role: 'subheadline' }));
  y += textHeight(c.tagline.toUpperCase(), tagSize, TW, 1.0) + 40;

  // Info blocks flow after the headline area, clamped so they + the CTA always fit
  let by = Math.min(Math.max(y, 560), 1100 - 3 * 116);
  for (const b of [[c.configLabel, c.configValue], [c.priceLabel, c.priceValue], [c.detailLabel, c.detailValue]] as const) {
    L.push(...infoBlock(LX, by, b[0], b[1], TEAL, TEAL, NAVY, TW));
    by += 116;
  }

  L.push(...ctaPill(LX, 1124, 360, c.cta, TEAL, '#FFFFFF'));
  if (c.brand) L.push(T({ text: c.brand.toUpperCase(), x: LX, y: 1258, fontSize: 22, fontWeight: '700', color: NAVY, letterSpacing: 3, width: TW }));

  return frame(L, 'cove', 'luxury', [PANEL, NAVY, TEAL, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
