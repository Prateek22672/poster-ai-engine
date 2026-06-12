'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type Konva from 'konva';
import type { PosterLayout } from '@/types/poster';

// Dynamically import — Konva requires browser environment
const PosterCanvasInner = dynamic(
  () => import('./PosterCanvasInner').then((m) => ({ default: m.PosterCanvasInner })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-ink rounded-lg animate-pulse"
        style={{ width: 486, height: 607 }}>
        <span className="text-white/40 text-sm">Initializing canvas…</span>
      </div>
    ),
  }
);

interface PosterCanvasProps {
  layout: PosterLayout;
  scale?: number;
  selectedLayerId?: string;
  onLayerSelect?: (id: string | null) => void;
  stageRef?: React.RefObject<Konva.Stage | null>;
  /** Fires once when fonts + background image are fully loaded (canvas painted). */
  onReady?: () => void;
  className?: string;
}

export function PosterCanvas({
  layout,
  scale = 0.45,
  selectedLayerId,
  onLayerSelect,
  stageRef,
  onReady,
  className,
}: PosterCanvasProps) {
  const internalRef = useRef<Konva.Stage | null>(null);
  const ref = stageRef ?? internalRef;

  return (
    <div className={className}>
      <PosterCanvasInner
        layout={layout}
        scale={scale}
        selectedLayerId={selectedLayerId}
        onLayerSelect={onLayerSelect}
        stageRef={ref}
        onReady={onReady}
      />
    </div>
  );
}

export default PosterCanvas;
