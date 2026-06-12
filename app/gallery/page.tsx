'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, History, Download, Pencil, ImageIcon, Video, Box } from 'lucide-react';
import Link from 'next/link';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DotsLoading } from '@/components/ui/loader';

interface GalleryPoster {
  id: string;
  prompt: string;
  category?: string;
  style?: string;
  cloudinary_url?: string;
  width?: number;
  height?: number;
  fonts?: string[];
  created_at?: string;
}

const TABS = [
  { id: 'image', label: 'Posters', icon: ImageIcon, enabled: true },
  { id: 'video', label: 'Video', icon: Video, enabled: false },
  { id: 'avatar', label: '3D Avatar', icon: Box, enabled: false },
];

export default function GalleryPage() {
  const [posters, setPosters] = useState<GalleryPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to load');
        const list = (json.posters ?? []) as GalleryPoster[];
        setPosters(list);
        setSelectedId(list[0]?.id ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () =>
      posters.filter((p) => {
        const matchSearch = !search || p.prompt.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !filterCategory || p.category === filterCategory;
        return matchSearch && matchCategory;
      }),
    [posters, search, filterCategory]
  );

  const selected = filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-sunset" />
      <DashboardNav />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        {/* The card */}
        <div className="rounded-3xl border border-white/10 bg-ink backdrop-blur-xl shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div>
              <h1 className="text-base font-bold text-white">AI Poster Gallery</h1>
              <p className="text-xs text-white/40 mt-0.5">Your generated, on-brand designs</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40">{posters.length} saved</span>
              <History className="w-4 h-4 text-white/40" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = t.id === 'image';
              return (
                <button
                  key={t.id}
                  disabled={!t.enabled}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-white/35'
                  } ${!t.enabled ? 'cursor-not-allowed' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  {!t.enabled && <span className="text-[9px] text-white/25">Soon</span>}
                  {active && (
                    <motion.div layoutId="gallery-tab" className="absolute bottom-0 inset-x-6 h-0.5 bg-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-28 text-white/40">
              <DotsLoading className="text-indigo-400 w-8 h-8" />
              <p className="text-sm">Loading your gallery…</p>
            </div>
          ) : error ? (
            <div className="py-28 text-center text-white/40 text-sm">{error}</div>
          ) : !selected ? (
            <EmptyState hasFilter={!!search || !!filterCategory} />
          ) : (
            <div className="p-5">
              {/* Search + filter */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posters…"
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
                >
                  <option value="">All</option>
                  <option value="realestate">Real Estate</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="fitness">Fitness</option>
                  <option value="sale">Sale</option>
                  <option value="event">Event</option>
                </select>
              </div>

              {/* Featured preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.cloudinary_url}
                    alt={selected.prompt}
                    className="w-full max-h-[440px] object-contain bg-ink"
                  />
                  {selected.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white capitalize">
                      {selected.category}
                    </span>
                  )}
                </motion.div>

                {/* Meta rows */}
                <div key={`${selected.id}-meta`} className="mt-4 rounded-2xl border border-white/10 divide-y divide-white/[0.06]">
                  <MetaRow label="Quality" value={selected.width && selected.height ? `${selected.width} × ${selected.height}` : '1080 × 1350'} />
                  <MetaRow label="Style" value={selected.style ?? '—'} />
                  <MetaRow label="Fonts" value={selected.fonts?.length ? selected.fonts.join(' · ') : '—'} />
                  <MetaRow label="Engine" value="PosterAI Design Engine" />
                </div>
              </AnimatePresence>

              {/* Recent generations strip */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-white/50 mb-2">Recent Generations</p>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`relative flex-shrink-0 w-24 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all ${
                        p.id === selected.id ? 'border-indigo-500' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.cloudinary_url} alt={p.prompt} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <Link
                  href="/create"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Create New
                </Link>
                <a
                  href={selected.cloudinary_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm font-medium text-white/90 truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div className="flex flex-col items-center gap-5 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
        <Sparkles className="w-7 h-7 text-white/20" />
      </div>
      <div>
        <p className="text-white/70 font-semibold">{hasFilter ? 'No matching posters' : 'No posters saved yet'}</p>
        <p className="text-white/30 text-sm mt-1.5 max-w-xs">
          {hasFilter ? 'Try a different search or clear filters' : 'Generate a poster — it auto-saves here.'}
        </p>
      </div>
      {!hasFilter && (
        <Link
          href="/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Create first poster
        </Link>
      )}
    </div>
  );
}
