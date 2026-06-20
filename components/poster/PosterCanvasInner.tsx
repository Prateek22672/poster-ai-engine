'use client';

import {
  Stage, Layer, Rect, Text, Image as KonvaImage, Ellipse,
} from 'react-konva';
import { useEffect, useState, useRef, useCallback } from 'react';
import useImage from 'use-image';
import type Konva from 'konva';
import type {
  PosterLayout, BackgroundLayer, TextLayer, ShapeLayer, ImageLayer,
} from '@/types/poster';
import {
  backgroundToKonvaProps,
  textToKonvaProps,
  shapeToKonvaProps,
  separateLayers,
  downloadDataUrl,
} from '@/lib/rendering/engine';
import { loadFontsForCanvas } from '@/lib/rendering/font-loader';

// ─── Per-layer renderers ──────────────────────────────────────────

function BackgroundLayerRenderer({ layer }: { layer: BackgroundLayer }) {
  const props = backgroundToKonvaProps(layer);
  const [bgImage] = useImage(
    layer.fillType === 'image' ? (layer.imageUrl ?? '') : '',
    'anonymous'
  );

  if (layer.fillType === 'image' && layer.imageUrl) {
    return (
      <>
        <KonvaImage
          image={bgImage}
          x={0} y={0}
          width={props.width} height={props.height}
        />
        {layer.overlay && (
          <Rect
            x={0} y={0}
            width={props.width} height={props.height}
            fill={layer.overlay.color}
            opacity={layer.overlay.opacity}
          />
        )}
      </>
    );
  }

  return <Rect {...props} />;
}

function TextLayerRenderer({
  layer, isSelected, onClick,
}: {
  layer: TextLayer;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const props = textToKonvaProps(layer);
  return (
    <>
      <Text
        {...props}
        onClick={onClick}
        onTap={onClick}
        cursor="pointer"
      />
      {isSelected && (
        <Rect
          x={layer.x - 4} y={layer.y - 4}
          width={(layer.width ?? 200) + 8} height={layer.fontSize + 8}
          stroke="#6366f1"
          strokeWidth={2}
          dash={[6, 3]}
          fill="transparent"
        />
      )}
    </>
  );
}

function ShapeLayerRenderer({
  layer, isSelected, onClick,
}: {
  layer: ShapeLayer;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const props = shapeToKonvaProps(layer);

  if (layer.shapeType === 'circle') {
    const radiusX = (layer.width ?? 100) / 2;
    const radiusY = (layer.height ?? 100) / 2;
    // Konva Ellipse is positioned by its CENTER; layer x/y is the top-left.
    return (
      <Ellipse
        x={layer.x + radiusX}
        y={layer.y + radiusY}
        radiusX={radiusX}
        radiusY={radiusY}
        fill={layer.fill}
        stroke={layer.stroke}
        strokeWidth={layer.strokeWidth}
        opacity={layer.opacity}
        rotation={layer.rotation}
        shadowColor={layer.shadowColor}
        shadowBlur={layer.shadowBlur}
        onClick={onClick}
        onTap={onClick}
      />
    );
  }

  return (
    <Rect
      {...props}
      onClick={onClick}
      onTap={onClick}
      cursor="pointer"
    />
  );
}

function ImageLayerRenderer({ layer }: { layer: ImageLayer }) {
  const [image] = useImage(layer.src, 'anonymous');
  if (!image) return null;
  return (
    <KonvaImage
      image={image}
      x={layer.x} y={layer.y}
      width={layer.width} height={layer.height}
      cornerRadius={layer.cornerRadius}
      opacity={layer.opacity}
    />
  );
}

// ─── Main canvas ──────────────────────────────────────────────────

export interface PosterCanvasInnerProps {
  layout: PosterLayout;
  scale?: number;
  selectedLayerId?: string;
  onLayerSelect?: (id: string | null) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  onReady?: () => void;
}

export function PosterCanvasInner({
  layout,
  scale = 0.45,
  selectedLayerId,
  onLayerSelect,
  stageRef,
  onReady,
}: PosterCanvasInnerProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const internalRef = useRef<Konva.Stage | null>(null);
  const ref = stageRef ?? internalRef;
  const readyFired = useRef(false);

  // Load the template's declared fonts PLUS any font actually used by a text
  // layer (e.g. a font picked in the studio) so the preview matches the output.
  const usedFonts = Array.from(new Set([
    ...layout.fonts,
    ...layout.layers.filter((l) => l.type === 'text').map((l) => (l as TextLayer).fontFamily).filter(Boolean),
  ])) as string[];
  const fontsKey = usedFonts.join('|');
  useEffect(() => {
    setFontsLoaded(false);
    loadFontsForCanvas(usedFonts).then(() => setFontsLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsKey]);

  // Track background-image readiness so onReady only fires once everything is painted
  const bgUrl = layout.layers.find(
    (l) => l.type === 'background' && (l as BackgroundLayer).fillType === 'image'
  ) as BackgroundLayer | undefined;
  const [, bgStatus] = useImage(bgUrl?.imageUrl ?? '', 'anonymous');

  useEffect(() => {
    if (readyFired.current) return;
    const bgDone = !bgUrl?.imageUrl || bgStatus === 'loaded' || bgStatus === 'failed';
    if (fontsLoaded && bgDone) {
      readyFired.current = true;
      // next frame so Konva has actually drawn
      const t = setTimeout(() => onReady?.(), 150);
      return () => clearTimeout(t);
    }
  }, [fontsLoaded, bgStatus, bgUrl?.imageUrl, onReady]);

  const { backgrounds, foreground } = separateLayers(layout);
  const W = layout.dimensions.width * scale;
  const H = layout.dimensions.height * scale;

  if (!fontsLoaded) {
    return (
      <div
        style={{ width: W, height: H }}
        className="bg-ink animate-pulse-slow flex items-center justify-center rounded"
      >
        <span className="text-white/40 text-sm">Loading fonts…</span>
      </div>
    );
  }

  return (
    <Stage
      ref={ref as React.RefObject<Konva.Stage>}
      width={W}
      height={H}
      scaleX={scale}
      scaleY={scale}
      onClick={(e) => {
        if (e.target === e.target.getStage()) {
          onLayerSelect?.(null);
        }
      }}
    >
      <Layer>
        {/* Backgrounds */}
        {backgrounds.map((bg) => (
          <BackgroundLayerRenderer key={bg.id} layer={bg} />
        ))}

        {/* Foreground layers */}
        {foreground.map((layer) => {
          const isSelected = layer.id === selectedLayerId;

          if (layer.type === 'text') {
            return (
              <TextLayerRenderer
                key={layer.id}
                layer={layer as TextLayer}
                isSelected={isSelected}
                onClick={() => onLayerSelect?.(layer.id)}
              />
            );
          }
          if (layer.type === 'shape') {
            return (
              <ShapeLayerRenderer
                key={layer.id}
                layer={layer as ShapeLayer}
                isSelected={isSelected}
                onClick={() => onLayerSelect?.(layer.id)}
              />
            );
          }
          if (layer.type === 'image') {
            return <ImageLayerRenderer key={layer.id} layer={layer as ImageLayer} />;
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}

// ─── Export helper (called externally via stageRef) ───────────────
export function exportStageToDataUrl(
  stage: Konva.Stage,
  pixelRatio = 2
): string {
  return stage.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio });
}

export { downloadDataUrl };
