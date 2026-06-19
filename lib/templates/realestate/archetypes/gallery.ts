import type { Layer, PosterLayout } from '@/types/poster';
import type { RealEstateContent } from '../content';
import { W, H, T, R, img, scrim, ctaPill, fitFontSize, textHeight, clampOneLine, frame } from '../toolkit';
import { getTheme, type ColorMap } from '../theme';

// GALLERY — multi-photo collage: a hero photo up top with the title, then a row
// of up to 3 secondary photos, with price + features + CTA on a dark base.
const M = 48, HERO_H = 812;

export const galleryLabel = 'Photo Gallery';

export function buildGallery(c: RealEstateContent, url?: string | null, photos?: string[], theme?: ColorMap): PosterLayout {
  const t = getTheme('gallery', theme);
  const NAVY = t.navy, GOLD = t.gold, WHITE = t.white, MUTED = t.muted;
  const pics = (photos && photos.length ? photos : url ? [url] : []).filter(Boolean) as string[];
  const hero = pics[0];
  const thumbs = pics.slice(1, 4);

  const L: Layer[] = [R({ x: 0, y: 0, width: W, height: H, fill: NAVY })];
  if (hero) L.push(img(hero, 0, 0, W, HERO_H));
  // scrim on the hero bottom for title legibility
  L.push(scrim(0, HERO_H - 360, W, 360, '#06101C', 0.55, 0));

  // Title block over the hero
  let ty = HERO_H - 320;
  if (c.location) {
    L.push(T({ text: clampOneLine(c.location.toUpperCase(), 20, W - 2 * M, false), x: M, y: ty, fontSize: 20, fontWeight: '600', color: GOLD, letterSpacing: 5, width: W - 2 * M }));
    ty += 40;
  }
  const nameSize = fitFontSize(c.projectName, W - 2 * M, 76, 40, 2, true);
  L.push(T({ text: c.projectName, x: M, y: ty, fontSize: nameSize, fontFamily: 'Playfair Display', fontWeight: '700', color: WHITE, lineHeight: 1.0, width: W - 2 * M, role: 'headline' }));
  ty += textHeight(c.projectName, nameSize, W - 2 * M, 1.0, true) + 10;
  L.push(T({ text: clampOneLine(c.tagline.toUpperCase(), 22, W - 2 * M, false), x: M, y: ty, fontSize: 22, fontWeight: '600', color: MUTED, letterSpacing: 3, width: W - 2 * M }));

  // Thumbnail row
  if (thumbs.length) {
    const gap = 16;
    const rowW = W - 2 * M;
    const tw = Math.floor((rowW - (thumbs.length - 1) * gap) / thumbs.length);
    const tY = HERO_H + 28, tH = 214;
    thumbs.forEach((src, i) => {
      const x = M + i * (tw + gap);
      L.push(img(src, x, tY, tw, tH, 14));
      L.push(R({ x, y: tY, width: tw, height: tH, fill: 'transparent', stroke: 'rgba(255,255,255,0.12)', strokeWidth: 1, cornerRadius: 14 }));
    });
  }

  // Price + features
  const infoY = thumbs.length ? HERO_H + 290 : HERO_H + 60;
  L.push(T({ text: c.priceLabel.toUpperCase(), x: M, y: infoY, fontSize: 16, fontWeight: '600', color: GOLD, letterSpacing: 3, width: 480 }));
  L.push(T({ text: clampOneLine(c.priceValue, 46, 480, false), x: M, y: infoY + 24, fontSize: 46, fontWeight: '700', color: WHITE, width: 480 }));
  L.push(R({ x: W / 2 + 30, y: infoY + 6, width: 1, height: 66, fill: 'rgba(255,255,255,0.18)' }));
  L.push(T({ text: c.configLabel.toUpperCase(), x: W / 2 + 64, y: infoY, fontSize: 16, fontWeight: '600', color: GOLD, letterSpacing: 3, width: W / 2 - 64 - M }));
  L.push(T({ text: clampOneLine(c.configValue, 28, W / 2 - 64 - M, false), x: W / 2 + 64, y: infoY + 26, fontSize: 28, fontWeight: '700', color: WHITE, width: W / 2 - 64 - M }));

  // CTA + brand
  L.push(...ctaPill(M, H - 124, 340, c.cta, t.cta, t.ctaText));
  if (c.brand) L.push(T({ text: clampOneLine(c.brand.toUpperCase(), 20, 360, false), x: W - M - 360, y: H - 96, fontSize: 20, fontWeight: '700', color: WHITE, letterSpacing: 2, width: 360, align: 'right' }));

  return frame(L, 'gallery', 'luxury', [NAVY, GOLD, WHITE, MUTED, '#FFFFFF'], ['Playfair Display', 'Switzer']);
}
