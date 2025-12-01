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
    const addQty = Number(body?.addQty)
    if (!Number.isFinite(addQty) || addQty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const { data: product, error: getErr } = await service
      .from("products")
      .select("id, quantity")
      .eq("id", id)
      .maybeSingle()
    if (getErr) return NextResponse.json({ error: getErr.message }, { status: 500 })
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

    const newQty = Number(product.quantity) + addQty
    const { error: updErr } = await service.from("products").update({ quantity: newQty }).eq("id", id)
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "product_restocked",
      entity_type: "product",
      entity_id: id,
      details: { added: addQty, new_quantity: newQty },
    })

    return NextResponse.json({ ok: true, new_quantity: newQty })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}