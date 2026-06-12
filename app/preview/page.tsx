'use client';

/**
 * /preview — LAYOUT TEST BENCH (dev tool).
 * Renders every real-estate archetype live with editable sample content.
 * Add a new archetype in lib/templates/realestate/archetypes/ + register it in
 * index.ts → it appears here instantly. Edit the fields → all layouts re-render.
 */
import { useState } from 'react';
import { ARCHETYPES } from '@/lib/templates/realestate';
import type { RealEstateContent } from '@/lib/templates/realestate';
import { PosterCanvas } from '@/components/poster/PosterCanvas';

const DEFAULT_HERO = 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg';

export default function PreviewPage() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [c, setC] = useState<RealEstateContent>({
    projectName: 'BIRLA ARIKA',
    developer: 'Birla',
    location: 'Sector 31',
    tagline: 'Modern Elegance',
    configLabel: 'Residences',
    configValue: '4 BHK',
    priceLabel: 'Starting From',
    priceValue: '₹12 CR',
    detailLabel: 'Possession & Plan',
    detailValue: 'Q4 2027 · 60/40',
    cta: 'Enquire Now',
    brand: 'Birla Estates',
  });

  const set = (k: keyof RealEstateContent) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="min-h-dvh bg-[#0b0712] text-white flex">
      {/* Controls */}
      <aside className="w-72 flex-shrink-0 border-r border-white/10 p-4 space-y-3 sticky top-0 h-dvh overflow-y-auto">
        <h1 className="text-sm font-bold">Layout test bench</h1>
        <p className="text-[11px] text-white/40">
          Edit fields → all {ARCHETYPES.length} archetypes re-render. Add one in
          <code className="text-indigo-300"> archetypes/</code> + register in
          <code className="text-indigo-300"> index.ts</code>.
        </p>
        <Field label="Hero image URL" value={hero} onChange={(e) => setHero(e.target.value)} />
        {([
          ['projectName', 'Project name'], ['developer', 'Developer'], ['location', 'Location'],
          ['tagline', 'Tagline'], ['configLabel', 'Config label'], ['configValue', 'Config value'],
          ['priceLabel', 'Price label'], ['priceValue', 'Price value'], ['detailLabel', 'Detail label'],
          ['detailValue', 'Detail value'], ['cta', 'CTA'], ['brand', 'Brand'],
        ] as Array<[keyof RealEstateContent, string]>).map(([k, label]) => (
          <Field key={k} label={label} value={(c[k] as string) ?? ''} onChange={set(k)} />
        ))}
      </aside>

      {/* Grid of archetypes */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {ARCHETYPES.map((a) => (
            <div key={a.id} className="flex flex-col items-center gap-2">
              <div className="text-xs text-white/60 font-medium">{a.label} <span className="text-white/25">({a.id})</span></div>
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-xl">
                <PosterCanvas layout={a.build(c, hero)} scale={0.3} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/35">{label}</span>
      <input
        value={value}
        onChange={onChange}
        className="mt-0.5 w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40"
      />
    </label>
  );
}
