import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminManagementContent from "@/components/dashboard/admin-management-content"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"
import { getAllAdminsServiceRole } from "@/lib/admins/get-all"

export default async function AdminsPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login")
  }

  let { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (!admin) {
    admin = await getAdminByUserIdServiceRole(user.id)
  }

  if (!admin || admin.role !== "super_admin") {
    redirect("/dashboard")
  }

  let { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (!admins || admins.length === 0) {
    admins = await getAllAdminsServiceRole()
  }

  return <AdminManagementContent currentAdmin={admin} admins={admins || []} user={user} />
}