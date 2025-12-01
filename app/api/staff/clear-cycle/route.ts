import { NextResponse } from "next/server"
import { createClient } from "../../../../lib/supabase/server"
import { createServiceClient } from "../../../../lib/supabase/service"

export async function POST(_req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceClient()
    const { data: currentAdmin, error: adminErr } = await service
      .from("admins")
      .select("id, role, status, full_name")
      .eq("id", user.id)
      .maybeSingle()
    if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 })
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: updErr } = await service
      .from("staff")
      .update({ payment_status: "pending" })
      .eq("employment_status", "active")
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "salary_cycle_cleared",
      entity_type: "staff",
      details: { scope: "active_staff", cleared_to: "pending" },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}