-- Fix documents RLS: insert/update/delete policies were missing the owner
-- check that the select policy already had.  Also fix select policy to use
-- p.user_id = auth.uid() instead of the broken is_workspace_member(p.user_id)
-- check (that was checking if user is a member of a workspace whose UUID
-- equals the project owner's user UUID, which doesn't make sense).

-- ---------------------------------------------------------------------------
-- documents: rewrite all project-scoped policies
-- ---------------------------------------------------------------------------

drop policy if exists documents_project_select on public.documents;
create policy documents_project_select
  on public.documents for select to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = documents.project_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists documents_project_insert on public.documents;
create policy documents_project_insert
  on public.documents for insert to authenticated
  with check (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = documents.project_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists documents_project_update on public.documents;
create policy documents_project_update
  on public.documents for update to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = documents.project_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists documents_project_delete on public.documents;
create policy documents_project_delete
  on public.documents for delete to authenticated
  using (
    project_id is null
    or exists (
      select 1 from public.projects p
      where p.id = documents.project_id
        and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.projects p
      join public.memberships m on m.workspace_id = p.id
      where p.id = documents.project_id
        and m.user_id = auth.uid()
    )
  );
