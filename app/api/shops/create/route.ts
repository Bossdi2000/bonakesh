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
    const { data: admin, error: adminErr } = await service
      .from("admins")
      .select("id, role, status, full_name")
      .eq("id", user.id)
      .maybeSingle()
    if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 })
    if (!admin || admin.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const name = String(body?.name || "").trim()
    const address = String(body?.address || "").trim()
    const contact_phone = String(body?.contact_phone || "").trim()
    const contact_email = String(body?.contact_email || "").trim()

    if (!name) return NextResponse.json({ error: "Shop name is required" }, { status: 400 })

    const { data: shop, error: createErr } = await service
      .from("shops")
      .insert({ name, address: address || null, contact_phone: contact_phone || null, contact_email: contact_email || null })
      .select()
      .maybeSingle()
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, shop })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}

