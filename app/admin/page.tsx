'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, RefreshCw, LogOut, KeyRound, Plus, Copy, Check,
  CircleCheck, CircleX, Activity, DollarSign, Radio, Layers, Lock,
} from 'lucide-react';
import { DotsLoading } from '@/components/ui/loader';
import { Money, CurrencyToggle } from '@/components/ui/Money';

// Frosted pill — identical language to the main app header (DashboardNav).
const PILL =
  'bg-ink backdrop-blur-xl border border-white/15 ' +
  'shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_6px_20px_rgba(0,0,0,0.35)]';

interface HealthCheck { name: string; ok: boolean; detail: string }
interface ServiceKey { id: string; name: string; prefix: string; active: boolean; allowed_ips: string | null; created_at: string; last_used_at: string | null }
interface Stats { totals: { calls: number; cost: number }; today: { calls: number; cost: number } }

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  const [health, setHealth] = useState<HealthCheck[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [keys, setKeys] = useState<ServiceKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyIps, setNewKeyIps] = useState('');
  const [revealedKey, setRevealedKey] = useState<{ name: string; raw: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const loadAll = useCallback(async () => {
    const [h, s, k] = await Promise.all([
      fetch('/api/admin/health', { cache: 'no-store' }),
      fetch('/api/admin/stats', { cache: 'no-store' }),
      fetch('/api/admin/keys', { cache: 'no-store' }),
    ]);
    if (h.status === 401) { setAuthed(false); return; }
    setAuthed(true);
    setHealth((await h.json()).checks ?? []);
    setStats(await s.json());
    setKeys((await k.json()).keys ?? []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function login() {
    setBusy(true); setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) { setLoginError((await res.json()).error ?? 'Login failed'); return; }
      setPassword('');
      await loadAll();
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    const res = await fetch('/api/admin/keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim(), allowedIps: newKeyIps.trim() }),
    });
    const json = await res.json();
    if (res.ok) { setRevealedKey({ name: json.name, raw: json.raw }); setNewKeyName(''); setNewKeyIps(''); loadAll(); }
  }

  async function patchKey(id: string, body: { active?: boolean; allowedIps?: string }) {
    await fetch('/api/admin/keys', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    loadAll();
  }

  // ── Loading / login gate ────────────────────────────────────────
  if (authed === null) {
    return <Centered><DotsLoading className="text-indigo-400 w-8 h-8" /></Centered>;
  }
  if (!authed) {
    return (
      <Centered>
        <div className="w-full max-w-sm">
          {/* Brand mark */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">PosterAI Admin</h1>
            <p className="text-[13px] text-white/55 mt-1 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">Engine control &amp; service monitoring</p>
          </div>

          {/* Card — solid dark black */}
          <div className="rounded-3xl bg-black/95 backdrop-blur-xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
            <label className="block text-xs font-semibold text-white/55 mb-2">Admin password</label>
            <input
              type="password" value={password} autoFocus
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && login()}
              placeholder="••••••••••"
              className="w-full bg-white/[0.06] rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
            />
            {loginError && <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1"><CircleX className="w-3.5 h-3.5" /> {loginError}</p>}
            <button
              onClick={login} disabled={busy}
              className="mt-4 w-full py-3 rounded-xl bg-white hover:bg-white/90 text-ink text-sm font-bold disabled:opacity-50 transition shadow-[0_10px_28px_rgba(0,0,0,0.4)]"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
            <TrustTag icon={<Lock className="w-3 h-3" />} label="TLS encrypted" />
            <TrustTag icon={<ShieldCheck className="w-3 h-3" />} label="HMAC-signed API" />
          </div>
          <p className="text-center text-[11px] text-white/40 mt-3 drop-shadow-[0_1px_6px_rgba(0,0,0,0.3)]">
            Protected area · authorized personnel only
          </p>
        </div>
      </Centered>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────
  return (
    <div className="min-h-dvh relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-sunset" />
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-5 pt-3 pb-2">
        {/* Logo pill — back to the app */}
        <Link href="/create" className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors hover:bg-ink ${PILL}`}>
          <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
            <Layers className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight leading-none">PosterAI</span>
          <span className="text-white/25 text-[13px] leading-none">/</span>
          <span className="text-[13px] font-semibold text-indigo-300 tracking-tight leading-none flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        </Link>

        {/* Action pills */}
        <div className="flex items-center gap-1.5">
          <CurrencyToggle className={`!rounded-full !border-white/15 ${PILL}`} />
          <Link href="/admin/service" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/65 hover:text-white transition-colors hover:bg-ink ${PILL}`}>
            <Radio className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Service</span>
          </Link>
          <button onClick={loadAll} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/65 hover:text-white transition-colors hover:bg-ink ${PILL}`}>
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={logout} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/65 hover:text-white transition-colors hover:bg-ink ${PILL}`}>
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<Activity className="w-4 h-4" />} label="Total calls" value={String(stats?.totals.calls ?? 0)} />
          <Stat icon={<DollarSign className="w-4 h-4" />} label="Total cost" value={<Money usd={stats?.totals.cost ?? 0} decimals={4} />} accent />
          <Stat icon={<Activity className="w-4 h-4" />} label="Calls today" value={String(stats?.today.calls ?? 0)} />
          <Stat icon={<DollarSign className="w-4 h-4" />} label="Cost today" value={<Money usd={stats?.today.cost ?? 0} decimals={4} />} />
        </div>

        {/* Health */}
        <Section title="System health" subtitle="Live status of the engine and every connected service.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {health.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink backdrop-blur px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {c.ok ? <CircleCheck className="w-4 h-4 text-emerald-400" /> : <CircleX className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-white">{c.name}</span>
                </div>
                <span className={`text-xs ${c.ok ? 'text-white/40' : 'text-red-400'}`}>{c.detail}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Service keys */}
        <Section title="Service API keys" subtitle="Issue a key per client (e.g. their PHP backend). Revoke any time.">
          <div className="space-y-2 mb-3">
            <div className="flex gap-2">
              <input
                value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Client name (e.g. brandchimp-php)"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <button onClick={createKey} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
                <Plus className="w-4 h-4" /> Create
              </button>
            </div>
            <input
              value={newKeyIps} onChange={(e) => setNewKeyIps(e.target.value)}
              placeholder="Allowed IPs (optional, comma-separated — blank = any IP)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 font-mono placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {revealedKey && (
            <div className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
              <p className="text-xs text-emerald-400 mb-1.5">New key for &ldquo;{revealedKey.name}&rdquo; — copy now, shown once:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-white font-mono bg-black/40 rounded px-2 py-1.5 break-all">{revealedKey.raw}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(revealedKey.raw); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-white/10 divide-y divide-white/[0.06]">
            {keys.length === 0 && <p className="px-4 py-6 text-center text-white/30 text-sm">No keys yet.</p>}
            {keys.map((k) => (
              <div key={k.id} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <KeyRound className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{k.name}</p>
                      <p className="text-[11px] text-white/30 font-mono">{k.prefix} · {k.last_used_at ? `used ${new Date(k.last_used_at).toLocaleDateString()}` : 'never used'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => patchKey(k.id, { active: !k.active })}
                    className={`text-xs px-3 py-1.5 rounded-lg border flex-shrink-0 ${k.active ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 'border-white/10 text-white/40 bg-white/5'}`}
                  >
                    {k.active ? 'Active · revoke' : 'Revoked · enable'}
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 flex-shrink-0">IP allowlist</span>
                  <input
                    defaultValue={k.allowed_ips ?? ''}
                    placeholder="any IP (blank) — or 1.2.3.4, 5.6.7.8"
                    onBlur={(e) => { const v = e.target.value.trim(); if (v !== (k.allowed_ips ?? '')) patchKey(k.id, { allowedIps: v }); }}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white/80 font-mono placeholder:text-white/25 focus:outline-none focus:border-indigo-500/40"
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Integration */}
        <Section title="Connect their backend" subtitle="Their PHP calls this endpoint server-to-server with a service key.">
          <pre className="text-[11px] text-white/60 bg-black/40 rounded-xl p-4 overflow-x-auto font-mono leading-relaxed">{`POST  /api/v1/generate
Authorization: Bearer <service_key>
Content-Type: application/json

{ "prompt": "...", "headline": "AZURE", "brandText": "Emaar",
  "category": "realestate", "ctaText": "Enquire Now" }

→ { "status":"completed", "image_url":"https://res.cloudinary.com/...png",
    "poster_id":"...", "archetype":"cove", "cost_usd":0 }`}</pre>
        </Section>
      </main>
    </div>
  );
}

function TrustTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-medium text-white/80">
      {icon}{label}
    </span>
  );
}
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh relative flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-sunset" />
      {children}
    </div>
  );
}
function Stat({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${accent ? 'bg-ink border-emerald-500/30' : 'bg-ink border-white/10'}`}>
      <div className="flex items-center gap-1.5 text-white/40 text-xs">{icon}{label}</div>
      <div className={`text-xl font-bold mt-1.5 ${accent ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-ink backdrop-blur-xl p-5">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5 mb-3">{subtitle}</p>}
      {children}
    </section>
  );
}
