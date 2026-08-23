-- Profiles: public app data for each auth user.
-- auth.users is managed by Supabase Auth; this table holds profile fields
-- the console reads/writes (name, username) with RLS enforced.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  username text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid () = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid () = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid () = id);

-- Keep updated_at fresh.
create or replace function public.touch_updated_at ()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now ();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at ();

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user ()
  returns trigger
  language plpgsql
  security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, username)
  values (
    new.id,
    coalesce (new.email, ''),
    coalesce (new.raw_user_meta_data ->> 'name', ''),
    coalesce (new.raw_user_meta_data ->> 'username', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user ();
