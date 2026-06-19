'use client';

import { useCurrency } from '@/lib/currency';

/**
 * A USD amount that converts to ₹ (and back) when clicked. All <Money> on the
 * page toggle together. Inherits font/colour from its parent (Tailwind preflight
 * sets `font`/`color: inherit` on buttons) so it drops into headings & tables.
 */
export function Money({ usd, decimals = 4, className = '' }: { usd: number; decimals?: number; className?: string }) {
  const { currency, rate, symbol, toggle } = useCurrency();
  const value = currency === 'USD' ? usd : usd * rate;
  const other = currency === 'USD' ? '₹ INR' : '$ USD';
  return (
    <button
      type="button"
      onClick={toggle}
      title={`Click to show in ${other}`}
      className={`tabular-nums cursor-pointer hover:opacity-75 transition ${className}`}
    >
      {symbol}{value.toFixed(decimals)}
    </button>
  );
}

/** A small standalone USD/INR switch chip for headers. */
export function CurrencyToggle({ className = '' }: { className?: string }) {
  const { currency, toggle } = useCurrency();
  return (
    <button
      type="button"
      onClick={toggle}
      title="Switch currency (USD / INR)"
      className={`flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white bg-ink border border-white/10 px-2.5 py-1.5 rounded-lg transition ${className}`}
    >
      <span className={currency === 'USD' ? 'text-emerald-400' : ''}>$</span>
      <span className="text-white/25">/</span>
      <span className={currency === 'INR' ? 'text-emerald-400' : ''}>₹</span>
    </button>
  );
}
