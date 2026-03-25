create extension if not exists "pgcrypto";

-- Backward compatible migration: make sure `role` column exists
-- (for databases that already have the earlier v1 schema).
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'users'
  ) then
    begin
      alter table public.users add column if not exists role text not null default 'owner';
    exception when others then null;
    end;

    begin
      alter table public.users drop constraint if exists users_role_check;
    exception when others then null;
    end;

    begin
      alter table public.users add constraint users_role_check check (role in ('owner', 'admin'));
    exception when others then null;
    end;
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Pemilik Warung',
  phone text,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.warungs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  address text,
  city text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  warung_id uuid references public.warungs(id) on delete set null,
  name text not null,
  cost_price numeric(12,2) not null check (cost_price >= 0),
  selling_price numeric(12,2) not null check (selling_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  warung_id uuid references public.warungs(id) on delete set null,
  total numeric(12,2) not null check (total >= 0),
  profit numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0),
  cost numeric(12,2) not null check (cost >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  warung_id uuid references public.warungs(id) on delete set null,
  reference text not null unique,
  type text not null check (type in ('qris', 'va', 'manual')),
  provider text not null default 'xendit',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired')),
  amount numeric(12,2) not null check (amount >= 0),
  external_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  warung_id uuid not null references public.warungs(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  tenor_days integer not null check (tenor_days in (7, 14, 30)),
  interest_rate numeric(5,4) not null check (interest_rate >= 0),
  score integer not null check (score between 0 and 100),
  risk_level text not null check (risk_level in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'disbursed', 'completed')),
  disbursed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  due_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'late')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  category text,
  price numeric(12,2) not null check (price > 0),
  min_order_qty integer not null default 1 check (min_order_qty > 0),
  stock_available integer not null default 0 check (stock_available >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  warung_id uuid not null references public.warungs(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  supplier_product_id uuid not null references public.supplier_products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  total_amount numeric(12,2) not null check (total_amount > 0),
  payment_method text not null check (payment_method in ('qris', 'va')),
  payment_id uuid references public.payments(id) on delete set null,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'processing', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_user_stock on public.products(user_id, stock);
create index if not exists idx_transactions_user_created_at on public.transactions(user_id, created_at desc);
create index if not exists idx_transaction_items_transaction_id on public.transaction_items(transaction_id);
create index if not exists idx_transaction_items_product_id on public.transaction_items(product_id);
create index if not exists idx_warungs_user_id on public.warungs(user_id);
create index if not exists idx_payments_user_status on public.payments(user_id, status, created_at desc);
create index if not exists idx_loans_user_status on public.loans(user_id, status, created_at desc);
create index if not exists idx_loan_repayments_user_status on public.loan_repayments(user_id, status, due_date);
create index if not exists idx_supplier_products_supplier on public.supplier_products(supplier_id);
create index if not exists idx_orders_user_created_at on public.orders(user_id, created_at desc);

alter table public.users enable row level security;
alter table public.warungs enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.payments enable row level security;
alter table public.loans enable row level security;
alter table public.loan_repayments enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can upsert own profile" on public.users;
create policy "Users can upsert own profile"
  on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

drop policy if exists "Users can CRUD own products" on public.products;
create policy "Users can CRUD own products"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own warungs" on public.warungs;
create policy "Users can CRUD own warungs"
  on public.warungs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own transactions" on public.transactions;
create policy "Users can CRUD own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own transaction items" on public.transaction_items;
create policy "Users can CRUD own transaction items"
  on public.transaction_items for all
  using (
    exists (
      select 1
      from public.transactions t
      where t.id = transaction_id
      and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.transactions t
      where t.id = transaction_id
      and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users can CRUD own payments" on public.payments;
create policy "Users can CRUD own payments"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own loans" on public.loans;
create policy "Users can CRUD own loans"
  on public.loans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can CRUD own loan repayments" on public.loan_repayments;
create policy "Users can CRUD own loan repayments"
  on public.loan_repayments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Authenticated can read suppliers" on public.suppliers;
create policy "Authenticated can read suppliers"
  on public.suppliers for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can read supplier products" on public.supplier_products;
create policy "Authenticated can read supplier products"
  on public.supplier_products for select
  using (auth.role() = 'authenticated');

drop policy if exists "Users can CRUD own orders" on public.orders;
create policy "Users can CRUD own orders"
  on public.orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.transaction_items;
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.orders;
