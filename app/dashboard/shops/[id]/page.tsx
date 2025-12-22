import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import ShopDetails from "@/components/dashboard/shop-details"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("Accessing Shop Page ID:", id)
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
  console.log("Fetching shop with service client:", id)
  const { data: shop, error: shopError } = await service.from("shops").select("*").eq("id", id).maybeSingle()
  if (shopError) console.error("Shop fetch error:", shopError)
  if (!shop) {
    console.log("Shop not found, redirecting...")
    redirect("/dashboard/shops")
  }

  const { data: products } = await service.from("products").select("*").eq("shop_id", id).order("created_at", { ascending: false })

  return <ShopDetails admin={admin} user={user} shop={shop} products={products || []} />
}
