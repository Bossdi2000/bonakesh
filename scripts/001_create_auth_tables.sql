-- Create admins table
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null check (role in ('super_admin', 'store_manager')),
  full_name text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  last_login timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  buying_price numeric not null,
  selling_price numeric not null,
  quantity integer not null default 0,
  created_by uuid not null references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create staff table
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  job_title text not null,
  monthly_salary numeric not null,
  employment_status text not null default 'active' check (employment_status in ('active', 'suspended', 'resigned')),
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending', 'withheld')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create transactions table
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  total_amount numeric not null,
  payment_method text not null,
  transaction_date timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create transaction items table
create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null,
  price_per_unit numeric not null,
  total_price numeric not null,
  created_at timestamp with time zone default now()
);

-- Create activity log table
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  action_type text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.staff enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.activity_log enable row level security;

-- Admin policies
create policy "admins_view_own" on public.admins for select using (auth.uid() = id);
create policy "admins_super_admin_view_all" on public.admins for select using (
  exists (
    select 1 from public.admins 
    where id = auth.uid() and role = 'super_admin'
  )
);

-- Product policies (all authenticated users can view, only admins can modify)
create policy "products_select_all" on public.products for select using (true);
create policy "products_insert_admin" on public.products for insert 
  with check (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );
create policy "products_update_admin" on public.products for update 
  using (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );
create policy "products_delete_admin" on public.products for delete 
  using (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );

-- Staff policies
create policy "staff_select_all" on public.staff for select using (true);
create policy "staff_insert_admin" on public.staff for insert 
  with check (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );
create policy "staff_update_admin" on public.staff for update 
  using (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );
create policy "staff_delete_admin" on public.staff for delete 
  using (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );

-- Transactions policies
create policy "transactions_select_all" on public.transactions for select using (true);
create policy "transactions_insert_admin" on public.transactions for insert 
  with check (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );

-- Transaction items policies
create policy "transaction_items_select_all" on public.transaction_items for select using (true);
create policy "transaction_items_insert_admin" on public.transaction_items for insert 
  with check (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );

-- Activity log policies
create policy "activity_log_select_all" on public.activity_log for select using (true);
create policy "activity_log_insert_admin" on public.activity_log for insert 
  with check (
    exists (
      select 1 from public.admins 
      where id = auth.uid()
    )
  );
