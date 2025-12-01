-- This script creates the default super admin
-- NOTE: The user must be created via Supabase Auth first
-- After creating the auth user with email 'admin@devI.com' and password 'admin123'
-- Run this script to create the admin profile

-- Get the UUID of the user created in auth (you'll need to insert the actual UUID)
-- For now, we'll create a function that inserts the admin when called

create or replace function public.create_admin_profile(
  user_id uuid,
  user_email text,
  user_full_name text
)
returns void as $$
begin
  insert into public.admins (id, email, role, full_name, status)
  values (user_id, user_email, 'super_admin', user_full_name, 'active')
  on conflict (id) do nothing;
end;
$$ language plpgsql security definer set search_path = public;
