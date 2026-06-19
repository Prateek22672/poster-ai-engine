import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, img, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// EDITORIAL SPLIT — photo on top, dark panel below, a big serif headline sitting
// on the seam, a serif sub-line, a 3-column spec row and CTA. Magazine feel.
const M = 80, SPLIT = 620;
export const splitpanelLabel = 'Editorial Split';

export function buildSplitPanel(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('splitpanel', theme);
  const PANEL = t.panel, GOLD = t.gold, WHITE = t.white, MUTED = t.muted;
  const L: Layer[] = [R({ x: 0, y: 0, width: W, height: H, fill: PANEL })];
  if (url) L.push(img(url, 0, 0, W, SPLIT));
  L.push(R({ x: 0, y: SPLIT - 220, width: W, height: 220, fill: PANEL, opacity: 0.5 })); // blend the seam

  // eyebrow over the photo
  if (c.location) L.push(T({ text: clampOneLine(c.location.toUpperCase(), 18, W - 2 * M, false), x: 0, y: 70, fontSize: 18, fontWeight: '600', color: WHITE, letterSpacing: 5, width: W, align: 'center' }));

  // big headline straddling the seam
  const ns = fitFontSize(c.projectName.toUpperCase(), W - 2 * M, 116, 56, 2, true);
  const nh = textHeight(c.projectName.toUpperCase(), ns, W - 2 * M, 0.96, true);
  L.push(T({ text: c.projectName.toUpperCase(), x: M, y: SPLIT - nh / 2, fontSize: ns, fontFamily: 'Playfair Display', fontWeight: '800', color: WHITE, lineHeight: 0.96, letterSpacing: 1, width: W - 2 * M, align: 'center', role: 'headline' }));

  let y = SPLIT + nh / 2 + 26;
  L.push(T({ text: clampOneLine(c.tagline, 28, W - 2 * M, false), x: 0, y, fontSize: 28, fontFamily: 'Playfair Display', fontWeight: '500', color: GOLD, width: W, align: 'center' }));
  y += 70;
  L.push(R({ x: W / 2 - 30, y, width: 60, height: 2, fill: GOLD })); y += 40;

  // 3-column specs
  const cols: Array<[string, string]> = [[c.configLabel, c.configValue], [c.priceLabel, c.priceValue], [c.detailLabel, c.detailValue]];
  const innerW = W - 2 * M, colW = innerW / 3;
  cols.forEach(([label, value], i) => {
    const x = M + i * colW;
    if (i > 0) L.push(R({ x, y: y + 2, width: 1, height: 64, fill: 'rgba(255,255,255,0.22)' }));
    L.push(T({ text: clampOneLine(label.toUpperCase(), 14, colW - 12, false), x, y, fontSize: 14, fontWeight: '600', color: GOLD, letterSpacing: 2, width: colW, align: 'center' }));
    L.push(T({ text: clampOneLine(value, 20, colW - 12, false), x, y: y + 26, fontSize: 22, fontWeight: '700', color: WHITE, width: colW, align: 'center' }));
  });

  L.push(...ctaPill(W / 2 - 170, 1180, 340, c.cta, t.cta, t.ctaText));
  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 16, 500, false), x: 0, y: 1290, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 3, width: W, align: 'center' }));

  return frame(L, 'splitpanel', 'elegant', [PANEL, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
