import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import type { PosterLayout, PosterCategory, PosterStyle } from '@/types/poster';
import type { ExtractedIntent, RAGSearchResult } from '@/types/rag';
import type { PosterGenerationInput } from '@/types/poster';
import { formatTemplatesForAI } from '@/lib/rag/retriever';
import { selectTokenSet } from '@/lib/design-system/tokens';
import { getVariationPalettes } from '@/lib/design-system/colors';
import { track, type CallUsage } from '@/lib/ai/cost';
import type { PosterImage } from '@/lib/images/pexels';

// ─── Prompt building ──────────────────────────────────────────────

function buildPlannerSystemPrompt(hasImage: boolean): string {
  return `You are a senior graphic designer AI that produces premium, agency-quality marketing posters — the kind you'd see from a professional studio, NOT a generic template.

Your output is a STRUCTURED JSON layout rendered by a canvas engine.
Canvas size: 1080x1350 pixels. Origin (0,0) is top-left.

LAYER TYPES:
1. background: { type:"background", fillType:"solid"|"gradient"|"image", color?, gradient:{type,stops:[{color,stop}],angle?,centerX?,centerY?,radius?}, imageUrl?, overlay?:{color,opacity} }
2. text: { type:"text", role:"headline"|"subheadline"|"body"|"cta"|"label"|"price"|"date", text, fontFamily, fontSize, fontWeight, color, x, y, width, align, letterSpacing?, lineHeight?, uppercase?, shadowColor?, shadowBlur? }
3. shape: { type:"shape", shapeType:"rect"|"circle"|"line", x, y, width, height, fill?, fillType?, gradient?, stroke?, strokeWidth?, cornerRadius?, opacity?, rotation?, shadowColor?, shadowBlur? }
4. image: { type:"image", src, x, y, width, height, fit:"cover"|"contain", cornerRadius? }

Every layer needs: id (uuid-like string), type, name, x, y.

AVAILABLE FONTS (use ONLY these — pair ONE headline font with ONE body font):
Premium picks (prefer these for an upscale look):
- "Switzer": premium neutral sans — modern luxury headlines OR body, any category
- "Syne": distinctive display — fashion/restaurant/event headlines with character
- "Outfit": geometric premium sans — clean modern headlines or body
- "Oswald": tall condensed — strong real-estate/impact headlines (great uppercase)
- "Inter": ultra-legible sans — body text, labels, specs, contact lines
Classics:
- "Playfair Display": premium serif — luxury/real-estate/editorial headlines
- "Cormorant Garamond": elegant serif — fine dining, refined subhead/body
- "Bebas Neue": tall bold condensed caps — fitness/impact (headlines only, ALWAYS uppercase)
- "Montserrat": clean geometric sans — versatile body, labels
- "Space Grotesk": modern sans — tech/minimal
- "Poppins": friendly rounded sans — playful/restaurant casual
- "Orbitron" / "Fira Code": futuristic / monospace — tech accents, specs

═══════════════════════════════════════════════════════════
THE DESIGN GRAMMAR OF A PROFESSIONAL POSTER (follow this!)
═══════════════════════════════════════════════════════════
A premium poster is built from these zones, not a single centered line of text:

1. HERO IMAGE — a full-bleed or large photo anchors the design${hasImage ? ' (one IS provided — see HERO IMAGE section)' : ''}.
2. LEGIBILITY SCRIM — NEVER place text directly on a busy photo. Put a gradient
   scrim (semi-transparent dark rect/gradient, e.g. opacity 0.4-0.75) or a SOLID
   COLOR PANEL behind any text that sits over the image. This is the #1 rule.
3. BRAND MARK — a small logo or brand name, usually top-left or top-center.
   - If a LOGO image is provided: add an image layer with src:"{{LOGO}}" (EXACT placeholder),
     small (~width 160-280, keep it modest), near the top. Reserve clean space around it.
   - Else if a BRAND NAME is provided: render it as a small refined text layer at the top.
4. HEADLINE — the dominant element. Large (90-150px), confident. For luxury/real-estate/
   restaurant use a serif (Playfair/Cormorant). Consider a 2-tone headline (two text
   layers, different colors) like the reference posters. Can span 2 lines.
5. SUBHEAD / TAGLINE — supporting line under the headline (36-52px), often italic for elegance.
6. STRUCTURED DETAIL BLOCKS — organize specifics into tidy blocks, e.g.:
   • real-estate: a PRICE block (solid panel + "Price Start" label + big number),
     a feature list ("Why Choose Us" with • bullets), specs (beds·baths·sqft).
   • restaurant: an offer block, menu/feature bullets, hours.
   Use small filled rects/pills as panels behind label groups.
7. CTA — one unmistakable call-to-action: a filled rounded-rect "pill" (shape, cornerRadius
   ~12-30) with a short label text layer centered on top ("BOOK NOW", "ENQUIRE", "MORE INFO").
8. CONTACT — website / phone, small, near the bottom.
9. DECORATIVE ACCENTS (sparingly) — a thin rule/line, a small dot grid (several tiny
   circles), or a short divider — for polish. Don't overdo it.

LAYOUT & QUALITY RULES:
- Safe zone: keep text/elements ≥ 60px from edges (only the background photo is full-bleed).
- Align everything to an invisible grid — shared left edges, consistent gaps. No random placement.
- Strong hierarchy: ONE hero headline, 2-3 supporting groups, ONE CTA. Size contrast is key.
- Contrast: light text over dark scrim/areas, dark text over light panels. Verify every text layer
  has a legible background behind it.
- Max 2 font families (a headline + a body), max 4-5 distinct sizes.
- Generous spacing — premium feels uncrowded. Group related items close, separate groups with space.
- Use the provided palette colors. Tasteful: avoid neon-on-neon, cheesy rainbow gradients, drop-shadow overload.

AVOID (these make it look cheap/generic):
- A single headline + one subtitle centered on a plain background (this is the FAILURE case).
- Text floating directly on a photo with no scrim/panel.
- Everything centered with no structure, no CTA, no detail blocks.
- Tiny headline / weak hierarchy.
${hasImage ? `
═══════════════════════════════════════════════════════════
HERO IMAGE (provided)
═══════════════════════════════════════════════════════════
- A background photo IS available. Use it: add a background layer with
  fillType:"image" and imageUrl:"{{HERO_IMAGE}}" (use this EXACT placeholder string —
  it will be replaced with the real URL). Optionally add an "overlay" for a base tint.
- Then add a SEPARATE gradient/scrim shape (a rect with low opacity dark fill, or a
  linear-gradient shape) over the photo region where text will go — so text is readable.
- Compose the headline, blocks, and CTA OVER the photo using the scrim for contrast,
  OR reserve a solid color panel area (like the reference where the lower third is a color block).
` : ''}
PREMIUM TECHNIQUES (use when they fit — these separate pro from generic):
- GLASSMORPHISM PANELS: put feature/amenity strips and spec rows on semi-transparent
  rounded rectangles (shape rect, cornerRadius 16-28, opacity ~0.25-0.45, light or dark
  fill) so the photo shows through softly. Great for "info cards" and amenity strips.
- ATMOSPHERIC FEEL: for dusk/sunset photos, add a soft low-opacity dark/scrim rect over
  the top or bottom so text floats cleanly and the image feels cinematic and premium.
- BIG STANDOUT FIGURE: make the key number large (price "AED 1.47M", "₹12CR onwards",
  "10%" booking) — it is often the second-strongest element after the name.

REAL-ESTATE / PROPERTY POSTERS specifically follow this grammar (mirror the references):
- LOCATION TAG (e.g. "SECTOR 31", city/area) with a small pin, usually top.
- DEVELOPER/BRAND mark top (use the brand mark rules above).
- EYEBROW line, then the PROJECT NAME as a large elegant SERIF (Playfair Display).
- PRICE + CONFIG in a pill or split by a divider ("₹12CR onwards | 4000-4900 sqft",
  "Studio,1&2 BR", "Starting from AED 585K").
- HERO BUILDING photo (tower/villa), typically rising from the bottom or one side.
- A GLASS FEATURE STRIP: 3-4 small icon+label amenity columns separated by thin dividers,
  OR stacked glass info cards (BHK / price / booking %).
- For villas: a dark GLASS lower panel with specs (sqft, beds, price) + a KEY FEATURES row.
- CTA pill ("Enquire today", "Book Now", "Talk to an Expert") + contact (phone/website).
- Optionally a small compliance line (RERA no.) — keep it tiny, a corner.

RETURN only a valid JSON object for PosterLayout:
{
  "id": string,
  "version": "1.0",
  "dimensions": {"width":1080,"height":1350},
  "category": "fitness"|"sale"|"event"|"realestate"|"restaurant",
  "style": string,
  "palette": string[],
  "fonts": string[],
  "layers": Layer[]   // ordered back-to-front: background, scrim, panels, then text/CTA on top
}

CRITICAL: Return ONLY the JSON object. No markdown. No explanation. No code fences. Aim for 9-16 layers — a rich, structured, professional composition.`;
}

