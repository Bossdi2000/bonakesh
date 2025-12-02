"use client"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CartItem = { product_id: string; name: string; price_per_unit: number; quantity: number; total_price: number }

export default function CheckoutLiveView({ adminId }: { adminId: string }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [adminName, setAdminName] = useState("")
  const [customer, setCustomer] = useState<{ name?: string; address?: string; phone?: string }>({})
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!adminId) return
    let channel: any = null
    try {
      const supabase = createClient()
      channel = supabase.channel(`checkout:${adminId}`)
      channel.on("broadcast", { event: "cart:update" }, (payload: any) => {
        const data = payload.payload || {}
        setCart(data.cart || [])
        setTotal(data.totalAmount || 0)
        setPaymentMethod(data.paymentMethod || "cash")
        setAdminName(data.admin?.name || "")
        setCustomer(data.customer || {})
      })
      channel.subscribe()
      channelRef.current = channel
    } catch {
      // ignore client creation errors during SSR/prerender
    }
    return () => {
      try {
        channelRef.current?.unsubscribe()
      } catch {}
      channelRef.current = null
    }
  }, [adminId])

  return (
    <div className="space-y-6">
      <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-white">Live Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length > 0 ? (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between p-3 bg-[#7a1632]/5 dark:bg-white/5 rounded-lg">
                  <div>
                    <p className="text-neutral-900 dark:text-white font-medium">{item.name}</p>
                    <p className="text-neutral-600 dark:text-white/70 text-sm">
                      {item.quantity} × ₦{item.price_per_unit?.toLocaleString("en-NG")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-900 dark:text-white font-semibold">₦{item.total_price?.toLocaleString("en-NG")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600 dark:text-white/70">Waiting for items…</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-white">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-neutral-700 dark:text-white/80">
            <span>Items:</span>
            <span>{cart.length}</span>
          </div>
          <div className="flex justify-between text-neutral-700 dark:text-white/80">
            <span>Total:</span>
            <span className="text-lg font-bold text-[#7a1632] dark:text-white">₦{total.toLocaleString("en-NG")}</span>
          </div>
          <div className="flex justify-between text-neutral-700 dark:text-white/80">
            <span>Payment Method:</span>
            <span className="uppercase">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-neutral-700 dark:text-white/80">
            <span>Admin:</span>
            <span>{adminName || "-"}</span>
          </div>
          {(customer?.name || customer?.address || customer?.phone) && (
            <div className="mt-3 space-y-1 text-neutral-700 dark:text-white/80">
              <div className="flex justify-between"><span>Customer:</span><span>{customer?.name || "-"}</span></div>
              <div className="flex justify-between"><span>Phone:</span><span>{customer?.phone || "-"}</span></div>
              <div><span>Address:</span><div className="text-neutral-600 dark:text-white/70">{customer?.address || "-"}</div></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
