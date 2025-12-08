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
    const name = body?.name ? String(body.name).trim() : undefined
    const sku = body?.sku !== undefined ? String(body.sku).trim() : undefined
    const serial_number = body?.serial_number !== undefined ? String(body.serial_number).trim() : undefined
    const model_number = body?.model_number !== undefined ? String(body.model_number).trim() : undefined
    const shop_id = body?.shop_id !== undefined ? String(body.shop_id).trim() : undefined
    const buying_price = body?.buying_price !== undefined ? Number(body.buying_price) : undefined
    const selling_price = body?.selling_price !== undefined ? Number(body.selling_price) : undefined
    const quantity = body?.quantity !== undefined ? Number(body.quantity) : undefined

    const update: Record<string, any> = {}
    if (name !== undefined) update.name = name
    if (sku !== undefined) update.sku = sku || null
    if (serial_number !== undefined) update.serial_number = serial_number || null
    if (model_number !== undefined) update.model_number = model_number || null
    if (shop_id !== undefined) update.shop_id = shop_id || null
    if (buying_price !== undefined) {
      if (!Number.isFinite(buying_price) || buying_price < 0) return NextResponse.json({ error: "Invalid buying price" }, { status: 400 })
      update.buying_price = buying_price
    }
    if (selling_price !== undefined) {
      if (!Number.isFinite(selling_price) || selling_price < 0) return NextResponse.json({ error: "Invalid selling price" }, { status: 400 })
      update.selling_price = selling_price
    }
    if (quantity !== undefined) {
      if (!Number.isFinite(quantity) || quantity < 0) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
      update.quantity = quantity
    }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })

    if (shop_id !== undefined && shop_id) {
      const { data: shop, error: shopErr } = await service.from("shops").select("id").eq("id", shop_id).maybeSingle()
      if (shopErr) return NextResponse.json({ error: shopErr.message }, { status: 500 })
      if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 })
    }

    if (sku !== undefined && sku) {
      const { data: existingSku, error: skuErr } = await service
        .from("products")
        .select("id")
        .eq("sku", sku)
        .maybeSingle()
      if (skuErr) return NextResponse.json({ error: skuErr.message }, { status: 500 })
      if (existingSku && existingSku.id !== id) return NextResponse.json({ error: "SKU already exists" }, { status: 409 })
    }

    const { error: updErr } = await service.from("products").update(update).eq("id", id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "product_updated",
      entity_type: "product",
      entity_id: id,
      details: update,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}
