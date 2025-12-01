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
    if (!currentAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (!["super_admin", "store_manager"].includes(currentAdmin.role as string)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const items: Array<{ product_id: string; quantity: number; price_per_unit: number }> = body?.items || []
    const paymentMethod: string = String(body?.paymentMethod || "cash")
    const customer: { name?: string; address?: string; phone?: string } = body?.customer || {}

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Validate items and stock
    const productIds = Array.from(new Set(items.map((it) => it.product_id)))
    const { data: products, error: prodErr } = await service
      .from("products")
      .select("id,name,quantity,selling_price")
      .in("id", productIds)
    if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 })

    const productMap = new Map<string, any>()
    for (const p of products || []) productMap.set(p.id as string, p)

    let totalAmount = 0
    for (const it of items) {
      const p = productMap.get(it.product_id)
      if (!p) return NextResponse.json({ error: `Product not found: ${it.product_id}` }, { status: 404 })
      if (it.quantity <= 0) return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
      if (p.quantity < it.quantity) return NextResponse.json({ error: `Insufficient stock for ${p.name}` }, { status: 400 })
      const unitPrice = Number(it.price_per_unit || p.selling_price)
      totalAmount += unitPrice * it.quantity
    }

    // Create transaction
    const { data: transaction, error: txErr } = await service
      .from("transactions")
      .insert({
        admin_id: user.id,
        total_amount: totalAmount,
        payment_method: paymentMethod,
      })
      .select()
      .maybeSingle()
    if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })
    if (!transaction) return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })

    // Insert items and update stock
    const itemsToInsert = items.map((it) => {
      const unitPrice = Number(it.price_per_unit || productMap.get(it.product_id)?.selling_price || 0)
      return {
        transaction_id: transaction.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price_per_unit: unitPrice,
        total_price: unitPrice * it.quantity,
      }
    })

    const { error: itemsErr } = await service.from("transaction_items").insert(itemsToInsert)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

    // Update product quantities
    for (const it of items) {
      const p = productMap.get(it.product_id)
      const newQty = Number(p.quantity) - Number(it.quantity)
      const { error: updErr } = await service.from("products").update({ quantity: newQty }).eq("id", it.product_id)
      if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    // Verify totals integrity
    const { data: sumRows, error: sumErr } = await service
      .from("transaction_items")
      .select("total_price")
      .eq("transaction_id", transaction.id)
    if (sumErr) return NextResponse.json({ error: sumErr.message }, { status: 500 })
    const computedSum = (sumRows || []).reduce((acc: number, r: any) => acc + Number(r.total_price || 0), 0)
    if (Math.round(computedSum) !== Math.round(totalAmount)) {
      await service.from("transaction_items").delete().eq("transaction_id", transaction.id)
      await service.from("transactions").delete().eq("id", transaction.id)
      return NextResponse.json({ error: "Transaction total mismatch" }, { status: 500 })
    }

    // Activity log with price overrides if any
    const overrides: any[] = []
    for (const it of items) {
      const p = productMap.get(it.product_id)
      const unitPrice = Number(it.price_per_unit || p?.selling_price || 0)
      if (p && Number(p.selling_price) !== unitPrice) {
        overrides.push({ product_id: it.product_id, name: p.name, original: Number(p.selling_price), overridden: unitPrice, quantity: it.quantity })
      }
    }

    await service.from("activity_log").insert({
      admin_id: user.id,
      action_type: "transaction_completed",
      entity_type: "transaction",
      entity_id: transaction.id,
      details: {
        total_amount: totalAmount,
        items_count: items.length,
        payment_method: paymentMethod,
        customer_name: customer?.name,
        customer_address: customer?.address,
        customer_phone: customer?.phone,
        price_overrides: overrides,
      },
    })

    return NextResponse.json({ ok: true, transaction_id: transaction.id })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 })
  }
}