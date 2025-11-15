create extension if not exists vector;

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id),
  filename text not null,
  mime_type text,
  size_bytes bigint,
  duration_sec numeric,
  text text,
  created_at timestamptz not null default now()
);

create table if not exists public.call_chunks (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  idx int not null,
  content text not null,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index if not exists call_chunks_call_id_idx on public.call_chunks(call_id);
