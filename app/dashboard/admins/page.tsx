import AdminManagementContent from "@/components/dashboard/admin-management-content"
import { getAllAdminsServiceRole } from "@/lib/admins/get-all"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function AdminsPage() {
  const { user, admin, supabase } = await requireSuperAdmin()

  let { data: admins } = await supabase
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false })

  if (!admins || admins.length === 0) {
    admins = await getAllAdminsServiceRole()
  }

  return <AdminManagementContent currentAdmin={admin} admins={admins || []} user={user} />
}
