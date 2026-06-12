'use client';

import { useState, type ChangeEvent } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { ReferenceUpload } from './ReferenceUpload';
import type { PosterGenerationInput, PosterCategory, PosterStyle } from '@/types/poster';

interface PosterFormProps {
  onSubmit: (input: PosterGenerationInput) => Promise<void>;
  isGenerating: boolean;
}

const CATEGORIES: Array<{ value: PosterCategory; label: string; emoji: string }> = [
  { value: 'realestate', label: 'Real Estate', emoji: '🏠' },
  { value: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'sale', label: 'Sale', emoji: '🏷️' },
  { value: 'event', label: 'Event', emoji: '🎭' },
];

const STYLES: Array<{ value: PosterStyle; label: string }> = [
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'playful', label: 'Playful' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'luxury', label: 'Luxury' },
];

const ASPECT_RATIOS = ['4:5', '1:1', '9:16'] as const;

// Curated, ready-to-use prompts so users never start from a blank page.
// Written to produce premium, reference-quality posters.
const PROMPT_LIBRARY: Record<string, string[]> = {
  realestate: [
    'Luxury modern villa for sale — full-bleed dusk exterior photo, elegant serif headline "Modern City Estates", price-start block "$2,500,000", feature list (4 Beds · 5 Baths · Ocean View), gold accents on deep navy, refined CTA "Book a Viewing"',
    'Premium beachfront apartment listing — bright airy hero photo, headline "Live by the Sea", "Why Choose Us" bullets (Prime Location · Smart Home · Private Pool), clean minimalist layout, CTA "Schedule a Tour"',
    'Exclusive penthouse open house — sophisticated city-skyline photo, two-tone serif headline, price panel, agent contact, decorative dot accents, luxury navy-and-gold palette, CTA "Enquire Now"',
  ],
  restaurant: [
    'Fine dining grand opening — appetizing plated-food hero photo, warm dark scrim, elegant serif headline "Saffron & Sage", italic tagline "An Evening of Modern Cuisine", reservation CTA "Reserve a Table", gold-on-charcoal palette',
    'Cozy Italian bistro promo — wood-fired pizza photo, friendly bold headline, offer block "2-for-1 Wood-Fired Pizzas", hours "Happy Hour 5–7pm", warm inviting palette, CTA "Order Now"',
    'Specialty coffee house launch — rich espresso/latte-art photo, modern headline "Roasted to Perfection", menu highlights, cozy warm tones, CTA "Visit Us Today"',
  ],
  fitness: [
    'High-energy gym membership poster — dynamic workout photo, bold condensed headline "LEVEL UP", aggressive dark-red palette, offer "First Month Free", CTA "JOIN NOW"',
  ],
  sale: [
    'Luxury seasonal sale — premium product photo, elegant headline, "Up to 50% Off", gold-on-black, refined CTA "Shop the Collection"',
  ],
  event: [
    'Elegant gala night — atmospheric venue photo, serif headline, date · time · venue block, CTA "RSVP Now", midnight-purple palette',
  ],
};

const DEFAULT_EXAMPLES = [...PROMPT_LIBRARY.realestate.slice(0, 2), ...PROMPT_LIBRARY.restaurant.slice(0, 1)];

