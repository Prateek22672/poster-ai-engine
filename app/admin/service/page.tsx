'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Radio, CircleCheck, CircleX, Clock, Layers, Power, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { DotsLoading } from '@/components/ui/loader';

// Frosted pill — identical language to the main app header (DashboardNav).
const PILL =
  'bg-ink backdrop-blur-xl border border-white/15 ' +
  'shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_6px_20px_rgba(0,0,0,0.35)]';

interface CallRow {
  id: string; created_at: string; request_id: string | null; tenant_id: string | null;
  status: string; error_code: string | null; posters_count: number; images_count: number;
  logos_count: number; total_ms: number | null; property: Record<string, unknown> | null;
  response: Record<string, unknown> | null; ip: string | null;
}
interface SecurityData {
  blocked: number;
  reasons: Record<string, number>;
  lastBlockedAt: string | null;
  lastBlockedIp: string | null;
}
interface ServiceData {
  enabled: boolean;
  stats: { total: number; completed: number; errors: number; today: number };
  security: SecurityData;
  calls: CallRow[];
}

const statusColor = (s: string) =>
  s === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : s === 'admin' ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'
    : s === 'disabled' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : s === 'unauthorized' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
    : 'text-red-400 bg-red-500/10 border-red-500/30';

// Human label for each HMAC rejection reason.
const REASON_LABEL: Record<string, string> = {
  UNAUTHORIZED: 'Wrong API key',
  STALE_TIMESTAMP: 'Replay / expired timestamp',
  BAD_SIGNATURE: 'Forged / tampered body',
  ENGINE_NOT_CONFIGURED: 'Engine missing secrets',
  BAD_JSON: 'Malformed payload',
};
const statusIcon = (s: string) => {
  if (s === 'completed') return <CircleCheck className="w-4 h-4 text-emerald-400" />;
  if (s === 'admin') return <Power className="w-4 h-4 text-indigo-300" />;
  if (s === 'disabled') return <Radio className="w-4 h-4 text-amber-400" />;
  if (s === 'unauthorized') return <ShieldAlert className="w-4 h-4 text-rose-400" />;
  return <CircleX className="w-4 h-4 text-red-400" />;
};

