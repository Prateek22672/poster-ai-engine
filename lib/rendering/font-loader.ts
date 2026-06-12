import { buildGoogleFontsUrl, buildFontshareUrl } from '@/lib/design-system/typography';

const loadedFonts = new Set<string>();

function injectStylesheet(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`link[href="${url}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = () => resolve();
    link.onerror = () => resolve(); // never block rendering on a font CDN hiccup
    document.head.appendChild(link);
  });
}

/**
 * Load font families (Google Fonts + Fontshare) and wait until they're
 * available in the browser font engine — required before Konva canvas text
 * renders with the correct typeface.
 */
export async function loadFontsForCanvas(families: string[]): Promise<void> {
  const toLoad = families.filter((f) => f && !loadedFonts.has(f));
  if (!toLoad.length) return;

  // Inject the needed stylesheet(s) — Google and/or Fontshare
  const sheets = [buildGoogleFontsUrl(toLoad), buildFontshareUrl(toLoad)].filter(
    (u): u is string => !!u
  );
  await Promise.all(sheets.map(injectStylesheet));

  // Explicitly load each weight variant Konva may request
  const weights = [300, 400, 500, 600, 700, 800, 900];
  const loadPromises = toLoad.flatMap((family) =>
    weights.map((w) =>
      document.fonts.load(`${w} 48px "${family}"`).catch(() => undefined)
    )
  );
  await Promise.allSettled(loadPromises);
  try {
    await document.fonts.ready;
  } catch {
    /* noop */
  }

  toLoad.forEach((f) => loadedFonts.add(f));
}

/** Check if all fonts in a list are loaded */
export function areFontsLoaded(families: string[]): boolean {
  return families.every((f) => loadedFonts.has(f));
}

/** Reset cache (useful in dev/testing) */
export function resetFontCache(): void {
  loadedFonts.clear();
}
