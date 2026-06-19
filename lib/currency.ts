'use client';

import { useEffect, useSyncExternalStore } from 'react';

/**
 * Tiny shared currency store (no provider needed). Every <Money> on the page
 * shares one selected currency + live USD→INR rate, so clicking any value
 * converts them all together. Persisted to localStorage.
 */
type Cur = 'USD' | 'INR';
export const SYMBOL: Record<Cur, string> = { USD: '$', INR: '₹' };

let currency: Cur = 'USD';
let rate = 83; // INR per USD (updated from /api/fx)
let snapshot: { currency: Cur; rate: number } = { currency, rate };
const subs = new Set<() => void>();

function commit() { snapshot = { currency, rate }; subs.forEach((f) => f()); }
function subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }
function getSnapshot() { return snapshot; }

export function setCurrency(c: Cur) { if (c === currency) return; currency = c; try { localStorage.setItem('pa_cur', c); } catch { /* ignore */ } commit(); }
export function toggleCurrency() { setCurrency(currency === 'USD' ? 'INR' : 'USD'); }
export function setRate(r: number) { if (!r || r === rate) return; rate = r; commit(); }

let inited = false;
export function useCurrency() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  useEffect(() => {
    if (inited) return; inited = true;
    try { const saved = localStorage.getItem('pa_cur') as Cur | null; if (saved === 'INR' || saved === 'USD') setCurrency(saved); } catch { /* ignore */ }
    fetch('/api/fx').then((r) => r.json()).then((j) => { if (typeof j.rate === 'number') setRate(j.rate); }).catch(() => {});
  }, []);
  return { currency: s.currency, rate: s.rate, symbol: SYMBOL[s.currency], toggle: toggleCurrency, set: setCurrency };
}
