import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';
import { cached } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posters = await cached('gallery:list', 20, async () => {
      const supabase = createServerClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('posters') as any)
        .select('id, prompt, layout, cloudinary_url, template_id, created_at')
        .not('cloudinary_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(60);
      if (error) throw new Error(error.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((p: any) => ({
      id: p.id,
      prompt: p.prompt,
      cloudinary_url: p.cloudinary_url,
      category: p.layout?.category,
      style: p.layout?.style,
      width: p.layout?.dimensions?.width,
      height: p.layout?.dimensions?.height,
      fonts: Array.isArray(p.layout?.fonts) ? p.layout.fonts : [],
        created_at: p.created_at,
      }));
    });

    return NextResponse.json({ posters });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load gallery';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
