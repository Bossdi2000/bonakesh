import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { generateCodes } from "@/lib/admins/codes"

// Regenerates a full set of 5 fresh codes for a store-manager account.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabaseServer = await createServerClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceClient()
    const { data: currentAdmin } = await service
      .from("admins")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle()
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: target } = await service
      .from("admins")
      .select("id, role")
      .eq("id", id)
      .maybeSingle()
    if (!target) return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    if (target.role === "super_admin") {
      return NextResponse.json({ error: "Super admins do not use token codes" }, { status: 400 })
    }

    // Remove old unused codes, then insert 5 fresh ones.
    const codes = generateCodes(5)
    const { error: delErr } = await service.from("admin_token_codes").delete().eq("admin_id", id)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    const { error: insErr } = await service.from("admin_token_codes").insert(
      codes.map((code) => ({ admin_id: id, code })),
    )
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "admin_codes_regenerated",
      entity_type: "admin",
      entity_id: id,
      details: { count: codes.length },
    })

    return NextResponse.json({ ok: true, tokenCodes: codes })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
