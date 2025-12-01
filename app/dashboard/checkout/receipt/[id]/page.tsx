import { createServiceClient } from "../../../../../lib/supabase/service"
import Receipt from "../../../../../components/dashboard/receipt"

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const service = createServiceClient()
  const id = params.id

  const { data: transaction, error: txErr } = await service
    .from("transactions")
    .select("id, total_amount, payment_method, created_at, admin_id")
    .eq("id", id)
    .maybeSingle()
  if (txErr || !transaction) return <div className="p-6 text-red-500">Failed to load receipt</div>

  const { data: items, error: itemsErr } = await service
    .from("transaction_items")
    .select("product_id, quantity, price_per_unit, total_price, products(name)")
    .eq("transaction_id", id)
  if (itemsErr) return <div className="p-6 text-red-500">Failed to load items</div>

  const { data: admin, error: adminErr } = await service
    .from("admins")
    .select("id, full_name")
    .eq("id", transaction.admin_id)
    .maybeSingle()
  if (adminErr) return <div className="p-6 text-red-500">Failed to load admin</div>
  const tx = { ...transaction, transaction_date: transaction.created_at }
  const formattedItems = (items || []).map((it: any) => ({
    name: it.products?.name || "",
    quantity: it.quantity,
    price_per_unit: it.price_per_unit,
    total_price: it.total_price,
  }))
  return <Receipt transaction={tx as any} items={formattedItems as any[]} admin={admin as any} user={null as any} />
}