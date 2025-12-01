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
    const name = String(body?.name || "").trim()
    const sku = String(body?.sku || "").trim()
    const buying_price = Number(body?.buying_price)
    const selling_price = Number(body?.selling_price)
    const quantity = Number(body?.quantity)
    if (!name || !Number.isFinite(buying_price) || !Number.isFinite(selling_price) || !Number.isFinite(quantity)) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 })
    }
    if (buying_price < 0 || selling_price < 0 || quantity < 0) {
      return NextResponse.json({ error: "Prices and quantity must be non-negative" }, { status: 400 })
    }

    if (sku) {
      const { data: existingSku, error: skuErr } = await service
        .from("products")
        .select("id")
        .eq("sku", sku)
        .maybeSingle()
      if (skuErr) return NextResponse.json({ error: skuErr.message }, { status: 500 })
      if (existingSku) return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }

    const { error: insertErr } = await service.from("products").insert({
      name,
      sku: sku || null,
      buying_price,
      selling_price,
      quantity,
      created_by: user.id,
    })
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "product_created",
      entity_type: "product",
      details: { name, buying_price, selling_price, quantity },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}