function buildPlannerUserPrompt(
  intent: ExtractedIntent,
  templates: RAGSearchResult[],
  input: PosterGenerationInput,
  heroImage?: PosterImage | null
): string {
  const tokens = selectTokenSet(intent.category, intent.style);
  const p = tokens.palette;

  const parts = [
    `=== USER REQUEST ===`,
    `Prompt: "${input.prompt}"`,
    `Category: ${intent.category}`,
    `Style: ${intent.style}`,
    `Tone: ${intent.tone}`,
    `Color preference: ${intent.colorPreference}`,
    ``,
    `=== TEXT CONTENT ===`,
    `Headline: "${intent.primaryText}"`,
    `Subheadline: "${intent.secondaryText}"`,
    `CTA: "${intent.ctaText}"`,
    `Target audience: ${intent.targetAudience}`,
    ``,
    `=== DESIGN DIRECTION ===`,
    `Suggested fonts: ${intent.suggestedFonts.join(', ')}`,
    `Suggested colors: ${intent.suggestedColors.join(', ')}`,
    `Keywords: ${intent.keywords.join(', ')}`,
    ``,
    `=== RETRIEVED DESIGN TEMPLATES (use as inspiration) ===`,
    formatTemplatesForAI(templates),
    ``,
    `=== RECOMMENDED TOKEN SET ===`,
    `Typography pair: ${tokens.typography.headline.family} (headlines) + ${tokens.typography.body.family} (body)`,
    `Palette — use these hex values:`,
    `  background: ${p.background}  surface/panel: ${p.surface}`,
    `  primary: ${p.primary}  secondary: ${p.secondary}  accent: ${p.accent}`,
    `  text: ${p.text}  text-muted: ${p.textMuted}`,
    `  CTA: bg ${p.ctaBackground} / text ${p.ctaText}`,
    `Composition rules for this style:`,
    tokens.compositionRules.map((r) => `- ${r}`).join('\n'),
    ``,
    heroImage
      ? [
          `=== HERO IMAGE (use it as the photo background) ===`,
          `A real photo has been fetched for this poster.`,
          `Dominant color of the photo: ${heroImage.avgColor} (factor this into scrim/contrast).`,
          `Set a background layer: fillType:"image", imageUrl:"{{HERO_IMAGE}}" (EXACT placeholder).`,
          `Add a scrim (low-opacity dark rect or gradient) and/or a solid color panel so all text is legible.`,
          ``,
        ].join('\n')
      : `=== NO PHOTO ===\nNo hero image. Build a striking layout with a gradient/solid background, color panels, shapes, and strong typography.`,
    ``,
    `=== BRANDING ===`,
    input.logoDataUrl
      ? `A LOGO image is provided. Add an image layer with src:"{{LOGO}}" (EXACT placeholder), small (~width 200), near the top as the brand mark.`
      : input.brandText
        ? `Brand name: "${input.brandText}". Render it as a small refined brand text layer at the top (top-left or top-center).`
        : `No brand provided — you may omit the brand mark or use a subtle generic placement.`,
    ``,
    `Now produce the complete 1080x1350 poster as ONE JSON object. Make it look like a senior designer made it:`,
    `a real hierarchy, structured detail blocks, a clear CTA pill, tasteful accents — NOT a single centered headline.`,
  ];

  return parts.join('\n');
}

