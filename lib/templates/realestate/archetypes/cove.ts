import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { H, T, R, photoBg, ctaPill, infoBlock, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';

// COVE — clean LEFT text column on a frosted panel, building photo on the right.
const NAVY = '#0B2239', GOLD = '#A9803F', TEAL = '#2F6E8F', PANEL = '#F6F4EF', MUTED = '#6A7480';
const LX = 76, PW = 648, TW = 500;

export const coveLabel = 'Left Column';

export function buildCove(c: RealEstateContent, url?: string | null): PosterLayout {
  const L: Layer[] = [photoBg(url), R({ x: 0, y: 0, width: PW, height: H, fill: PANEL, opacity: 0.94 })];
  // thin gold seam between panel and photo
  L.push(R({ x: PW - 4, y: 0, width: 4, height: H, fill: GOLD }));
  let y = 96;

  // top eyebrow — location, on one line
  if (c.location) {
    L.push(T({ text: clampOneLine(c.location.toUpperCase(), 18, TW, false), x: LX, y, fontSize: 18, fontWeight: '600', color: GOLD, letterSpacing: 5, width: TW }));
    y += 40;
  }

  // Project name / listing title — auto-fits to max 3 lines so it never overflows
  const nameSize = fitFontSize(c.projectName, TW, 72, 34, 3, true);
  L.push(T({ text: c.projectName, x: LX, y, fontSize: nameSize, fontFamily: 'Playfair Display', fontWeight: '700', color: NAVY, lineHeight: 1.02, width: TW, role: 'headline' }));
  y += textHeight(c.projectName, nameSize, TW, 1.02, true) + 18;

  if (c.developer) {
    L.push(T({ text: clampOneLine(`BY ${c.developer.toUpperCase()}`, 19, TW, false), x: LX, y, fontSize: 19, fontWeight: '600', color: MUTED, letterSpacing: 3, width: TW }));
    y += 42;
  }

  // gold divider
  L.push(R({ x: LX, y, width: 56, height: 3, fill: GOLD, cornerRadius: 2 })); y += 28;

  const tag = c.tagline.toUpperCase();
  const tagSize = fitFontSize(tag, TW, 44, 26, 2);
  L.push(T({ text: tag, x: LX, y, fontSize: tagSize, fontWeight: '700', color: TEAL, lineHeight: 1.05, width: TW, role: 'subheadline' }));
  y += textHeight(tag, tagSize, TW, 1.05) + 36;

  // Info blocks flow after the headline area, clamped so they + the CTA always fit
  let by = Math.min(Math.max(y, 600), 1096 - 3 * 116);
  for (const b of [[c.configLabel, c.configValue], [c.priceLabel, c.priceValue], [c.detailLabel, c.detailValue]] as const) {
    L.push(...infoBlock(LX, by, b[0], clampOneLine(b[1], 32, TW - 22, false), GOLD, TEAL, NAVY, TW));
    by += 116;
  }

  L.push(...ctaPill(LX, 1126, 340, c.cta, NAVY, '#FFFFFF'));

  return frame(L, 'cove', 'luxury', [PANEL, NAVY, GOLD, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
