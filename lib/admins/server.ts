import { createClient } from "@supabase/supabase-js"

type Admin = {
  id: string
  username: string
  full_name: string | null
  role: "super_admin" | "store_manager"
  status: "active" | "suspended"
  created_at?: string
  updated_at?: string
}

export async function getAdminByUserIdServiceRole(userId: string): Promise<Admin | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    return null
  }

  return data as Admin | null
}

export async function getAdminsByIdsServiceRole(ids: string[]): Promise<Record<string, Admin>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey || !ids || ids.length === 0) {
    return {}
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .in("id", ids)

  if (error || !data) {
    return {}
  }

  const map: Record<string, Admin> = {}
  for (const a of data as Admin[]) {
    map[a.id] = a
  }
  return map
}