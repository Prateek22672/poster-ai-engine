'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, DollarSign, Activity, Zap, Radio, ImageIcon, Timer, ShieldAlert } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { Money, CurrencyToggle } from '@/components/ui/Money';

interface KindRow {
  kind: string; provider: string; model: string | null;
  calls: number; cost: number; input_tokens: number; output_tokens: number;
}
interface ProviderRow { provider: string; calls: number; cost: number }
interface RecentRow {
  created_at: string; provider: string; kind: string; model: string | null;
  input_tokens: number; output_tokens: number; cost: number; status: string;
}
interface RealtorSummary {
  requests: number; completed: number; errors: number; blocked: number; today: number;
  posters: number; avgMs: number; avgPerPosterMs: number; lastMs: number;
}
interface Summary {
  totals: { calls: number; cost: number; input_tokens: number; output_tokens: number };
  today: { calls: number; cost: number };
  by_kind: KindRow[];
  by_provider: ProviderRow[];
  recent: RecentRow[];
  realtor?: RealtorSummary;
}

// Plain-English explanation of every call type the engine makes.
const KIND_INFO: Record<string, string> = {
  intent: 'Reads the user prompt and extracts structured fields (category, headline, CTA…). Model: gpt-4o-mini (cheap).',
  'rag-embed': 'Turns the search query into a vector for RAG similarity search. Model: text-embedding-3-small (cheapest).',
  layout: 'Designs the poster as structured JSON (the main cost). Model: gpt-4o.',
  vision: 'Analyses a user-uploaded reference image. Model: gpt-4o vision (only if a reference is uploaded).',
  'image-search': 'Fetches a real background photo from Pexels. Free (no token cost).',
  upload: 'Uploads the final poster to Cloudinary. Free on the current plan.',
  'realtor-poster': 'A poster rendered for the Realtor integration (deterministic real-estate engine). $0 AI cost — no OpenAI call.',
};


