-- Account states (spec §23) + append-only security event audit log (spec §38).
-- Idempotent: safe to replay.

-- ---------------------------------------------------------------------------
-- 1. profiles.account_status
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists account_status text not null default 'ACTIVE';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_account_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_account_status_check check (
        account_status in (
          'ACTIVE', 'UNVERIFIED', 'LOCKED', 'SUSPENDED', 'DISABLED', 'DELETED'
        )
      );
  end if;
end $$;

create index if not exists profiles_account_status_idx
  on public.profiles (account_status);

-- ---------------------------------------------------------------------------
-- 2. security_events
--    Never store passwords, tokens, OTPs or secrets here (spec §39) - the
--    caller only passes non-sensitive metadata; user_id is derived from the
--    JWT server-side and can never be forged by a client.
-- ---------------------------------------------------------------------------

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid (),
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  success boolean not null default true,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now (),
  constraint security_events_event_type_check check (event_type in (
    'LOGIN_SUCCESS',
    'LOGIN_FAILURE',
    'LOGOUT',
    'ACCOUNT_CREATED',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    'EMAIL_VERIFIED',
    'MFA_ENROLLED',
    'MFA_VERIFIED',
    'MFA_FAILED',
    'MFA_REMOVED',
    'SESSION_REVOKED',
    'ACCOUNT_LOCKED',
    'ACCOUNT_SUSPENDED'
  ))
);

create index if not exists security_events_user_created_idx
  on public.security_events (user_id, created_at desc);
create index if not exists security_events_event_type_idx
  on public.security_events (event_type);
create index if not exists security_events_created_at_idx
  on public.security_events (created_at desc);

alter table public.security_events enable row level security;

drop policy if exists "security_events_select_own" on public.security_events;
create policy "security_events_select_own"
  on public.security_events for select
  using (auth.uid () = user_id);

-- Deliberately NO insert/update/delete policies: RLS denies all client writes.
-- Rows are created exclusively by log_security_event () below.

create or replace function public.log_security_event (
  p_event_type text,
  p_success boolean default true,
  p_metadata jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_headers jsonb;
  v_ip text;
  v_event_id uuid;
begin
  v_headers = coalesce (
    nullif (current_setting ('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );

  v_ip = coalesce (
    v_headers ->> 'x-forwarded-for',
    host (inet_client_addr ())
  );
  if v_ip = '' then
    v_ip = null;
  end if;

  insert into public.security_events (
    user_id, event_type, success, ip_address, user_agent, metadata
  ) values (
    auth.uid (),
    p_event_type,
    coalesce (p_success, true),
    v_ip,
    left (v_headers ->> 'user-agent', 512),
    jsonb_strip_nulls (coalesce (p_metadata, '{}'::jsonb))
  )
  returning id into v_event_id;

  return v_event_id;
exception
  when others then
    -- Auditing must never break the caller's flow; failures surface in logs.
    return null;
end;
$$;

-- Login failures occur before a session exists, so anon must be able to call
-- this. Impersonation is impossible: user_id always comes from auth.uid ().
-- NOTE: anonymous calls are unthrottled until proxy-level rate limiting
-- lands (phase 8 of the platform spec).
revoke all on function public.log_security_event (text, boolean, jsonb) from public;
grant execute on function public.log_security_event (text, boolean, jsonb)
  to anon, authenticated;