// ─── AI callers ───────────────────────────────────────────────────

async function callAnthropic(system: string, user: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4096,
    system,
    messages: [{ role: 'user', content: user }],
  });
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

async function callOpenAI(system: string, user: string, usage?: CallUsage[]): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  track(usage, 'layout', 'gpt-4o', response.usage?.prompt_tokens ?? 0, response.usage?.completion_tokens ?? 0);
  return response.choices[0].message.content ?? '{}';
}

// ─── JSON parsing ─────────────────────────────────────────────────

function parseLayoutJSON(raw: string): PosterLayout {
  // Strip markdown fences if any
  const clean = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(clean);

  // Ensure every layer has an id
  if (Array.isArray(parsed.layers)) {
    parsed.layers = parsed.layers.map((l: PosterLayout['layers'][0]) => ({
      ...l,
      id: (l as { id?: string }).id || uuidv4(),
    }));
  }

  return parsed as PosterLayout;
}

// ─── Safety net: never let an opaque panel hide the hero photo ────
// The LLM occasionally emits a near-full-bleed scrim at opacity ~1, which
// would completely cover the background photo. Clamp those to a readable scrim.
function protectHeroImage(layout: PosterLayout): PosterLayout {
  const W = layout.dimensions?.width ?? 1080;
  const H = layout.dimensions?.height ?? 1350;
  const area = W * H;
  let sawImageBg = false;

  for (const layer of layout.layers) {
    if (layer.type === 'background') {
      if ((layer as BackgroundLayerLike).fillType === 'image') sawImageBg = true;
      continue;
    }
    if (!sawImageBg) continue; // only touch layers ABOVE the photo
    if (layer.type !== 'shape') continue;

    const s = layer as { width?: number; height?: number; opacity?: number };
    const w = s.width ?? 0;
    const h = s.height ?? 0;
    const op = s.opacity ?? 1;
    // Near-full-cover + high opacity = it's hiding the photo. Make it a scrim.
    if (w * h >= area * 0.85 && op >= 0.85) {
      s.opacity = 0.55;
    }
  }
  return layout;
}

