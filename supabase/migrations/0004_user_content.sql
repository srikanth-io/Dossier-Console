-- User-owned content tables (platform spec §55): every row belongs to exactly
-- one account. user_id defaults to auth.uid() so a forged owner id can never
-- be inserted, and RLS restricts every operation to the owning user.
-- No seed data: each authenticated user starts with empty collections.
-- Idempotent: safe to replay.

-- ---------------------------------------------------------------------------
-- 0. updated_at touch helper
-- ---------------------------------------------------------------------------

create or replace function public.touch_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now ();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. documents - document-engine library entries (payload stored as JSONB)
-- ---------------------------------------------------------------------------

create table if not exists public.documents (
  id text primary key,
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'custom',
  status text not null default 'draft',
  version text not null default '1.0',
  author text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint documents_status_check check (status in ('draft', 'published', 'archived'))
);

create index if not exists documents_user_updated_idx
  on public.documents (user_id, updated_at desc);

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
  before update on public.documents
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 2. document_components - reusable saved element groups
-- ---------------------------------------------------------------------------

create table if not exists public.document_components (
  id text primary key,
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  name text not null,
  elements jsonb not null default '[]',
  created_at timestamptz not null default now ()
);

create index if not exists document_components_user_idx
  on public.document_components (user_id);

-- ---------------------------------------------------------------------------
-- 3. resume_files - generated or uploaded resume files
-- ---------------------------------------------------------------------------

create table if not exists public.resume_files (
  id text primary key,
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'TEX',
  size_label text not null default '',
  source text not null default '',
  file_url text,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index if not exists resume_files_user_updated_idx
  on public.resume_files (user_id, updated_at desc);

drop trigger if exists resume_files_touch_updated_at on public.resume_files;
create trigger resume_files_touch_updated_at
  before update on public.resume_files
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 4. projects + time_entries - project tracking and timesheets
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  ref text not null default '',
  name text not null,
  client text not null default '',
  description text not null default '',
  status text not null default 'planning',
  color text not null default '#6366f1',
  icon text not null default 'file',
  hours_logged numeric(8,2) not null default 0,
  estimated_hours numeric(8,2) not null default 0,
  tasks_total integer not null default 0,
  tasks_completed integer not null default 0,
  team_size integer not null default 1,
  start_date date,
  due_date date,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint projects_status_check check (status in (
    'active', 'completed', 'onHold', 'cancelled', 'planning'
  ))
);

create index if not exists projects_user_updated_idx
  on public.projects (user_id, updated_at desc);

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at ();

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  entry_date date not null default current_date,
  task text not null default '',
  description text not null default '',
  start_time text not null default '',
  end_time text not null default '',
  break_minutes integer not null default 0,
  hours numeric(5,2) not null default 0,
  status text not null default 'completed',
  priority text not null default 'medium',
  created_at timestamptz not null default now (),
  constraint time_entries_status_check check (status in (
    'completed', 'inProgress', 'blocked', 'cancelled'
  )),
  constraint time_entries_priority_check check (priority in ('high', 'medium', 'low'))
);

create index if not exists time_entries_project_idx
  on public.time_entries (project_id, entry_date desc);

-- ---------------------------------------------------------------------------
-- 5. notepad_pages - hierarchical page tree per workspace
-- ---------------------------------------------------------------------------

create table if not exists public.notepad_pages (
  id text primary key,
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  workspace_id text not null default 'personal',
  parent_id text references public.notepad_pages (id) on delete cascade,
  title text not null default 'Untitled',
  icon text not null default 'file',
  content text not null default '',
  favorite boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index if not exists notepad_pages_user_workspace_idx
  on public.notepad_pages (user_id, workspace_id);

drop trigger if exists notepad_pages_touch_updated_at on public.notepad_pages;
create trigger notepad_pages_touch_updated_at
  before update on public.notepad_pages
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 6. app_notifications - in-app notification feed
-- ---------------------------------------------------------------------------

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null default auth.uid () references auth.users (id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info',
  screen text,
  read boolean not null default false,
  created_at timestamptz not null default now (),
  constraint app_notifications_type_check check (type in (
    'info', 'success', 'warning', 'error'
  ))
);

create index if not exists app_notifications_user_created_idx
  on public.app_notifications (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 7. Row level security - users can only ever touch their own rows
-- ---------------------------------------------------------------------------

alter table public.documents enable row level security;
alter table public.document_components enable row level security;
alter table public.resume_files enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.notepad_pages enable row level security;
alter table public.app_notifications enable row level security;

do $$
declare
  tables text[] := array [
    'documents', 'document_components', 'resume_files',
    'projects', 'time_entries', 'notepad_pages', 'app_notifications'
  ];
  t text;
begin
  foreach t in array tables loop
    execute format ('drop policy if exists %I on public.%I;', t || '_own_select', t);
    execute format ('drop policy if exists %I on public.%I;', t || '_own_insert', t);
    execute format ('drop policy if exists %I on public.%I;', t || '_own_update', t);
    execute format ('drop policy if exists %I on public.%I;', t || '_own_delete', t);

    execute format (
      'create policy %I on public.%I for select to authenticated using (user_id = auth.uid ());',
      t || '_own_select', t
    );
    execute format (
      'create policy %I on public.%I for insert to authenticated with check (user_id = auth.uid ());',
      t || '_own_insert', t
    );
    execute format (
      'create policy %I on public.%I for update to authenticated using (user_id = auth.uid ()) with check (user_id = auth.uid ());',
      t || '_own_update', t
    );
    execute format (
      'create policy %I on public.%I for delete to authenticated using (user_id = auth.uid ());',
      t || '_own_delete', t
    );
  end loop;
end $$;

-- Grants follow the blanket pattern from 0002_public_grants.sql; RLS above is
-- what actually scopes access, so no extra grants are needed here.
