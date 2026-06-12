import { NextRequest, NextResponse } from 'next/server';
import { generatePoster } from '@/lib/ai/orchestrator';
import { createServerClient } from '@/lib/supabase/client';
import { guardAiRequest } from '@/lib/security/guard';
import type { PosterGenerationInput } from '@/types/poster';

export const maxDuration = 60; // seconds

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PosterGenerationInput;

    // Security guards: rate limit (per IP) + input validation + daily spend cap.
    const blocked = await guardAiRequest(req, body);
    if (blocked) {
      return NextResponse.json(
        { error: blocked.error },
        { status: blocked.status, headers: blocked.retryAfter ? { 'Retry-After': String(blocked.retryAfter) } : undefined }
      );
    }

    // Generate the poster
    const result = await generatePoster(body);

    // Persist the design and capture its row id (so the rendered image can be
    // attached after the client draws the canvas).
    result.posterId = await persistPoster(result, body.prompt);

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API/generate] Error:', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function persistPoster(
  result: Awaited<ReturnType<typeof generatePoster>>,
  prompt: string
): Promise<string | undefined> {
  try {
    const supabase = createServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('posters') as any)
      .insert({
        prompt,
        layout: result.layout as unknown as Record<string, unknown>,
        template_id: result.templateId ?? null,
      })
      .select('id')
      .single();
    if (error) { console.error('[API/generate] DB persist error:', error.message); return undefined; }
    return data?.id as string | undefined;
  } catch (err) {
    console.error('[API/generate] DB persist error:', err);
    return undefined;
  }
}
