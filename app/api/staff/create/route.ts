import { NextResponse } from "next/server"
import { createClient } from "../../../../lib/supabase/server"
import { createServiceClient } from "../../../../lib/supabase/service"

export async function POST(req: Request) {
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

    const body = await req.json()
    const full_name = String(body?.full_name || "").trim()
    const job_title = String(body?.job_title || "").trim()
    const monthly_salary = Number(body?.monthly_salary || 0)
    const employment_status = String(body?.employment_status || "active")

    if (!full_name || !job_title || !Number.isFinite(monthly_salary) || monthly_salary <= 0) {
      return NextResponse.json({ error: "Invalid staff data" }, { status: 400 })
    }

    const { data: inserted, error: insErr } = await service
      .from("staff")
      .insert({
        full_name,
        job_title,
        monthly_salary,
        employment_status,
        payment_status: "pending",
      })
      .select()
      .maybeSingle()
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "staff_created",
      entity_type: "staff",
      entity_id: inserted?.id,
      details: { full_name, job_title, monthly_salary, employment_status },
    })

    return NextResponse.json({ ok: true, staff: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}