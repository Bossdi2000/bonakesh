import { createServiceClient } from "@/lib/supabase/service"
import ShopsContent from "@/components/dashboard/shops-content"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function ShopsPage() {
  const { user, admin } = await requireSuperAdmin()

  const service = createServiceClient()
  const { data: shops } = await service.from("shops").select("*").order("created_at", { ascending: false })

  return <ShopsContent admin={admin} shops={shops || []} user={user} />
}
