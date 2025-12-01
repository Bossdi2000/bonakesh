import { NextResponse } from "next/server"
import { createClient } from "../../../../../lib/supabase/server"
import { createServiceClient } from "../../../../../lib/supabase/service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const update: Record<string, any> = {}
    if (body?.full_name !== undefined) update.full_name = String(body.full_name).trim()
    if (body?.job_title !== undefined) update.job_title = String(body.job_title).trim()
    if (body?.monthly_salary !== undefined) {
      const ms = Number(body.monthly_salary)
      if (!Number.isFinite(ms) || ms <= 0) return NextResponse.json({ error: "Invalid salary" }, { status: 400 })
      update.monthly_salary = ms
    }
    if (body?.employment_status !== undefined) update.employment_status = String(body.employment_status)

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const { error: updErr } = await service.from("staff").update(update).eq("id", id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "staff_updated",
      entity_type: "staff",
      entity_id: id,
      details: update,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}