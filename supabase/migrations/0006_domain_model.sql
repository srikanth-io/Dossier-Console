-- Domain model tables for the pentest / security-assessment platform.
-- Mirrors src/domain/model.ts.  Follows the same patterns as 0004_user_content.sql:
--   * user_id defaults to auth.uid()
--   * RLS restricts every operation to workspace membership
--   * touch_updated_at triggers on mutable tables
--   * Idempotent (create table if not exists)

-- ---------------------------------------------------------------------------
-- 1. workspaces
-- ---------------------------------------------------------------------------

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text not null unique,
  retention_policy_days integer not null default 365,
  data_region text not null default 'us-east-1',
  created_at timestamptz not null default now ()
);

-- ---------------------------------------------------------------------------
-- 2. memberships (links users ↔ workspaces)
-- ---------------------------------------------------------------------------

create table if not exists public.memberships (
  user_id uuid not null references auth.users (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  access text not null default 'viewer',
  created_at timestamptz not null default now (),
  primary key (user_id, workspace_id),
  constraint memberships_access_check check (access in ('owner', 'editable', 'viewer'))
);

create index if not exists memberships_workspace_idx
  on public.memberships (workspace_id);

-- ---------------------------------------------------------------------------
-- Helpers: workspace membership checks
-- ---------------------------------------------------------------------------

create or replace function public.user_workspace_id (p_user uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.workspace_id
  from public.memberships m
  where m.user_id = p_user
  limit 1;
$$;

create or replace function public.is_workspace_member (p_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = auth.uid ()
      and workspace_id = p_workspace
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. clients (per-workspace)
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid (),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  code text not null default '',
  logo_asset_id text,
  confidentiality_default text not null default 'confidential',
  created_at timestamptz not null default now (),
  constraint clients_confidentiality_check check (confidentiality_default in (
    'internal', 'confidential', 'restricted'
  ))
);

create index if not exists clients_workspace_idx
  on public.clients (workspace_id);

-- ---------------------------------------------------------------------------
-- 4. engagements
-- ---------------------------------------------------------------------------

create table if not exists public.engagements (
  id uuid primary key default gen_random_uuid (),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  short_code text not null default '',
  type text not null default 'webapp',
  methodology text not null default 'owasp_wstg',
  scope_text text not null default '',
  start_date date not null default current_date,
  end_date date,
  status text not null default 'scoping',
  roe_reference text,
  classification text not null default 'confidential',
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint engagements_type_check check (type in (
    'webapp', 'api', 'network', 'mobile', 'cloud', 'physical', 'social'
  )),
  constraint engagements_methodology_check check (methodology in (
    'ptes', 'osstmm', 'owasp_wstg', 'nist_800_115', 'custom'
  )),
  constraint engagements_status_check check (status in (
    'scoping', 'testing', 'reporting', 'in_review', 'delivered', 'retest', 'closed'
  )),
  constraint engagements_classification_check check (classification in (
    'internal', 'confidential', 'restricted'
  ))
);

create index if not exists engagements_workspace_idx
  on public.engagements (workspace_id, status);

create index if not exists engagements_client_idx
  on public.engagements (client_id);

drop trigger if exists engagements_touch_updated_at on public.engagements;
create trigger engagements_touch_updated_at
  before update on public.engagements
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 5. findings
-- ---------------------------------------------------------------------------

create table if not exists public.findings (
  id uuid primary key default gen_random_uuid (),
  display_id text not null default '',
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  title text not null,
  cvss_version text not null default '3.1',
  cvss_vector text not null default '',
  cvss_base_score numeric(3,1) not null default 0,
  severity text not null default 'info',
  severity_override text,
  severity_override_reason text,
  cwe_ids text[] not null default '{}',
  owasp_categories text[] not null default '{}',
  cve_ids text[],
  methodology_phase text,
  description text not null default '',
  impact text not null default '',
  remediation text not null default '',
  references_list text[] not null default '{}',
  status text not null default 'draft',
  retest_status text,
  retest_date date,
  retested_by text,
  author_id uuid references auth.users (id) on delete set null,
  approver_id uuid references auth.users (id) on delete set null,
  source_finding_template_id uuid,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint findings_severity_check check (severity in (
    'none', 'info', 'low', 'medium', 'high', 'critical'
  )),
  constraint findings_status_check check (status in (
    'draft', 'in_review', 'changes_requested', 'approved',
    'remediated', 'risk_accepted', 'false_positive'
  )),
  constraint findings_retest_status_check check (retest_status is null or retest_status in (
    'not_retested', 'pass', 'fail', 'partial'
  ))
);

create index if not exists findings_engagement_idx
  on public.findings (engagement_id, status);

create index if not exists findings_severity_idx
  on public.findings (severity);

drop trigger if exists findings_touch_updated_at on public.findings;
create trigger findings_touch_updated_at
  before update on public.findings
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 6. affected_assets
-- ---------------------------------------------------------------------------

create table if not exists public.affected_assets (
  id uuid primary key default gen_random_uuid (),
  finding_id uuid not null references public.findings (id) on delete cascade,
  asset_type text not null default 'host',
  identifier text not null,
  environment text not null default 'prod',
  notes text,
  created_at timestamptz not null default now (),
  constraint affected_assets_type_check check (asset_type in (
    'host', 'url', 'endpoint', 'parameter', 'repo', 'mobile_package'
  )),
  constraint affected_assets_env_check check (environment in (
    'prod', 'uat', 'dev', 'staging'
  ))
);

create index if not exists affected_assets_finding_idx
  on public.affected_assets (finding_id);

-- ---------------------------------------------------------------------------
-- 7. evidence
-- ---------------------------------------------------------------------------

create table if not exists public.evidence (
  id uuid primary key default gen_random_uuid (),
  finding_id uuid not null references public.findings (id) on delete cascade,
  kind text not null default 'text',
  storage_ref text not null default '',
  caption text,
  redaction_state text not null default 'unredacted',
  redaction_map_ref text,
  sha256 text not null default '',
  captured_at timestamptz not null default now (),
  order_index integer not null default 0,
  constraint evidence_kind_check check (kind in (
    'image', 'text', 'http_exchange', 'file'
  )),
  constraint evidence_redaction_check check (redaction_state in (
    'unredacted', 'redacted', 'not_required'
  ))
);

create index if not exists evidence_finding_idx
  on public.evidence (finding_id, order_index);

-- ---------------------------------------------------------------------------
-- 8. review_events (append-only audit trail for finding reviews)
-- ---------------------------------------------------------------------------

create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid (),
  finding_id uuid not null references public.findings (id) on delete cascade,
  actor_id uuid not null references auth.users (id) on delete set null,
  action text not null,
  comment text,
  created_at timestamptz not null default now (),
  finding_snapshot_hash text not null default '',
  constraint review_events_action_check check (action in (
    'submitted', 'commented', 'changes_requested', 'approved', 'revoked'
  ))
);

-- Make review_events append-only (no update/delete)
create or replace function public.block_review_event_modification ()
returns trigger
language plpgsql
as $$
begin
  raise exception 'review_events are append-only';
end;
$$;

drop trigger if exists review_events_no_update on public.review_events;
create trigger review_events_no_update
  before update on public.review_events
  for each row execute function public.block_review_event_modification ();

drop trigger if exists review_events_no_delete on public.review_events;
create trigger review_events_no_delete
  before delete on public.review_events
  for each row execute function public.block_review_event_modification ();

create index if not exists review_events_finding_idx
  on public.review_events (finding_id, created_at);

-- ---------------------------------------------------------------------------
-- 9. report_documents
-- ---------------------------------------------------------------------------

create table if not exists public.report_documents (
  id uuid primary key default gen_random_uuid (),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  report_template_id text not null default '',
  title text not null,
  classification text not null default 'confidential',
  status text not null default 'draft',
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint report_documents_status_check check (status in (
    'draft', 'in_review', 'approved', 'delivered'
  )),
  constraint report_documents_classification_check check (classification in (
    'internal', 'confidential', 'restricted'
  ))
);

create index if not exists report_documents_engagement_idx
  on public.report_documents (engagement_id);

drop trigger if exists report_documents_touch_updated_at on public.report_documents;
create trigger report_documents_touch_updated_at
  before update on public.report_documents
  for each row execute function public.touch_updated_at ();

-- ---------------------------------------------------------------------------
-- 10. document_versions
-- ---------------------------------------------------------------------------

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid (),
  document_id uuid not null references public.report_documents (id) on delete cascade,
  version_label text not null default '1.0',
  content_json jsonb not null default '{}',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now (),
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  export_sha256 text,
  is_immutable boolean not null default false
);

