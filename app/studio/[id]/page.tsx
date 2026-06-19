'use client';

/**
 * /studio/[id] — TEMPLATE STUDIO (single template).
 * LEFT: live preview.  RIGHT: edit colours, button, text, upload an image,
 * stress-test overflow, and SAVE (password-locked with the admin password →
 * writes lib/templates/realestate/theme-overrides.json, committed to the repo).
 */
import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Upload, Save, Lock, Check, AlertTriangle, RotateCcw } from 'lucide-react';
import { ARCHETYPES } from '@/lib/templates/realestate';
import type { RealEstateContent } from '@/lib/templates/realestate';
import type { ColorMap } from '@/lib/templates/realestate/theme';
import { PosterCanvas } from '@/components/poster/PosterCanvas';

const DEFAULT_HERO = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg';

const SAMPLE: RealEstateContent = {
  projectName: 'BIRLA ARIKA', developer: 'Birla', location: 'Sector 31',
  tagline: 'Modern Elegance', configLabel: 'Residences', configValue: '4 BHK',
  priceLabel: 'Starting From', priceValue: '₹12 CR', detailLabel: 'Possession & Plan',
  detailValue: 'Q4 2027 · 60/40', cta: 'Enquire Now', brand: 'Birla Estates',
  caption: 'Chic Rooftop Moments',
};

// Deliberately long values to check the template never overlaps (auto-fit test).
const OVERFLOW: RealEstateContent = {
  projectName: 'The Magnificent Grand Beachfront Residences at Palm Jumeirah',
  developer: 'Emaar Properties International Development Group LLC',
  location: '23800 Malibu Colony Drive, Malibu, California 90265, United States',
  tagline: 'Where Timeless Architecture Meets Unrivalled Coastal Luxury Living',
  configLabel: 'Configurations', configValue: '3, 4, 5 & 6 Bedroom Sky Villas + Penthouses',
  priceLabel: 'Booking Starting From', priceValue: 'AED 12,500,000 Onwards',
  detailLabel: 'Possession & Payment Plan', detailValue: 'Q4 2027 Handover · 60/40 Construction-Linked Plan',
  cta: 'Schedule a Private Viewing Today', brand: 'Sky Marketing & Realty Advisors Pvt Ltd',
  caption: 'An Address Beyond Compare — Chic Rooftop Moments Await',
};

