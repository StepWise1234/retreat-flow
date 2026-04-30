create table if not exists public.auth_email_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  action_type text not null,
  to_email text not null,
  subject text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null,
  redirect_to text,
  error_message text
);

create index if not exists auth_email_events_created_at_idx
  on public.auth_email_events (created_at desc);

create index if not exists auth_email_events_to_email_idx
  on public.auth_email_events (to_email);

create index if not exists auth_email_events_status_idx
  on public.auth_email_events (status);
