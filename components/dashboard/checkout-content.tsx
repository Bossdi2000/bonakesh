"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import DashboardLayout from "./dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Printer, CheckCircle } from "lucide-react"
import Receipt from "./receipt"
import { snackbar } from "@/lib/ui/snackbar"

interface CartItem {
  product_id: string
  name: string
  price_per_unit: number
  quantity: number
  total_price: number
}

export default function CheckoutContent({ admin, products, user, shops = [] }: any) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isLoading, setIsLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [receiptItems, setReceiptItems] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [scanInput, setScanInput] = useState("")
  const [holdsOpen, setHoldsOpen] = useState(false)
  const [holds, setHolds] = useState<any[]>([])
  const [shopFilter, setShopFilter] = useState<string>("")
  const [sortByLocation, setSortByLocation] = useState<boolean>(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [selectedVariantShopId, setSelectedVariantShopId] = useState<string>("")
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const channelRef = useRef<any>(null)

  // Total amount must be declared before effects that depend on it
  const totalAmount = cart.reduce((sum, item) => sum + item.total_price, 0)

  // Setup live broadcast channel for customer view
  useEffect(() => {
    if (!admin?.id) return
    const channel = supabase.channel(`checkout:${admin.id}`)
    channel.subscribe()
    channelRef.current = channel
    return () => {
      try {
        channel.unsubscribe()
      } catch {}
    }
  }, [admin?.id])

  // Broadcast cart changes
  useEffect(() => {
    if (!channelRef.current) return
    channelRef.current.send({
      type: "broadcast",
      event: "cart:update",
      payload: {
        cart,
        totalAmount,
        paymentMethod,
        admin: { id: admin?.id, name: admin?.full_name },
        customer: { name: customerName, address: customerAddress, phone: customerPhone },
      },
    })
  }, [cart, totalAmount, paymentMethod, customerName, customerAddress, customerPhone])

  useEffect(() => {
    const base = products.find((p: any) => String(p.id) === String(selectedProductId))
    if (base) {
      setSelectedVariantId(String(base.id))
      setSelectedVariantShopId(String(base.shop_id || ""))
    } else {
      setSelectedVariantId("")
      setSelectedVariantShopId("")
    }
  }, [selectedProductId, products])

  const handleAddToCart = () => {
    const targetId = selectedVariantId || selectedProductId
    if (!targetId || !quantity || Number.parseInt(quantity) <= 0) {
      snackbar.error("Select a product and valid quantity")
      return
    }
    if (selectedVariantShopId && !selectedVariantId) {
      snackbar.error("Product not available in selected location")
      return
    }

    const product = products.find((p: any) => String(p.id) === String(targetId))
    if (!product) return

    const qty = Number.parseInt(quantity)
    if (qty > product.quantity) {
      snackbar.error("Insufficient stock available")
      return
    }

    const existingItem = cart.find((item) => item.product_id === targetId)
    if (existingItem) {
      if (existingItem.quantity + qty > product.quantity) {
        snackbar.error("Insufficient stock available")
        return
      }
      setCart(
        cart.map((item) =>
          item.product_id === targetId
            ? {
              ...item,
              quantity: item.quantity + qty,
              total_price: item.price_per_unit * (item.quantity + qty),
              }
            : item,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          product_id: targetId,
          name: `${product.name}`,
          price_per_unit: product.selling_price,
          quantity: qty,
          total_price: product.selling_price * qty,
        },
      ])
    }

    setSelectedProductId("")
    setSelectedVariantId("")
    setQuantity("1")
    snackbar.success("Added to cart")
  }

  const handleScanEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    const code = scanInput.trim().toLowerCase()
    if (!code) return
    const product = products.find((p: any) => String(p.sku || "").toLowerCase() === code)
    if (!product) {
      snackbar.error("SKU not found")
      return
    }
    setSelectedProductId(String(product.id))
    setSelectedVariantId(String(product.id))
    setSelectedVariantShopId(String(product.shop_id || ""))
    setQuantity("1")
    setScanInput("")
    setTimeout(() => handleAddToCart(), 0)
  }

  const holdKey = (admin?.id ? `checkout_holds:${admin.id}` : "checkout_holds")
  useEffect(() => {
    try {
      const raw = localStorage.getItem(holdKey)
      setHolds(raw ? JSON.parse(raw) : [])
    } catch {}
  }, [holdKey])

  const saveHolds = (next: any[]) => {
    try {
      localStorage.setItem(holdKey, JSON.stringify(next))
      setHolds(next)
    } catch {}
  }

  const handleHoldCart = () => {
    if (cart.length === 0) {
      snackbar.info("Cart is empty")
      return
    }
    const entry = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      cart,
      customer: { name: customerName, address: customerAddress, phone: customerPhone },
      paymentMethod,
      totalAmount,
    }
    const next = [entry, ...holds].slice(0, 20)
    saveHolds(next)
    snackbar.success("Cart held")
    setHoldsOpen(true)
    setCart([])
  }

  const resumeHold = (id: string) => {
    const entry = holds.find((h) => h.id === id)
    if (!entry) return
    setCart(entry.cart)
    setCustomerName(entry.customer?.name || "")
    setCustomerAddress(entry.customer?.address || "")
    setCustomerPhone(entry.customer?.phone || "")
    setPaymentMethod(entry.paymentMethod || "cash")
    snackbar.info("Cart resumed")
    setHoldsOpen(false)
  }

  const deleteHold = (id: string) => {
    const next = holds.filter((h) => h.id !== id)
    saveHolds(next)
  }

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId))
  }

  // moved above for correct hook dependency evaluation

  const handleCompleteCheckout = async () => {
    if (cart.length === 0) {
      snackbar.info("Cart is empty")
      return
    }
    setConfirmOpen(true)
  }

  const executeCheckout = async () => {
    setIsLoading(true)
    try {
      const items = cart.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        price_per_unit: it.price_per_unit,
      }))

      const res = await fetch(`/api/checkout/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items,
          paymentMethod,
          customer: { name: customerName, address: customerAddress, phone: customerPhone },
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.transaction_id) {
        snackbar.error(String(data?.error || "Error completing checkout"))
        setIsLoading(false)
        return
      }

      const { data: txRecord } = await supabase
        .from("transactions")
        .select("id, total_amount, payment_method, created_at")
        .eq("id", data.transaction_id)
        .maybeSingle()

      setLastTransaction(txRecord || { id: data.transaction_id, total_amount: totalAmount, payment_method: paymentMethod, transaction_date: new Date().toISOString() })
      setReceiptItems(cart)
      setShowReceipt(true)
      setCart([])
      router.refresh()
      try {
        const url = `/dashboard/checkout/receipt/${data.transaction_id}?print=1`
        router.prefetch(url)
      } catch {}
      snackbar.success("Sale completed")
    } catch (error) {
      snackbar.error("Error completing checkout")
    } finally {
      setIsLoading(false)
      setConfirmOpen(false)
    }
  }

  const handlePrintReceipt = () => {
    if (lastTransaction?.id) {
      const url = `/dashboard/checkout/receipt/${lastTransaction.id}?print=1`
      router.push(url)
      return
    }
    window.print()
  }

  const getShopName = (productId: string) => {
    const p = products.find((x: any) => x.id === productId)
    const s = shops.find((sh: any) => String(sh.id) === String(p?.shop_id || ""))
    return s?.name || "-"
  }

  if (showReceipt && lastTransaction) {
    return (
      <DashboardLayout admin={admin} user={user}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Transaction Receipt</h1>
            <p className="text-neutral-600 dark:text-white/70 mt-1">Order completed successfully</p>
          </div>

          <Receipt
            ref={receiptRef}
            transaction={lastTransaction}
            items={receiptItems}
            admin={admin}
            user={user}
            customerName={customerName}
            customerAddress={customerAddress}
            customerPhone={customerPhone}
          />

          <div className="flex gap-3 justify-center">
            <Button onClick={handlePrintReceipt} className="bg-[#7a1632] hover:bg-[#66122a] text-white">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={() => {
                setShowReceipt(false)
                setCart([])
              }}
              variant="outline"
              className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
            >
              New Transaction
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="space-y-6">
          <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Checkout</h1>
          <p className="text-neutral-600 dark:text-white/70 mt-1">Process customer sales</p>
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/dashboard/checkout/view?admin=${admin?.id}`, "customer_view", "width=480,height=800")}
              className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
            >
              Open Customer View
            </Button>
            <Button
              variant="outline"
              onClick={() => setHoldsOpen(true)}
              className="ml-2 border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
            >
              View Holds
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Products */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-white">Add Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Product</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, SKU, model, serial"
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white mt-1"
                  />
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <div className="max-h-64 overflow-auto rounded border border-[#7a1632]/30">
                        {getFilteredProducts(products, shops, searchQuery, shopFilter, sortByLocation).slice(0, 50).map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProductId(String(p.id))}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#7a1632]/10 dark:hover:bg-white/10 ${selectedProductId === p.id ? "bg-[#7a1632]/10 dark:bg-white/10" : ""}`}
                          >
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-white">{p.name}</div>
                              <div className="text-xs text-neutral-600 dark:text-white/70">SKU: {p.sku || "-"} • Model: {p.model_number || "-"} • Serial: {p.serial_number || "-"}</div>
                              <div className="mt-1 text-xs"><span className={`inline-block px-2 py-0.5 rounded ${getLocationBadgeClass(p.shop_id, shops)}`}>{getShopName(p.id)}</span></div>
                            </div>
                            <div className="text-sm text-neutral-700 dark:text-white/80">₦{Number(p.selling_price || 0).toLocaleString("en-NG")}</div>
                            <div className="ml-3 text-xs text-neutral-600 dark:text-white/70">{p.quantity} in stock</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-neutral-700 dark:text-white/80">Filter by Location</Label>
                      <Select value={shopFilter} onValueChange={(v) => setShopFilter(v === "__ALL__" ? "" : v)}>
                        <SelectTrigger className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white mt-1">
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1a0d13]">
                          <SelectItem value="__ALL__">All</SelectItem>
                          {shops.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-3">
                        <Label className="text-neutral-700 dark:text-white/80">Sort by Location</Label>
                        <Button variant="outline" size="sm" className="mt-1 border-[#7a1632]/30" onClick={() => setSortByLocation((v) => !v)}>
                          {sortByLocation ? "Location ▾" : "Location ▴"}
                        </Button>
                      </div>
                      <Label className="text-neutral-700 dark:text-white/80">Scan SKU</Label>
                      <Input
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyDown={handleScanEnter}
                        placeholder="Focus and scan barcode/SKU"
                        className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white mt-1"
                      />
                    </div>
                  </div>
                  {selectedProductId && (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-neutral-600 dark:text-white/70">Selected product ready to add</p>
                      <Label className="text-neutral-700 dark:text-white/80">Sell From</Label>
                      <Select
                        value={selectedVariantShopId}
                        onValueChange={(shopId) => {
                          setSelectedVariantShopId(shopId)
                          const vid = findVariantInShop(selectedProductId, products, shopId)
                          if (vid) {
                            setSelectedVariantId(vid)
                          } else {
                            setSelectedVariantId("")
                            snackbar.error("Product not available at selected location")
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white">
                          <SelectValue placeholder="Choose location" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#1a0d13]">
                          {shops.map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              <span className={`inline-block px-2 py-0.5 rounded ${getLocationBadgeClass(s.id, shops)}`}>{s.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedProductId}
                  className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-white">Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between p-3 bg-[#7a1632]/5 dark:bg-white/5 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-neutral-900 dark:text-white font-medium">{item.name}</p>
                          <p className="text-neutral-600 dark:text-white/70 text-xs">{getShopName(item.product_id)}</p>
                          <p className="text-neutral-600 dark:text-white/70 text-sm">
                            {item.quantity} x ₦{item.price_per_unit.toLocaleString("en-NG")}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Label className="text-neutral-700 dark:text-white/80 text-xs">Override price</Label>
                            <Input
                              type="number"
                              value={item.price_per_unit}
                              onChange={(e) => {
                                const val = Number(e.target.value)
                                setCart((prev) => prev.map((ci) => (
                                  ci.product_id === item.product_id
                                    ? { ...ci, price_per_unit: val, total_price: val * ci.quantity }
                                    : ci
                                )))
                              }}
                              className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white w-28 h-8"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-neutral-900 dark:text-white font-semibold">₦{item.total_price.toLocaleString("en-NG")}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.product_id)}
                            className="border-red-600 text-red-500 hover:bg-red-600/10 mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-600 dark:text-white/70 text-center py-8">Cart is empty</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary & Checkout */}
          <div className="space-y-4">
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader>
                <CardTitle className="text-neutral-900 dark:text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b border-[#7a1632]/30 pb-4">
                  <div className="flex justify-between text-neutral-700 dark:text-white/80">
                    <span>Items:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700 dark:text-white/80">
                    <span>Total Amount:</span>
                    <span className="text-lg font-bold text-[#7a1632] dark:text-white">₦{totalAmount.toLocaleString("en-NG")}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Customer Name</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Address</Label>
                    <Input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Address"
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Phone Number</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30">
                      <SelectItem value="cash" className="text-neutral-900 dark:text-white">
                        Cash
                      </SelectItem>
                      <SelectItem value="transfer" className="text-neutral-900 dark:text-white">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="pos" className="text-neutral-900 dark:text-white">
                        POS
                      </SelectItem>
                      <SelectItem value="card" className="text-neutral-900 dark:text-white">
                        Card
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleHoldCart}
                    disabled={isLoading || cart.length === 0}
                    className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10 w-1/2"
                  >
                    Hold Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHoldsOpen(true)}
                    className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10 w-1/2"
                  >
                    Resume Holds
                  </Button>
                </div>

                <Button
                  onClick={handleCompleteCheckout}
                  disabled={isLoading || cart.length === 0}
                  className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Sale
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={holdsOpen} onOpenChange={setHoldsOpen}>
        <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Held Carts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {holds.length === 0 ? (
              <p className="text-neutral-600 dark:text-white/70">No held carts</p>
            ) : (
              holds.map((h) => (
                <div key={h.id} className="flex items-center justify-between border border-[#7a1632]/30 rounded p-3">
                  <div className="text-sm">
                    <div className="text-neutral-900 dark:text-white font-medium">{h.customer?.name || "Unnamed"}</div>
                    <div className="text-neutral-600 dark:text-white/70">{new Date(h.created_at).toLocaleString()} • {h.cart.length} item(s) • ₦{Number(h.totalAmount||0).toLocaleString("en-NG")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-[#7a1632]/30" onClick={() => resumeHold(h.id)}>Resume</Button>
                    <Button variant="outline" className="border-red-600 text-red-500" onClick={() => deleteHold(h.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Confirm Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border border-[#7a1632]/30 rounded p-3">
              {cart.map((ci) => (
                <div key={ci.product_id} className="flex justify-between text-sm">
                  <span className="text-neutral-700 dark:text-white/80">{ci.name} • {getShopName(ci.product_id)}</span>
                  <span className="text-neutral-900 dark:text-white">{ci.quantity} × ₦{ci.price_per_unit.toLocaleString("en-NG")} = ₦{ci.total_price.toLocaleString("en-NG")}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between">
                <span className="font-medium text-neutral-700 dark:text-white/80">Total</span>
                <span className="font-bold text-[#7a1632] dark:text-white">₦{totalAmount.toLocaleString("en-NG")}</span>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="border-[#7a1632]/30" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button onClick={executeCheckout} disabled={isLoading} className="bg-[#7a1632] hover:bg-[#66122a] text-white">{isLoading ? "Processing..." : "Confirm"}</Button>
            </div>
          </div>
    </DialogContent>
  </Dialog>
  </DashboardLayout>
  )
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim()
}

function score(a: string, b: string) {
  const A = norm(a), B = norm(b)
  if (!A || !B) return 0
  if (A === B) return 100
  if (A.includes(B)) return 80
  if (B.includes(A)) return 80
  let m = 0
  const setA = new Set(A.split(""))
  for (const ch of B.split("")) if (setA.has(ch)) m++
  return Math.round((m / Math.max(A.length, B.length)) * 70)
}

function getFilteredProducts(products: any[], shops: any[], q: string, shopId: string, sortByLocation: boolean) {
  const query = norm(q)
  let res = products
  if (query) {
    res = products
      .map((p) => {
        const fields = [p.name || "", p.sku || "", p.model_number || "", p.serial_number || ""]
        const s = Math.max(...fields.map((f) => score(f, query)))
        return { p, s }
      })
      .filter(({ s }) => s >= 40)
      .sort((a, b) => b.s - a.s)
      .map(({ p }) => p)
  }
  if (shopId) res = res.filter((p) => String(p.shop_id || "") === shopId)
  if (sortByLocation) {
    const idx: Record<string, number> = {}
    shops.forEach((s, i) => (idx[s.id] = i))
    res = res.slice().sort((a, b) => (idx[a.shop_id || ""] ?? 0) - (idx[b.shop_id || ""] ?? 0))
  }
  return res
}

function getLocationBadgeClass(shopId: string, shops: any[]) {
  const s = shops.find((x) => x.id === shopId)
  const name = String(s?.name || "")
  const isWarehouse = /warehouse|storehouse|depot/i.test(name)
  return isWarehouse ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
}

function getVariantOptions(selectedId: string, products: any[]) {
  const base = products.find((p: any) => String(p.id) === String(selectedId))
  if (!base) return []
  const sku = String(base.sku || "").trim()
  const model = String(base.model_number || "").trim()
  const serial = String(base.serial_number || "").trim()
  if (sku) {
    return products.filter((p: any) => String(p.sku || "").trim() === sku)
  }
  const key = `${String(base.name || "").trim()}|${model}`
  return products.filter((p: any) => `${String(p.name || "").trim()}|${String(p.model_number || "").trim()}` === key)
}

function getAvailableShopsForSelected(selectedId: string, products: any[], shops: any[]) {
  const avail = shops.filter((s: any) => !!findVariantInShop(selectedId, products, String(s.id)))
  if (avail.length > 0) return avail
  const baseShopId = String(products.find((p: any) => String(p.id) === String(selectedId))?.shop_id || "")
  return shops.filter((s: any) => String(s.id) === String(baseShopId))
}

function findVariantInShop(selectedId: string, products: any[], shopId: string) {
  const base = products.find((p: any) => String(p.id) === String(selectedId))
  if (!base) return null
  const byShop = products.filter((p: any) => String(p.shop_id || "") === String(shopId || ""))
  const serial = String(base.serial_number || "").trim()
  if (serial) {
    const m = byShop.find((p: any) => String(p.serial_number || "").trim() === serial)
    if (m) return m.id
  }
  const sku = String(base.sku || "").trim()
  if (sku) {
    const m = byShop.find((p: any) => String(p.sku || "").trim() === sku)
    if (m) return m.id
  }
  const nm = String(base.name || "").trim()
  const mdl = String(base.model_number || "").trim()
  const m2 = byShop.find((p: any) => String(p.name || "").trim() === nm && String(p.model_number || "").trim() === mdl)
  if (m2) return m2.id
  const m3 = byShop.find((p: any) => String(p.name || "").trim() === nm)
  return m3 ? m3.id : null
}