export default function StudioPage() {
  const id = String(useParams().id);
  const arch = ARCHETYPES.find((a) => a.id === id);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState('');

  const [defaults, setDefaults] = useState<ColorMap>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [colors, setColors] = useState<ColorMap>({});
  const [savedAll, setSavedAll] = useState<Record<string, ColorMap>>({});

  const [content, setContent] = useState<RealEstateContent>(SAMPLE);
  const [overflow, setOverflow] = useState(false);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'ok' | 'err'>('idle');
  const [saveMsg, setSaveMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Load theme defaults + saved overrides for this template
  const load = useCallback(async () => {
    const res = await fetch('/api/studio/theme', { cache: 'no-store' });
    const j = await res.json();
    setDefaults(j.defaults[id] ?? {});
    setLabels(j.labels ?? {});
    setSavedAll(j.saved ?? {});
    setColors({ ...(j.defaults[id] ?? {}), ...(j.saved[id] ?? {}) });
  }, [id]);

  useEffect(() => { load(); }, [load]);
  // Probe admin auth (the studio is read-only until unlocked)
  useEffect(() => { fetch('/api/admin/health', { cache: 'no-store' }).then((r) => setAuthed(r.ok)); }, []);

  async function unlock() {
    setPwErr('');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    if (res.ok) { setAuthed(true); setPw(''); } else setPwErr((await res.json().catch(() => ({})))?.error ?? 'Wrong password');
  }

  function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setHero(typeof r.result === 'string' ? r.result : hero); r.readAsDataURL(f); e.target.value = '';
  }

  async function save() {
    setSaveState('saving'); setSaveMsg('');
    const merged = { ...savedAll, [id]: colors };
    const res = await fetch('/api/studio/theme', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(merged) });
    if (res.ok) { setSaveState('ok'); setSavedAll(merged); setTimeout(() => setSaveState('idle'), 2000); }
    else { setSaveState('err'); setSaveMsg((await res.json().catch(() => ({})))?.error ?? 'Save failed'); }
  }

  if (!arch) {
    return <Shell id={id}><div className="p-10 text-white/50">Unknown template &ldquo;{id}&rdquo;. <Link href="/studio" className="text-indigo-400 underline">Back to studio</Link></div></Shell>;
  }

  const draw = overflow ? OVERFLOW : content;
  const editable = authed === true;

  return (
    <Shell id={id} label={arch.label}>
      <div className="flex flex-1 min-h-0">
        {/* LEFT — preview */}
        <div className="flex-1 flex items-center justify-center p-8 bg-[#070410] overflow-auto">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <PosterCanvas layout={arch.build(draw, hero, hero ? [hero, hero, hero, hero] : [], colors)} scale={0.46} />
          </div>
        </div>

        {/* RIGHT — controls */}
        <aside className="w-[360px] flex-shrink-0 border-l border-white/10 bg-ink overflow-y-auto">
          {!editable && (
            <div className="p-4 border-b border-white/10 bg-amber-500/[0.06]">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-medium mb-2"><Lock className="w-3.5 h-3.5" /> Locked — enter the admin password to edit &amp; save</div>
              <div className="flex gap-2">
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && unlock()} placeholder="Admin password"
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
                <button onClick={unlock} className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold">Unlock</button>
              </div>
              {pwErr && <p className="text-[11px] text-red-400 mt-1.5">{pwErr}</p>}
            </div>
          )}

          <fieldset disabled={!editable} className={editable ? '' : 'opacity-60 pointer-events-none'}>
            {/* Image */}
            <Section title="Image">
              <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md py-2 font-medium transition">
                <Upload className="w-3.5 h-3.5" /> Upload image
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
              {hero.startsWith('data:') && <p className="text-[10px] text-emerald-400 mt-1">✓ using your uploaded image</p>}
            </Section>

            {/* Overflow stress test */}
            <Section title="Overflow stress-test">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[11px] text-white/55 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Inject very long text</span>
                <button onClick={() => setOverflow((v) => !v)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${overflow ? 'bg-amber-500' : 'bg-white/15'}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${overflow ? 'translate-x-[18px]' : 'translate-x-1'}`} />
                </button>
              </label>
              <p className="text-[10px] text-white/35 mt-1.5">Checks the auto-fit guards — text should shrink/clamp, never overlap.</p>
            </Section>

            {/* Colours */}
            <Section title="Colours & button">
              <div className="space-y-2">
                {Object.keys(defaults).map((k) => (
                  <ColorRow key={k} label={labels[k] ?? k} value={colors[k] ?? ''} onChange={(v) => setColors((p) => ({ ...p, [k]: v }))} />
                ))}
              </div>
              <button onClick={() => setColors({ ...defaults })} className="mt-2 flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white">
                <RotateCcw className="w-3 h-3" /> Reset to defaults
              </button>
            </Section>

            {/* Content */}
            <Section title="Text">
              {([['projectName', 'Headline'], ['tagline', 'Tagline'], ['priceLabel', 'Price label'], ['priceValue', 'Price value'], ['cta', 'Button text'], ['caption', 'Caption']] as Array<[keyof RealEstateContent, string]>).map(([k, l]) => (
                <Field key={k} label={l} value={(content[k] as string) ?? ''} onChange={(e) => setContent((p) => ({ ...p, [k]: e.target.value }))} />
              ))}
            </Section>
          </fieldset>

          {/* Save */}
          <div className="sticky bottom-0 p-3 border-t border-white/10 bg-ink">
            <button onClick={save} disabled={!editable || saveState === 'saving'}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-40 ${saveState === 'ok' ? 'bg-emerald-600' : saveState === 'err' ? 'bg-red-600' : 'bg-white text-ink hover:bg-white/90'}`}>
              {saveState === 'ok' ? <><Check className="w-4 h-4" /> Saved to repo</> : saveState === 'saving' ? 'Saving…' : <><Save className="w-4 h-4" /> Save colours</>}
            </button>
            {saveState === 'err' && <p className="text-[11px] text-red-400 mt-1.5">{saveMsg}</p>}
            <p className="text-[10px] text-white/30 mt-1.5">Saves into theme-overrides.json — commit it to ship. (Works on local dev only.)</p>
          </div>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ id, label, children }: { id: string; label?: string; children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-ink text-white">
      <header className="flex items-center justify-between px-4 h-12 border-b border-white/10 flex-shrink-0">
        <Link href="/studio" className="flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="w-4 h-4" /> Studio</Link>
        <span className="text-xs text-white/50">{label ?? id} <span className="text-white/25">({id})</span></span>
      </header>
      {children}
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 border-b border-white/10 space-y-2">
      <h3 className="text-[10px] uppercase tracking-widest text-white/30">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
      <input value={value} onChange={onChange} className="mt-0.5 w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
    </label>
  );
}
// ── Colour helpers (parse/serialise hex AND rgba, with an alpha channel) ──
function parseColor(v: string): { r: number; g: number; b: number; a: number } {
  const s = (v || '').trim();
  const hex = s.match(/^#([0-9a-f]{6})$/i);
  if (hex) { const n = parseInt(hex[1], 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }; }
  const rgba = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
  if (rgba) return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] !== undefined ? +rgba[4] : 1 };
  return { r: 0, g: 0, b: 0, a: 1 };
}
const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join('');
const serialize = (r: number, g: number, b: number, a: number) => (a >= 1 ? toHex(r, g, b) : `rgba(${r}, ${g}, ${b}, ${+a.toFixed(2)})`);

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { r, g, b, a } = parseColor(value);
  const setRGB = (hex: string) => { const p = parseColor(hex); onChange(serialize(p.r, p.g, p.b, a)); };
  const setA = (na: number) => onChange(serialize(r, g, b, na));
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {/* checkerboard so transparency is visible behind the swatch */}
        <span className="relative w-7 h-7 rounded border border-white/15 flex-shrink-0 overflow-hidden" style={{ backgroundImage: 'linear-gradient(45deg,#666 25%,transparent 25%,transparent 75%,#666 75%),linear-gradient(45deg,#666 25%,#999 25%,#999 75%,#666 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0,4px 4px' }}>
          <span className="absolute inset-0" style={{ background: `rgba(${r},${g},${b},${a})` }} />
          <input type="color" value={toHex(r, g, b)} onChange={(e) => setRGB(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </span>
        <span className="text-[11px] text-white/55 w-20 flex-shrink-0">{label}</span>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-white focus:outline-none focus:border-indigo-500/40" />
      </div>
      <div className="flex items-center gap-2 pl-9">
        <span className="text-[9px] uppercase tracking-wider text-white/25 w-12 flex-shrink-0">alpha</span>
        <input type="range" min={0} max={100} value={Math.round(a * 100)} onChange={(e) => setA(+e.target.value / 100)} className="flex-1 h-1 accent-indigo-500 cursor-pointer" />
        <span className="text-[9px] text-white/40 w-7 text-right flex-shrink-0">{Math.round(a * 100)}%</span>
      </div>
    </div>
  );
}
