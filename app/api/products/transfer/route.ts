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
      .select("id, role, status")
      .eq("id", user.id)
      .maybeSingle()
    if (adminErr) return NextResponse.json({ error: adminErr.message }, { status: 500 })
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const productId = String(body?.productId || "").trim()
    const toShopId = String(body?.toShopId || "").trim()
    const quantity = Number(body?.quantity)

    if (!productId || !toShopId) {
      return NextResponse.json({ error: "Product and destination shop are required" }, { status: 400 })
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json({ error: "Quantity must be greater than zero" }, { status: 400 })
    }

    const { data, error } = await service.rpc("transfer_product", {
      p_product_id: productId,
      p_quantity: quantity,
      p_to_shop_id: toShopId,
      p_admin_id: user.id,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data?.ok) return NextResponse.json({ error: data?.error || "Transfer failed" }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}