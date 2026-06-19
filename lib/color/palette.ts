import { createCanvas, loadImage } from '@napi-rs/canvas';
import type { ColorMap } from '@/lib/templates/realestate/theme';

/**
 * Photo-aware colour engine. Samples the hero image, finds its dominant hue,
 * then derives a PREMIUM palette that matches the photo instead of always using
 * gold-on-navy:
 *   • dark base  = a deep, rich tone in the photo's own hue (harmonises)
 *   • accent     = a curated premium accent, usually complementary to the photo
 *                  (warm photo → cool accent, cool photo → warm accent)
 * Returns a theme override touching only the dark-base + accent keys, so light
 * surfaces (cove's cream panel, minimal's paper) are left intact. Null on any
 * failure → templates fall back to their defaults.
 */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return '#' + to(r) + to(g) + to(b);
}

// Curated premium accents — mostly complementary to the photo's dominant hue.
function pickAccent(h: number, s: number): string {
  if (s < 0.12) return '#C9A24B';                       // grayscale photo → champagne gold
  if (h >= 200 && h <= 285) return '#D8B26A';           // blue → warm champagne gold
  if (h >= 160 && h < 200) return '#C98A4E';            // cyan/teal → copper
  if (h >= 75 && h < 160) return '#C9A24B';             // green → gold
  if (h >= 285 || h < 18) return '#2F7488';             // magenta/red → teal
  return '#2E8B6B';                                     // orange/brown → emerald
}

async function toBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:')) return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

export async function paletteFromImage(url?: string | null): Promise<ColorMap | null> {
  if (!url) return null;
  try {
    const img = await loadImage(await toBuffer(url));
    const N = 36;
    const ctx = createCanvas(N, N).getContext('2d');
    ctx.drawImage(img, 0, 0, N, N);
    const data = ctx.getImageData(0, 0, N, N).data;

    // Weighted average — favour colourful, mid-luminance pixels (the "subject").
    let r = 0, g = 0, b = 0, w = 0;
    for (let i = 0; i < data.length; i += 4) {
      const R = data[i], G = data[i + 1], B = data[i + 2];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B);
      const sat = mx === 0 ? 0 : (mx - mn) / mx;
      const lum = (mx + mn) / 510;
      const wt = (0.15 + sat) * (lum > 0.08 && lum < 0.93 ? 1 : 0.15);
      r += R * wt; g += G * wt; b += B * wt; w += wt;
    }
    if (!w) return null;
    const [h, s] = rgbToHsl(r / w, g / w, b / w);

    const dark = hslToHex(h, clamp(s * 0.7, 0.16, 0.4), 0.09);  // deep, rich, legible base
    const accent = pickAccent(h, s);
    // Only dark-base + accent keys — never the light surfaces (panel/paper/ink).
    return { gold: accent, scrim: dark, bg: dark, navy: dark, col: dark };
  } catch {
    return null;
  }
}
