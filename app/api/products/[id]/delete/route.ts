import { NextResponse } from "next/server"
import { createClient } from "../../../../../lib/supabase/server"
import { createServiceClient } from "../../../../../lib/supabase/service"

export async function POST(
  _req: Request,
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

    const { error: delErr } = await service.from("products").delete().eq("id", id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "product_deleted",
      entity_type: "product",
      entity_id: id,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}