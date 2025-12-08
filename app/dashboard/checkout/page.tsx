import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CheckoutContent from "@/components/dashboard/checkout-content"
import { getAdminByUserIdServiceRole } from "@/lib/admins/server"
import { createServiceClient } from "@/lib/supabase/service"

export default async function CheckoutPage() {
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

  const { data: products } = await supabase.from("products").select("*").gt("quantity", 0).order("name")
  const service = createServiceClient()
  const { data: shops } = await service.from("shops").select("id,name").order("name")

  return <CheckoutContent admin={admin} products={products || []} user={user} shops={shops || []} />
}
