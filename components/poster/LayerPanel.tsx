'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Type, Square, Image as ImageIcon } from 'lucide-react';
import type { PosterLayout, Layer, TextLayer } from '@/types/poster';

interface LayerPanelProps {
  layout: PosterLayout;
  selectedLayerId?: string | null;
  onLayerSelect: (id: string) => void;
  onLayerUpdate: (id: string, patch: Partial<Layer>) => void;
}

function LayerIcon({ type }: { type: Layer['type'] }) {
  if (type === 'text') return <Type className="w-3.5 h-3.5" />;
  if (type === 'image') return <ImageIcon className="w-3.5 h-3.5" />;
  return <Square className="w-3.5 h-3.5" />;
}

function layerLabel(layer: Layer): string {
  if ('name' in layer && layer.name) return layer.name as string;
  if (layer.type === 'text') return `"${(layer as TextLayer).text.slice(0, 20)}"`;
  return layer.type;
}

export function LayerPanel({
  layout, selectedLayerId, onLayerSelect, onLayerUpdate,
}: LayerPanelProps) {
  // Show layers back-to-front (top of list = top of canvas)
  const layers = [...layout.layers].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-white/10">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;
          const visible = layer.visible !== false;
          const locked = layer.locked === true;

          return (
            <div
              key={layer.id}
              onClick={() => onLayerSelect(layer.id)}
              className={`
                flex items-center gap-2 px-3 py-2 cursor-pointer text-sm
                transition-colors border-b border-white/5
                ${isSelected
                  ? 'bg-indigo-500/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'}
              `}
            >
              {/* Layer type icon */}
              <span className="text-white/40 flex-shrink-0">
                <LayerIcon type={layer.type} />
              </span>

              {/* Layer name */}
              <span className="flex-1 truncate text-xs">{layerLabel(layer)}</span>

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerUpdate(layer.id, { visible: !visible });
                }}
                className="flex-shrink-0 text-white/30 hover:text-white/80 transition-colors"
                title={visible ? 'Hide layer' : 'Show layer'}
              >
                {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>

              {/* Lock toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLayerUpdate(layer.id, { locked: !locked });
                }}
                className="flex-shrink-0 text-white/30 hover:text-white/80 transition-colors"
                title={locked ? 'Unlock layer' : 'Lock layer'}
              >
                {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Selected Layer Properties Editor ────────────────────────────

interface LayerPropsEditorProps {
  layer: Layer | null;
  onUpdate: (patch: Partial<Layer>) => void;
}

export function LayerPropsEditor({ layer, onUpdate }: LayerPropsEditorProps) {
  if (!layer) {
    return (
      <div className="p-4 text-white/30 text-xs text-center">
        Select a layer to edit its properties
      </div>
    );
  }

  if (layer.type === 'text') {
    const tl = layer as TextLayer;
    return (
      <div className="p-3 space-y-3">
        <div>
          <label className="text-xs text-white/50 block mb-1">Text</label>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white resize-none"
            rows={3}
            value={tl.text}
            onChange={(e) => onUpdate({ text: e.target.value } as Partial<TextLayer>)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-white/50 block mb-1">Font Size</label>
            <input
              type="number"
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
              value={tl.fontSize}
              onChange={(e) => onUpdate({ fontSize: Number(e.target.value) } as Partial<TextLayer>)}
            />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Color</label>
            <input
              type="color"
              className="w-full h-9 bg-white/5 border border-white/10 rounded cursor-pointer"
              value={tl.color}
              onChange={(e) => onUpdate({ color: e.target.value } as Partial<TextLayer>)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-white/50 block mb-1">X</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
              value={tl.x} onChange={(e) => onUpdate({ x: Number(e.target.value) })} />
          </div>
          <div>
            <label className="text-xs text-white/50 block mb-1">Y</label>
            <input type="number" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
              value={tl.y} onChange={(e) => onUpdate({ y: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 block mb-1">Letter Spacing</label>
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
            value={tl.letterSpacing ?? 0}
            onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value) } as Partial<TextLayer>)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-white/50 block mb-1">X</label>
          <input type="number" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
            value={layer.x} onChange={(e) => onUpdate({ x: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">Y</label>
          <input type="number" className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white"
            value={layer.y} onChange={(e) => onUpdate({ y: Number(e.target.value) })} />
        </div>
      </div>
      {layer.type === 'shape' && (
        <div>
          <label className="text-xs text-white/50 block mb-1">Fill Color</label>
          <input type="color"
            className="w-full h-9 bg-white/5 border border-white/10 rounded cursor-pointer"
            value={(layer as import('@/types/poster').ShapeLayer).fill ?? '#000000'}
            onChange={(e) => onUpdate({ fill: e.target.value } as Partial<import('@/types/poster').ShapeLayer>)} />
        </div>
      )}
    </div>
  );
}
