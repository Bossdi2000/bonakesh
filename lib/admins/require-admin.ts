import { createClient } from "@/lib/supabase/server"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"
import { redirect } from "next/navigation"

/**
 * Resolves the signed-in user + their admins row for a protected dashboard page.
 *
 * - If there's no session the middleware already redirected, but we still guard here.
 * - Loads the admin row via the authed client, falling back to the service role
 *   (RLS-safe). Redirects to /auth/error if the user has no admin record.
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  let { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).maybeSingle()

  if (!admin) {
    admin = await getAdminByUserIdServiceRole(user.id)
    if (!admin) {
      redirect("/auth/error")
    }
  }

  return { user, admin, supabase }
}

/** Guard that also enforces super_admin, bouncing others to /dashboard. */
export async function requireSuperAdmin() {
  const ctx = await requireAdmin()
  if (ctx.admin.role !== "super_admin") {
    redirect("/dashboard")
  }
  return ctx
}
