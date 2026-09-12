"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import snackbar from "@/lib/ui/snackbar"

const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG")}`

export default function ShopDetails({ admin, user, shop, products, shops = [] }: any) {
  const router = useRouter()
  const [hidden, setHidden] = useState(false)

  const [transferOpen, setTransferOpen] = useState(false)
  const [transferProduct, setTransferProduct] = useState<any | null>(null)
  const [destShopId, setDestShopId] = useState("")
  const [transferQty, setTransferQty] = useState("")
  const [transferError, setTransferError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const totalProducts = products.length
  const totalUnits = products.reduce((acc: number, p: any) => acc + Number(p.quantity || 0), 0)
  const totalValue = products.reduce((acc: number, p: any) => acc + Number(p.selling_price || 0) * Number(p.quantity || 0), 0)

  const openTransfer = (product: any) => {
    setTransferProduct(product)
    setDestShopId("")
    setTransferQty("")
    setTransferError("")
    setTransferOpen(true)
  }

  const handleTransfer = async () => {
    if (!transferProduct) return
    const qty = Number.parseInt(transferQty || "0", 10)
    if (!destShopId) {
      setTransferError("Select a destination shop")
      return
    }
    if (!qty || qty <= 0) {
      setTransferError("Enter a valid quantity to transfer")
      return
    }
    if (qty > transferProduct.quantity) {
      setTransferError(`Only ${transferProduct.quantity} available in ${shop.name}`)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/products/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: transferProduct.id, toShopId: destShopId, quantity: qty }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Transfer failed")
      snackbar.success(`Transferred ${qty} of "${transferProduct.name}"`)
      setTransferOpen(false)
      setTransferProduct(null)
      setDestShopId("")
      setTransferQty("")
      router.refresh()
    } catch (e) {
      console.error(e)
      const msg = typeof e === "object" && e && "message" in (e as any) ? (e as any).message : "Failed to transfer"
      snackbar.error(msg)
      setTransferError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const destShops = (shops || []).filter((s: any) => s.id !== shop.id)

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/dashboard/shops" className="text-sm text-[#0ea5e9] hover:underline">
              ← Back to shops
            </Link>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{shop.name}</h2>
            <p className="text-neutral-600 dark:text-white/70">{hidden ? "••••••" : (shop.address || "No address")}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setHidden(!hidden)} className="text-[#0ea5e9] dark:text-white">
            {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neutral-900 dark:text-white">{totalProducts}</div>
              <div className="text-sm text-neutral-600 dark:text-white/70">{totalUnits} units in stock</div>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#0ea5e9] dark:text-white">{hidden ? "₦••••" : formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-neutral-700 dark:text-white/80">
              <div>Address: {hidden ? "••••••" : (shop.address || "-")}</div>
              <div>Phone: {hidden ? "••••••" : (shop.contact_phone || "-")}</div>
              <div>Email: {hidden ? "••••••" : (shop.contact_email || "-")}</div>
              <div>Status: {shop.status || "active"}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-[#0ea5e9]/30 ">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-white">Items in {shop.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#0ea5e9]/30">
                      <th className="text-left py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Model</th>
                      <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Qty</th>
                      <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Buy Price</th>
                      <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Sell Price</th>
                      <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Value</th>
                      <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any) => (
                      <tr
                        key={product.id}
                        className="border-b border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-neutral-900 dark:text-white">{product.name}</td>
                        <td className="py-3 px-4 text-neutral-700 dark:text-white/80">
                          {product.model_number || <span className="text-neutral-400 dark:text-white/40">—</span>}
                        </td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">{product.quantity}</td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">
                          {hidden ? "₦••••" : formatCurrency(product.buying_price)}
                        </td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">
                          {hidden ? "₦••••" : formatCurrency(product.selling_price)}
                        </td>
                        <td className="text-right py-3 px-4 text-green-500 font-semibold">
                          {hidden ? "₦••••" : formatCurrency(product.selling_price * product.quantity)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTransfer(product)}
                            disabled={product.quantity <= 0}
                            className="border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"
                          >
                            <ArrowLeftRight className="w-4 h-4 mr-1" />
                            Transfer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-neutral-600 dark:text-white/70">No items in this shop yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="border-[#0ea5e9]/30">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Transfer Item</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-white/70">
              Move stock of{" "}
              <span className="font-medium text-neutral-900 dark:text-white">{transferProduct?.name || "item"}</span>{" "}
              out of <span className="font-medium text-neutral-900 dark:text-white">{shop.name}</span>
              {transferProduct?.quantity != null ? ` (${transferProduct.quantity} available)` : ""} to another shop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-neutral-700 dark:text-white/80">Destination Shop</Label>
              <Select value={destShopId} onValueChange={setDestShopId}>
                <SelectTrigger className="bg-white border-[#0ea5e9]/30 text-neutral-900 dark:bg-[#0a1620] dark:text-white">
                  <SelectValue placeholder="Select destination shop" />
                </SelectTrigger>
                <SelectContent>
                  {destShops.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-neutral-700 dark:text-white/80">Quantity to Transfer</Label>
              <Input
                type="number"
                min={1}
                max={transferProduct?.quantity || 1}
                placeholder="0"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="bg-white border-[#0ea5e9]/30 text-neutral-900 dark:bg-[#0a1620] dark:text-white"
              />
            </div>
            {transferError && <p className="text-red-500 text-sm">{transferError}</p>}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                className="border-[#0ea5e9]/30"
                onClick={() => {
                  setTransferOpen(false)
                  setTransferProduct(null)
                  setTransferError("")
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleTransfer} disabled={isLoading} className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white">
                {isLoading ? "Transferring..." : "Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}