import { NextRequest, NextResponse } from 'next/server';
import { generatePoster } from '@/lib/ai/orchestrator';
import { renderLayoutToPng } from '@/lib/rendering/server-render';
import { uploadPosterToCloudinary } from '@/lib/cloudinary/upload';
import { createServerClient } from '@/lib/supabase/client';
import { verifyServiceKey } from '@/lib/security/service-auth';
import { checkRateLimit, checkDailyBudget, validateGenerateInput } from '@/lib/security/guard';
import type { PosterGenerationInput } from '@/types/poster';

export const maxDuration = 60;

/**
 * Secure service endpoint for external backends (e.g. the client's PHP app).
 *   POST /api/v1/generate
 *   Authorization: Bearer <service_key>
 *   Body: { prompt, headline?, brandText?, category?, ctaText?, ... }
 *   Returns: { status, image_url, poster_id, archetype, cost_usd, width, height }
 *
 * The key never reaches a browser — this is a server-to-server call.
 */
export async function POST(req: NextRequest) {
  // 1) Authenticate the service key
  const key = await verifyServiceKey(req);
  if (!key.ok) {
    return NextResponse.json({ status: 'error', error: 'Invalid or missing API key' }, { status: 401 });
  }

  // 2) Parse + guard
  let body: PosterGenerationInput;
  try {
    body = (await req.json()) as PosterGenerationInput;
  } catch {
    return NextResponse.json({ status: 'error', error: 'Invalid JSON body' }, { status: 400 });
  }

  const rl = checkRateLimit(`svc:${key.keyId}`);
  if (!rl.ok) {
    return NextResponse.json(
      { status: 'error', error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }
  const valid = validateGenerateInput(body);
  if (!valid.ok) return NextResponse.json({ status: 'error', error: valid.error }, { status: 400 });

  const budget = await checkDailyBudget();
  if (!budget.ok) return NextResponse.json({ status: 'error', error: 'Daily limit reached' }, { status: 429 });

  // 3) Generate → server-render → store
  try {
    const result = await generatePoster(body);

    const png = await renderLayoutToPng(result.layout);
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    const uploaded = await uploadPosterToCloudinary(dataUrl, 'poster-ai/service');

    // Save the design + image (so it appears in gallery/admin) and capture the id.
    let posterId: string | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (createServerClient().from('posters') as any)
        .insert({
          prompt: body.prompt,
          layout: result.layout as unknown as Record<string, unknown>,
          template_id: result.templateId ?? null,
          cloudinary_url: uploaded.url,
          user_session: `service:${key.name ?? key.keyId}`,
        })
        .select('id')
        .single();
      posterId = data?.id as string | undefined;
    } catch (e) {
      console.error('[API/v1/generate] persist failed:', e);
    }

    return NextResponse.json({
      status: 'completed',
      image_url: uploaded.url,
      poster_id: posterId,
      archetype: result.layout.id.split('-')[1] ?? 'default',
      category: result.layout.category,
      width: uploaded.width,
      height: uploaded.height,
      cost_usd: result.usage?.totalCostUsd ?? 0,
    });
  } catch (err) {
    console.error('[API/v1/generate] Error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
