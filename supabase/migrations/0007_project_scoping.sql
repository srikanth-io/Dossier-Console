-- Add project_id to documents and notepad_pages for per-project scoping.
-- Idempotent: safe to replay.

-- ---------------------------------------------------------------------------
-- 1. documents: add project_id FK
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'documents' and column_name = 'project_id'
  ) then
    alter table public.documents
      add column project_id uuid references public.projects (id) on delete cascade;

    create index if not exists documents_project_idx
      on public.documents (project_id, updated_at desc);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. notepad_pages: add project_id FK, migrate workspace_id data
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'notepad_pages' and column_name = 'project_id'
  ) then
    alter table public.notepad_pages
      add column project_id uuid references public.projects (id) on delete cascade;

    create index if not exists notepad_pages_project_idx
      on public.notepad_pages (project_id, created_at);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. Update RLS policies for documents (project-scoped)
-- ---------------------------------------------------------------------------

-- Drop old user-scoped policies
drop policy if exists documents_own_select on public.documents;
drop policy if exists documents_own_insert on public.documents;
drop policy if exists documents_own_update on public.documents;
drop policy if exists documents_own_delete on public.documents;

-- New policies: access via project → engagements → workspace → membership
create policy documents_project_select
  on public.documents for select to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = documents.project_id
        and public.is_workspace_member(p.user_id::uuid)
    )
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

create policy documents_project_insert
  on public.documents for insert to authenticated
  with check (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

create policy documents_project_update
  on public.documents for update to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

create policy documents_project_delete
  on public.documents for delete to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Update RLS policies for notepad_pages (project-scoped)
-- ---------------------------------------------------------------------------

drop policy if exists notepad_pages_own_select on public.notepad_pages;
drop policy if exists notepad_pages_own_insert on public.notepad_pages;
drop policy if exists notepad_pages_own_update on public.notepad_pages;
drop policy if exists notepad_pages_own_delete on public.notepad_pages;

create policy notepad_pages_project_select
  on public.notepad_pages for select to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = notepad_pages.project_id
        and m.user_id = auth.uid()
    )
  );

create policy notepad_pages_project_insert
  on public.notepad_pages for insert to authenticated
  with check (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = notepad_pages.project_id
        and m.user_id = auth.uid()
    )
  );

create policy notepad_pages_project_update
  on public.notepad_pages for update to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = notepad_pages.project_id
        and m.user_id = auth.uid()
    )
  );

create policy notepad_pages_project_delete
  on public.notepad_pages for delete to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = notepad_pages.project_id
        and m.user_id = auth.uid()
    )
  );
