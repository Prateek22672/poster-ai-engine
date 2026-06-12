/**
 * Seeds design templates and verifies the full RAG pipeline end-to-end.
 * Run: PG_URL="postgresql://..." npx tsx scripts/seed-and-verify.ts
 *
 * Loads .env.local manually (this is a standalone script, not Next.js),
 * then exercises the REAL app code: seeder -> embedder (OpenAI) -> Supabase,
 * and retriever -> embedder -> search_design_templates RPC.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// ── Load .env.local into process.env BEFORE importing app modules ──
const envText = readFileSync(join(root, '.env.local'), 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const eq = t.indexOf('=');
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (!(k in process.env)) process.env[k] = v;
}

async function main() {
// Dynamic imports AFTER env is set (these modules read env at load time)
const { seedDesignTemplates } = await import('@/lib/rag/seeder');
const { searchDesignTemplates } = await import('@/lib/rag/retriever');

console.log('=== STEP 1: SEED ===');
const seedResult = await seedDesignTemplates();
console.log('Seed result:', JSON.stringify(seedResult));

// ── Optional DB-level verification via direct Postgres ─────────────
if (process.env.PG_URL) {
  console.log('\n=== STEP 2: DB VERIFY (embeddings) ===');
  const pg = (await import('pg')).default;
  const client = new pg.Client({
    connectionString: process.env.PG_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const stats = await client.query(
    `select
       count(*)::int                              as total_rows,
       count(embedding)::int                      as with_embedding,
       min(vector_dims(embedding))                as min_dims,
       max(vector_dims(embedding))                as max_dims,
       count(distinct industry)::int              as industries
     from public.design_templates`
  );
  const s = stats.rows[0];
  console.log(`  total rows        : ${s.total_rows}`);
  console.log(`  with embedding    : ${s.with_embedding}`);
  console.log(`  embedding dims    : ${s.min_dims === s.max_dims ? s.min_dims : `${s.min_dims}..${s.max_dims}`}  ${s.min_dims === 1536 && s.max_dims === 1536 ? '✓ (1536)' : '✗'}`);
  console.log(`  industries        : ${s.industries}`);
  const byIndustry = await client.query(
    `select industry, count(*)::int as n from public.design_templates group by industry order by industry`
  );
  for (const r of byIndustry.rows) console.log(`    - ${r.industry}: ${r.n}`);
  await client.end();
}

// ── RAG retrieval end-to-end (embedder -> RPC -> similarity) ───────
console.log('\n=== STEP 3: RAG RETRIEVAL (real query -> embedding -> vector search) ===');
const queries: Array<{ q: string; category: 'fitness' | 'sale' | 'event' }> = [
  { q: 'high energy gym workout promo, bold and aggressive', category: 'fitness' },
  { q: 'big weekend discount sale, 50% off everything', category: 'sale' },
  { q: 'elegant evening gala event invitation', category: 'event' },
];

for (const { q, category } of queries) {
  const results = await searchDesignTemplates(q, { category, limit: 3, threshold: 0.2 });
  console.log(`\n  Query: "${q}" [${category}]`);
  if (!results.length) {
    console.log('    ⚠ no matches');
    continue;
  }
  for (const r of results) {
    console.log(`    -> ${r.template_id.padEnd(12)} ${r.industry}/${r.style.padEnd(10)} sim=${r.similarity.toFixed(3)}`);
  }
}

console.log('\n=== PIPELINE CHECK COMPLETE ===');
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
