-- Drop existing policies
drop policy if exists "admins_view_own" on public.admins;
drop policy if exists "admins_super_admin_view_all" on public.admins;

-- Add username column and modify admins table
alter table public.admins 
  add column if not exists username text unique,
  drop column if exists email;

-- Add username to existing records if needed
update public.admins 
set username = 'admin_' || substr(id::text, 1, 8) 
where username is null;

-- Make username not null
alter table public.admins 
  alter column username set not null;

-- Recreate policies for admins table
create policy "admins_view_own" on public.admins for select using (auth.uid() = id);
create policy "admins_super_admin_view_all" on public.admins for select using (
  exists (
    select 1 from public.admins 
    where id = auth.uid() and role = 'super_admin'
  )
);

-- Create default admin user with username/password
-- First, create the auth user
insert into auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values (
  'admin@devi.local',
  crypt('admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  jsonb_build_object('username', 'admin')
) on conflict do nothing;

-- Then create the admin record
insert into public.admins (id, username, role, status, created_at)
select id, 'admin', 'super_admin', 'active', now()
from auth.users
where email = 'admin@devi.local'
on conflict do nothing;
