-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- ─── Design Templates (RAG knowledge base) ───────────────────────
create table if not exists public.design_templates (
  id            uuid default gen_random_uuid() primary key,
  template_id   text unique not null,
  industry      text not null check (industry in ('fitness', 'sale', 'event', 'realestate', 'restaurant')),
  style         text not null,
  layout_type   text not null,
  metadata      jsonb not null default '{}',
  embedding     vector(1536),
  created_at    timestamptz default now()
);

-- Vector index.
-- NOTE: For small datasets (up to a few thousand rows) NO index is best —
-- pgvector does exact (sequential-scan) nearest-neighbor, which is correct and
-- sub-millisecond. An ivfflat index with lists=50 on a tiny table breaks recall
-- (queries probe 1 of 50 mostly-empty clusters and return nothing).
-- When design_templates grows large, add an HNSW index instead (no probe tuning,
-- great recall):
--   create index design_templates_embedding_idx
--     on public.design_templates using hnsw (embedding vector_cosine_ops);

-- ─── Posters ──────────────────────────────────────────────────────
create table if not exists public.posters (
  id              uuid default gen_random_uuid() primary key,
  user_session    text,
  prompt          text not null,
  layout          jsonb not null,
  cloudinary_url  text,
  template_id     text,
  created_at      timestamptz default now()
);

create index if not exists posters_user_session_idx
  on public.posters (user_session);

create index if not exists posters_created_at_idx
  on public.posters (created_at desc);

-- ─── Vector similarity search function ───────────────────────────
create or replace function public.search_design_templates(
  query_embedding vector(1536),
  match_threshold float default 0.6,
  match_count     int     default 5
)
returns table (
  id          uuid,
  template_id text,
  industry    text,
  style       text,
  layout_type text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    dt.id,
    dt.template_id,
    dt.industry,
    dt.style,
    dt.layout_type,
    dt.metadata,
    1 - (dt.embedding <=> query_embedding) as similarity
  from public.design_templates dt
  where dt.embedding is not null
    and 1 - (dt.embedding <=> query_embedding) > match_threshold
  order by dt.embedding <=> query_embedding
  limit match_count;
$$;

-- ─── Row Level Security ──────────────────────────────────────────
alter table public.design_templates enable row level security;
alter table public.posters enable row level security;

-- Allow reads on design_templates
create policy "Anyone can read design templates"
  on public.design_templates for select
  using (true);

-- Allow service role to insert templates
create policy "Service role can insert templates"
  on public.design_templates for insert
  with check (true);

-- Allow anyone to insert/read posters
create policy "Anyone can insert posters"
  on public.posters for insert
  with check (true);

create policy "Anyone can read posters"
  on public.posters for select
  using (true);

-- ─── Grants ──────────────────────────────────────────────────────
-- Supabase's SQL editor auto-grants these, but a direct Postgres connection
-- (e.g. running this migration via a pooler) does not — without them the
-- service_role hits "permission denied for table". The app uses service_role
-- for all DB access (see lib/supabase/client.ts createServerClient).
grant usage on schema public to service_role;
grant all on table public.design_templates to service_role;
grant all on table public.posters to service_role;
grant execute on all functions in schema public to service_role;
