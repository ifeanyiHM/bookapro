create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  phone text,
  password_hash text not null,
  role text not null check (role in ('admin', 'technician')),
  skills text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists areas (
  id serial primary key,
  slug text not null unique,
  name text not null,
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists technician_areas (
  user_id uuid not null references users(id) on delete cascade,
  area_id int not null references areas(id) on delete cascade,
  primary key (user_id, area_id)
);

create table if not exists services (
  id serial primary key,
  slug text not null unique,
  name text not null,
  category text not null check (category in ('ac', 'electrical', 'plumbing', 'cleaning')),
  summary text not null default '',
  description text not null default '',
  includes text[] not null default '{}',
  price_kobo int not null check (price_kobo > 0),
  duration_minutes int not null check (duration_minutes > 0),
  active boolean not null default true,
  sort int not null default 0
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,
  service_id int not null references services(id),
  area_id int not null references areas(id),
  service_name text not null,
  area_name text not null,
  category text not null,
  price_kobo int not null,
  slot_date date not null,
  slot_window text not null,
  address text not null,
  landmark text,
  notes text,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'assigned', 'in_progress', 'completed', 'cancelled')),
  technician_id uuid references users(id),
  technician_payout_kobo int,
  payout_paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_slot_idx on bookings (area_id, slot_date, slot_window);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_tech_idx on bookings (technician_id);

create table if not exists booking_events (
  id bigserial primary key,
  booking_id uuid not null references bookings(id) on delete cascade,
  status text not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists booking_events_booking_idx on booking_events (booking_id);

create table if not exists payments (
  id bigserial primary key,
  booking_id uuid not null references bookings(id) on delete cascade,
  reference text not null unique,
  amount_kobo int not null,
  status text not null default 'initiated' check (status in ('initiated', 'success', 'failed')),
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  contact_method text not null check (contact_method in ('phone', 'whatsapp', 'email')),
  project_type text not null,
  trades text[] not null default '{}',
  location text not null,
  size_note text,
  start_window text,
  description text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  internal_note text,
  created_at timestamptz not null default now()
);
create index if not exists enquiries_status_idx on enquiries (status, created_at desc);

-- =====================================================================================================
-- Accounts, roles and onboarding (auth redesign).
-- Kept separate on purpose:
--   users                     identity and sign-in only (email, password hash, Google id, role, session version)
--   customer_profiles         who a customer is
--   technician_profiles       who a technician is and what they offer
--   technician_applications   the admin review decision (pending / approved / rejected)
--   technician_documents      files submitted for review
-- Everything below is safe to run again.
-- =====================================================================================================

create table if not exists customer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists technician_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  years_experience int check (years_experience is null or years_experience between 0 and 60),
  bio text not null default '',
  qualifications text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists technician_applications (
  user_id uuid primary key references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references users(id) on delete set null,
  review_note text,
  attempt int not null default 1
);
create index if not exists technician_applications_status_idx on technician_applications (status, submitted_at);

create table if not exists technician_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  kind text not null check (kind in ('id', 'credential')),
  filename text not null,
  mime text not null,
  size_bytes int not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists technician_documents_user_idx on technician_documents (user_id);

-- Single-use, expiring tokens for email verification and password reset. Only a hash is stored.
create table if not exists auth_tokens (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('verify_email', 'reset_password')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists auth_tokens_user_idx on auth_tokens (user_id, purpose);

-- Rate limit counters live in Postgres so the limits hold across several server instances.
create table if not exists rate_hits (
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_key_idx on rate_hits (key, at);

-- A customer's half-finished booking, kept while they register, verify and complete their profile.
create table if not exists booking_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days'
);
create index if not exists booking_drafts_user_idx on booking_drafts (user_id);

-- First run only: existing staff accounts predate email verification and applications, so they are
-- treated as verified, and existing technicians as approved. Guarded by the missing column, so it
-- can never mark a later self-registered account as verified.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = current_schema() and table_name = 'users' and column_name = 'email_verified_at'
  ) then
    alter table users add column email_verified_at timestamptz;
    update users set email_verified_at = created_at;
    insert into technician_profiles (user_id, full_name, phone)
      select id, coalesce(name, 'Technician'), coalesce(phone, '') from users where role = 'technician'
      on conflict do nothing;
    insert into technician_applications (user_id, status, reviewed_at)
      select id, 'approved', now() from users where role = 'technician'
      on conflict do nothing;
  end if;
end $$;

alter table users alter column name drop not null;
alter table users alter column password_hash drop not null;
alter table users alter column role drop not null;
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role is null or role in ('admin', 'customer', 'technician'));
alter table users add column if not exists google_sub text;
alter table users add column if not exists admin_password_hash text;
alter table users add column if not exists session_version int not null default 0;
alter table users add column if not exists password_changed_at timestamptz;
create unique index if not exists users_google_sub_idx on users (google_sub) where google_sub is not null;

alter table bookings add column if not exists customer_user_id uuid references users(id) on delete set null;
create index if not exists bookings_customer_idx on bookings (customer_user_id);