type BackgroundLayerLike = { fillType?: string };

// ─── Variation generator ──────────────────────────────────────────

export function generateLayoutVariation(
  base: PosterLayout,
  variationIndex: 1 | 2
): PosterLayout {
  const [altPalette1, altPalette2] = getVariationPalettes(
    base.palette[0] ?? '',
    base.category
  );
  const palette = variationIndex === 1 ? altPalette1 : altPalette2;

  const colorMap: Record<string, string> = {
    [base.palette[0]]: palette.background,
    [base.palette[1]]: palette.primary,
    [base.palette[2] ?? '#FFFFFF']: palette.text,
  };

  // Deep clone and remap colors
  const clone: PosterLayout = JSON.parse(JSON.stringify(base));
  clone.id = uuidv4();
  clone.palette = [palette.background, palette.primary, palette.text, palette.accent];

  clone.layers = clone.layers.map((layer) => {
    const l = { ...layer };
    // Remap known color fields
    const remap = (c?: string) => (c && colorMap[c] ? colorMap[c] : c);

    if (l.type === 'background') {
      const bg = l as import('@/types/poster').BackgroundLayer;
      if (bg.color) bg.color = remap(bg.color) ?? bg.color;
    } else if (l.type === 'text') {
      const tx = l as import('@/types/poster').TextLayer;
      tx.color = remap(tx.color) ?? tx.color;
    } else if (l.type === 'shape') {
      const sh = l as import('@/types/poster').ShapeLayer;
      if (sh.fill) sh.fill = remap(sh.fill) ?? sh.fill;
    }
    return l;
  });

  return clone;
}

// ─── Main planner ─────────────────────────────────────────────────

export async function planLayout(
  intent: ExtractedIntent,
  templates: RAGSearchResult[],
  input: PosterGenerationInput,
  heroImage?: PosterImage | null,
  usage?: CallUsage[]
): Promise<PosterLayout> {
  const system = buildPlannerSystemPrompt(!!heroImage);
  const user = buildPlannerUserPrompt(intent, templates, input, heroImage);
  const provider = process.env.AI_PROVIDER ?? 'anthropic';

  try {
    let raw = provider === 'openai'
      ? await callOpenAI(system, user, usage)
      : await callAnthropic(system, user);

    // Replace placeholders with real values via string swap so the model
    // never has to echo a long URL / data URL.
    if (heroImage) {
      raw = raw.split('{{HERO_IMAGE}}').join(heroImage.url);
    }
    if (input.logoDataUrl) {
      raw = raw.split('{{LOGO}}').join(input.logoDataUrl);
    }

    let layout = parseLayoutJSON(raw);
    if (heroImage) layout = protectHeroImage(layout);
    return layout;
  } catch (err) {
    console.error('[LayoutPlanner] Generation failed:', err);
    throw new Error(`Layout planning failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
