"use client"

import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShopDetails({ admin, user, shop, products }: any) {
  const totalProducts = products.length
  const totalValue = products.reduce((acc: number, p: any) => acc + Number(p.selling_price || 0) * Number(p.quantity || 0), 0)

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">{shop.name}</h2>
          <p className="text-neutral-600 dark:text-white/70">{shop.address || "No address"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#7a1632] dark:text-white">₦{totalValue.toLocaleString("en-NG")}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Recent Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.slice(0, 10).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div className="text-neutral-900 dark:text-white">{p.name}</div>
                    <div className="text-neutral-600 dark:text-white/70">Qty {p.quantity}</div>
                  </div>
                ))}
                {!products.length && <div className="text-neutral-600 dark:text-white/70">No items yet</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Shop Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-neutral-700 dark:text-white/80">
                <div>Name: {shop.name}</div>
                <div>Address: {shop.address || "-"}</div>
                <div>Phone: {shop.contact_phone || "-"}</div>
                <div>Email: {shop.contact_email || "-"}</div>
                <div>Status: {shop.status || "active"}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
