import { createClient } from "@supabase/supabase-js"

export type Admin = {
  id: string
  username: string
  full_name: string | null
  role: "super_admin" | "store_manager"
  status: "active" | "suspended"
  created_at?: string
  updated_at?: string
}

export async function getAllAdminsServiceRole(): Promise<Admin[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return []
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (error || !data) {
    return []
  }

  return data as Admin[]
}