import { NextResponse } from 'next/server';

// USD → INR rate for the Insights/Admin currency toggle. Cached 6h, with a safe
// fallback if the free FX source is unreachable.
export const revalidate = 21600;

export async function GET() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR', { next: { revalidate: 21600 } });
    if (res.ok) {
      const j = await res.json();
      const rate = j?.rates?.INR;
      if (typeof rate === 'number' && rate > 0) return NextResponse.json({ rate, currency: 'INR', date: j.date });
    }
  } catch { /* fall through */ }
  return NextResponse.json({ rate: 83, currency: 'INR', fallback: true });
}
