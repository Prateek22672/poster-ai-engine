'use client';

import { useState } from 'react';
import { Download, Eye, Trash2, Clock } from 'lucide-react';

interface PosterCardProps {
  id: string;
  prompt: string;
  thumbnailUrl?: string;
  cloudinaryUrl?: string;
  createdAt?: string;
  category?: string;
  style?: string;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
}

export function PosterCard({
  id,
  prompt,
  thumbnailUrl,
  cloudinaryUrl,
  createdAt,
  category,
  style,
  onDelete,
  onPreview,
}: PosterCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(iso?: string) {
    if (!iso) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  }

  return (
    <div className="group relative bg-ink rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-black/40">
      {/* Thumbnail */}
      <div className="relative aspect-[4/5] bg-neutral-800 overflow-hidden">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Placeholder gradient */
          <div className="w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-ink" />
            <span className="relative text-white/20 text-xs text-center px-4 leading-relaxed">
              {prompt.slice(0, 80)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          {onPreview && (
            <button
              onClick={() => onPreview(id)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {cloudinaryUrl && (
            <a
              href={cloudinaryUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2.5 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 hover:text-red-300 transition-colors backdrop-blur-sm disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category badge */}
        {category && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 border border-white/10 capitalize">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Card footer */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
          {prompt}
        </p>

        <div className="flex items-center justify-between">
          {style && (
            <span className="text-[10px] text-white/30 capitalize">{style}</span>
          )}
          {createdAt && (
            <div className="flex items-center gap-1 text-[10px] text-white/25 ml-auto">
              <Clock className="w-2.5 h-2.5" />
              {formatDate(createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton placeholder ── */
export function PosterCardSkeleton() {
  return (
    <div className="bg-ink rounded-2xl overflow-hidden border border-white/5 animate-pulse">
      <div className="aspect-[4/5] bg-neutral-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-full" />
        <div className="h-3 bg-neutral-800 rounded w-2/3" />
      </div>
    </div>
  );
}
