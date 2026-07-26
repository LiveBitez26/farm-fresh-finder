-- =========================================================================
-- MarketConnect — Phase 1 Foundation Schema
-- Multi-tenant SaaS platform for farmers markets
-- =========================================================================
-- Run this against a Supabase (Postgres) project via the SQL editor,
-- or `supabase db push` / `supabase migration up` if using the Supabase CLI.
-- =========================================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------------
-- Shared helper: auto-update `updated_at` on every row change
-- -------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------
create type org_role as enum (
  'platform_owner',
  'org_owner',
  'market_manager',
  'compliance_manager',
  'finance_manager'
);

create type vendor_application_status as enum (
  'submitted',
  'document_review',
  'approved',
  'agreement_signed',
  'payment_setup',
  'activated',
  'rejected'
);

create type document_type as enum (
  'business_license',
  'food_permit',
  'insurance_certificate',
  'organic_certification',
  'health_department_document',
  'safety_document',
  'other_certification'
);

create type document_status as enum (
  'pending_review',
  'verified',
  'expiring_soon',
  'expired',
  'update_requested',
  'rejected'
);

create type attendance_status as enum ('attending', 'absent', 'late');

create type announcement_audience as enum ('all_vendors', 'specific_vendors', 'customers');
create type announcement_channel as enum ('in_app', 'email', 'sms');

create type order_status as enum (
  'pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'delivered', 'cancelled', 'refunded'
);

create type subscription_status as enum ('active', 'paused', 'cancelled');
create type subscription_frequency as enum ('weekly', 'biweekly', 'monthly');

create type payment_purpose as enum ('booth_fee', 'membership_fee', 'platform_subscription', 'product_order');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');

-- -------------------------------------------------------------------------
-- Organizations (tenant root)
-- -------------------------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  country text,
  default_currency text default 'USD',
  default_locale text default 'en',
  subscription_plan text default 'trial',
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_organizations_updated_at before update on organizations
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Profiles (1:1 with Supabase auth.users) — global identity
-- -------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id) on delete set null,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  is_platform_owner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- Staff roles scoped to an organization (a user can have one role per org)
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role org_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
create trigger trg_org_members_updated_at before update on organization_members
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Markets
-- -------------------------------------------------------------------------
create table markets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  address text,
  city text,
  region text,
  postal_code text,
  country text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  hero_image_url text,
  market_type text, -- daily | weekly | seasonal | special_event
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_markets_updated_at before update on markets
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Vendors
-- -------------------------------------------------------------------------
create table vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  owner_user_id uuid references profiles(id) on delete set null,
  business_name text not null,
  farm_story text,
  farm_location text,
  product_categories text[],
  website text,
  social_links jsonb default '{}'::jsonb,
  farming_practices text[],
  photos text[],
  status text default 'pending', -- pending | active | suspended | inactive
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_vendors_updated_at before update on vendors
  for each row execute function set_updated_at();

-- Vendor participation in specific markets (many-to-many)
create table vendor_market_participation (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  joined_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, market_id)
);
create trigger trg_vmp_updated_at before update on vendor_market_participation
  for each row execute function set_updated_at();

-- Vendor application workflow
create table vendor_applications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete cascade,
  market_id uuid references markets(id) on delete set null,
  applicant_name text not null,
  applicant_email text not null,
  status vendor_application_status not null default 'submitted',
  notes text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_vendor_apps_updated_at before update on vendor_applications
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Compliance Vault: Documents & Certifications
-- -------------------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  document_type document_type not null,
  title text not null,
  file_url text,
  status document_status not null default 'pending_review',
  issued_at date,
  expires_at date,
  verified_by uuid references profiles(id),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_documents_updated_at before update on documents
  for each row execute function set_updated_at();

create index idx_documents_expiring on documents (organization_id, expires_at);

-- -------------------------------------------------------------------------
-- Booths & Schedules
-- -------------------------------------------------------------------------
create table booths (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  code text not null, -- e.g. A01, B02
  pos_x numeric,
  pos_y numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market_id, code)
);
create trigger trg_booths_updated_at before update on booths
  for each row execute function set_updated_at();

create table schedules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  market_id uuid not null references markets(id) on delete cascade,
  event_date date not null,
  start_time time,
  end_time time,
  event_type text, -- daily | weekly | seasonal | special_event
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_schedules_updated_at before update on schedules
  for each row execute function set_updated_at();

create table booth_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  schedule_id uuid not null references schedules(id) on delete cascade,
  booth_id uuid not null references booths(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  attendance attendance_status default 'attending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_id, booth_id)
);
create trigger trg_booth_assignments_updated_at before update on booth_assignments
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Communication Hub
-- -------------------------------------------------------------------------
create table announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  market_id uuid references markets(id) on delete set null,
  author_id uuid references profiles(id),
  audience announcement_audience not null,
  channel announcement_channel not null,
  message text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_announcements_updated_at before update on announcements
  for each row execute function set_updated_at();

