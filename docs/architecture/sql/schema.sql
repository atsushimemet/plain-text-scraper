-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profiles table
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamp with time zone default now()
);

-- Pages table for storing scraped content
create table pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  description text,
  content text,
  content_char_count int generated always as (char_length(coalesce(content, ''))) stored,
  site_host text,
  fetched_at timestamptz,
  created_at timestamptz default now()
);

-- Jobs table for tracking scraping jobs
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  status text not null check (status in ('queued','running','succeeded','failed')),
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  page_id uuid references pages(id),
  created_at timestamptz default now()
);

-- Quotas table for rate limiting
create table quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_start timestamptz not null,
  count int not null default 0
);

-- Indexes
create index pages_user_created_idx on pages(user_id, created_at desc);
create index pages_fts_idx on pages using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,'')));
create index jobs_user_status_idx on jobs(user_id, status, created_at desc);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table pages enable row level security;
alter table jobs enable row level security;
alter table quotas enable row level security;

-- RLS Policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = user_id);

create policy "Users can view own pages" on pages
  for select using (auth.uid() = user_id);

create policy "Users can insert own pages" on pages
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pages" on pages
  for update using (auth.uid() = user_id);

create policy "Users can view own jobs" on jobs
  for select using (auth.uid() = user_id);

create policy "Users can insert own jobs" on jobs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own jobs" on jobs
  for update using (auth.uid() = user_id);

create policy "Users can view own quotas" on quotas
  for select using (auth.uid() = user_id);

create policy "Users can insert own quotas" on quotas
  for insert with check (auth.uid() = user_id);

create policy "Users can update own quotas" on quotas
  for update using (auth.uid() = user_id);

-- Function to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, plan)
  values (new.id, 'free');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();