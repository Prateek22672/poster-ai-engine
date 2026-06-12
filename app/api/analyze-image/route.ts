import { NextRequest, NextResponse } from 'next/server';
import { analyzeReferenceImage } from '@/lib/ai/image-analyzer';
import { getClientIp, checkRateLimit, checkDailyBudget } from '@/lib/security/guard';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { base64Data, mimeType } = await req.json() as {
      base64Data: string;
      mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
    };

    if (!base64Data) {
      return NextResponse.json({ error: 'base64Data is required' }, { status: 400 });
    }
    if (base64Data.length > 8_000_000) {
      return NextResponse.json({ error: 'Image too large' }, { status: 400 });
    }

    // Security guards (vision is the most expensive call)
    const rl = checkRateLimit(getClientIp(req));
    if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    const budget = await checkDailyBudget();
    if (!budget.ok) return NextResponse.json({ error: 'Daily limit reached' }, { status: 429 });

    const analysis = await analyzeReferenceImage(base64Data, mimeType ?? 'image/jpeg');
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('[API/analyze-image] Error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
