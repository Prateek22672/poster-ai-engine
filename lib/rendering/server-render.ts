import { createCanvas, loadImage, GlobalFonts, type SKRSContext2D } from '@napi-rs/canvas';
import { join } from 'node:path';
import type { PosterLayout, Layer, BackgroundLayer, TextLayer, ShapeLayer, ImageLayer } from '@/types/poster';

/**
 * Headless (server-side) renderer — draws a PosterLayout to a PNG buffer using
 * @napi-rs/canvas. This is what lets the /api/v1 service return an image without
 * a browser. It mirrors the client Konva renderer closely.
 *
 * FONTS: serverless runtimes (Vercel) ship NO system fonts, so fillText draws
 * nothing — invisible text. We bundle the real .ttf files (lib/rendering/fonts)
 * and register them once with GlobalFonts before any draw. "Switzer" (a paid
 * font we don't ship) is aliased to Inter so existing layouts resolve.
 */

// ── font registration (runs once at module load) ────────────────
const FONT_DIR = join(process.cwd(), 'lib', 'rendering', 'fonts');
let fontsReady = false;
function ensureFonts(): void {
  if (fontsReady) return;
  fontsReady = true;
  const reg = (file: string, family: string) => {
    try {
      if (!GlobalFonts.has(family)) GlobalFonts.registerFromPath(join(FONT_DIR, file), family);
    } catch (e) {
      console.error(`[server-render] font register failed (${family}):`, e instanceof Error ? e.message : e);
    }
  };
  reg('PlayfairDisplay.ttf', 'Playfair Display');
  reg('Syne.ttf', 'Syne');
  reg('Oswald.ttf', 'Oswald');
  reg('CormorantGaramond.ttf', 'Cormorant Garamond');
  reg('Inter.ttf', 'Inter');
  reg('Inter.ttf', 'Switzer'); // alias: we don't ship the paid Switzer font
  // ── extra display/text fonts ──────────────────────────────────
  reg('SpaceGrotesk.ttf', 'Space Grotesk');
  reg('HostGrotesk.ttf', 'Host Grotesk');
  reg('SansitaSwashed.ttf', 'Sansita Swashed');
  reg('ClimateCrisis.otf', 'Climate Crisis');
  reg('Gnomon.ttf', 'Gnomon');
  reg('Karrik.ttf', 'Karrik');
  reg('VioletSans.ttf', 'Violet Sans');
  // ── LT display family ─────────────────────────────────────────
  reg('LTAvocado.ttf', 'LT Avocado');
  reg('LTBeverage.otf', 'LT Beverage');
  reg('LTCrow.ttf', 'LT Crow');
  reg('LTDelilah.ttf', 'LT Delilah');
  reg('LTHumor.ttf', 'LT Humor');
  reg('LTInstitute.otf', 'LT Institute');
  reg('LTMakeup.otf', 'LT Makeup');
  reg('LTOval.otf', 'LT Oval');
  reg('LTRenovate.otf', 'LT Renovate');
  reg('LTSaeada.otf', 'LT Saeada');
  reg('LTSonoma.otf', 'LT Sonoma');
  reg('LTSoul.otf', 'LT Soul');
  reg('LTSpaz.otf', 'LT Spaz');
  reg('LTSuperior.otf', 'LT Superior');
  reg('LTWave.otf', 'LT Wave');
}

function fontStack(family?: string): string {
  const f = family ?? 'Inter';
  const serif = /playfair|cormorant|garamond/i.test(f);
  return `"${f}", ${serif ? 'Georgia, serif' : 'Inter, Arial, sans-serif'}`;
}