export function PosterForm({ onSubmit, isGenerating }: PosterFormProps) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState<PosterCategory | ''>('');
  const [style, setStyle] = useState<PosterStyle | ''>('');
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [colorPreference, setColorPreference] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '1:1' | '9:16'>('4:5');
  const [referenceBase64, setReferenceBase64] = useState('');
  const [referenceMime, setReferenceMime] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Branding
  const [brandMode, setBrandMode] = useState<'none' | 'text' | 'logo'>('none');
  const [brandText, setBrandText] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoName, setLogoName] = useState('');

  function handleLogoFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const okType = /image\/(svg\+xml|png|jpeg|webp)/.test(file.type) || file.name.endsWith('.svg');
    if (!okType) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(typeof reader.result === 'string' ? reader.result : '');
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!prompt.trim()) return;

    const input: PosterGenerationInput = {
      prompt: prompt.trim(),
      ...(category && { category }),
      ...(style && { style }),
      ...(headline.trim() && { headline: headline.trim() }),
      ...(subheadline.trim() && { subheadline: subheadline.trim() }),
      ...(ctaText.trim() && { ctaText: ctaText.trim() }),
      ...(colorPreference.trim() && { colorPreference: colorPreference.trim() }),
      targetAspectRatio: aspectRatio,
      ...(referenceBase64 && { referenceImageBase64: referenceBase64, referenceImageMimeType: referenceMime }),
      ...(brandMode === 'text' && brandText.trim() && { brandText: brandText.trim() }),
      ...(brandMode === 'logo' && logoDataUrl && { logoDataUrl }),
    };

    await onSubmit(input);
  }

  return (
    <div className="space-y-5">
      {/* Main prompt */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Describe your poster
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Dark red fitness gym poster with aggressive bold typography and JOIN NOW CTA…"
          rows={3}
          className="
            w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
            text-sm text-white placeholder:text-white/25
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
            resize-none transition-colors
          "
          disabled={isGenerating}
        />

        {/* Example prompts — curated, category-aware so users never struggle */}
        <div className="space-y-1.5">
          <p className="text-[11px] text-white/40">
            {category && PROMPT_LIBRARY[category]
              ? `Tap a ready-made ${category} prompt:`
              : 'Tap a ready-made prompt to start:'}
          </p>
          <div className="flex flex-col gap-1.5">
            {(category && PROMPT_LIBRARY[category] ? PROMPT_LIBRARY[category] : DEFAULT_EXAMPLES).map((ex, i) => (
              <button
                key={i}
                onClick={() => setPrompt(ex)}
                title={ex}
                className="text-left text-[11px] leading-snug text-white/45 hover:text-white/80 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-md transition-colors border border-white/5 line-clamp-2"
                disabled={isGenerating}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category + Style */}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(category === c.value ? '' : c.value)}
                disabled={isGenerating}
                className={`
                  flex flex-col items-center gap-0.5 py-2 rounded-lg text-xs border transition-all
                  ${category === c.value
                    ? 'border-indigo-500 bg-indigo-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'}
                `}
              >
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as PosterStyle | '')}
            disabled={isGenerating}
            className="
              w-full h-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
              text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50
              cursor-pointer appearance-none
            "
          >
            <option value="">Auto-detect</option>
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aspect ratio */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Format</label>
        <div className="flex gap-2">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              disabled={isGenerating}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                ${aspectRatio === r
                  ? 'border-indigo-500 bg-indigo-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'}
              `}
            >
              {r}
              <span className="block text-[10px] opacity-60 mt-0.5">
                {r === '4:5' ? 'Instagram' : r === '1:1' ? 'Square' : 'Story'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand — client customization */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Brand</label>
        <div className="flex gap-1.5">
          {([
            { v: 'none', l: 'None' },
            { v: 'text', l: 'Company Text' },
            { v: 'logo', l: 'Upload Logo' },
          ] as const).map((b) => (
            <button
              key={b.v}
              onClick={() => setBrandMode(b.v)}
              disabled={isGenerating}
              className={`
                flex-1 py-2 rounded-lg text-xs font-medium border transition-all
                ${brandMode === b.v
                  ? 'border-indigo-500 bg-indigo-500/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20'}
              `}
            >
              {b.l}
            </button>
          ))}
        </div>

        {brandMode === 'text' && (
          <input
            type="text"
            value={brandText}
            onChange={(e) => setBrandText(e.target.value)}
            placeholder="Your company name (e.g. Larana, Inc.)"
            disabled={isGenerating}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-colors"
          />
        )}

        {brandMode === 'logo' && (
          <label className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border border-dashed border-white/15 bg-white/5 text-xs text-white/50 hover:text-white hover:border-indigo-500/40 cursor-pointer transition-colors">
            <input
              type="file"
              accept=".svg,image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={handleLogoFile}
              disabled={isGenerating}
              className="hidden"
            />
            {logoDataUrl ? (
              <span className="flex items-center gap-2 text-emerald-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoDataUrl} alt="logo" className="h-5 w-auto max-w-[80px] object-contain bg-white/80 rounded px-1" />
                {logoName || 'Logo uploaded'} · change
              </span>
            ) : (
              <span>Upload SVG or PNG logo</span>
            )}
          </label>
        )}
      </div>

      {/* Advanced toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
        disabled={isGenerating}
      >
        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        Advanced options
      </button>

      {showAdvanced && (
        <div className="space-y-3 pt-1">
          {/* Headline / Subheadline / CTA */}
          {[
            { label: 'Headline', value: headline, setter: setHeadline, placeholder: 'LEVEL UP YOUR FITNESS' },
            { label: 'Subheadline', value: subheadline, setter: setSubheadline, placeholder: 'Transform your body in 90 days' },
            { label: 'CTA Text', value: ctaText, setter: setCtaText, placeholder: 'JOIN NOW →' },
            { label: 'Color Preference', value: colorPreference, setter: setColorPreference, placeholder: 'dark red, black, white' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className="space-y-1">
              <label className="text-xs text-white/50">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                disabled={isGenerating}
                className="
                  w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
                  text-sm text-white placeholder:text-white/20
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/50
                  transition-colors
                "
              />
            </div>
          ))}

          {/* Reference image */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50">Reference Image (optional)</label>
            <ReferenceUpload
              onImageReady={(base64, mime) => {
                setReferenceBase64(base64);
                setReferenceMime(mime);
              }}
              onClear={() => {
                setReferenceBase64('');
                setReferenceMime('');
              }}
            />
          </div>
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleSubmit}
        disabled={isGenerating || !prompt.trim()}
        className={`
          w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl
          text-sm font-bold tracking-wide uppercase transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isGenerating
            ? 'bg-indigo-700 text-white/70 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99]'}
        `}
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating poster…
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Poster
          </>
        )}
      </button>
    </div>
  );
}
