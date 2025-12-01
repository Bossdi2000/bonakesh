"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CartItem = { product_id: string; name: string; price_per_unit: number; quantity: number; total_price: number }

export default function CheckoutLiveView({ adminId }: { adminId: string }) {
  const supabase = createClient()
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [adminName, setAdminName] = useState("")
  const [customer, setCustomer] = useState<{ name?: string; address?: string; phone?: string }>({})

  useEffect(() => {
    if (!adminId) return
    const channel = supabase.channel(`checkout:${adminId}`)
    channel.on("broadcast", { event: "cart:update" }, (payload: any) => {
      const data = payload.payload || {}
      setCart(data.cart || [])
      setTotal(data.totalAmount || 0)
      setPaymentMethod(data.paymentMethod || "cash")
      setAdminName(data.admin?.name || "")
      setCustomer(data.customer || {})
    })
    channel.subscribe()
    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  }, [adminId])

  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Live Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-slate-400 text-sm">
                      {item.quantity} × ₦{item.price_per_unit?.toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">₦{item.total_price?.toLocaleString("en-NG")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">Waiting for items…</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-slate-300">
            <span>Items:</span>
            <span>{cart.length}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Total:</span>
            <span className="text-lg font-bold text-green-500">₦{total.toLocaleString("en-NG")}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Payment Method:</span>
            <span className="uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Admin:</span>
            <span>{adminName || "-"}</span>
          </div>
          {(customer?.name || customer?.address || customer?.phone) && (
            <div className="mt-3 space-y-1 text-slate-300">
              <div className="flex justify-between"><span>Customer:</span><span>{customer?.name || "-"}</span></div>
              <div className="flex justify-between"><span>Phone:</span><span>{customer?.phone || "-"}</span></div>
              <div><span className="text-slate-300">Address:</span><div className="text-slate-400">{customer?.address || "-"}</div></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}