export default function ServicePage() {
  const [data, setData] = useState<ServiceData | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/service', { cache: 'no-store' });
    if (res.status === 401) { setAuthed(false); return; }
    setAuthed(true);
    setData(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggle() {
    if (!data) return;
    setSaving(true);
    await fetch('/api/admin/service', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !data.enabled }),
    });
    await load();
    setSaving(false);
  }

  if (authed === false) {
    return (
      <Shell>
        <div className="rounded-2xl border border-white/10 bg-ink p-6 text-center text-white/60">
          Please <Link href="/admin" className="text-indigo-400 underline">log in at /admin</Link> first.
        </div>
      </Shell>
    );
  }
  if (!data) return <Shell><div className="flex justify-center py-20"><DotsLoading className="text-indigo-400 w-8 h-8" /></div></Shell>;

  return (
    <Shell>
      {/* Connection + toggle */}
      <div className="rounded-2xl border border-white/10 bg-ink p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className={`w-5 h-5 ${data.enabled ? 'text-emerald-400' : 'text-white/30'}`} />
            <div>
              <p className="text-sm font-semibold text-white">Realtor service {data.enabled ? 'LIVE' : 'OFF'}</p>
              <p className="text-xs text-white/40">
                {data.enabled ? 'Accepting calls at /api/posters/generate' : 'Disabled — Realtor falls back to GD'}
              </p>
            </div>
          </div>
          <button
            onClick={toggle} disabled={saving}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${data.enabled ? 'bg-emerald-500' : 'bg-white/15'} disabled:opacity-50`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${data.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total calls" value={String(data.stats.total)} />
        <Stat label="Completed" value={String(data.stats.completed)} good />
        <Stat label="Errors" value={String(data.stats.errors)} bad={data.stats.errors > 0} />
        <Stat label="Today" value={String(data.stats.today)} />
      </div>

      {/* Security */}
      <SecurityPanel security={data.security} />

      {/* Call log */}
      <div className="rounded-2xl border border-white/10 bg-ink p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Realtor call log</h2>
            <p className="text-xs text-white/40">Every request from the Realtor + what we returned (newest first).</p>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {data.calls.length === 0 ? (
          <div className="py-10 text-center text-white/30 text-sm">
            No calls yet. If the Realtor &ldquo;generates&rdquo; but nothing appears here, their PHP isn&apos;t reaching this endpoint.
          </div>
        ) : (
          <div className="space-y-2">
            {data.calls.map((c) => {
              const urls = (c.response?.posters as string[] | undefined) ?? [];
              const errMsg = (c.response?.error as string | undefined);
              const eventMsg = (c.response?.event as string | undefined);
              const isSystem = c.status === 'admin' || c.status === 'unauthorized';
              return (
                <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {statusIcon(c.status)}
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusColor(c.status)}`}>{c.status}{c.error_code ? ` · ${c.error_code}` : ''}</span>
                      <span className="text-xs text-white/40 font-mono">{c.request_id ?? '—'}</span>
                      {c.tenant_id && <span className="text-[11px] text-white/30">tenant: {c.tenant_id}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/35">
                      {c.total_ms != null && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.total_ms}ms</span>}
                      <span>{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 text-[11px] text-white/45 flex flex-wrap gap-x-3 gap-y-0.5">
                    {!isSystem && <span>imgs: {c.images_count}</span>}
                    {!isSystem && <span>logos: {c.logos_count}</span>}
                    {!isSystem && <span>posters: {c.posters_count}</span>}
                    {c.ip && <span>ip: {c.ip}</span>}
                    {c.property?.name ? <span>property: {String(c.property.name)}</span> : null}
                  </div>
                  {eventMsg && <p className="mt-1 text-[11px] text-indigo-300/80">{eventMsg}</p>}
                  {errMsg && <p className="mt-1 text-[11px] text-red-400/80">error: {errMsg}</p>}
                  {urls.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {urls.map((u, i) => (
                        <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-indigo-400 hover:text-indigo-300 font-mono truncate">{u}</a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
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
            <Radio className="w-3.5 h-3.5" /> Service
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <Link href="/admin" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/65 hover:text-white transition-colors hover:bg-ink ${PILL}`}>
            <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}

function SecurityPanel({ security }: { security: SecurityData }) {
  const protections = [
    { label: 'API key authentication', detail: 'Every call must carry the shared X-Api-Key.' },
    { label: 'Timestamp window (±5 min)', detail: 'Old/replayed requests are rejected.' },
    { label: 'Request HMAC-SHA256', detail: 'Body is signed — any tampering fails verification.' },
    { label: 'Signed responses', detail: 'We sign every reply so the Realtor can prove it came from us, unaltered.' },
  ];
  const hasBlocked = security.blocked > 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-ink p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <h2 className="text-sm font-semibold text-white">Security &amp; integrity</h2>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Every request is verified before we render. Forged, replayed, or tampered calls are rejected and logged below — no one can impersonate the Realtor or alter our signed responses.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {protections.map((p) => (
          <div key={p.label} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <Lock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-white">{p.label}</p>
              <p className="text-[11px] text-white/40">{p.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-3 ${hasBlocked ? 'border-rose-500/30 bg-rose-500/[0.04]' : 'border-emerald-500/20 bg-emerald-500/[0.03]'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasBlocked ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            <span className="text-xs font-medium text-white">
              {hasBlocked ? `${security.blocked} blocked attempt${security.blocked === 1 ? '' : 's'}` : 'No tampering detected'}
            </span>
          </div>
          {security.lastBlockedAt && (
            <span className="text-[11px] text-white/35">last: {new Date(security.lastBlockedAt).toLocaleString()}{security.lastBlockedIp ? ` · ${security.lastBlockedIp}` : ''}</span>
          )}
        </div>
        {hasBlocked && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(security.reasons).map(([code, n]) => (
              <span key={code} className="text-[11px] px-2 py-0.5 rounded-full border border-rose-500/30 text-rose-300 bg-rose-500/10">
                {REASON_LABEL[code] ?? code}: {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 bg-ink ${bad ? 'border-red-500/30' : good ? 'border-emerald-500/30' : 'border-white/10'}`}>
      <div className="text-white/40 text-xs">{label}</div>
      <div className={`text-2xl font-bold mt-1.5 ${bad ? 'text-red-400' : good ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
