import { createServiceClient } from "@/lib/supabase/service"
import ProductsContent from "@/components/dashboard/products-content"
import { requireSuperAdmin } from "@/lib/admins/require-admin"

export default async function ProductsPage() {
  const { user, admin } = await requireSuperAdmin()

  // Independent queries — run concurrently.
  const service = createServiceClient()
  const [productsRes, shopsRes] = await Promise.all([
    service.from("products").select("*").order("created_at", { ascending: false }),
    service.from("shops").select("id,name").order("name"),
  ])

  return (
    <ProductsContent
      admin={admin}
      products={productsRes.data || []}
      user={user}
      shops={shopsRes.data || []}
    />
  )
}
