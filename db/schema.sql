-- Shass Console — Postgres schema (no ORM: plain SQL, applied by scripts/migrate.mjs)
-- Sanity owns content (products, categories, pages, blog, settings, faqs, menus,
-- catalogue, redirects). This database owns everything content can't: submitted
-- enquiries, staff accounts, sessions, and the audit trail.

-- gen_random_uuid() is built into Postgres core (13+) — no extension needed.

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null, -- format: scrypt:<saltHex>:<derivedHex>
  role text not null default 'editor', -- see src/lib/roles.ts for the fixed role set
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists staff_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  token_hash text not null unique, -- sha256(opaque token), never the raw token
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists staff_session_user_id_idx on staff_session(user_id);

create table if not exists customer (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enquiry (
  id uuid primary key default gen_random_uuid(),
  enquiry_number text not null unique,
  status text not null default 'new', -- new, contacted, quoted, negotiation, won, lost
  customer_id uuid references customer(id),
  customer_name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  source text not null default 'website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists enquiry_status_idx on enquiry(status);
create index if not exists enquiry_created_at_idx on enquiry(created_at desc);

create table if not exists enquiry_item (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiry(id) on delete cascade,
  product_id text not null, -- Sanity document id (cross-system reference, not a fk)
  product_name text not null,
  product_sku text,
  product_url text,
  image_url text,
  quantity integer not null default 1,
  note text, -- chosen variation/options, e.g. "Colour: Black, 4GB"
  created_at timestamptz not null default now()
);

create index if not exists enquiry_item_enquiry_id_idx on enquiry_item(enquiry_id);

create table if not exists enquiry_note (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiry(id) on delete cascade,
  text text not null,
  author text not null,
  created_at timestamptz not null default now()
);

create index if not exists enquiry_note_enquiry_id_idx on enquiry_note(enquiry_id);

create table if not exists form_submission (
  id uuid primary key default gen_random_uuid(),
  form_type text not null default 'contact', -- contact, quote_request, catalogue_download, other
  name text,
  email text,
  phone text,
  message text,
  payload jsonb,
  status text not null default 'new', -- new, reviewed, archived
  created_at timestamptz not null default now()
);

create index if not exists form_submission_created_at_idx on form_submission(created_at desc);

create table if not exists newsletter_subscriber (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed', -- subscribed, unsubscribed
  subscribed_at timestamptz not null default now()
);

create table if not exists catalogue_download (
  id uuid primary key default gen_random_uuid(),
  catalogue_id text, -- Sanity document id
  catalogue_title text,
  name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null, -- staff email/name, or "system"
  action text not null,
  target text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_at_idx on audit_log(created_at desc);

create table if not exists rate_limit (
  key text primary key, -- e.g. sha256(ip) + ':' + route
  count integer not null default 1,
  window_start timestamptz not null default now()
);

create table if not exists app_setting (
  key text primary key,
  value jsonb not null
);

create table if not exists webhook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  event text not null, -- enquiry.created, form_submission.created, newsletter_subscriber.created
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Redirects stay in Sanity (sanity/schemaTypes/redirect.ts) per the build spec's
-- document list — they're editorial/content, not operational state.
