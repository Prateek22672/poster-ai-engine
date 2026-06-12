import type {
  Layer,
  BackgroundLayer,
  TextLayer,
  ShapeLayer,
  ImageLayer,
  GradientStop,
  PosterLayout,
} from '@/types/poster';

// ─── Background props ─────────────────────────────────────────────

export interface KonvaRectProps {
  x: number; y: number; width: number; height: number;
  fill?: string;
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: (number | string)[];
  fillRadialGradientStartPoint?: { x: number; y: number };
  fillRadialGradientEndPoint?: { x: number; y: number };
  fillRadialGradientStartRadius?: number;
  fillRadialGradientEndRadius?: number;
  fillRadialGradientColorStops?: (number | string)[];
  opacity?: number;
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  rotation?: number;
}

function gradientColorStops(stops: GradientStop[]): (number | string)[] {
  return stops.flatMap((s) => [s.stop, s.color]);
}

function angleToPoints(
  angle: number,
  width: number,
  height: number
): { start: { x: number; y: number }; end: { x: number; y: number } } {
  const rad = (angle * Math.PI) / 180;
  const len = Math.sqrt(width * width + height * height) / 2;
  const cx = width / 2;
  const cy = height / 2;
  return {
    start: { x: cx - Math.cos(rad) * len, y: cy - Math.sin(rad) * len },
    end: { x: cx + Math.cos(rad) * len, y: cy + Math.sin(rad) * len },
  };
}

export function backgroundToKonvaProps(layer: BackgroundLayer): KonvaRectProps {
  const base: KonvaRectProps = {
    x: 0, y: 0,
    width: layer.width ?? 1080,
    height: layer.height ?? 1350,
  };

  if (layer.fillType === 'solid') {
    return { ...base, fill: layer.color ?? '#000000' };
  }

  if (layer.fillType === 'gradient' && layer.gradient) {
    const g = layer.gradient;
    const w = base.width;
    const h = base.height;

    if (g.type === 'linear') {
      const pts = angleToPoints(g.angle ?? 180, w, h);
      return {
        ...base,
        fillLinearGradientStartPoint: pts.start,
        fillLinearGradientEndPoint: pts.end,
        fillLinearGradientColorStops: gradientColorStops(g.stops),
      };
    }

    if (g.type === 'radial') {
      const cx = (g.centerX ?? 0.5) * w;
      const cy = (g.centerY ?? 0.5) * h;
      const r = g.radius ?? Math.min(w, h) * 0.6;
      return {
        ...base,
        fillRadialGradientStartPoint: { x: cx, y: cy },
        fillRadialGradientEndPoint: { x: cx, y: cy },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: r,
        fillRadialGradientColorStops: gradientColorStops(g.stops),
      };
    }
  }

  return { ...base, fill: '#000000' };
}

// ─── Text props ───────────────────────────────────────────────────

export interface KonvaTextProps {
  x: number; y: number; width?: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontStyle?: string;
  fill: string;
  align?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textDecoration?: string;
  wrap?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  rotation?: number;
}

export function textToKonvaProps(layer: TextLayer): KonvaTextProps {
  return {
    x: layer.x,
    y: layer.y,
    width: layer.maxWidth ?? layer.width,
    text: layer.uppercase ? layer.text.toUpperCase() : layer.text,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    fontStyle: [
      layer.fontWeight === 'bold' || Number(layer.fontWeight ?? 400) >= 700
        ? 'bold'
        : '',
      layer.fontStyle === 'italic' ? 'italic' : '',
    ]
      .filter(Boolean)
      .join(' ') || 'normal',
    fill: layer.color,
    align: layer.align ?? 'left',
    letterSpacing: layer.letterSpacing ?? 0,
    lineHeight: layer.lineHeight ?? 1.2,
    textDecoration: layer.textDecoration,
    wrap: layer.wrap !== false ? 'word' : 'none',
    shadowColor: layer.shadowColor,
    shadowBlur: layer.shadowBlur,
    shadowOffsetX: layer.shadowOffsetX ?? 0,
    shadowOffsetY: layer.shadowOffsetY ?? 0,
    stroke: layer.strokeColor,
    strokeWidth: layer.strokeWidth,
    opacity: layer.opacity,
    rotation: layer.rotation,
  };
}

// ─── Shape props ──────────────────────────────────────────────────

export function shapeToKonvaProps(layer: ShapeLayer): Omit<KonvaRectProps, 'fillLinearGradientStartPoint' | 'fillLinearGradientEndPoint' | 'fillLinearGradientColorStops' | 'fillRadialGradientStartPoint' | 'fillRadialGradientEndPoint' | 'fillRadialGradientStartRadius' | 'fillRadialGradientEndRadius' | 'fillRadialGradientColorStops'> & {
  fill?: string; stroke?: string; strokeWidth?: number; rotation?: number; cornerRadius?: number;
} {
  return {
    x: layer.x,
    y: layer.y,
    width: layer.width ?? 100,
    height: layer.height ?? 100,
    fill: layer.fill,
    stroke: layer.stroke,
    strokeWidth: layer.strokeWidth,
    cornerRadius: layer.cornerRadius,
    opacity: layer.opacity,
    rotation: layer.rotation,
    shadowColor: layer.shadowColor,
    shadowBlur: layer.shadowBlur,
    shadowOffsetX: layer.shadowOffsetX ?? 0,
    shadowOffsetY: layer.shadowOffsetY ?? 0,
  };
}

// ─── Layer ordering ───────────────────────────────────────────────

/** Separate background from other layers (backgrounds render first) */
export function separateLayers(layout: PosterLayout): {
  backgrounds: BackgroundLayer[];
  foreground: (TextLayer | ShapeLayer | ImageLayer)[];
} {
  const backgrounds: BackgroundLayer[] = [];
  const foreground: (TextLayer | ShapeLayer | ImageLayer)[] = [];

  for (const layer of layout.layers) {
    if (layer.visible === false) continue;
    if (layer.type === 'background') {
      backgrounds.push(layer as BackgroundLayer);
    } else {
      foreground.push(layer as TextLayer | ShapeLayer | ImageLayer);
    }
  }

  return { backgrounds, foreground };
}

// ─── Export helpers ───────────────────────────────────────────────

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
