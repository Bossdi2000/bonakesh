import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import StaffContent from "@/components/dashboard/staff-content"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"

export default async function StaffPage() {
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
    if (!admin) {
      redirect("/auth/error")
    }
  }

  if (admin.role !== "super_admin") {
    redirect("/dashboard")
  }

  const { data: staff } = await supabase.from("staff").select("*").order("created_at", { ascending: false })

  return <StaffContent admin={admin} staff={staff || []} user={user} />
}
