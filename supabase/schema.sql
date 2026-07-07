-- PulseStock schema for Supabase
-- Run via: supabase db query --linked --file supabase/schema.sql

-- ---------------------------------------------------------------------------
-- Users (mirrors auth.users for app-level role/profile storage)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  role text not null check (role in ('admin','warehouse_manager','staff')) default 'staff',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Warehouses
-- ---------------------------------------------------------------------------
create table if not exists public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  capacity integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid not null references public.categories(id),
  price numeric(12,2) not null default 0,
  critical_stock_threshold integer not null default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Inventory Levels (junction table)
-- ---------------------------------------------------------------------------
create table if not exists public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  quantity integer not null default 0,
  updated_at timestamptz default now(),
  unique(product_id, warehouse_id)
);

-- ---------------------------------------------------------------------------
-- Stock Transfers
-- ---------------------------------------------------------------------------
create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  from_warehouse_id uuid references public.warehouses(id) on delete set null,
  to_warehouse_id uuid references public.warehouses(id) on delete set null,
  quantity integer not null,
  transfer_type text not null check (transfer_type in ('transfer','adjustment','initial')) default 'transfer',
  notes text,
  created_by uuid not null references public.users(id),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Audit Logs
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.warehouses enable row level security;
alter table public.products enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.stock_transfers enable row level security;
alter table public.audit_logs enable row level security;

-- Authenticated users can read everything (server-side uses service_role which bypasses RLS)
create policy "authenticated_read_users" on public.users for select to authenticated using (true);
create policy "authenticated_read_categories" on public.categories for select to authenticated using (true);
create policy "authenticated_read_warehouses" on public.warehouses for select to authenticated using (true);
create policy "authenticated_read_products" on public.products for select to authenticated using (true);
create policy "authenticated_read_inventory" on public.inventory_levels for select to authenticated using (true);
create policy "authenticated_read_transfers" on public.stock_transfers for select to authenticated using (true);
create policy "authenticated_read_audit_logs" on public.audit_logs for select to authenticated using (true);

-- Grants so the Data API can access tables (Supabase exposes public schema by default)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant select on tables to authenticated;
