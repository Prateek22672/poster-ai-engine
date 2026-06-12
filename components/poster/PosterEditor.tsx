'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sliders, Palette, Download, X, ChevronRight } from 'lucide-react';
import type Konva from 'konva';
import type { PosterLayout, Layer, GeneratedPoster } from '@/types/poster';

import { PosterCanvas } from './PosterCanvas';
import { LayerPanel, LayerPropsEditor } from './LayerPanel';
import { ExportPanel } from './ExportPanel';
import { VariationsPanel } from './VariationsPanel';

type PanelTab = 'layers' | 'properties' | 'variations' | 'export';

interface PosterEditorProps {
  poster: GeneratedPoster;
  onRegenerate?: () => Promise<void>;
  onClose?: () => void;
}

export function PosterEditor({ poster, onRegenerate, onClose }: PosterEditorProps) {
  const [activeLayout, setActiveLayout] = useState<PosterLayout>(poster.layout);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('layers');
  const stageRef = useRef<Konva.Stage | null>(null);
  const autoSavedRef = useRef(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Auto-save the rendered poster image to Cloudinary + attach it to the design row,
  // so it shows up in the Gallery without the user clicking anything.
  const handleCanvasReady = useCallback(async () => {
    if (autoSavedRef.current || !poster.posterId) return;
    const stage = stageRef.current;
    if (!stage) return;
    autoSavedRef.current = true;
    setSaveState('saving');
    try {
      const dataUrl = stage.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, posterId: poster.posterId }),
      });
      if (!res.ok) throw new Error('save failed');
      setSaveState('saved');
    } catch {
      setSaveState('error');
      autoSavedRef.current = false; // allow a manual retry via Export tab
    }
  }, [poster.posterId]);

  // Merge a partial layer update back into the layout
  const handleLayerUpdate = useCallback((id: string, patch: Partial<Layer>) => {
    setActiveLayout((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? { ...l, ...patch } as Layer : l)),
    }));
  }, []);

  const selectedLayer = activeLayout.layers.find((l) => l.id === selectedLayerId) ?? null;

  // When user selects a layer, auto-switch to properties tab
  const handleLayerSelect = useCallback((id: string | null) => {
    setSelectedLayerId(id);
    if (id) setActiveTab('properties');
  }, []);

  const tabs: Array<{ id: PanelTab; icon: React.ReactNode; label: string }> = [
    { id: 'layers', icon: <Layers className="w-4 h-4" />, label: 'Layers' },
    { id: 'properties', icon: <Sliders className="w-4 h-4" />, label: 'Props' },
    { id: 'variations', icon: <Palette className="w-4 h-4" />, label: 'Vars' },
    { id: 'export', icon: <Download className="w-4 h-4" />, label: 'Export' },
  ];

  return (
    <div className="flex h-full min-h-0 bg-ink">
      {/* ── Canvas Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_#1a1a2e_0%,_#0a0a0a_70%)] relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Poster label + auto-save status */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs z-10">
          <span className="text-white/30">{activeLayout.dimensions.width} × {activeLayout.dimensions.height}</span>
          {saveState === 'saving' && <span className="text-white/40">Saving to gallery…</span>}
          {saveState === 'saved' && <span className="text-emerald-400">✓ Saved to gallery</span>}
          {saveState === 'error' && <span className="text-amber-400">Auto-save failed — use Export tab</span>}
        </div>

        {/* Canvas with shadow */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
          style={{
            filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.8))',
          }}
        >
          <PosterCanvas
            layout={activeLayout}
            scale={0.45}
            selectedLayerId={selectedLayerId ?? undefined}
            onLayerSelect={handleLayerSelect}
            stageRef={stageRef}
            onReady={handleCanvasReady}
          />
        </motion.div>

        {/* Shortcut hints */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-xs text-white/20">
          <span>Click layer to select</span>
          <span>·</span>
          <span>Edit in right panel</span>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────── */}
      <div className="w-72 flex flex-col border-l border-white/10 bg-ink backdrop-blur">
        {/* Tab bar */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium
                transition-colors relative
                ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'}
              `}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="panel-indicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {activeTab === 'layers' && (
                <LayerPanel
                  layout={activeLayout}
                  selectedLayerId={selectedLayerId}
                  onLayerSelect={handleLayerSelect}
                  onLayerUpdate={handleLayerUpdate}
                />
              )}

              {activeTab === 'properties' && (
                <div>
                  {selectedLayer ? (
                    <>
                      <div className="px-3 py-2 border-b border-white/10 flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider flex-1">
                          Properties
                        </h3>
                        <button
                          onClick={() => setActiveTab('layers')}
                          className="text-white/30 hover:text-white/60 transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <LayerPropsEditor
                        layer={selectedLayer}
                        onUpdate={(patch) => handleLayerUpdate(selectedLayer.id, patch)}
                      />
                    </>
                  ) : (
                    <div className="p-4 text-white/30 text-xs text-center mt-4">
                      Select a layer to edit
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'variations' && (
                <div className="p-3">
                  <VariationsPanel
                    primaryLayout={poster.layout}
                    variations={poster.variations}
                    activeLayoutId={activeLayout.id}
                    onSelectVariation={setActiveLayout}
                    prompt={poster.prompt}
                    onRegenerate={onRegenerate}
                  />
                </div>
              )}

              {activeTab === 'export' && (
                <ExportPanel
                  stageRef={stageRef}
                  posterTitle={poster.prompt.slice(0, 40)}
                  posterId={poster.posterId}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer: palette preview */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/30">Palette</span>
            <div className="flex gap-1 flex-1">
              {activeLayout.palette.map((color, i) => (
                <div
                  key={i}
                  className="h-4 flex-1 rounded-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
