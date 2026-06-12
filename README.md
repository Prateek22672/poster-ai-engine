# PosterAI — AI-Powered Design Engine

> Generate professional marketing posters using structured design intelligence, not random image generation.
> Typography systems · Composition rules · Dynamic layouts · RAG-retrieved design templates

---

## What is this?

PosterAI is a production-grade MVP for an AI-powered poster design platform. Instead of generating random AI images, the system:

1. **Extracts intent** from your text prompt using Claude/OpenAI
2. **Searches** a RAG vector database of professional design templates
3. **Plans a layout** with structured JSON (positions, fonts, colors, layers)
4. **Renders** the poster using React-Konva — a controlled, editable canvas
5. **Exports** high-quality PNG/JPG at 2× resolution

The output looks like Canva/Adobe Express-quality marketing creatives — not AI slop.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 15 (App Router) + TypeScript |
| Canvas Rendering | React-Konva / Konva.js |
| AI (primary) | Anthropic Claude (claude-opus-4-5) |
| AI (fallback) | OpenAI (gpt-4o) |
| Embeddings | OpenAI text-embedding-3-small |
| Vector DB | Supabase pgvector |
| Storage | Cloudinary |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Deployment | Vercel |

---

## Quickstart

### 1. Clone and install

```bash
git clone <repo>
cd poster-ai
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# AI Provider — use "anthropic" (default) or "openai"
AI_PROVIDER=anthropic

# Anthropic (primary AI)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (embeddings + optional fallback AI)
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=xxx

# Seed protection (pick any random string)
SEED_SECRET=your-secret-here
```

### 3. Supabase setup

#### Enable pgvector extension

In Supabase SQL Editor, run:

```sql
create extension if not exists vector;
```

#### Run migration

```bash
# Apply the init migration via Supabase CLI
npx supabase db push

# OR manually paste the SQL:
# supabase/migrations/001_init.sql
```

This creates:
- `design_templates` table with `vector(1536)` embedding column
- `posters` table for saved generations
- `search_design_templates` RPC function for cosine similarity search
- Row-level security policies

### 4. Seed design templates

After the DB is set up, seed the built-in design templates:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer your-secret-here"
```

This embeds 8 built-in templates (fitness, sale, event) into the vector DB.
You only need to do this once.

### 5. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/create`.

---

## Usage

### Generate a poster

1. Go to `/create`
2. Write a prompt: *"Dark red fitness Instagram poster with aggressive bold typography and JOIN NOW CTA"*
3. Optionally select category, style, aspect ratio
4. Click **Generate Poster**
5. The editor opens with canvas + layer panel + variations

### Edit layers

- Click any layer in the canvas to select it
- Switch to the **Props** tab to edit text, color, position, size
- Toggle visibility/lock via the **Layers** panel

### Variations

The **Vars** tab shows 3 designs:
- **Primary** — AI-generated layout
- **Alternative Palette** — programmatic color swap
- **High Contrast** — high contrast variant

### Export

- **Download PNG/JPG** — exports at 2× resolution (2160×2700 for 4:5)
- **Save to Cloud** — uploads to Cloudinary, returns a URL

---

## Architecture

```
app/
├── api/
│   ├── generate/      # POST — full generation pipeline
│   ├── analyze-image/ # POST — reference image style analysis
│   ├── export/        # POST — upload to Cloudinary
│   └── seed/          # POST — seed RAG templates (protected)
├── create/            # Main creation page
├── gallery/           # Poster gallery
└── layout.tsx

components/
├── poster/
│   ├── PosterCanvasInner.tsx  # Konva Stage + renderers
│   ├── PosterCanvas.tsx       # Dynamic import wrapper (ssr: false)
│   ├── PosterEditor.tsx       # Full editor (canvas + panels)
│   ├── LayerPanel.tsx         # Layer management + property editor
│   ├── VariationsPanel.tsx    # Variation selector
│   └── ExportPanel.tsx        # Download + cloud upload
├── forms/
│   ├── PosterForm.tsx         # Generation input form
│   └── ReferenceUpload.tsx    # Reference image drag & drop
└── dashboard/
    ├── DashboardNav.tsx
    └── PosterCard.tsx

lib/
├── ai/
│   ├── orchestrator.ts        # Full pipeline coordinator
│   ├── intent-extractor.ts    # Prompt → ExtractedIntent
│   ├── layout-planner.ts      # Intent + RAG → PosterLayout JSON
│   └── image-analyzer.ts      # Reference image → style analysis
├── rag/
│   ├── embedder.ts            # OpenAI text-embedding-3-small
│   ├── retriever.ts           # Supabase vector search
│   └── seeder.ts              # Batch seed templates
├── rendering/
│   ├── engine.ts              # Layer → Konva props converters
│   └── font-loader.ts         # Dynamic Google Fonts for canvas
├── design-system/
│   ├── typography.ts          # Font catalog + pairing logic
│   ├── colors.ts              # Palette catalog + selection
│   ├── spacing.ts             # Spacing systems + poster dimensions
│   └── tokens.ts              # Design token sets per category/style
├── templates/
│   ├── fitness.ts
│   ├── sale.ts
│   ├── event.ts
│   └── index.ts               # All templates flat list
├── supabase/                  # Supabase client + types
└── cloudinary/                # Cloudinary upload utilities

types/
├── poster.ts                  # PosterLayout, Layer, GeneratedPoster, etc.
├── design.ts                  # Typography, colors, spacing types
└── rag.ts                     # Design template metadata, RAG types
```

---

## Generation Pipeline

```
User Prompt
  ↓
extractIntent()           # Claude: extract category, style, keywords
  ↓
searchDesignTemplates()   # pgvector cosine similarity search
  ↓
planLayout()              # Claude: generate structured PosterLayout JSON
  ↓
generateLayoutVariation() # programmatic palette swaps (×2)
  ↓
React-Konva render        # client-side canvas rendering
  ↓
Export (PNG/JPG @ 2×)
```

---

## Poster Types

| Category | Styles | Templates |
|----------|--------|-----------|
| Fitness | Aggressive, Minimal | Dark Red, Electric Blue |
| Sale | Hot Sale, Luxury | Vibrant, Gold/Dark |
| Event | Gala, Festival | Dark Elegant, Vibrant Neon |

---

## Adding New Templates

1. Create a template factory in `lib/templates/your-category.ts`:

```typescript
export const YOUR_TEMPLATE_METADATA: DesignTemplateMetadata[] = [
  {
    template_id: 'your_001',
    industry: 'your-industry',
    style: 'minimal',
    // ...
    embeddingText: 'Describe this template for RAG search...',
  }
];

export function createYourLayout(params): PosterLayout {
  // Return a PosterLayout with layers
}
```

2. Add to `lib/templates/index.ts`
3. Re-seed: `POST /api/seed`

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo in Vercel
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy

The `next.config.ts` sets `maxDuration: 60` for the generate route — ensure your Vercel plan supports it (Pro plan for 60s functions).

### Supabase + Cloudinary

Both are external services — no additional Vercel config needed beyond env vars.

---

## Known Limitations (MVP)

- Font rendering in Konva may differ slightly from browser text — expected
- The `VariationsPanel` mini-previews use CSS transform scale (not pixel-perfect)
- Gallery page is a placeholder — requires a `/api/gallery` route reading from Supabase `posters` table
- Seed must be run once manually after DB migration

---

## License

MIT
