-- HACKER-TALE Supabase schema
-- Run this in Supabase SQL Editor, then add server-side DB
-- connection values (host/port/database/user/password) to .env.

create extension if not exists pgcrypto;

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 32),
  class_name text not null check (class_name in ('Developer', 'Designer', 'Planner', 'Founder')),
  role_title text not null check (char_length(role_title) between 1 and 64),
  level integer not null default 5 check (level between 1 and 999),
  hp text not null default '92/92' check (char_length(hp) <= 16),
  status text not null default 'ONLINE' check (char_length(status) <= 32),
  intent text not null check (char_length(intent) between 1 and 256),
  skills text[] not null default '{}'::text[],
  interests text[] not null default '{}'::text[],
  bio text not null default '안녕하세요!' check (char_length(bio) between 1 and 256),
  resume_text text not null default '' check (char_length(resume_text) <= 20000),
  avatar_data_url text check (avatar_data_url is null or char_length(avatar_data_url) <= 500000),
  stats jsonb not null default '{}'::jsonb,
  preset_questions text[] not null default array['HOBBIES', 'FOOD', 'PROJECTS', 'WORK_STYLE'],
  is_public boolean not null default true,
  view_count integer not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cards add column if not exists skills text[] not null default '{}'::text[];
alter table public.cards add column if not exists interests text[] not null default '{}'::text[];
alter table public.cards add column if not exists bio text not null default '안녕하세요!';
alter table public.cards add column if not exists resume_text text not null default '';
alter table public.cards add column if not exists avatar_data_url text;

create table if not exists public.chat_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  question_type text not null default 'CUSTOM' check (char_length(question_type) <= 64),
  question text not null check (char_length(question) between 1 and 512),
  response text not null check (char_length(response) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists cards_created_at_idx on public.cards (created_at desc);
create index if not exists cards_public_created_at_idx on public.cards (created_at desc) where is_public = true;
create index if not exists chat_events_card_id_created_at_idx on public.chat_events (card_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
before update on public.cards
for each row
execute function public.set_updated_at();

create or replace function public.increment_card_view(card_uuid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cards
  set view_count = view_count + 1
  where id = card_uuid
    and is_public = true;
end;
$$;

alter table public.cards enable row level security;
alter table public.chat_events enable row level security;

drop policy if exists "Public cards are readable" on public.cards;
create policy "Public cards are readable"
on public.cards
for select
to anon, authenticated
using (is_public = true);

drop policy if exists "Anyone can create cards" on public.cards;
create policy "Anyone can create cards"
on public.cards
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can insert chat events" on public.chat_events;
create policy "Anyone can insert chat events"
on public.chat_events
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.cards
    where cards.id = chat_events.card_id
      and cards.is_public = true
  )
);

grant usage on schema public to anon, authenticated;
grant select, insert on public.cards to anon, authenticated;
grant insert on public.chat_events to anon, authenticated;
grant execute on function public.increment_card_view(uuid) to anon, authenticated;
