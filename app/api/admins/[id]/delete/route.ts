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

    if (id === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Reassign foreign key references to the acting super admin to satisfy FK constraints
    // Products.created_by → user.id
    const { error: prodReassignErr } = await service
      .from("products")
      .update({ created_by: user.id })
      .eq("created_by", id)
    if (prodReassignErr) return NextResponse.json({ error: prodReassignErr.message }, { status: 500 })

    // Transactions.admin_id → user.id
    const { error: txReassignErr } = await service
      .from("transactions")
      .update({ admin_id: user.id })
      .eq("admin_id", id)
    if (txReassignErr) return NextResponse.json({ error: txReassignErr.message }, { status: 500 })

    // Activity log admin_id → user.id (preserve logs while freeing FK)
    const { error: logReassignErr } = await service
      .from("activity_log")
      .update({ admin_id: user.id })
      .eq("admin_id", id)
    if (logReassignErr) return NextResponse.json({ error: logReassignErr.message }, { status: 500 })

    // use service client for privileged delete
    const { error } = await service.auth.admin.deleteUser(id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "admin_deleted",
      entity_type: "admin",
      entity_id: id,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
