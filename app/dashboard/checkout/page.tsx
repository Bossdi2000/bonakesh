import { createServiceClient } from "@/lib/supabase/service"
import CheckoutContent from "@/components/dashboard/checkout-content"
import { requireAdmin } from "@/lib/admins/require-admin"

export default async function CheckoutPage() {
  const { user, admin, supabase } = await requireAdmin()

  // Products + shops are independent — fetch in parallel.
  const service = createServiceClient()
  const [productsRes, shopsRes] = await Promise.all([
    supabase.from("products").select("*").gt("quantity", 0).order("name"),
    service.from("shops").select("id,name").order("name"),
  ])

  return (
    <CheckoutContent
      admin={admin}
      products={productsRes.data || []}
      user={user}
      shops={shopsRes.data || []}
    />
  )
}
