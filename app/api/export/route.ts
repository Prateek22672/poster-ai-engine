import { NextRequest, NextResponse } from 'next/server';
import { uploadPosterToCloudinary } from '@/lib/cloudinary/upload';
import { createServerClient } from '@/lib/supabase/client';
import { cacheInvalidate } from '@/lib/cache';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { dataUrl, posterId } = await req.json() as {
      dataUrl: string;
      posterId?: string;
    };

    if (!dataUrl) {
      return NextResponse.json({ error: 'dataUrl is required' }, { status: 400 });
    }

    const result = await uploadPosterToCloudinary(
      dataUrl,
      'poster-ai/posters'
    );

    // Attach the rendered image URL back to the design row so it shows in the Gallery.
    if (posterId) {
      try {
        const supabase = createServerClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('posters') as any)
          .update({ cloudinary_url: result.url })
          .eq('id', posterId);
        cacheInvalidate('gallery'); // new image — refresh the gallery immediately
      } catch (e) {
        console.error('[API/export] row update failed:', e);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[API/export] Error:', err);
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
