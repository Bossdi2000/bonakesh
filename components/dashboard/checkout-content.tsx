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

export default function CheckoutContent({ admin, products, user }: any) {
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

  const handleAddToCart = () => {
    if (!selectedProductId || !quantity || Number.parseInt(quantity) <= 0) {
      snackbar.error("Select a product and valid quantity")
      return
    }

    const product = products.find((p: any) => p.id === selectedProductId)
    if (!product) return

    const qty = Number.parseInt(quantity)
    if (qty > product.quantity) {
      snackbar.error("Insufficient stock available")
      return
    }

    const existingItem = cart.find((item) => item.product_id === selectedProductId)
    if (existingItem) {
      if (existingItem.quantity + qty > product.quantity) {
        snackbar.error("Insufficient stock available")
        return
      }
      setCart(
        cart.map((item) =>
          item.product_id === selectedProductId
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
          product_id: selectedProductId,
          name: product.name,
          price_per_unit: product.selling_price,
          quantity: qty,
          total_price: product.selling_price * qty,
        },
      ])
    }

    setSelectedProductId("")
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
    setSelectedProductId(product.id)
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
      snackbar.success("Sale completed")
    } catch (error) {
      snackbar.error("Error completing checkout")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "", "width=600,height=800")
      if (printWindow) {
        printWindow.document.write(receiptRef.current.innerHTML)
        printWindow.document.close()
        printWindow.print()
        snackbar.info("Receipt ready to print")
      }
    }
  }

  if (showReceipt && lastTransaction) {
    return (
      <DashboardLayout admin={admin} user={user}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction Receipt</h1>
            <p className="text-slate-400 mt-1">Order completed successfully</p>
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
            <Button onClick={handlePrintReceipt} className="bg-blue-600 hover:bg-blue-700">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={() => {
                setShowReceipt(false)
                setCart([])
              }}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
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
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <p className="text-slate-400 mt-1">Process customer sales</p>
          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/dashboard/checkout/view?admin=${admin?.id}`, "customer_view", "width=480,height=800")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Open Customer View
            </Button>
            <Button
              variant="outline"
              onClick={() => setHoldsOpen(true)}
              className="ml-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              View Holds
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Products */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Add Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Product</Label>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products by name or SKU"
                    className="bg-slate-700 border-slate-600 text-white mt-1"
                  />
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <div className="max-h-64 overflow-auto rounded border border-slate-700">
                        {(searchQuery ? products.filter((p: any) => {
                          const q = searchQuery.trim().toLowerCase()
                          const name = String(p.name || "").toLowerCase()
                          const sku = String(p.sku || "").toLowerCase()
                          return name.includes(q) || sku.includes(q)
                        }) : products).slice(0, 50).map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProductId(p.id)}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-700 ${selectedProductId === p.id ? "bg-slate-700" : ""}`}
                          >
                            <div>
                              <div className="font-medium text-white">{p.name}</div>
                              <div className="text-xs text-slate-400">{p.sku || "No SKU"}</div>
                            </div>
                            <div className="text-sm text-slate-300">₦{Number(p.selling_price || 0).toLocaleString("en-NG")}</div>
                            <div className="ml-3 text-xs text-slate-400">{p.quantity} in stock</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-slate-300">Scan SKU</Label>
                      <Input
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyDown={handleScanEnter}
                        placeholder="Focus and scan barcode/SKU"
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  {selectedProductId && (
                    <p className="mt-2 text-xs text-slate-400">Selected product ready to add</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-300">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isLoading || !selectedProductId}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>

            {/* Cart Items */}
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-slate-400 text-sm">
                            {item.quantity} x ₦{item.price_per_unit.toLocaleString("en-NG")}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Label className="text-slate-300 text-xs">Override price</Label>
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
                              className="bg-slate-700 border-slate-600 text-white w-28 h-8"
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">₦{item.total_price.toLocaleString("en-NG")}</p>
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
                  <p className="text-slate-400 text-center py-8">Cart is empty</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary & Checkout */}
          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-800/50">
              <CardHeader>
                <CardTitle className="text-white">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b border-slate-700 pb-4">
                  <div className="flex justify-between text-slate-300">
                    <span>Items:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Amount:</span>
                    <span className="text-lg font-bold text-green-500">₦{totalAmount.toLocaleString("en-NG")}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Customer Name</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Address</Label>
                    <Input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Address"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Phone Number</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="cash" className="text-white">
                        Cash
                      </SelectItem>
                      <SelectItem value="transfer" className="text-white">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="pos" className="text-white">
                        POS
                      </SelectItem>
                      <SelectItem value="card" className="text-white">
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
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 w-1/2"
                  >
                    Hold Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHoldsOpen(true)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 w-1/2"
                  >
                    Resume Holds
                  </Button>
                </div>

                <Button
                  onClick={handleCompleteCheckout}
                  disabled={isLoading || cart.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
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
        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Held Carts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {holds.length === 0 ? (
              <p className="text-slate-400">No held carts</p>
            ) : (
              holds.map((h) => (
                <div key={h.id} className="flex items-center justify-between border border-slate-700 rounded p-3">
                  <div className="text-sm">
                    <div className="text-white font-medium">{h.customer?.name || "Unnamed"}</div>
                    <div className="text-slate-400">{new Date(h.created_at).toLocaleString()} • {h.cart.length} item(s) • ₦{Number(h.totalAmount||0).toLocaleString("en-NG")}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-600" onClick={() => resumeHold(h.id)}>Resume</Button>
                    <Button variant="outline" className="border-red-600 text-red-500" onClick={() => deleteHold(h.id)}>Delete</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
