import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/service"
import ShopDetails from "@/components/dashboard/shop-details"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { user, admin } = await requireSuperAdmin()

  const service = createServiceClient()
  const { data: shop, error: shopError } = await service.from("shops").select("*").eq("id", id).maybeSingle()
  if (shopError) console.error("Shop fetch error:", shopError)
  if (!shop) {
    redirect("/dashboard/shops")
  }

  const { data: products } = await service
    .from("products")
    .select("*")
    .eq("shop_id", id)
    .order("created_at", { ascending: false })

  const { data: allShops } = await service.from("shops").select("id,name").order("name")

  return (
    <ShopDetails admin={admin} user={user} shop={shop} products={products || []} shops={allShops || []} />
  )
}
