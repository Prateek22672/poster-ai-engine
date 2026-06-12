-- ─── API usage / cost log ────────────────────────────────────────
-- Records EVERY external API call the engine makes (OpenAI, Pexels, ...)
-- so the Insights page can show a full, explainable usage + cost history.
create table if not exists public.api_usage (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  provider      text not null,                 -- 'openai' | 'pexels' | 'cloudinary'
  kind          text not null,                 -- 'intent' | 'rag-embed' | 'layout' | 'vision' | 'image-search' | 'upload'
  model         text,                          -- model name (null for non-AI calls)
  input_tokens  int  default 0,
  output_tokens int  default 0,
  cost_usd      numeric(12,8) default 0,
  status        text default 'ok',             -- 'ok' | 'error'
  meta          jsonb default '{}'
);

create index if not exists api_usage_created_at_idx on public.api_usage (created_at desc);
create index if not exists api_usage_kind_idx       on public.api_usage (kind);
create index if not exists api_usage_provider_idx   on public.api_usage (provider);

alter table public.api_usage enable row level security;
grant all on table public.api_usage to service_role;
