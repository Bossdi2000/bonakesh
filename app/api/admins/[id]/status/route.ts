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
    const { data: currentAdmin, error: roleError } = await service
      .from("admins")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
    if (roleError) return NextResponse.json({ error: roleError.message }, { status: 500 })
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { status } = body || {}
    if (!status || !["active", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    
    // use service client for privileged update
    const { error } = await service.from("admins").update({ status }).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "admin_status_changed",
      entity_type: "admin",
      entity_id: id,
      details: { status },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}