create table notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_notifications_updated_at before update on notifications
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Products & Inventory
-- -------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  description text,
  category text,
  price numeric(10,2) not null,
  currency text default 'USD',
  unit text, -- e.g. per lb, per dozen, per box
  photo_url text,
  is_subscription_eligible boolean default false,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

create table inventory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity_available numeric not null default 0,
  low_stock_threshold numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id)
);
create trigger trg_inventory_updated_at before update on inventory
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Orders & Subscriptions
-- -------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references profiles(id),
  vendor_id uuid not null references vendors(id),
  market_id uuid references markets(id),
  status order_status not null default 'pending',
  fulfillment_type text default 'pickup', -- pickup | delivery
  pickup_time timestamptz,
  total_amount numeric(10,2) not null default 0,
  currency text default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity numeric not null default 1,
  unit_price numeric(10,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_order_items_updated_at before update on order_items
  for each row execute function set_updated_at();

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  customer_id uuid not null references profiles(id),
  vendor_id uuid not null references vendors(id),
  product_id uuid not null references products(id),
  frequency subscription_frequency not null default 'weekly',
  status subscription_status not null default 'active',
  next_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Payments (Stripe Connect)
-- -------------------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid references vendors(id),
  order_id uuid references orders(id),
  subscription_id uuid references subscriptions(id),
  purpose payment_purpose not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  status payment_status not null default 'pending',
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();

-- -------------------------------------------------------------------------
-- Analytics (lightweight event log — aggregate in views/materialized views later)
-- -------------------------------------------------------------------------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  market_id uuid references markets(id),
  event_type text not null, -- e.g. 'visit', 'sale', 'vendor_activated'
  payload jsonb default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_analytics_updated_at before update on analytics_events
  for each row execute function set_updated_at();

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table markets enable row level security;
alter table vendors enable row level security;
alter table vendor_market_participation enable row level security;
alter table vendor_applications enable row level security;
alter table documents enable row level security;
alter table booths enable row level security;
alter table schedules enable row level security;
alter table booth_assignments enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table subscriptions enable row level security;
alter table payments enable row level security;
alter table analytics_events enable row level security;

-- Helper: is the current user a staff member of a given organization?
create or replace function is_org_member(org_id uuid)
returns boolean as $$
  select exists (
    select 1 from organization_members
    where organization_id = org_id and user_id = auth.uid()
  ) or exists (
    select 1 from profiles where id = auth.uid() and is_platform_owner = true
  );
$$ language sql stable security definer;

-- Profiles: users can read/update their own profile; org staff can read
-- profiles of members within their org.
create policy "profiles_self_select" on profiles
  for select using (id = auth.uid() or is_org_member(organization_id));
create policy "profiles_self_update" on profiles
  for update using (id = auth.uid());

-- Organizations: members can read their own org; platform owners read all.
create policy "organizations_member_select" on organizations
  for select using (is_org_member(id));

-- Generic org-scoped policy applied to every tenant table: staff of the
-- owning organization can read/write; customers reach vendor-facing data
-- (markets, vendors, products) via dedicated public-read policies below.
create policy "org_members_all" on organization_members for all using (is_org_member(organization_id));
create policy "markets_org_all" on markets for all using (is_org_member(organization_id));
create policy "markets_public_read" on markets for select using (is_active = true);
create policy "vendors_org_all" on vendors for all using (is_org_member(organization_id));
create policy "vendors_public_read" on vendors for select using (status = 'active');
create policy "vmp_org_all" on vendor_market_participation for all using (is_org_member(organization_id));
create policy "vendor_apps_org_all" on vendor_applications for all using (is_org_member(organization_id));
create policy "documents_org_all" on documents for all using (is_org_member(organization_id));
create policy "booths_org_all" on booths for all using (is_org_member(organization_id));
create policy "schedules_org_all" on schedules for all using (is_org_member(organization_id));
create policy "schedules_public_read" on schedules for select using (true);
create policy "booth_assignments_org_all" on booth_assignments for all using (is_org_member(organization_id));
create policy "announcements_org_all" on announcements for all using (is_org_member(organization_id));
create policy "notifications_owner_all" on notifications for all using (user_id = auth.uid() or is_org_member(organization_id));
create policy "products_org_all" on products for all using (is_org_member(organization_id));
create policy "products_public_read" on products for select using (is_active = true);
create policy "inventory_org_all" on inventory for all using (is_org_member(organization_id));
create policy "orders_org_staff_all" on orders for all using (is_org_member(organization_id));
create policy "orders_customer_read" on orders for select using (customer_id = auth.uid());
create policy "order_items_org_all" on order_items for all using (is_org_member(organization_id));
create policy "subscriptions_org_staff_all" on subscriptions for all using (is_org_member(organization_id));
create policy "subscriptions_customer_all" on subscriptions for all using (customer_id = auth.uid());
create policy "payments_org_all" on payments for all using (is_org_member(organization_id));
create policy "analytics_org_all" on analytics_events for all using (is_org_member(organization_id));

-- =========================================================================
-- Auto-create a profile row whenever a new Supabase auth user signs up
-- =========================================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
