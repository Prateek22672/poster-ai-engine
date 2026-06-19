'use client';

/**
 * /studio/new — TEMPLATE BUILDER.
 * Compose a template from blocks (heading, text, banner, button, price, image),
 * bind each to a content field, position/size/colour it, preview live, and SAVE
 * (password-locked). Saving writes custom-templates.json AND derives a RAG
 * reference so the engine can design from it. ?edit=<id> edits an existing one.
 */
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, Lock, Check, Upload, Copy } from 'lucide-react';
import { PosterCanvas } from '@/components/poster/PosterCanvas';
import { buildFromSpec, starterSpec, W, H, type TemplateSpec, type Block, type BlockType } from '@/lib/templates/realestate';
import type { RealEstateContent } from '@/lib/templates/realestate';

const SCALE = 0.46;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
// Approximate on-canvas size of a block (so the drag handle covers it).
function blockBox(b: Block): { w: number; h: number } {
  if (b.type === 'banner') return { w: b.w, h: b.height ?? 80 };
  if (b.type === 'image') return { w: b.w, h: b.height ?? 300 };
  if (b.type === 'button') return { w: b.w, h: 82 };
  if (b.type === 'heading') return { w: b.w, h: (b.fontSize ?? 96) * 1.1 };
  return { w: b.w, h: (b.fontSize ?? 24) * 1.5 };
}

const SAMPLE: RealEstateContent = {
  projectName: 'BIRLA ARIKA', developer: 'Birla Estates', location: 'Sector 31',
  tagline: 'Modern Elegance', configLabel: 'Residences', configValue: '3 & 4 BHK',
  priceLabel: 'Starting From', priceValue: '₹12 CR', detailLabel: 'Possession',
  detailValue: 'Q4 2027 · 60/40', cta: 'Enquire Now', brand: 'Sky Marketing',
  caption: 'Chic Rooftop Moments',
};
const DEFAULT_HERO = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg';
const BINDS: Array<keyof RealEstateContent> = ['projectName', 'developer', 'location', 'tagline', 'configLabel', 'configValue', 'priceLabel', 'priceValue', 'detailLabel', 'detailValue', 'cta', 'brand', 'caption'];
const ADD: Array<{ t: BlockType; label: string }> = [
  { t: 'heading', label: 'Heading' }, { t: 'eyebrow', label: 'Eyebrow' }, { t: 'text', label: 'Text' },
  { t: 'price', label: 'Price' }, { t: 'banner', label: 'Banner' }, { t: 'button', label: 'Button' }, { t: 'image', label: 'Image' },
];

let nid = 0;
const newId = (p: string) => `${p}_${Date.now().toString(36)}_${nid++}`;

