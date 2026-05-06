-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Leads table
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  company text,
  position text,
  source text not null default 'manual' check (source in ('linkedin', 'instagram', 'manual', 'import')),
  status text not null default 'new' check (status in ('new', 'contacted', 'converted', 'lost')),
  tags text[] default '{}',
  notes text,
  linkedin_url text,
  instagram_handle text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS for leads
alter table public.leads enable row level security;

create policy "Users can view own leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Users can insert own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update own leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Users can delete own leads"
  on public.leads for delete
  using (auth.uid() = user_id);

-- AI messages table
create table public.ai_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lead_id uuid references public.leads(id) on delete cascade not null,
  type text not null check (type in ('connection', 'followup', 'pitch')),
  content text not null,
  created_at timestamptz default now() not null
);

-- RLS for ai_messages
alter table public.ai_messages enable row level security;

create policy "Users can view own messages"
  on public.ai_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on public.ai_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own messages"
  on public.ai_messages for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on leads
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
