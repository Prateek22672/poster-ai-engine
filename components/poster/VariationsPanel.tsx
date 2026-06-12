'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, Check } from 'lucide-react';
import { PosterCanvas } from './PosterCanvas';
import type { PosterVariation, PosterLayout } from '@/types/poster';

interface VariationsPanelProps {
  primaryLayout: PosterLayout;
  variations: PosterVariation[];
  activeLayoutId: string;
  onSelectVariation: (layout: PosterLayout) => void;
  prompt: string;
  onRegenerate?: () => Promise<void>;
}

export function VariationsPanel({
  primaryLayout,
  variations,
  activeLayoutId,
  onSelectVariation,
  prompt,
  onRegenerate,
}: VariationsPanelProps) {
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    if (!onRegenerate) return;
    setRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setRegenerating(false);
    }
  }

  // All variants: primary + variations
  const allVariants: Array<{ id: string; label: string; layout: PosterLayout }> = [
    { id: primaryLayout.id, label: 'Primary', layout: primaryLayout },
    ...variations.map((v) => ({ id: v.id, label: v.label, layout: v.layout })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Variations</h3>
        {onRegenerate && (
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors disabled:opacity-50"
            title="Regenerate all"
          >
            {regenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            Regen
          </button>
        )}
      </div>

      <div className="space-y-2">
        {allVariants.map(({ id, label, layout }) => {
          const isActive = id === activeLayoutId || layout.id === activeLayoutId;

          return (
            <button
              key={id}
              onClick={() => onSelectVariation(layout)}
              className={`
                w-full text-left rounded-lg overflow-hidden border-2 transition-all
                ${isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 hover:border-white/30'}
              `}
            >
              {/* Mini preview */}
              <div className="relative bg-ink" style={{ height: 120 }}>
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{ pointerEvents: 'none' }}
                >
                  <div style={{ transform: 'scale(0.2)', transformOrigin: 'center center' }}>
                    <PosterCanvas layout={layout} scale={1} />
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-1.5 right-1.5 bg-indigo-600 rounded-full p-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Color swatches */}
                <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                  {layout.palette.slice(0, 4).map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border border-black/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Label */}
              <div className={`
                px-2.5 py-1.5 text-xs font-medium transition-colors
                ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/50'}
              `}>
                {label}
              </div>
            </button>
          );
        })}
      </div>

      {regenerating && (
        <div className="text-xs text-white/40 text-center py-2 animate-pulse">
          Generating new design…
        </div>
      )}
    </div>
  );
}
