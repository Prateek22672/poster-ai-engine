'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface ReferenceUploadProps {
  onImageReady: (base64: string, mimeType: string, analysis?: string) => void;
  onClear: () => void;
}

export function ReferenceUpload({ onImageReady, onClear }: ReferenceUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Convert to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // strip data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setAnalyzing(true);

    try {
      // Analyze with AI
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });

      if (res.ok) {
        const data = await res.json();
        const analysisText = data.analysis
          ? `Style: ${data.analysis.overallStyle}, Colors: ${data.analysis.dominantColors?.join(', ')}, Composition: ${data.analysis.composition}`
          : '';
        setAnalysis(analysisText);
        onImageReady(base64, file.type, analysisText);
      } else {
        onImageReady(base64, file.type);
      }
    } catch {
      onImageReady(base64, file.type);
    } finally {
      setAnalyzing(false);
    }
  }, [onImageReady]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleClear() {
    setPreview(null);
    setAnalysis('');
    onClear();
    if (inputRef.current) inputRef.current.value = '';
  }

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg overflow-hidden border border-white/10 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Reference"
            className="w-full object-cover"
            style={{ maxHeight: 160 }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-white bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>

          {/* Analyzing indicator */}
          {analyzing && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <span className="text-xs text-white/70">Analyzing style…</span>
            </div>
          )}
        </div>

        {/* Analysis result */}
        {analysis && !analyzing && (
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <p className="text-xs text-indigo-300 leading-relaxed">{analysis}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-lg border-2 border-dashed transition-all
        flex flex-col items-center justify-center gap-2 py-6
        ${dragOver
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />

      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        <ImageIcon className="w-5 h-5 text-white/40" />
      </div>

      <div className="text-center">
        <p className="text-xs text-white/60">
          <span className="text-white/90 font-medium">Upload reference</span>
        </p>
        <p className="text-[11px] text-white/30 mt-0.5">PNG, JPG up to 10MB</p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-white/30">
        <Upload className="w-3 h-3" />
        <span>Drag & drop or click</span>
      </div>
    </div>
  );
}
