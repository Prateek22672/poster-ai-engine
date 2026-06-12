# Real-estate templates — how to add your own (read me!)

This folder is the **only** place you touch to add/improve real-estate poster
layouts. No AI, no training run — a "template" is just a function that places
layers on a 1080×1350 canvas. Add one file, register it, done.

```
lib/templates/realestate/
  toolkit.ts          ← shared helpers (don't usually edit)
  content.ts          ← what text is available (RealEstateContent) + prompt parsing
  archetypes/         ← ONE FILE PER LAYOUT — add yours here
    cove.ts           (Left Column)
    overlay.ts        (Photo Overlay)
    topband.ts        (Top Band)
    centered.ts       (Centered)
  index.ts            ← REGISTRY — add your archetype to the ARCHETYPES list
  rag.ts              ← RAG knowledge (text descriptions of references)
  GUIDE.md            ← this file
```

## The coordinate system
- Canvas is **1080 wide × 1350 tall**. Origin (0,0) is **top-left**. x→right, y→down.
- Keep text **≥ 60px** from the edges. Only the background photo is full-bleed.

## The content you get (from the user's prompt)
`RealEstateContent` (see `content.ts`):
`projectName` (short, big name) · `developer` · `location` · `tagline` ·
`configLabel/configValue` (e.g. Residences / Studio, 1 & 2 BR) ·
`priceLabel/priceValue` (Starting From / AED 585K) ·
`detailLabel/detailValue` (Possession & Plan / Q1 2027 · 60/40) · `cta` · `brand`.

## The toolkit helpers (toolkit.ts)
- `photoBg(url)` → the background building photo (full-bleed). `url` is the
  Pexels photo now, OR the client's own photo when they send `heroImageUrl`.
- `scrim(x,y,w,h,fill,opacity,radius)` → a semi-transparent panel so text reads on a photo.
- `T({ text, x, y, fontSize, ... })` → a text layer (default Switzer, white, left).
- `R({ x, y, width, height, fill, cornerRadius, opacity, stroke })` → a shape/rect.
- `ctaPill(x,y,w,label,fill,textColor)` → a rounded button + centered label.
- `infoBlock(x,y,label,value,accent,labelColor,valueColor,w)` → accent line + label + value.
- `frame(layers, 'myid', style, palette)` → wraps your layers into a PosterLayout.

### ⭐ The two rules that prevent the "messy/overlap" look
1. **Auto-fit big text**: `const size = fitFontSize(text, maxWidth, base, min, maxLines, serif)`
   shrinks the font so the text never spills past `maxLines`.
2. **Flow with a Y cursor**: never hard-code the next element's `y`. Do:
   ```ts
   let y = 96;
   L.push(T({ text: c.projectName, x: LX, y, fontSize: size, /*serif*/ fontFamily:'Playfair Display' }));
   y += textHeight(c.projectName, size, TW, 0.98, true) + 24;  // advance by actual height
   L.push(T({ text: c.tagline, x: LX, y, ... }));               // now safely below
   ```
   `textHeight(text, fontSize, maxWidth, lineHeight, serif)` estimates the rendered height.

## Add a new archetype in 3 steps
1. Copy an existing file, e.g. `archetypes/cove.ts` → `archetypes/myname.ts`.
2. Build your layout with the helpers (use `fitFontSize` + a `y` cursor!), and
   export a `build` function + a friendly label:
   ```ts
   export const mynameLabel = 'My Layout';
   export function buildMyname(c: RealEstateContent, url?: string | null): PosterLayout {
     const L: Layer[] = [photoBg(url)];
     // ...place your layers...
     return frame(L, 'myname', 'luxury');
   }
   ```
3. Register it in `index.ts`:
   ```ts
   import { buildMyname, mynameLabel } from './archetypes/myname';
   export const ARCHETYPES = [
     ...,
     { id: 'myname', label: mynameLabel, build: buildMyname },
   ];
   ```
That's it — it automatically joins the rotation (every prompt shows 3 different
archetypes, and yours becomes one of them). Hot reload picks it up; refresh `/create`.

## Tips for a premium look (from the references)
- Serif (Playfair Display) for the project NAME; Switzer for everything else.
- Put text over a **scrim** or a **solid/glass panel** — never raw on a busy photo.
- One clear hierarchy: name (huge) → tagline → price (standout) → specs → CTA.
- Gold (#C8A85A / #D8B26A) or teal (#3E7CA8) accents; generous spacing = premium.
- Glassmorphism panel = `R({ ..., fill: 'rgba(255,255,255,0.08)', opacity: 1, cornerRadius: 16 })`.

## Coming next (easy upgrades you can ask for / try)
- **Smart selection**: in `index.ts`, instead of a hash, map `intent.style`/keywords
  to a specific archetype (e.g. minimal→minimal-white, luxury→cove).
- **Client photo as bg**: already supported — send `heroImageUrl` in the request and
  `photoBg(url)` uses it instead of Pexels.
