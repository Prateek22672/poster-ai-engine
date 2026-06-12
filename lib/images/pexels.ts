import type { PosterCategory } from '@/types/poster';

const PEXELS_SEARCH = 'https://api.pexels.com/v1/search';

export interface PosterImage {
  /** CORS-safe, optimized URL (Cloudinary-proxied) — safe for canvas + export */
  url: string;
  /** Original Pexels image URL */
  rawUrl: string;
  width: number;
  height: number;
  /** Dominant color of the photo — useful for scrim/contrast decisions */
  avgColor: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
}

interface PexelsPhoto {
  width: number;
  height: number;
  avg_color: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: { original: string; large2x: string; large: string; portrait: string };
}

/**
 * Build a strong stock-photo search query from poster intent.
 * Category drives the base subject; keywords refine it.
 */
export function buildImageQuery(
  category: PosterCategory,
  keywords: string[] = [],
  explicit?: string
): string {
  if (explicit && explicit.trim()) return explicit.trim();

  const base: Record<PosterCategory, string> = {
    realestate: 'luxury modern building architecture exterior dusk twilight',
    restaurant: 'gourmet plated food fine dining',
    fitness: 'fitness gym workout training',
    sale: 'modern retail product shopping',
    event: 'elegant event venue celebration',
  };

  // Pick 1-2 of the most visual keywords to refine (skip abstract ones)
  const skip = new Set(['modern', 'professional', 'minimal', 'clean', 'premium', 'bold']);
  const refine = keywords.filter((k) => !skip.has(k.toLowerCase())).slice(0, 2);
  return [base[category], ...refine].join(' ').trim();
}

/**
 * Wrap a remote image URL in a Cloudinary fetch transformation so it is:
 *  - CORS-enabled (required for Konva canvas export / toDataURL)
 *  - optimized (auto format + quality, sized for poster use)
 */
function cloudinaryProxy(remoteUrl: string): string {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return remoteUrl; // fallback: direct (may taint canvas)
  const transform = 'f_auto,q_auto,w_1280,c_limit';
  return `https://res.cloudinary.com/${cloud}/image/fetch/${transform}/${encodeURIComponent(remoteUrl)}`;
}

/**
 * Search Pexels for the best poster background photo for a query.
 * Returns null on failure (caller should degrade to a non-image layout).
 */
export async function searchPosterImage(
  query: string,
  orientation: 'portrait' | 'landscape' | 'square' = 'portrait'
): Promise<PosterImage | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.warn('[Pexels] PEXELS_API_KEY not set — skipping image fetch');
    return null;
  }

  try {
    const url = `${PEXELS_SEARCH}?query=${encodeURIComponent(query)}&per_page=10&orientation=${orientation}`;
    const res = await fetch(url, { headers: { Authorization: apiKey } });
    if (!res.ok) {
      console.error('[Pexels] search failed:', res.status, await res.text().catch(() => ''));
      return null;
    }
    const data = (await res.json()) as { photos: PexelsPhoto[] };
    if (!data.photos?.length) {
      console.warn('[Pexels] no photos for query:', query);
      return null;
    }

    // Prefer a high-resolution photo with a usable aspect ratio
    const photo = data.photos[0];
    const rawUrl = photo.src.original;

    return {
      url: cloudinaryProxy(rawUrl),
      rawUrl,
      width: photo.width,
      height: photo.height,
      avgColor: photo.avg_color || '#222222',
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      alt: photo.alt || query,
    };
  } catch (err) {
    console.error('[Pexels] error:', err instanceof Error ? err.message : err);
    return null;
  }
}