create index if not exists document_versions_doc_idx
  on public.document_versions (document_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 11. finding_templates
-- ---------------------------------------------------------------------------

create table if not exists public.finding_templates (
  id uuid primary key default gen_random_uuid (),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  default_cvss_vector text not null default '',
  description text not null default '',
  impact text not null default '',
  remediation text not null default '',
  cwe_ids text[] not null default '{}',
  owasp_categories text[] not null default '{}',
  tags text[] not null default '{}',
  usage_count integer not null default 0,
  created_at timestamptz not null default now ()
);

create index if not exists finding_templates_workspace_idx
  on public.finding_templates (workspace_id);

-- ---------------------------------------------------------------------------
-- 12. Row level security — workspace-scoped access
-- ---------------------------------------------------------------------------

-- Helper: resolve workspace_id from a table's workspace_id column
-- For tables that don't have a direct workspace_id, we join through foreign keys.

alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.clients enable row level security;
alter table public.engagements enable row level security;
alter table public.findings enable row level security;
alter table public.affected_assets enable row level security;
alter table public.evidence enable row level security;
alter table public.review_events enable row level security;
alter table public.report_documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.finding_templates enable row level security;

-- Workspaces: visible if user is a member
drop policy if exists workspaces_member_select on public.workspaces;
create policy workspaces_member_select
  on public.workspaces for select to authenticated
  using (public.is_workspace_member (id));

drop policy if exists workspaces_member_insert on public.workspaces;
create policy workspaces_member_insert
  on public.workspaces for insert to authenticated
  with check (true);

drop policy if exists workspaces_owner_update on public.workspaces;
create policy workspaces_owner_update
  on public.workspaces for update to authenticated
  using (exists (
    select 1 from public.memberships
    where workspace_id = workspaces.id and user_id = auth.uid () and access = 'owner'
  ));

drop policy if exists workspaces_owner_delete on public.workspaces;
create policy workspaces_owner_delete
  on public.workspaces for delete to authenticated
  using (exists (
    select 1 from public.memberships
    where workspace_id = workspaces.id and user_id = auth.uid () and access = 'owner'
  ));

-- Memberships: visible if user is in the same workspace
drop policy if exists memberships_member_select on public.memberships;
create policy memberships_member_select
  on public.memberships for select to authenticated
  using (public.is_workspace_member (workspace_id));

drop policy if exists memberships_owner_insert on public.memberships;
create policy memberships_owner_insert
  on public.memberships for insert to authenticated
  with check (exists (
    select 1 from public.memberships m
    where m.workspace_id = memberships.workspace_id
      and m.user_id = auth.uid ()
      and m.access = 'owner'
  ));

drop policy if exists memberships_owner_delete on public.memberships;
create policy memberships_owner_delete
  on public.memberships for delete to authenticated
  using (exists (
    select 1 from public.memberships m
    where m.workspace_id = memberships.workspace_id
      and m.user_id = auth.uid ()
      and m.access = 'owner'
  ));

-- Clients: workspace member access
do $$
declare
  tbl text;
begin
  for tbl in select unnest(array['clients', 'engagements', 'finding_templates']) loop
    execute format ('drop policy if exists %I on public.%I;', tbl || '_ws_select', tbl);
    execute format ('drop policy if exists %I on public.%I;', tbl || '_ws_insert', tbl);
    execute format ('drop policy if exists %I on public.%I;', tbl || '_ws_update', tbl);
    execute format ('drop policy if exists %I on public.%I;', tbl || '_ws_delete', tbl);

    execute format (
      'create policy %I on public.%I for select to authenticated
       using (public.is_workspace_member (workspace_id));',
      tbl || '_ws_select', tbl
    );
    execute format (
      'create policy %I on public.%I for insert to authenticated
       with check (public.is_workspace_member (workspace_id));',
      tbl || '_ws_insert', tbl
    );
    execute format (
      'create policy %I on public.%I for update to authenticated
       using (public.is_workspace_member (workspace_id));',
      tbl || '_ws_update', tbl
    );
    execute format (
      'create policy %I on public.%I for delete to authenticated
       using (public.is_workspace_member (workspace_id));',
      tbl || '_ws_delete', tbl
    );
  end loop;
end $$;

-- Findings: workspace member access (join through engagements)
drop policy if exists findings_ws_select on public.findings;
create policy findings_ws_select
  on public.findings for select to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = findings.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists findings_ws_insert on public.findings;
create policy findings_ws_insert
  on public.findings for insert to authenticated
  with check (exists (
    select 1 from public.engagements e
    where e.id = findings.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists findings_ws_update on public.findings;
create policy findings_ws_update
  on public.findings for update to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = findings.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists findings_ws_delete on public.findings;
create policy findings_ws_delete
  on public.findings for delete to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = findings.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

-- Affected assets: workspace member via findings → engagements
drop policy if exists affected_assets_ws_select on public.affected_assets;
create policy affected_assets_ws_select
  on public.affected_assets for select to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = affected_assets.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists affected_assets_ws_insert on public.affected_assets;
create policy affected_assets_ws_insert
  on public.affected_assets for insert to authenticated
  with check (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = affected_assets.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists affected_assets_ws_update on public.affected_assets;
create policy affected_assets_ws_update
  on public.affected_assets for update to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = affected_assets.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists affected_assets_ws_delete on public.affected_assets;
create policy affected_assets_ws_delete
  on public.affected_assets for delete to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = affected_assets.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

-- Evidence: workspace member via findings → engagements
drop policy if exists evidence_ws_select on public.evidence;
create policy evidence_ws_select
  on public.evidence for select to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = evidence.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists evidence_ws_insert on public.evidence;
create policy evidence_ws_insert
  on public.evidence for insert to authenticated
  with check (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = evidence.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists evidence_ws_update on public.evidence;
create policy evidence_ws_update
  on public.evidence for update to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = evidence.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists evidence_ws_delete on public.evidence;
create policy evidence_ws_delete
  on public.evidence for delete to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = evidence.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

-- Review events: workspace member via findings → engagements
drop policy if exists review_events_ws_select on public.review_events;
create policy review_events_ws_select
  on public.review_events for select to authenticated
  using (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = review_events.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists review_events_ws_insert on public.review_events;
create policy review_events_ws_insert
  on public.review_events for insert to authenticated
  with check (exists (
    select 1 from public.findings f
    join public.engagements e on e.id = f.engagement_id
    where f.id = review_events.finding_id
      and public.is_workspace_member (e.workspace_id)
  ));

-- Report documents: workspace member via engagements
drop policy if exists report_documents_ws_select on public.report_documents;
create policy report_documents_ws_select
  on public.report_documents for select to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = report_documents.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists report_documents_ws_insert on public.report_documents;
create policy report_documents_ws_insert
  on public.report_documents for insert to authenticated
  with check (exists (
    select 1 from public.engagements e
    where e.id = report_documents.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists report_documents_ws_update on public.report_documents;
create policy report_documents_ws_update
  on public.report_documents for update to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = report_documents.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists report_documents_ws_delete on public.report_documents;
create policy report_documents_ws_delete
  on public.report_documents for delete to authenticated
  using (exists (
    select 1 from public.engagements e
    where e.id = report_documents.engagement_id
      and public.is_workspace_member (e.workspace_id)
  ));

-- Document versions: workspace member via report_documents → engagements
drop policy if exists document_versions_ws_select on public.document_versions;
create policy document_versions_ws_select
  on public.document_versions for select to authenticated
  using (exists (
    select 1 from public.report_documents rd
    join public.engagements e on e.id = rd.engagement_id
    where rd.id = document_versions.document_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists document_versions_ws_insert on public.document_versions;
create policy document_versions_ws_insert
  on public.document_versions for insert to authenticated
  with check (exists (
    select 1 from public.report_documents rd
    join public.engagements e on e.id = rd.engagement_id
    where rd.id = document_versions.document_id
      and public.is_workspace_member (e.workspace_id)
  ));

drop policy if exists document_versions_ws_update on public.document_versions;
create policy document_versions_ws_update
  on public.document_versions for update to authenticated
  using (exists (
    select 1 from public.report_documents rd
    join public.engagements e on e.id = rd.engagement_id
    where rd.id = document_versions.document_id
      and public.is_workspace_member (e.workspace_id)
      and is_immutable = false
  ));

drop policy if exists document_versions_ws_delete on public.document_versions;
create policy document_versions_ws_delete
  on public.document_versions for delete to authenticated
  using (exists (
    select 1 from public.report_documents rd
    join public.engagements e on e.id = rd.engagement_id
    where rd.id = document_versions.document_id
      and public.is_workspace_member (e.workspace_id)
      and is_immutable = false
  ));

-- Grants: standard blanket grants already from 0002_public_grants.sql
