-- Data Privacy App — Supabase schema (POC)

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null default 'requestor', -- requestor | officer | admin
  created_at timestamptz not null default now()
);

create table if not exists public.dsar_requests (
  id uuid primary key default gen_random_uuid(),
  jurisdiction text not null,
  right text not null, -- e.g., Right to Know, Delete, etc.
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  customer_type text not null, -- Consumer | Employee | Applicant | Other
  reference_id text,
  details text,
  status text not null default 'received', -- received | in_progress | fulfilled | rejected | closed
  sla_due_date date,
  assigned_to uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consents (
  id uuid primary key default gen_random_uuid(),
  subject_email text not null,
  consent_type text not null, -- marketing | sale_sharing | cookies | etc.
  preference boolean not null, -- true = consented, false = revoked
  source text, -- web, mobile, import, etc.
  policy_version text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,        -- e.g., 'DSAR_CREATED', 'STATUS_CHANGED'
  entity_type text not null,   -- 'dsar_request' | 'consent' | ...
  entity_id uuid not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpful trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_dsar_updated_at on public.dsar_requests;
create trigger trg_dsar_updated_at
before update on public.dsar_requests
for each row execute function public.set_updated_at();

-- RLS: off by default; we rely on Service Role via server only.
-- You can harden further with policies later.
alter table public.users enable row level security;
alter table public.dsar_requests enable row level security;
alter table public.consents enable row level security;
alter table public.audit_logs enable row level security;

-- Default deny
do $$ begin
  execute 'drop policy if exists p_all_block_users on public.users';
  execute 'drop policy if exists p_all_block_dsar on public.dsar_requests';
  execute 'drop policy if exists p_all_block_consents on public.consents';
  execute 'drop policy if exists p_all_block_audit on public.audit_logs';
exception when others then null; end $$;

create policy p_all_block_users on public.users
  for all using (false);

create policy p_all_block_dsar on public.dsar_requests
  for all using (false);

create policy p_all_block_consents on public.consents
  for all using (false);

create policy p_all_block_audit on public.audit_logs
  for all using (false);
