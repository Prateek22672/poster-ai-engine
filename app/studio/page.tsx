'use client';

/**
 * /studio — TEMPLATE STUDIO (gallery).
 * Renders every real-estate archetype live with editable sample content + your
 * own uploaded image. Each template has an "Open in Studio" button → /studio/[id]
 * where you can edit colours, buttons, text and stress-test overflow, then save.
 */
import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Upload, SlidersHorizontal, Plus, Pencil, Home } from 'lucide-react';
import { ARCHETYPES, CUSTOM_ARCHETYPES } from '@/lib/templates/realestate';
import type { RealEstateContent } from '@/lib/templates/realestate';
import { PosterCanvas } from '@/components/poster/PosterCanvas';

const DEFAULT_HERO = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg';

const SAMPLE: RealEstateContent = {
  projectName: 'BIRLA ARIKA', developer: 'Birla', location: 'Sector 31',
  tagline: 'Modern Elegance', configLabel: 'Residences', configValue: '4 BHK',
  priceLabel: 'Starting From', priceValue: '₹12 CR', detailLabel: 'Possession & Plan',
  detailValue: 'Q4 2027 · 60/40', cta: 'Enquire Now', brand: 'Birla Estates',
  caption: 'Chic Rooftop Moments',
};

export default function PreviewPage() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [c, setC] = useState<RealEstateContent>(SAMPLE);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof RealEstateContent) => (e: ChangeEvent<HTMLInputElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }));

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setHero(typeof r.result === 'string' ? r.result : hero);
    r.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="min-h-dvh relative text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-sunset" />
      {/* dull the bright gradient a touch */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/[0.12]" />
      <StudioWelcome />
      <div className="flex gap-4 p-3">
      {/* Controls */}
      <aside className="w-72 flex-shrink-0 bg-ink rounded-2xl p-4 space-y-3 sticky top-3 h-[calc(100dvh-1.5rem)] overflow-y-auto shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h1 className="text-sm font-bold">Template Studio</h1>
          </div>
          <Link href="/create" title="Back to app" className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2 py-1 transition">
            <Home className="w-3 h-3" /> Home
          </Link>
        </div>
        <p className="text-[11px] text-white/40">
          Edit fields → all {ARCHETYPES.length} templates re-render. Click <b className="text-white/70">Open in Studio</b> on any
          template to tune its colours, button &amp; text and save.
        </p>

        {/* Image: upload or URL */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-white/35">Hero image</span>
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md py-2 font-medium transition">
            <Upload className="w-3.5 h-3.5" /> Upload your image
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
          <input value={hero.startsWith('data:') ? '' : hero} onChange={(e) => setHero(e.target.value)} placeholder="…or paste an image URL"
            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-[11px] text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40" />
          {hero.startsWith('data:') && <p className="text-[10px] text-emerald-400">✓ using your uploaded image</p>}
        </div>

        <div className="border-t border-white/10 pt-2 space-y-2">
          {([
            ['projectName', 'Project name'], ['developer', 'Developer'], ['location', 'Location'],
            ['tagline', 'Tagline'], ['configLabel', 'Config label'], ['configValue', 'Config value'],
            ['priceLabel', 'Price label'], ['priceValue', 'Price value'], ['detailLabel', 'Detail label'],
            ['detailValue', 'Detail value'], ['cta', 'CTA'], ['brand', 'Brand'],
            ['caption', 'Caption (mood line)'],
          ] as Array<[keyof RealEstateContent, string]>).map(([k, label]) => (
            <Field key={k} label={label} value={(c[k] as string) ?? ''} onChange={set(k)} />
          ))}
        </div>
      </aside>

      {/* Grid of templates */}
      <main className="flex-1 p-3 pr-1">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-sm font-bold text-ink/90">Templates <span className="text-ink/50 font-medium">({ARCHETYPES.length} built-in{CUSTOM_ARCHETYPES.length ? ` · ${CUSTOM_ARCHETYPES.length} custom` : ''})</span></h2>
          <Link href="/studio/new" className="flex items-center gap-1.5 text-xs font-semibold bg-ink text-white hover:bg-ink/90 border border-white/10 rounded-full px-4 py-2 transition shadow-lg">
            <Plus className="w-3.5 h-3.5" /> Create new template
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHETYPES.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-medium text-white/90 bg-ink/85 backdrop-blur rounded-full px-3 py-1">{a.label} <span className="text-white/40">({a.id})</span></div>
              <Link href={`/studio/${a.id}`} className="rounded-xl overflow-hidden border border-white/15 shadow-2xl cursor-pointer hover:ring-2 hover:ring-white/50 hover:scale-[1.01] transition">
                <PosterCanvas layout={a.build(c, hero, hero ? [hero] : [])} scale={0.3} />
              </Link>
              <Link href={`/studio/${a.id}`} className="flex items-center gap-1.5 text-[11px] font-medium text-white/85 hover:text-white bg-ink/85 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 transition shadow-md">
                <SlidersHorizontal className="w-3 h-3 text-indigo-300" /> Open in Studio
              </Link>
            </div>
          ))}
          {CUSTOM_ARCHETYPES.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-medium text-emerald-300 bg-ink/85 backdrop-blur rounded-full px-3 py-1">{a.label} <span className="text-white/40">(custom)</span></div>
              <Link href={`/studio/new?edit=${a.id}`} className="rounded-xl overflow-hidden border border-emerald-500/30 shadow-2xl cursor-pointer hover:ring-2 hover:ring-emerald-400/50 hover:scale-[1.01] transition">
                <PosterCanvas layout={a.build(c, hero, hero ? [hero, hero, hero, hero] : [])} scale={0.3} />
              </Link>
              <Link href={`/studio/new?edit=${a.id}`} className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 bg-ink/85 backdrop-blur border border-white/10 rounded-full px-3 py-1.5 transition shadow-md">
                <Pencil className="w-3 h-3" /> Edit in Builder
              </Link>
            </div>
          ))}
        </div>
      </main>
      </div>
    </div>
  );
}

// Big one-time hero shown the first time you enter the studio this session.
function StudioWelcome() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem('studio_welcome')) return; sessionStorage.setItem('studio_welcome', '1'); } catch { /* ignore */ }
    setShow(true);
    const t = setTimeout(() => setShow(false), 1700);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="sw" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-sunset">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-center px-6">
            <h1 className="text-5xl sm:text-7xl font-bold text-ink tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.15)]">Welcome to Studio</h1>
            <p className="text-ink/55 mt-4 text-lg">Design, theme &amp; build your poster templates</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
      <input value={value} onChange={onChange}
        className="mt-0.5 w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
    </label>
  );
}
