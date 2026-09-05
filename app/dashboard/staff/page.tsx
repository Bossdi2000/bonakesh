import StaffContent from "@/components/dashboard/staff-content"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function StaffPage() {
  const { user, admin, supabase } = await requireSuperAdmin()

  const { data: staff } = await supabase.from("staff").select("*").order("created_at", { ascending: false })

  return <StaffContent admin={admin} staff={staff || []} user={user} />
}
