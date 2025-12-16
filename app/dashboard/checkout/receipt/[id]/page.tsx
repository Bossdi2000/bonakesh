"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Receipt from "../../../../../components/dashboard/receipt"

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const p = useParams() as any
  const id = String(p?.id || params?.id || "")
  const [transaction, setTransaction] = useState<any | null>(null)
  const [items, setItems] = useState<any[]>([])
  const [admin, setAdmin] = useState<any | null>(null)
  const [customer, setCustomer] = useState<{ name?: string; address?: string; phone?: string } | null>(null)
  const [adminName, setAdminName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError("")
      if (!id) {
        setError("Invalid receipt id")
        setLoading(false)
        return
      }
      for (let i = 0; i < 24 && !cancelled; i++) {
        const { data: tx } = await supabase
          .from("transactions")
          .select("id, total_amount, payment_method, created_at, admin_id")
          .eq("id", id)
          .maybeSingle()
        if (tx) {
          const { data: its } = await supabase
            .from("transaction_items")
            .select("product_id, quantity, price_per_unit, total_price, products(name,model_number,serial_number)")
            .eq("transaction_id", tx.id)
          const { data: ad } = await supabase
            .from("admins")
            .select("id, full_name")
            .eq("id", tx.admin_id)
            .maybeSingle()
          const { data: logs } = await supabase
            .from("activity_log")
            .select("details, entity_id, action_type")
            .eq("entity_id", tx.id)
            .eq("action_type", "transaction_completed")
            .limit(1)
          if (!cancelled) {
            setTransaction({ ...tx, transaction_date: tx.created_at })
            setItems((its || []).map((it: any) => ({
              name: it.products?.name || "",
              quantity: it.quantity,
              price_per_unit: it.price_per_unit,
              total_price: it.total_price,
              serial_no: it.products?.serial_number || "",
              model_no: it.products?.model_number || "",
            })))
            setAdmin(ad || null)
            const log = Array.isArray(logs) && logs.length > 0 ? logs[0] : null
            const det = (log?.details as any) || {}
            setCustomer({
              name: det?.customer_name || "",
              address: det?.customer_address || "",
              phone: det?.customer_phone || "",
            })
            setAdminName(String(det?.admin_name || ""))
            setLoading(false)
          }
          return
        }
        await new Promise((r) => setTimeout(r, 300))
      }
      if (!cancelled) {
        setError("Failed to load receipt")
        setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div className="p-6">Loading receipt...</div>
  if (error || !transaction) return (
    <div className="p-6">
      <div className="text-red-500 mb-3">{error || "Failed to load receipt"}</div>
      <button onClick={() => window.location.reload()} className="px-3 py-2 bg-[#7a1632] text-white rounded">Retry</button>
    </div>
  )
  return (
    <Receipt
      transaction={transaction}
      items={items}
      admin={admin as any}
      user={null as any}
      customerName={customer?.name || ""}
      customerAddress={customer?.address || ""}
      customerPhone={customer?.phone || ""}
      adminName={adminName}
    />
  )
}
