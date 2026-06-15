'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Radio, CircleCheck, CircleX, Clock } from 'lucide-react';
import { DotsLoading } from '@/components/ui/loader';

interface CallRow {
  id: string; created_at: string; request_id: string | null; tenant_id: string | null;
  status: string; error_code: string | null; posters_count: number; images_count: number;
  logos_count: number; total_ms: number | null; property: Record<string, unknown> | null;
  response: Record<string, unknown> | null; ip: string | null;
}
interface ServiceData {
  enabled: boolean;
  stats: { total: number; completed: number; errors: number; today: number };
  calls: CallRow[];
}

const statusColor = (s: string) =>
  s === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : s === 'disabled' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-red-400 bg-red-500/10 border-red-500/30';

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
              return (
                <div key={c.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {c.status === 'completed' ? <CircleCheck className="w-4 h-4 text-emerald-400" /> : <CircleX className="w-4 h-4 text-red-400" />}
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
                    <span>imgs: {c.images_count}</span>
                    <span>logos: {c.logos_count}</span>
                    <span>posters: {c.posters_count}</span>
                    {c.ip && <span>ip: {c.ip}</span>}
                    {c.property?.name ? <span>property: {String(c.property.name)}</span> : null}
                  </div>
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
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 border-b border-white/10 bg-ink backdrop-blur">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Service
        </Link>
        <span className="text-xs text-white/40">Realtor integration</span>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${bad ? 'bg-red-500/10 border-red-500/30' : good ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-ink border-white/10'}`}>
      <div className="text-white/40 text-xs">{label}</div>
      <div className={`text-2xl font-bold mt-1.5 ${bad ? 'text-red-400' : good ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}