export default function BuilderPage() {
  const [spec, setSpec] = useState<TemplateSpec>(() => starterSpec(newId('tpl')));
  const [sel, setSel] = useState<string | null>(null);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState(''); const [pwErr, setPwErr] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Load existing (for ?edit=) + probe auth
  useEffect(() => {
    const editId = new URLSearchParams(window.location.search).get('edit');
    fetch('/api/studio/templates', { cache: 'no-store' }).then((r) => r.json()).then((j) => {
      const found = (j.templates as TemplateSpec[]).find((t) => t.id === editId);
      if (found) setSpec(found);
    });
    fetch('/api/admin/health', { cache: 'no-store' }).then((r) => setAuthed(r.ok));
  }, []);

  const block = spec.blocks.find((b) => b.id === sel) ?? null;
  const patch = useCallback((id: string, p: Partial<Block>) =>
    setSpec((s) => ({ ...s, blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...p } : b)) })), []);

  // Drag a block on the canvas → live-update its x/y (screen delta ÷ scale).
  function startDrag(e: React.PointerEvent, b: Block) {
    e.preventDefault();
    setSel(b.id);
    const sx = e.clientX, sy = e.clientY, ox = b.x, oy = b.y;
    const move = (ev: PointerEvent) => {
      patch(b.id, {
        x: clamp(Math.round(ox + (ev.clientX - sx) / SCALE), 0, W - 20),
        y: clamp(Math.round(oy + (ev.clientY - sy) / SCALE), 0, H - 20),
      });
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  const addBlock = (t: BlockType) => {
    const b: Block = { id: newId(t), type: t, x: 80, y: 200, w: 920, ...(t === 'banner' || t === 'image' ? { height: t === 'image' ? 300 : 80 } : {}), bind: t === 'button' ? 'cta' : t === 'price' ? 'priceValue' : t === 'heading' ? 'projectName' : '', fill: t === 'button' ? '#D8B26A' : t === 'banner' ? '#0E2436' : undefined, textColor: t === 'button' ? '#1A1206' : undefined, color: '#FFFFFF', align: 'left' };
    setSpec((s) => ({ ...s, blocks: [...s.blocks, b] })); setSel(b.id);
  };
  const removeBlock = (id: string) => { setSpec((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) })); if (sel === id) setSel(null); };

  async function unlock() {
    setPwErr('');
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    if (r.ok) { setAuthed(true); setPw(''); } else setPwErr('Wrong password');
  }
  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader(); rd.onload = () => setHero(typeof rd.result === 'string' ? rd.result : hero); rd.readAsDataURL(f); e.target.value = '';
  }
  async function save() {
    setSaveState('saving'); setSaveMsg('');
    const cur = await fetch('/api/studio/templates', { cache: 'no-store' }).then((r) => r.json());
    const list: TemplateSpec[] = (cur.templates ?? []).filter((t: TemplateSpec) => t.id !== spec.id);
    const r = await fetch('/api/studio/templates', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templates: [...list, { ...spec, custom: true }] }) });
    if (r.ok) { setSaveState('ok'); setTimeout(() => setSaveState('idle'), 2500); }
    else { setSaveState('err'); setSaveMsg((await r.json().catch(() => ({})))?.error ?? 'Save failed'); }
  }

  const editable = authed === true;
  const photos = hero ? [hero, hero, hero, hero] : [];

  return (
    <div className="h-dvh flex flex-col bg-ink text-white">
      <header className="flex items-center justify-between px-4 h-12 border-b border-white/10 flex-shrink-0">
        <Link href="/studio" className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="w-4 h-4" /> Studio</Link>
        <span className="text-xs text-white/50">Template builder</span>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* LEFT — live preview with drag handles */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070410] overflow-auto">
          <p className="text-[11px] text-white/35 mb-3">Drag any element on the canvas to position it — X/Y update automatically.</p>
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10" style={{ width: W * SCALE, height: H * SCALE }}>
            <PosterCanvas layout={buildFromSpec(spec, SAMPLE, hero, photos)} scale={SCALE} />
            <div className="absolute inset-0">
              {spec.blocks.map((b) => {
                const box = blockBox(b);
                return (
                  <div
                    key={b.id}
                    onPointerDown={(e) => startDrag(e, b)}
                    title={`${b.type} — drag to move`}
                    className={`absolute cursor-move group ${sel === b.id ? 'ring-2 ring-indigo-400 bg-indigo-400/10' : 'hover:ring-1 hover:ring-white/40'}`}
                    style={{ left: b.x * SCALE, top: b.y * SCALE, width: Math.max(14, box.w * SCALE), height: Math.max(14, box.h * SCALE) }}
                  >
                    <span className={`absolute -top-4 left-0 text-[9px] leading-none px-1 py-0.5 rounded bg-indigo-600 text-white whitespace-nowrap ${sel === b.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{b.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — controls */}
        <aside className="w-[380px] flex-shrink-0 border-l border-white/10 overflow-y-auto">
          {!editable && (
            <div className="p-4 border-b border-white/10 bg-amber-500/[0.06]">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-2"><Lock className="w-3.5 h-3.5" /> Enter the admin password to save</div>
              <div className="flex gap-2">
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()} placeholder="Admin password" className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500/40" />
                <button onClick={unlock} className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">Unlock</button>
              </div>
              {pwErr && <p className="text-[11px] text-red-400 mt-1.5">{pwErr}</p>}
            </div>
          )}

          {/* Template meta */}
          <Section title="Template">
            <Field label="Name" value={spec.label} onChange={(e) => setSpec((s) => ({ ...s, label: e.target.value }))} />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-white/35">Background</span>
              <select value={spec.bg === 'photo' ? 'photo' : 'color'} onChange={(e) => setSpec((s) => ({ ...s, bg: e.target.value === 'photo' ? 'photo' : '#0A1B2E' }))} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs">
                <option value="photo">Hero photo</option><option value="color">Solid colour</option>
              </select>
              {spec.bg !== 'photo' && <input type="color" value={/^#[0-9a-f]{6}$/i.test(spec.bg) ? spec.bg : '#0A1B2E'} onChange={(e) => setSpec((s) => ({ ...s, bg: e.target.value }))} className="w-7 h-7 rounded border border-white/15 bg-transparent cursor-pointer" />}
            </div>
            <button onClick={() => fileRef.current?.click()} className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-md py-1.5"><Upload className="w-3.5 h-3.5" /> Preview image</button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </Section>

          {/* Add blocks */}
          <Section title="Add element">
            <div className="flex flex-wrap gap-1.5">
              {ADD.map(({ t, label }) => (
                <button key={t} onClick={() => addBlock(t)} className="flex items-center gap-1 text-[11px] bg-indigo-600/80 hover:bg-indigo-500 rounded-full px-2.5 py-1"><Plus className="w-3 h-3" /> {label}</button>
              ))}
            </div>
          </Section>

          {/* Block list */}
          <Section title={`Elements (${spec.blocks.length})`}>
            <div className="space-y-1">
              {spec.blocks.map((b) => (
                <div key={b.id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer border ${sel === b.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'}`} onClick={() => setSel(b.id)}>
                  <span className="text-[11px] font-medium text-white/80 capitalize w-16">{b.type}</span>
                  <span className="text-[10px] text-white/40 flex-1 truncate">{b.bind || `"${b.text ?? ''}"`}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeBlock(b.id); }} className="text-white/30 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </Section>

          {/* Selected block editor */}
          {block && (
            <Section title={`Edit: ${block.type}`}>
              {block.type !== 'banner' && block.type !== 'image' && (
                <>
                  <label className="block mb-1.5"><span className="text-[10px] uppercase tracking-wider text-white/35">Bind to field</span>
                    <select value={block.bind ?? ''} onChange={(e) => patch(block.id, { bind: e.target.value as Block['bind'] })} className="mt-0.5 w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs">
                      <option value="">— static text —</option>
                      {BINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </label>
                  {!block.bind && <Field label="Static text" value={block.text ?? ''} onChange={(e) => patch(block.id, { text: e.target.value })} />}
                </>
              )}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                <Num label="X" value={block.x} onChange={(v) => patch(block.id, { x: v })} />
                <Num label="Y" value={block.y} onChange={(v) => patch(block.id, { y: v })} />
                <Num label="W" value={block.w} onChange={(v) => patch(block.id, { w: v })} />
                {(block.type === 'banner' || block.type === 'image') && <Num label="H" value={block.height ?? 80} onChange={(v) => patch(block.id, { height: v })} />}
                {block.type !== 'banner' && block.type !== 'image' && <Num label="Size" value={block.fontSize ?? 24} onChange={(v) => patch(block.id, { fontSize: v })} />}
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {block.type !== 'banner' && block.type !== 'image' && (
                  <>
                    <ColorBtn label="Text" value={block.color ?? '#FFFFFF'} onChange={(v) => patch(block.id, { color: v })} />
                    <select value={block.align ?? 'left'} onChange={(e) => patch(block.id, { align: e.target.value as Block['align'] })} className="bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px]"><option>left</option><option>center</option><option>right</option></select>
                    <label className="flex items-center gap-1 text-[11px] text-white/55"><input type="checkbox" checked={!!block.uppercase} onChange={(e) => patch(block.id, { uppercase: e.target.checked })} /> CAPS</label>
                  </>
                )}
                {(block.type === 'banner' || block.type === 'button') && <ColorBtn label="Fill" value={block.fill ?? '#0E2436'} onChange={(v) => patch(block.id, { fill: v })} />}
                {block.type === 'button' && <ColorBtn label="Label" value={block.textColor ?? '#1A1206'} onChange={(v) => patch(block.id, { textColor: v })} />}
              </div>
            </Section>
          )}

          {/* Save */}
          <div className="sticky bottom-0 p-3 border-t border-white/10 bg-ink">
            <button onClick={save} disabled={!editable || saveState === 'saving'} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 ${saveState === 'ok' ? 'bg-emerald-600' : saveState === 'err' ? 'bg-red-600' : 'bg-white text-ink hover:bg-white/90'}`}>
              {saveState === 'ok' ? <><Check className="w-4 h-4" /> Saved + added to RAG</> : saveState === 'saving' ? 'Saving…' : <><Save className="w-4 h-4" /> Save template</>}
            </button>
            {saveState === 'err' && <p className="text-[11px] text-red-400 mt-1.5">{saveMsg}</p>}
            <p className="text-[10px] text-white/30 mt-1.5 flex items-center gap-1"><Copy className="w-3 h-3" /> Writes custom-templates.json — commit to ship. Re-run /api/seed to embed its RAG reference.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="p-4 border-b border-white/10 space-y-1.5"><h3 className="text-[10px] uppercase tracking-widest text-white/30">{title}</h3>{children}</div>;
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span><input value={value} onChange={onChange} className="mt-0.5 w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500/40" /></label>;
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className="block"><span className="text-[9px] uppercase tracking-wider text-white/30">{label}</span><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="mt-0.5 w-full bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:border-indigo-500/40" /></label>;
}
function ColorBtn({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <label className="flex items-center gap-1 text-[11px] text-white/55" title={label}>
      <input type="color" value={hex ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="w-6 h-6 rounded border border-white/15 bg-transparent cursor-pointer" />
      {label}
    </label>
  );
}
