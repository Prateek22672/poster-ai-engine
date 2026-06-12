// One-off migration runner + verifier for Supabase Postgres.
// Usage: PG_URL="postgresql://..." node scripts/run-migration.mjs
// Reads supabase/migrations/001_init.sql, applies it, then verifies state.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PG_URL = process.env.PG_URL;
if (!PG_URL) {
  console.error('ERROR: PG_URL env var not set');
  process.exit(1);
}

const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '001_init.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

// Make policy creation idempotent without editing the migration file:
// drop the 4 policies first (IF EXISTS = safe on a fresh DB too).
const dropPolicies = `
  drop policy if exists "Anyone can read design templates" on public.design_templates;
  drop policy if exists "Service role can insert templates" on public.design_templates;
  drop policy if exists "Anyone can insert posters" on public.posters;
  drop policy if exists "Anyone can read posters" on public.posters;
`;

const client = new pg.Client({
  connectionString: PG_URL,
  ssl: { rejectUnauthorized: false },
});

function row(label, value) {
  console.log(`  ${label.padEnd(28)} ${value}`);
}

try {
  await client.connect();
  console.log('Connected to Postgres.\n');

  // ── Apply migration ────────────────────────────────────────────
  console.log('Applying migration (drop-policies + 001_init.sql)...');
  try {
    await client.query(dropPolicies);
  } catch (e) {
    console.log('  (drop policies note:', e.message, ')');
  }
  await client.query(migrationSQL);
  console.log('Migration applied without error.\n');

  // ── Verify ─────────────────────────────────────────────────────
  console.log('=== VERIFICATION ===\n');

  console.log('1. pgvector extension:');
  const ext = await client.query(
    `select extname, extversion from pg_extension where extname = 'vector'`
  );
  if (ext.rows.length) row('vector', `v${ext.rows[0].extversion}  ✓`);
  else console.log('  MISSING ✗');

  console.log('\n2. Tables (public):');
  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_name in ('design_templates','posters')
     order by table_name`
  );
  for (const t of tables.rows) row(t.table_name, '✓');
  if (tables.rows.length !== 2) console.log('  EXPECTED 2 TABLES ✗');

  console.log('\n3. Embedding column type (must be vector(1536)):');
  const col = await client.query(
    `select a.attname, format_type(a.atttypid, a.atttypmod) as type
     from pg_attribute a join pg_class c on a.attrelid = c.oid
     where c.relname = 'design_templates' and a.attname = 'embedding'`
  );
  if (col.rows.length) {
    const ok = col.rows[0].type === 'vector(1536)';
    row('embedding', `${col.rows[0].type}  ${ok ? '✓ matches text-embedding-3-small' : '✗ MISMATCH'}`);
  } else console.log('  MISSING ✗');

  console.log('\n4. Indexes:');
  const idx = await client.query(
    `select indexname, tablename from pg_indexes
     where schemaname = 'public' and tablename in ('design_templates','posters')
     order by tablename, indexname`
  );
  for (const i of idx.rows) row(i.indexname, `on ${i.tablename}  ✓`);

  console.log('\n5. search_design_templates function:');
  const fn = await client.query(
    `select p.proname, pg_get_function_identity_arguments(p.oid) as args
     from pg_proc p join pg_namespace n on p.pronamespace = n.oid
     where n.nspname = 'public' and p.proname = 'search_design_templates'`
  );
  if (fn.rows.length) row(fn.rows[0].proname, `(${fn.rows[0].args})  ✓`);
  else console.log('  MISSING ✗');

  console.log('\n6. Row Level Security enabled:');
  const rls = await client.query(
    `select relname, relrowsecurity from pg_class
     where relname in ('design_templates','posters') order by relname`
  );
  for (const r of rls.rows) row(r.relname, r.relrowsecurity ? 'RLS ON ✓' : 'RLS OFF ✗');

  console.log('\n7. RLS policies:');
  const pol = await client.query(
    `select tablename, policyname, cmd from pg_policies
     where schemaname = 'public' and tablename in ('design_templates','posters')
     order by tablename, policyname`
  );
  for (const p of pol.rows) row(`${p.tablename}.${p.cmd}`, `"${p.policyname}"  ✓`);
  row('total policies', `${pol.rows.length} (expected 4)`);

  console.log('\n8. design_templates row count:');
  const cnt = await client.query(`select count(*)::int as n from public.design_templates`);
  row('rows', `${cnt.rows[0].n} (0 = ready to seed)`);

  console.log('\n=== DONE: database initialized successfully ===');
} catch (err) {
  console.error('\nFAILED:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
