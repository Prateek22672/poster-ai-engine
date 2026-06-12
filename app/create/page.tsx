'use client';

import { useState, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { PosterEditor } from '@/components/poster/PosterEditor';
import { Loader, LoadingText } from '@/components/ui/loader';
import { PromptInputBox } from '@/components/ui/PromptInputBox';
import type { GeneratedPoster, PosterGenerationInput, PosterCategory, PosterStyle } from '@/types/poster';

type PageState = 'form' | 'generating' | 'editor';

/* ── Real option sets (wired to the engine) ─────────────────────── */
const CATEGORIES: Array<{ v: PosterCategory; label: string; emoji: string }> = [
  { v: 'realestate', label: 'Real Estate', emoji: '🏠' },
  { v: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { v: 'fitness', label: 'Fitness', emoji: '💪' },
  { v: 'sale', label: 'Sale', emoji: '🏷️' },
  { v: 'event', label: 'Event', emoji: '🎭' },
];
const STYLES: PosterStyle[] = ['luxury', 'elegant', 'minimal', 'corporate', 'playful', 'aggressive'];
const FORMATS: Array<{ v: '4:5' | '1:1' | '9:16'; label: string }> = [
  { v: '4:5', label: 'Instagram 4:5' },
  { v: '1:1', label: 'Square' },
  { v: '9:16', label: 'Story 9:16' },
];
const SUGGESTIONS: Array<{ label: string; prompt: string; category: PosterCategory }> = [
  { label: '🏠 Luxury apartment launch', category: 'realestate', prompt: 'Luxury modern apartments, studio 1 & 2 BR, starting from AED 585K, Q1 2027 handover, 60/40 payment plan, Downtown' },
  { label: '🏠 Premium villa for sale', category: 'realestate', prompt: 'Ultra-luxury 4 BHK villa for sale, ₹12 Cr onwards, 4000-4900 sqft, possession Q4 2027, ocean views, Sector 31' },
  { label: '🍽️ Fine dining opening', category: 'restaurant', prompt: 'Fine dining grand opening, appetizing plated food, elegant tagline, reservation CTA, gold-on-charcoal palette' },
  { label: '🍽️ Cozy bistro promo', category: 'restaurant', prompt: 'Cozy Italian bistro, wood-fired pizza, 2-for-1 happy hour 5-7pm, warm inviting palette' },
];

/* ── UI bits ────────────────────────────────────────────────────── */
function Chip({ label, active, onClick, accent = 'indigo' }: { label: string; active: boolean; onClick: () => void; accent?: 'indigo' | 'violet' | 'emerald' }) {
  const map = {
    indigo: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300',
    violet: 'border-violet-500/50 bg-violet-500/10 text-violet-300',
    emerald: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap capitalize ${active ? map[accent] : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/80'}`}
    >
      {label}
    </button>
  );
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-widest text-white/30 mb-2">{children}</p>;
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function CreatePage() {
  const [state, setState] = useState<PageState>('form');
  const [poster, setPoster] = useState<GeneratedPoster | null>(null);
  const [error, setError] = useState('');
  const [lastInput, setLastInput] = useState<PosterGenerationInput | null>(null);
  const [generationTime, setGenerationTime] = useState(0);
  const [cost, setCost] = useState<number | null>(null);

  // form fields (wired to the engine)
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PosterCategory | ''>('');
  const [style, setStyle] = useState<PosterStyle | ''>('');
  const [aspect, setAspect] = useState<'4:5' | '1:1' | '9:16'>('4:5');
  const [headline, setHeadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [colorPref, setColorPref] = useState('');
  const [brandMode, setBrandMode] = useState<'none' | 'text' | 'logo'>('none');
  const [brandText, setBrandText] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleLogoFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  }

  function buildInput(promptText: string): PosterGenerationInput {
    return {
      prompt: promptText.trim(),
      ...(category && { category }),
      ...(style && { style }),
      targetAspectRatio: aspect,
      ...(headline.trim() && { headline: headline.trim() }),
      ...(ctaText.trim() && { ctaText: ctaText.trim() }),
      ...(colorPref.trim() && { colorPreference: colorPref.trim() }),
      ...(brandMode === 'text' && brandText.trim() && { brandText: brandText.trim() }),
      ...(brandMode === 'logo' && logoDataUrl && { logoDataUrl }),
    };
  }

  async function runGeneration(input: PosterGenerationInput) {
    setState('generating');
    setError('');
    setLastInput(input);
    const start = Date.now();
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Generation failed (${res.status})`);
      }
      const data = await res.json();
      setGenerationTime(Math.round((Date.now() - start) / 100) / 10);
      setCost(typeof data?.usage?.totalCostUsd === 'number' ? data.usage.totalCostUsd : null);
      setPoster(data); // /api/generate returns the GeneratedPoster directly
      setState('editor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setState('form');
    }
  }

  function handleSend(prompt: string) {
    const desc = (prompt || description).trim();
    if (!desc) return;
    runGeneration(buildInput(desc));
  }
  async function handleRegenerate() {
    if (lastInput) await runGeneration(lastInput);
  }

  /* ── Editor view (unchanged) ──────────────────────────────────── */
  if (state === 'editor' && poster) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <DashboardNav />
        {cost !== null && (
          <div className="px-4 py-1 text-[11px] text-emerald-400/90 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center gap-2">
            <span className="font-semibold">Real OpenAI cost this generation:</span>
            <span className="font-mono">${cost.toFixed(4)}</span>
            <span className="text-white/30">· token counts from OpenAI’s API · verify at platform.openai.com/usage</span>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <PosterEditor poster={poster} onRegenerate={handleRegenerate} onClose={() => setState('form')} />
        </div>
      </div>
    );
  }

  /* ── Form / generating view ───────────────────────────────────── */
  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <DashboardNav />

      <div className="flex-1 relative overflow-y-auto">
        {/* Exact sunset gradient (orange → pink → lavender → sky blue) */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(125% 125% at 50% 101%, rgba(245,87,2,1) 10.5%, rgba(245,120,2,1) 16%, rgba(245,140,2,1) 17.5%, rgba(245,170,100,1) 25%, rgba(238,174,202,1) 40%, rgba(202,179,214,1) 65%, rgba(148,201,233,1) 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center px-4 pt-12 pb-16 min-h-full">
          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-white/25 bg-black/20 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] text-white/90 font-medium tracking-wide uppercase">Design Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight drop-shadow-sm">What would you like to create?</h1>
            <p className="text-sm text-neutral-800/80 mt-1.5">Describe your poster and let the engine compose the layout.</p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -6, height: 0 }} className="w-full max-w-2xl mb-4">
                <div className="flex items-start gap-2.5 p-3 bg-red-500/8 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-red-400">Generation failed</p>
                    <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt box */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="w-full max-w-2xl">
            <PromptInputBox
              value={description}
              onValueChange={setDescription}
              onSend={handleSend}
              isLoading={state === 'generating'}
              placeholder="Luxury apartment launch, ₹2.5 Cr onwards, 3 BHK, possession 2027…"
            />
          </motion.div>

          {/* Suggestions (set category too) */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.16 }} className="w-full max-w-2xl mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => { setDescription(s.prompt); setCategory(s.category); }}
                className="px-3 py-1.5 rounded-full text-xs border border-white/25 bg-black/25 backdrop-blur-sm text-white/85 hover:bg-black/40 hover:border-white/40 transition-all duration-150"
              >
                {s.label}
              </button>
            ))}
          </motion.div>

          {/* Refine controls */}
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }} className="w-full max-w-2xl mt-6 space-y-5 rounded-3xl border border-white/10 bg-ink backdrop-blur-xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-white/25 uppercase tracking-widest">Refine</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Category */}
            <div>
              <FieldLabel>Category</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <Chip key={c.v} label={`${c.emoji} ${c.label}`} active={category === c.v} onClick={() => setCategory(category === c.v ? '' : c.v)} accent="indigo" />
                ))}
              </div>
            </div>

            {/* Style + Format */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <FieldLabel>Style</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((s) => (
                    <Chip key={s} label={s} active={style === s} onClick={() => setStyle(style === s ? '' : s)} accent="violet" />
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>Format</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {FORMATS.map((f) => (
                    <Chip key={f.v} label={f.label} active={aspect === f.v} onClick={() => setAspect(f.v)} accent="emerald" />
                  ))}
                </div>
              </div>
            </div>

            {/* Brand */}
            <div>
              <FieldLabel>Brand</FieldLabel>
              <div className="flex gap-1.5">
                {([{ v: 'none', l: 'None' }, { v: 'text', l: 'Company Text' }, { v: 'logo', l: 'Upload Logo' }] as const).map((b) => (
                  <Chip key={b.v} label={b.l} active={brandMode === b.v} onClick={() => setBrandMode(b.v)} accent="indigo" />
                ))}
              </div>
              {brandMode === 'text' && (
                <input
                  value={brandText} onChange={(e) => setBrandText(e.target.value)}
                  placeholder="Company / developer name (e.g. Emaar)"
                  className="mt-2 w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40"
                />
              )}
              {brandMode === 'logo' && (
                <label className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-xs text-white/50 hover:text-white hover:border-indigo-500/40 cursor-pointer transition-colors">
                  <input type="file" accept=".svg,image/*" onChange={handleLogoFile} className="hidden" />
                  {logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <span className="flex items-center gap-2 text-emerald-400"><img src={logoDataUrl} alt="logo" className="h-5 max-w-[80px] object-contain bg-white/80 rounded px-1" /> Logo ready · change</span>
                  ) : 'Upload SVG or PNG logo'}
                </label>
              )}
            </div>

            {/* Advanced */}
            <div>
              <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors">
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span className="uppercase tracking-widest">Advanced</span>
              </button>
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="pt-4 grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Headline / Project name</FieldLabel>
                        <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. COVE, Birla Arika"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40" />
                      </div>
                      <div>
                        <FieldLabel>CTA text</FieldLabel>
                        <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="e.g. Enquire Now"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40" />
                      </div>
                      <div className="col-span-2">
                        <FieldLabel>Color preference</FieldLabel>
                        <input value={colorPref} onChange={(e) => setColorPref(e.target.value)} placeholder="e.g. navy and gold, warm tones"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {poster && state === 'form' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
              <p className="text-white/40 text-xs mb-2">Poster generated in {generationTime}s</p>
              <button onClick={() => setState('editor')} className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors mx-auto">
                <ArrowLeft className="w-4 h-4 rotate-180" /> Back to editor
              </button>
            </motion.div>
          )}
        </div>

        {/* Generating overlay */}
        <AnimatePresence>
          {state === 'generating' && (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-6 text-center">
                <Loader size={76} strokeWidth={1.8} className="text-indigo-400" />
                <LoadingText text="Crafting your poster" size={22} />
                <div className="flex flex-col gap-2 text-left w-64">
                  {['Extracting design intent', 'Searching design templates', 'Planning composition', 'Rendering layout'].map((step, i) => (
                    <motion.div key={step} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }} className="flex items-center gap-2 text-xs text-white/50">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
