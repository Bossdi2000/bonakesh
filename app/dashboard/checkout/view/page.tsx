import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CheckoutLiveView from "@/components/dashboard/checkout-live-view"
import DashboardLayout from "@/components/dashboard/dashboard-layout"

export default async function CheckoutViewPage({ searchParams }: { searchParams: { admin?: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: admin } = await supabase.from("admins").select("*").eq("id", user.id).single()
  // Allow viewing even if not admin record, but layout needs minimal props
  const adminObj = admin || { id: user.id, full_name: user.email }
  const targetAdminId = searchParams.admin || adminObj.id

  return (
    <DashboardLayout user={user} admin={adminObj} title="Customer View" description="Live Checkout">
      <CheckoutLiveView adminId={targetAdminId} />
    </DashboardLayout>
  )
}