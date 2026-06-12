'use client';

import { useState } from 'react';
import { Download, Upload, Check, Loader2 } from 'lucide-react';
import type Konva from 'konva';

interface ExportPanelProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  posterTitle?: string;
  posterId?: string;
  onUpload?: (cloudinaryUrl: string) => void;
}

type ExportFormat = 'png' | 'jpg';
type ExportState = 'idle' | 'exporting' | 'uploading' | 'done' | 'error';

export function ExportPanel({ stageRef, posterTitle = 'poster', posterId, onUpload }: ExportPanelProps) {
  const [state, setState] = useState<ExportState>('idle');
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(1.0);
  const [errorMsg, setErrorMsg] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');

  function getStageDataUrl(fmt: ExportFormat, q: number): string | null {
    const stage = stageRef.current;
    if (!stage) return null;

    // Temporarily bump pixel ratio for high-quality export
    const originalPixelRatio = (stage.getAttr('pixelRatio') as number) ?? 1;
    stage.setAttr('pixelRatio', 2);

    try {
      const dataUrl = stage.toDataURL({
        mimeType: fmt === 'png' ? 'image/png' : 'image/jpeg',
        quality: fmt === 'jpg' ? q : 1,
        pixelRatio: 2,
      });
      return dataUrl;
    } finally {
      stage.setAttr('pixelRatio', originalPixelRatio);
    }
  }

  async function handleDownload() {
    setState('exporting');
    setErrorMsg('');

    try {
      const dataUrl = getStageDataUrl(format, quality);
      if (!dataUrl) throw new Error('Canvas not ready');

      const link = document.createElement('a');
      link.download = `${posterTitle.replace(/\s+/g, '-').toLowerCase()}.${format}`;
      link.href = dataUrl;
      link.click();

      setState('done');
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
      setState('error');
    }
  }

  async function handleUpload() {
    setState('uploading');
    setErrorMsg('');

    try {
      const dataUrl = getStageDataUrl('png', 1);
      if (!dataUrl) throw new Error('Canvas not ready');

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, posterId }),
      });

      if (!res.ok) throw new Error('Upload failed');

      const { url } = await res.json();
      setCloudUrl(url);
      onUpload?.(url);
      setState('done');
      setTimeout(() => setState('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }

  const isLoading = state === 'exporting' || state === 'uploading';

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Export</h3>

      {/* Format selector */}
      <div className="flex gap-2">
        {(['png', 'jpg'] as ExportFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`
              flex-1 py-1.5 text-xs font-medium rounded border transition-colors uppercase
              ${format === f
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}
            `}
          >
            {f}
          </button>
        ))}
      </div>

      {/* JPG quality slider */}
      {format === 'jpg' && (
        <div>
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Quality</span>
            <span>{Math.round(quality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>
      )}

      {/* Export size info */}
      <p className="text-xs text-white/30">
        Export at 2× resolution (2160×2700px for 4:5)
      </p>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`
          w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
          transition-all disabled:opacity-50 disabled:cursor-not-allowed
          ${state === 'done' && !cloudUrl
            ? 'bg-emerald-600 text-white'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white'}
        `}
      >
        {state === 'exporting' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
        ) : state === 'done' && !cloudUrl ? (
          <><Check className="w-4 h-4" /> Downloaded!</>
        ) : (
          <><Download className="w-4 h-4" /> Download {format.toUpperCase()}</>
        )}
      </button>

      {/* Upload to Cloudinary button */}
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="
          w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
          bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white
          transition-all disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {state === 'uploading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
        ) : (
          <><Upload className="w-4 h-4" /> Save to Cloud</>
        )}
      </button>

      {/* Cloudinary URL */}
      {cloudUrl && (
        <div className="p-2 bg-white/5 rounded border border-white/10">
          <p className="text-xs text-white/40 mb-1">Cloud URL</p>
          <a
            href={cloudUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 break-all"
          >
            {cloudUrl.slice(0, 60)}…
          </a>
        </div>
      )}

      {/* Error */}
      {state === 'error' && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
