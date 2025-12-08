"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "./dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit2, Eye, EyeOff } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import snackbar from "@/lib/ui/snackbar"

export default function ProductsContent({ admin, products, user, shops = [] }: any) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [restockOpen, setRestockOpen] = useState(false)
  const [restockProduct, setRestockProduct] = useState<any | null>(null)
  const [restockQty, setRestockQty] = useState<string>("")
  const [restockError, setRestockError] = useState<string>("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    serial_number: "",
    model_number: "",
    buying_price: "",
    selling_price: "",
    quantity: "",
  })
  const [selectedShopId, setSelectedShopId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const ACCESS_KEY = "marshall-ethel-secret"
  const [hidden, setHidden] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accessKey, setAccessKey] = useState("")
  const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG")}`

  const handleToggle = () => {
    if (!hidden) {
      setHidden(true)
    } else {
      setDialogOpen(true)
    }
  }

  const handleSubmitKey = () => {
    if (accessKey.trim() === ACCESS_KEY) {
      setHidden(false)
      setDialogOpen(false)
      setAccessKey("")
      snackbar.success("Balances visible")
    } else {
      snackbar.error("Invalid access key")
    }
  }

  const handleOpenDialog = (product?: any) => {
    if (product) {
      setEditingId(product.id)
      setFormData({
        name: product.name,
        sku: product.sku || "",
        serial_number: product.serial_number || "",
        model_number: product.model_number || "",
        buying_price: product.buying_price,
        selling_price: product.selling_price,
        quantity: product.quantity,
      })
      setSelectedShopId(product.shop_id || "")
    } else {
      setEditingId(null)
      setFormData({ name: "", sku: "", serial_number: "", model_number: "", buying_price: "", selling_price: "", quantity: "" })
      setSelectedShopId("")
    }
    setOpen(true)
  }

  const handleOpenRestock = (product: any) => {
    setRestockProduct(product)
    setRestockQty("")
    setRestockError("")
    setRestockOpen(true)
  }

  const handleConfirmRestock = async () => {
    if (!restockProduct) return
    const addQty = Number.parseInt(restockQty || "0")
    if (!addQty || addQty <= 0) {
      snackbar.error("Enter a valid quantity to add")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/products/${restockProduct.id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ addQty }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Restock failed (${res.status})`)
      snackbar.success("Stock increased")
      setRestockOpen(false)
      setRestockProduct(null)
      setRestockQty("")
      setRestockError("")
      router.refresh()
    } catch (e) {
      console.error(e)
      const msg = typeof e === "object" && e && "message" in (e as any) ? (e as any).message : "Failed to restock"
      snackbar.error(msg)
      setRestockError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.buying_price || !formData.selling_price || !formData.quantity || !selectedShopId) {
      snackbar.error("Please fill all product fields")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        name: formData.name,
        sku: String((formData as any).sku || "").trim(),
        serial_number: String((formData as any).serial_number || "").trim(),
        model_number: String((formData as any).model_number || "").trim(),
        buying_price: Number.parseFloat(formData.buying_price),
        selling_price: Number.parseFloat(formData.selling_price),
        quantity: Number.parseInt(formData.quantity),
        shop_id: selectedShopId,
      }
      let res: Response
      if (editingId) {
        res = await fetch(`/api/products/${editingId}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || `Update failed (${res.status})`)
        }
        snackbar.success("Product updated successfully")
      } else {
        res = await fetch(`/api/products/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || `Create failed (${res.status})`)
        }
        snackbar.success("Product added successfully")
      }

      setOpen(false)
      setFormData({ name: "", sku: "", serial_number: "", model_number: "", buying_price: "", selling_price: "", quantity: "" })
      setSelectedShopId("")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      const msg =
        typeof error === "object" && error && "message" in (error as any)
          ? (error as any).message
          : "Failed to save product"
      snackbar.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/products/${id}/delete`, { method: "POST", credentials: "include" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Delete failed (${res.status})`)
      }
      router.refresh()
      snackbar.success("Product deleted")
    } catch (error) {
      console.error("Error deleting product:", error)
      const msg =
        typeof error === "object" && error && "message" in (error as any)
          ? (error as any).message
          : "Failed to delete product"
      snackbar.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalBoughtValue = products.reduce((acc: number, p: any) => acc + p.buying_price * p.quantity, 0)
  const totalSellingValue = products.reduce((acc: number, p: any) => acc + p.selling_price * p.quantity, 0)
  const expectedProfit = totalSellingValue - totalBoughtValue

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Stock Management</h1>
            <p className="text-neutral-600 dark:text-white/70 mt-1">Manage products and inventory</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-[#7a1632] hover:bg-[#66122a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-white">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-white/70">
                  {editingId ? "Update product details" : "Create a new product"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Product Name</Label>
                  <Input
                    placeholder="e.g., Refrigerator XL"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">SKU</Label>
                  <Input
                    placeholder="e.g., RF-XL-001"
                    value={(formData as any).sku || ""}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Serial Number</Label>
                    <Input
                      placeholder="e.g., SN-12345ABC"
                      value={(formData as any).serial_number || ""}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Model Number</Label>
                    <Input
                      placeholder="e.g., MD-XL-2000"
                      value={(formData as any).model_number || ""}
                      onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                </div>
                {/* Computed Previews */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#7a1632]/5 dark:bg-white/5 p-4 rounded-lg">
                  <div>
                    <p className="text-neutral-600 dark:text-white/70 text-sm">Total Bought Value</p>
                    <p className="text-neutral-900 dark:text-white text-lg font-semibold">
                      {hidden
                        ? "₦••••"
                        : formatCurrency(
                            (Number.parseFloat(String(formData.buying_price)) || 0) *
                              (Number.parseInt(String(formData.quantity)) || 0),
                          )}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-600 dark:text-white/70 text-sm">Total Selling Value</p>
                    <p className="text-neutral-900 dark:text-white text-lg font-semibold">
                      {hidden
                        ? "₦••••"
                        : formatCurrency(
                            (Number.parseFloat(String(formData.selling_price)) || 0) *
                              (Number.parseInt(String(formData.quantity)) || 0),
                          )}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-600 dark:text-white/70 text-sm">Expected Profit</p>
                    <p className={`text-lg font-semibold ${((Number.parseFloat(String(formData.selling_price)) || 0) - (Number.parseFloat(String(formData.buying_price)) || 0)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {hidden
                        ? "₦••••"
                        : formatCurrency(
                            ((Number.parseFloat(String(formData.selling_price)) || 0) -
                              (Number.parseFloat(String(formData.buying_price)) || 0)) *
                              (Number.parseInt(String(formData.quantity)) || 0),
                          )}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Shop</Label>
                    <Select value={selectedShopId} onValueChange={setSelectedShopId}>
                      <SelectTrigger className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white">
                        <SelectValue placeholder="Select shop" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#1a0d13]">
                        {shops.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Buying Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.buying_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buying_price: e.target.value,
                        })
                      }
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-neutral-700 dark:text-white/80">Selling Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.selling_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selling_price: e.target.value,
                        })
                      }
                      className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Quantity</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <Button
                  onClick={handleSaveProduct}
                  disabled={isLoading}
                  className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white"
                >
                  {isLoading ? "Saving..." : editingId ? "Update Product" : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={handleToggle} className="text-[#7a1632] dark:text-white">
            {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardContent className="p-6">
              <p className="text-neutral-600 dark:text-white/70 text-sm mb-1">Total Products</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{products.length}</p>
            </CardContent>
          </Card>
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardContent className="p-6">
              <p className="text-neutral-600 dark:text-white/70 text-sm mb-1">Total Bought Value</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{hidden ? "₦••••" : formatCurrency(totalBoughtValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardContent className="p-6">
              <p className="text-neutral-600 dark:text-white/70 text-sm mb-1">Expected Profit</p>
              <p className={`text-3xl font-bold ${expectedProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {hidden ? "₦••••" : formatCurrency(expectedProfit)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div>
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
          />
        </div>

        {/* Products Table */}
        <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-white">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#7a1632]/30">
                    <th className="text-left py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Name</th>
                    <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Buy Price</th>
                    <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Sell Price</th>
                    <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Qty</th>
                    <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Stock Value</th>
                    <th className="text-right py-3 px-4 text-neutral-700 dark:text-white/80 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product: any) => (
                      <tr
                        key={product.id}
                        className="border-b border-[#7a1632]/30 hover:bg-[#7a1632]/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-neutral-900 dark:text-white">{product.name}</td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">
                          {hidden ? "₦••••" : formatCurrency(product.buying_price)}
                        </td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">
                          {hidden ? "₦••••" : formatCurrency(product.selling_price)}
                        </td>
                        <td className="text-right py-3 px-4 text-neutral-700 dark:text-white/80">{product.quantity}</td>
                        <td className="text-right py-3 px-4 text-green-500 font-semibold">
                          {hidden ? "₦••••" : formatCurrency(product.selling_price * product.quantity)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex justify-end gap-2">
                            {/* Restock */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenRestock(product)}
                              className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
                            >
                              + Restock
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(product)}
                              className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDeleteId(product.id)
                                setDeleteOpen(true)
                              }}
                              disabled={isLoading}
                              className="border-red-600 text-red-500 hover:bg-red-600/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-600 dark:text-white/70">
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Restock Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Access Key</DialogTitle>
            <DialogDescription>Enter the access key to show balances</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input type="password" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} placeholder="Access key" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitKey}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <RestockDialog
        open={restockOpen}
        onOpenChange={setRestockOpen}
        qty={restockQty}
        setQty={setRestockQty}
        product={restockProduct}
        onConfirm={handleConfirmRestock}
        loading={isLoading}
        error={restockError}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 dark:text-white/70">
              This action cannot be undone. This will permanently remove the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)} className="border-[#7a1632]/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return
                await handleDeleteProduct(deleteId)
                setDeleteOpen(false)
                setDeleteId(null)
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

// Restock Modal
export function RestockDialog({ open, onOpenChange, qty, setQty, product, onConfirm, loading, error }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-neutral-900 dark:text-white">Restock Product</DialogTitle>
          <DialogDescription className="text-neutral-600 dark:text-white/70">
            Add quantity to <span className="font-medium text-neutral-900 dark:text-white">{product?.name || "Selected Product"}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-neutral-700 dark:text-white/80">Quantity to Add</Label>
            <Input
              type="number"
              min={1}
              placeholder="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" className="border-[#7a1632]/30" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onConfirm} disabled={loading} className="bg-[#7a1632] hover:bg-[#66122a] text-white">
              {loading ? "Restocking..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
