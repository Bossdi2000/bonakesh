import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import ShopsContent from "@/components/dashboard/shops-content"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"

export default async function ShopsPage() {
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

  const service = createServiceClient()
  const { data: shops } = await service.from("shops").select("*").order("created_at", { ascending: false })

  return <ShopsContent admin={admin} shops={shops || []} user={user} />
}