export default function InsightsPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/insights', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to load');
      setData(json as Summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalCost = data?.totals.cost ?? 0;
  // A "poster" = an AI design (kind 'layout') OR a deterministic Realtor poster.
  const layoutCalls = data?.by_kind.find((k) => k.kind === 'layout')?.calls ?? 0;
  const realtorPosters = data?.by_kind.find((k) => k.kind === 'realtor-poster')?.calls ?? 0;
  const totalPosters = layoutCalls + realtorPosters;
  const perPoster = totalPosters > 0 ? totalCost / totalPosters : 0;

  return (
    <div className="min-h-dvh flex flex-col relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-sunset" />
      <DashboardNav />

      <main className="flex-1 overflow-y-auto p-6 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-ink drop-shadow-sm">Usage &amp; Cost Insights</h1>
            <p className="text-sm text-neutral-800/70 mt-0.5">
              Every API call the engine makes is logged here — counts, models, tokens, and real cost.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CurrencyToggle />
            <button
              onClick={load}
              className="flex items-center gap-2 text-xs text-white/60 hover:text-white bg-ink border border-white/10 px-3 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card icon={<Activity className="w-4 h-4" />} label="Total API calls" value={String(data.totals.calls)} />
              <Card icon={<DollarSign className="w-4 h-4" />} label="Total cost (all time)" value={<Money usd={totalCost} decimals={4} />} accent />
              <Card icon={<ImageIcon className="w-4 h-4" />} label="Posters generated" value={String(totalPosters)} />
              <Card icon={<DollarSign className="w-4 h-4" />} label="Avg cost / poster" value={<Money usd={perPoster} decimals={6} />} />
            </div>

            {/* Realtor integration */}
            {data.realtor && (
              <Section
                title="Realtor integration"
                subtitle="Every poster request coming from the Realtor SaaS — counted, timed, and costed."
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <MiniStat icon={<Radio className="w-4 h-4" />} label="Requests" value={String(data.realtor.requests)} sub={`${data.realtor.today} today`} />
                  <MiniStat icon={<ImageIcon className="w-4 h-4" />} label="Posters delivered" value={String(data.realtor.posters)} sub={`${data.realtor.completed} completed`} good />
                  <MiniStat icon={<Timer className="w-4 h-4" />} label="Avg render / poster" value={data.realtor.avgPerPosterMs ? `${(data.realtor.avgPerPosterMs / 1000).toFixed(1)}s` : '—'} sub={data.realtor.lastMs ? `last ${(data.realtor.lastMs / 1000).toFixed(1)}s` : ''} />
                  <MiniStat icon={<ShieldAlert className="w-4 h-4" />} label="Errors / blocked" value={`${data.realtor.errors} / ${data.realtor.blocked}`} sub="failed · rejected" bad={data.realtor.errors + data.realtor.blocked > 0} />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3">
                  <span className="text-xs text-white/60">Realtor AI cost per poster</span>
                  <span className="text-sm font-mono text-emerald-400"><Money usd={0} decimals={6} /> · deterministic (no OpenAI)</span>
                </div>
              </Section>
            )}

            {/* Cost by call type */}
            <Section title="Cost by call type" subtitle="What every type of call does and what it has cost so far.">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/40 text-xs border-b border-white/10">
                      <th className="py-2 pr-3 font-medium">Call type</th>
                      <th className="py-2 px-3 font-medium">Provider</th>
                      <th className="py-2 px-3 font-medium">Model</th>
                      <th className="py-2 px-3 font-medium text-right">Calls</th>
                      <th className="py-2 px-3 font-medium text-right">Tokens (in/out)</th>
                      <th className="py-2 pl-3 font-medium text-right">Total cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.by_kind.map((k) => (
                      <tr key={k.kind} className="border-b border-white/5 align-top">
                        <td className="py-2.5 pr-3">
                          <div className="text-white font-medium">{k.kind}</div>
                          <div className="text-[11px] text-white/35 max-w-xs">{KIND_INFO[k.kind] ?? ''}</div>
                        </td>
                        <td className="py-2.5 px-3 text-white/60">{k.provider}</td>
                        <td className="py-2.5 px-3 text-white/60 font-mono text-xs">{k.model ?? '—'}</td>
                        <td className="py-2.5 px-3 text-right text-white/80">{k.calls}</td>
                        <td className="py-2.5 px-3 text-right text-white/50 font-mono text-xs">
                          {k.input_tokens}/{k.output_tokens}
                        </td>
                        <td className="py-2.5 pl-3 text-right text-emerald-400 font-mono"><Money usd={k.cost} decimals={6} /></td>
                      </tr>
                    ))}
                    {data.by_kind.length === 0 && (
                      <tr><td colSpan={6} className="py-6 text-center text-white/30">No calls logged yet — generate a poster.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* By provider */}
            <Section title="By provider" subtitle="OpenAI is the only paid provider; Pexels/Cloudinary are free.">
              <div className="flex flex-wrap gap-3">
                {data.by_provider.map((p) => (
                  <div key={p.provider} className="flex-1 min-w-[140px] bg-white/[0.03] border border-white/10 rounded-xl p-3">
                    <div className="text-xs text-white/40 uppercase tracking-wide">{p.provider}</div>
                    <div className="text-white font-semibold mt-1">{p.calls} calls</div>
                    <div className="text-emerald-400 text-sm font-mono"><Money usd={p.cost} decimals={6} /></div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Recent calls */}
            <Section title="Recent calls" subtitle="The last 25 API calls, newest first.">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-white/40 border-b border-white/10">
                      <th className="py-2 pr-3 font-medium">Time</th>
                      <th className="py-2 px-3 font-medium">Type</th>
                      <th className="py-2 px-3 font-medium">Model</th>
                      <th className="py-2 px-3 font-medium text-right">In/Out</th>
                      <th className="py-2 px-3 font-medium text-right">Cost</th>
                      <th className="py-2 pl-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((r, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2 pr-3 text-white/40 font-mono">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="py-2 px-3 text-white/80">{r.kind}</td>
                        <td className="py-2 px-3 text-white/50 font-mono">{r.model ?? '—'}</td>
                        <td className="py-2 px-3 text-right text-white/50 font-mono">{r.input_tokens}/{r.output_tokens}</td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-mono"><Money usd={r.cost} decimals={6} /></td>
                        <td className="py-2 pl-3">
                          <span className={r.status === 'ok' ? 'text-emerald-400' : 'text-red-400'}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                    {data.recent.length === 0 && (
                      <tr><td colSpan={6} className="py-6 text-center text-white/30">No calls yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            <p className="text-[11px] text-white/30 mt-4">
              Token counts come straight from each OpenAI API response. Costs = tokens × OpenAI list price.
              Cross-check any time at platform.openai.com/usage. Pexels &amp; Cloudinary calls are counted but free.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Card({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'bg-ink border-emerald-500/30' : 'bg-ink border-white/10'}`}>
      <div className="flex items-center gap-1.5 text-white/40 text-xs">{icon}{label}</div>
      <div className={`text-2xl font-bold mt-1.5 ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function MiniStat({ icon, label, value, sub, good, bad }: { icon: React.ReactNode; label: string; value: string; sub?: string; good?: boolean; bad?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-1.5 text-white/40 text-[11px]">{icon}{label}</div>
      <div className={`text-xl font-bold mt-1 ${bad ? 'text-red-400' : good ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
      {sub && <div className="text-[11px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 bg-ink backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5 mb-3">{subtitle}</p>}
      {children}
    </section>
  );
}