async function fetchImage(url: string) {
  // base64 data URL (e.g. an agent-uploaded photo) — decode directly
  if (url.startsWith('data:')) {
    const b64 = url.slice(url.indexOf(',') + 1);
    return loadImage(Buffer.from(b64, 'base64'));
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image fetch ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return loadImage(buf);
}

function roundRectPath(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// cover-fit draw of an image into a box
function drawCover(ctx: SKRSContext2D, img: Awaited<ReturnType<typeof loadImage>>, x: number, y: number, w: number, h: number) {
  const ir = img.width / img.height;
  const br = w / h;
  let dw = w, dh = h, dx = x, dy = y;
  if (ir > br) { dh = h; dw = h * ir; dx = x - (dw - w) / 2; }
  else { dw = w; dh = w / ir; dy = y - (dh - h) / 2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function wrapLines(ctx: SKRSContext2D, text: string, maxWidth: number): string[] {
  if (!maxWidth) return text.split('\n');
  const out: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    out.push(line);
  }
  return out;
}

async function drawBackground(ctx: SKRSContext2D, layer: BackgroundLayer, W: number, H: number) {
  if (layer.fillType === 'image' && layer.imageUrl) {
    try {
      const img = await fetchImage(layer.imageUrl);
      drawCover(ctx, img, 0, 0, W, H);
    } catch {
      ctx.fillStyle = '#0A1B2E';
      ctx.fillRect(0, 0, W, H);
    }
    if (layer.overlay) {
      ctx.globalAlpha = layer.overlay.opacity;
      ctx.fillStyle = layer.overlay.color;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    return;
  }
  if (layer.fillType === 'gradient' && layer.gradient) {
    const g = layer.gradient;
    let grad;
    if (g.type === 'radial') {
      grad = ctx.createRadialGradient((g.centerX ?? 0.5) * W, (g.centerY ?? 0.5) * H, 0, (g.centerX ?? 0.5) * W, (g.centerY ?? 0.5) * H, g.radius ?? W);
    } else {
      const a = ((g.angle ?? 0) * Math.PI) / 180;
      grad = ctx.createLinearGradient(0, 0, Math.cos(a) * W, Math.sin(a) * H);
    }
    for (const s of g.stops) grad.addColorStop(s.stop, s.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    return;
  }
  ctx.fillStyle = layer.color ?? '#0A0A0A';
  ctx.fillRect(0, 0, W, H);
}

function drawShape(ctx: SKRSContext2D, layer: ShapeLayer) {
  const { x, y, width = 100, height = 100 } = layer;
  ctx.globalAlpha = layer.opacity ?? 1;
  if (layer.shapeType === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    if (layer.fill) { ctx.fillStyle = layer.fill; ctx.fill(); }
  } else if (layer.shapeType === 'line') {
    ctx.strokeStyle = layer.fill ?? layer.stroke ?? '#FFFFFF';
    ctx.lineWidth = height || layer.strokeWidth || 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
  } else {
    roundRectPath(ctx, x, y, width, height, layer.cornerRadius ?? 0);
    if (layer.fill) { ctx.fillStyle = layer.fill; ctx.fill(); }
    if (layer.stroke && layer.strokeWidth) { ctx.strokeStyle = layer.stroke; ctx.lineWidth = layer.strokeWidth; ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
}

function drawText(ctx: SKRSContext2D, layer: TextLayer) {
  const size = layer.fontSize;
  const weight = layer.fontWeight ?? '400';
  ctx.font = `${weight} ${size}px ${fontStack(layer.fontFamily)}`;
  ctx.fillStyle = layer.color ?? '#FFFFFF';
  ctx.textBaseline = 'top';
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = `${layer.letterSpacing ?? 0}px`; } catch { /* noop */ }

  const text = layer.uppercase ? layer.text.toUpperCase() : layer.text;
  const boxW = layer.width ?? 0;
  const lines = wrapLines(ctx, text, boxW);
  const lh = size * (layer.lineHeight ?? 1.15);
  const align = layer.align ?? 'left';
  ctx.textAlign = align as CanvasTextAlign;

  let anchorX = layer.x;
  if (boxW) {
    if (align === 'center') anchorX = layer.x + boxW / 2;
    else if (align === 'right') anchorX = layer.x + boxW;
  }

  lines.forEach((line, i) => {
    ctx.fillText(line, anchorX, layer.y + i * lh);
  });
  try { (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'; } catch { /* noop */ }
}

async function drawImageLayer(ctx: SKRSContext2D, layer: ImageLayer) {
  if (!layer.src) return;
  try {
    const img = await fetchImage(layer.src);
    const w = layer.width ?? img.width;
    const h = layer.height ?? img.height;
    ctx.globalAlpha = layer.opacity ?? 1;
    // Always clip to the box (rounded if asked) so cover-fit overflow can't
    // bleed into neighbouring photos in a multi-image collage.
    const r = layer.cornerRadius ?? 0;
    const clip = layer.fit !== 'contain';
    if (clip) { ctx.save(); roundRectPath(ctx, layer.x, layer.y, w, h, r); ctx.clip(); }
    if (layer.fit === 'contain') ctx.drawImage(img, layer.x, layer.y, w, h);
    else drawCover(ctx, img, layer.x, layer.y, w, h);
    if (clip) ctx.restore();
    ctx.globalAlpha = 1;
  } catch { /* skip broken image */ }
}

/** Render a layout to a PNG buffer (server-side, no browser). */
export async function renderLayoutToPng(layout: PosterLayout): Promise<Buffer> {
  ensureFonts();
  const W = layout.dimensions.width;
  const H = layout.dimensions.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // base fill
  ctx.fillStyle = '#0A0A0A';
  ctx.fillRect(0, 0, W, H);

  for (const layer of layout.layers as Layer[]) {
    if (layer.type === 'background') await drawBackground(ctx, layer as BackgroundLayer, W, H);
    else if (layer.type === 'shape') drawShape(ctx, layer as ShapeLayer);
    else if (layer.type === 'text') drawText(ctx, layer as TextLayer);
    else if (layer.type === 'image') await drawImageLayer(ctx, layer as ImageLayer);
  }

  return canvas.toBuffer('image/png');
}
