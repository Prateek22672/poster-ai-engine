import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, photoBg, scrim, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// GLASS CARDS — full photo + soft scrim, brand + serif name top, a stack of
// frosted glass info cards (config / price / detail), CTA at the bottom.
const M = 80, CW = 460;
export const glasscardsLabel = 'Glass Cards';

export function buildGlassCards(c: RealEstateContent, url?: string | null, _photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('glasscards', theme);
  const GOLD = t.gold, WHITE = t.white, MUTED = t.muted, CARD = t.card;
  const L: Layer[] = [photoBg(url), scrim(0, 0, W, H, t.scrim, 0.4)];
  L.push(R({ x: 0, y: 0, width: W, height: 420, fill: t.scrim, opacity: 0.35 }));

  let y = 90;
  if (c.developer || c.brand) { L.push(T({ text: clampOneLine((c.developer || c.brand || '').toUpperCase(), 22, W - 2 * M, false), x: M, y, fontSize: 22, fontWeight: '700', color: WHITE, letterSpacing: 4, width: W - 2 * M })); y += 46; }
  const ns = fitFontSize(c.projectName, W - 2 * M, 96, 50, 2, true);
  L.push(T({ text: c.projectName, x: M, y, fontSize: ns, fontFamily: t.font, fontWeight: '700', color: WHITE, lineHeight: 1.0, width: W - 2 * M, role: 'headline' }));
  y += textHeight(c.projectName, ns, W - 2 * M, 1.0, true) + 6;
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 20, W - 2 * M, false), x: M, y, fontSize: 20, fontWeight: '600', color: GOLD, letterSpacing: 4, width: W - 2 * M }));

  // glass info cards (right-aligned stack)
  const cards: Array<[string, string]> = [[c.configLabel, c.configValue], [c.priceLabel, c.priceValue], [c.detailLabel, c.detailValue]];
  let cy = 720;
  for (const [label, value] of cards) {
    L.push(R({ x: W - M - CW, y: cy, width: CW, height: 112, fill: CARD, cornerRadius: 18, stroke: 'rgba(255,255,255,0.18)', strokeWidth: 1 }));
    L.push(T({ text: clampOneLine(label.toUpperCase(), 15, CW - 44, false), x: W - M - CW + 22, y: cy + 22, fontSize: 15, fontWeight: '600', color: GOLD, letterSpacing: 2, width: CW - 44 }));
    L.push(T({ text: clampOneLine(value, 30, CW - 44, false), x: W - M - CW + 22, y: cy + 50, fontSize: 30, fontWeight: '700', color: WHITE, width: CW - 44 }));
    cy += 128;
  }

  L.push(...ctaPill(M, 1188, 340, c.cta, t.cta, t.ctaText));
  if (c.location) L.push(T({ text: clampOneLine(c.location.toUpperCase(), 16, 420, false), x: W - M - 420, y: 1214, fontSize: 16, fontWeight: '600', color: MUTED, letterSpacing: 2, width: 420, align: 'right' }));

  return frame(L, 'glasscards', 'luxury', [t.scrim, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
