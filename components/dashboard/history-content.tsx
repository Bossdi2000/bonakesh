"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import Invoice from "./invoice"
import { getReceiptNumber } from "@/lib/receipt-number"
import { Printer, Loader2, LayoutGrid, ShoppingCart, Package, ShieldCheck } from "lucide-react"
import { snackbar } from "@/lib/ui/snackbar"

export default function HistoryContent({ admin, logs: initialLogs, user }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState(initialLogs || [])
  const [isSearching, setIsSearching] = useState(false)
  const [isRemoteResults, setIsRemoteResults] = useState(false)
  const [actionType, setActionType] = useState("all")
  const [adminName, setAdminName] = useState("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [reprintOpen, setReprintOpen] = useState(false)
  const [reprintTransaction, setReprintTransaction] = useState<any | null>(null)
  const [reprintNo, setReprintNo] = useState("")
  const [receiptItems, setReceiptItems] = useState<any[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const [category, setCategory] = useState("all")

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm && category === "all") {
        setLogs(initialLogs || [])
        setIsRemoteResults(false)
        return
      }

      setIsSearching(true)
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.set("q", searchTerm)
        if (category !== "all") params.set("category", category)

        const res = await fetch(`/api/history/search?${params.toString()}`)
        const json = await res.json()
        if (json.data) {
          setLogs(json.data)
          setIsRemoteResults(true)
        }
      } catch (e) {
        console.error(e)
        snackbar.error("Failed to search history")
      } finally {
        setIsSearching(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, category, initialLogs])

  const actionTypes = Array.from(
    new Set<string>((logs || []).map((l: any) => String(l.action_type || "")))
  ).sort()
  const adminNames = Array.from(
    new Set<string>((logs || []).map((l: any) => String(l.admins?.full_name || "Unknown")))
  ).sort()

  const totalCount = (logs || []).length
  const loginSuccessCount = (logs || []).filter((l: any) => l.action_type === "login_success").length
  const loginFailureCount = (logs || []).filter((l: any) => l.action_type === "login_failure").length
  const logoutCount = (logs || []).filter((l: any) => l.action_type === "logout").length

  function getAffectedItem(log: any): string {
    const type = log.entity_type
    const details = log.details || {}
    if (type === "product") {
      return details.name ? `Product: ${details.name}` : log.entity_id ? `Product #${log.entity_id}` : ""
    }
    if (type === "staff") {
      return details.full_name ? `Staff: ${details.full_name}` : log.entity_id ? `Staff #${log.entity_id}` : ""
    }
    if (type === "transaction") {
      const amt = details.total_amount ? `₦${Number(details.total_amount).toLocaleString("en-NG")}` : ""
      const items = details.items_count ? `${details.items_count} item(s)` : ""
      const method = details.payment_method ? `${details.payment_method}` : ""
      const parts = [amt, items, method].filter(Boolean)
      return parts.length ? `Sale: ${parts.join(" • ")}` : log.entity_id ? `Transaction #${log.entity_id}` : ""
    }
    if (type === "admin") {
      return details.full_name ? `Admin: ${details.full_name}` : log.entity_id ? `Admin #${log.entity_id}` : ""
    }
    return ""
  }

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch =
      isRemoteResults ||
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (getAffectedItem(log).toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesType = actionType === "all" || log.action_type === actionType
    const matchesAdmin = adminName === "all" || (log.admins?.full_name || "Unknown") === adminName

    const createdAt = new Date(log.created_at)
    const matchesStart = startDate ? createdAt >= new Date(startDate) : true
    // endDate should include the full day; add 1 day to make inclusive
    const endInclusive = endDate ? new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000) : null
    const matchesEnd = endInclusive ? createdAt < endInclusive : true

    return matchesSearch && matchesType && matchesAdmin && matchesStart && matchesEnd
  })

  const getActionColor = (actionType: string) => {
    if (actionType.includes("delete")) return "bg-red-600"
    if (actionType.includes("create")) return "bg-green-600"
    if (actionType.includes("update") || actionType.includes("changed")) return "bg-yellow-600"
    return "bg-[#0ea5e9]"
  }

  const handleReprint = async (log: any) => {
    if (!log || log.entity_type !== "transaction") return
    setIsLoading(true)
    try {
      const txId = log.entity_id
      const { data: txRecord, error: txErr } = await supabase
        .from("transactions")
        .select("id,total_amount,payment_method,transaction_date")
        .eq("id", txId)
        .maybeSingle()
      if (txErr) throw new Error(txErr.message)

      const { data: items, error: itemsErr } = await supabase
        .from("transaction_items")
        .select("product_id,product_name,quantity,price_per_unit,total_price")
        .eq("transaction_id", txId)
      if (itemsErr) throw new Error(itemsErr.message)

      const productIds = Array.from(new Set((items || []).map((it: any) => it.product_id).filter(Boolean)))
      let namesMap: Record<string, string> = {}
      if (productIds.length > 0) {
        const { data: products, error: prodErr } = await supabase
          .from("products")
          .select("id,name")
          .in("id", productIds)
        if (prodErr) throw new Error(prodErr.message)
        for (const p of products || []) namesMap[p.id as string] = String(p.name || "")
      }

      const withNames = (items || []).map((it: any) => ({
        product_id: it.product_id,
        name: it.product_name || namesMap[it.product_id] || "",
        price_per_unit: Number(it.price_per_unit || 0),
        quantity: Number(it.quantity || 0),
        total_price: Number(it.total_price || 0),
      }))

      setReprintTransaction(txRecord || { id: txId, total_amount: Number(log?.details?.total_amount || 0), payment_method: String(log?.details?.payment_method || "cash"), transaction_date: log?.created_at })
      setReprintNo(await getReceiptNumber(supabase, txId))
      setReceiptItems(withNames)
      setCustomerName(String(log?.details?.customer_name || ""))
      setCustomerAddress(String(log?.details?.customer_address || ""))
      setCustomerPhone(String(log?.details?.customer_phone || ""))
      setReprintOpen(true)
    } catch (e: any) {
      snackbar.error(String(e?.message || "Failed to prepare receipt"))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintReceipt = () => {
    const id = reprintTransaction?.id
    if (id) {
      const url = `/dashboard/checkout/receipt/${id}?print=1`
      router.push(url)
      return
    }
    window.print()
  }

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Activity Log</h1>
          <p className="text-neutral-600 dark:text-white/70 mt-1">Complete history of all system actions</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={category === "all" ? "default" : "outline"}
            onClick={() => setCategory("all")}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            All Activity
          </Button>
          <Button
            variant={category === "checkouts" ? "default" : "outline"}
            onClick={() => setCategory("checkouts")}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Checkouts
          </Button>
          <Button
            variant={category === "inventory" ? "default" : "outline"}
            onClick={() => setCategory("inventory")}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Inventory
          </Button>
          <Button
            variant={category === "auth" ? "default" : "outline"}
            onClick={() => setCategory("auth")}
            className="gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            System & Auth
          </Button>
        </div>

        <Card className="border-[#0ea5e9]/30 ">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-white">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={actionType === "all" ? "default" : "outline"}
                onClick={() => setActionType("all")}
                className={actionType === "all" ? "bg-[#0ea5e9] text-white" : "border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"}
              >
                All ({totalCount})
              </Button>
              <Button
                variant={actionType === "login_success" ? "default" : "outline"}
                onClick={() => setActionType("login_success")}
                className={actionType === "login_success" ? "bg-[#0ea5e9] text-white" : "border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"}
              >
                Logins ({loginSuccessCount})
              </Button>
              <Button
                variant={actionType === "login_failure" ? "default" : "outline"}
                onClick={() => setActionType("login_failure")}
                className={actionType === "login_failure" ? "bg-[#0ea5e9] text-white" : "border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"}
              >
                Failures ({loginFailureCount})
              </Button>
              <Button
                variant={actionType === "logout" ? "default" : "outline"}
                onClick={() => setActionType("logout")}
                className={actionType === "logout" ? "bg-[#0ea5e9] text-white" : "border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"}
              >
                Logouts ({logoutCount})
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Search</Label>
                <Input
                  placeholder="Search actions, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white border-[#0ea5e9]/30 text-neutral-900 dark:bg-[#0a1620] dark:text-white"
                />
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Admin</Label>
                <Select value={adminName} onValueChange={setAdminName}>
                  <SelectTrigger className="bg-white dark:bg-[#0a1620] border-[#0ea5e9]/30 text-neutral-900 dark:text-white">
                    <SelectValue placeholder="All admins" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a1620] border-[#0ea5e9]/30">
                    <SelectItem value="all" className="text-neutral-900 dark:text-white">All</SelectItem>
                    {adminNames.map((n: string) => (
                      <SelectItem key={n} value={n} className="text-neutral-900 dark:text-white">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Action Type</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger className="bg-white dark:bg-[#0a1620] border-[#0ea5e9]/30 text-neutral-900 dark:text-white">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a1620] border-[#0ea5e9]/30">
                    <SelectItem value="all" className="text-neutral-900 dark:text-white">All</SelectItem>
                    {actionTypes.map((t: string) => (
                      <SelectItem key={t} value={t} className="text-neutral-900 dark:text-white">
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border-[#0ea5e9]/30 text-neutral-900 dark:bg-[#0a1620] dark:text-white"
                />
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border-[#0ea5e9]/30 text-neutral-900 dark:bg-[#0a1620] dark:text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {!logs ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-[#0ea5e9]/30 ">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : filteredLogs.length > 0 ? (
            filteredLogs.map((log: any) => (
              <Card key={log.id}
 className="border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 dark:hover:bg-white/5 cursor-pointer"
 onClick={() => {
                  setSelected(log)
                  setOpen(true)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActionColor(log.action_type)}>{log.action_type.replace("_", " ")}</Badge>
                        {Array.isArray(log.grouped) && log.grouped.length > 0 && (
                          <Badge className="bg-[#0ea5e9] text-white">+{log.grouped.length} related</Badge>
                        )}
                        {log.entity_type && <span className="text-xs text-neutral-600 dark:text-white/70">{log.entity_type}</span>}
                      </div>
                      <p className="text-neutral-700 dark:text-white/80 text-sm">by {log.admins?.full_name || "Unknown"}</p>
                      {getAffectedItem(log) && (
                        <p className="text-neutral-600 dark:text-white/70 text-xs mt-1">{getAffectedItem(log)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 dark:text-white/70">{new Date(log.created_at).toLocaleString()}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <a href={`/dashboard/history/${log.id}`} className="text-xs text-[#0ea5e9] underline hover:text-[#0284c7]">Open</a>
                        {log.entity_type === "transaction" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isLoading}
                            onClick={(e) => { e.stopPropagation(); handleReprint(log) }}
                            className="border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"
                          >
                            Reprint
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-[#0ea5e9]/30 ">
              <CardContent className="p-8 text-center">
                <p className="text-neutral-600 dark:text-white/70">No activities found</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="border-[#0ea5e9]/30">
            <DialogHeader>
              <DialogTitle className="text-neutral-900 dark:text-white">Activity Details</DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-white/70">Full information about the selected activity</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-white/70">Action</span>
                  <span className="text-neutral-900 dark:text-white font-medium">{selected.action_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-white/70">Entity</span>
                  <span className="text-neutral-900 dark:text-white">{selected.entity_type || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-white/70">Entity ID</span>
                  <span className="text-neutral-900 dark:text-white">{selected.entity_id || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-white/70">Admin</span>
                  <span className="text-neutral-900 dark:text-white">{selected.admins?.full_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-white/70">Timestamp</span>
                  <span className="text-neutral-900 dark:text-white">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-white/70">Details</span>
                  <div className="mt-2 rounded bg-[#0ea5e9]/5 dark:bg-white/5 p-3 text-neutral-800 dark:text-white break-words">
                    {typeof selected.details === "object" && selected.details !== null
                      ? Object.entries(selected.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-neutral-700 dark:text-white/80">{k}</span>
                            <span className="text-neutral-900 dark:text-white">{String(v)}</span>
                          </div>
                        ))
                      : String(selected.details || "-")}
                  </div>
                </div>
                {Array.isArray((selected as any).grouped) && (selected as any).grouped.length > 0 && (
                  <div>
                    <span className="text-neutral-600 dark:text-white/70">Related</span>
                    <div className="mt-2 space-y-2">
                      {(selected as any).grouped.map((g: any) => (
                        <div key={g.id} className="rounded border border-[#0ea5e9]/30 p-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(g.action_type)}>{g.action_type.replace("_", " ")}</Badge>
                            <span className="text-xs text-neutral-600 dark:text-white/70">{new Date(g.created_at).toLocaleString()}</span>
                          </div>
                          <div className="mt-1 rounded bg-[#0ea5e9]/5 dark:bg-white/5 p-2 text-neutral-800 dark:text-white break-words">
                            {typeof g.details === "object" && g.details !== null
                              ? Object.entries(g.details).map(([k, v]) => (
                                  <div key={k} className="flex justify-between">
                                    <span className="text-neutral-700 dark:text-white/80">{k}</span>
                                    <span className="text-neutral-900 dark:text-white">{String(v)}</span>
                                  </div>
                                ))
                              : String(g.details || "-")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected?.entity_type === "transaction" ? (
                  <div className="pt-2">
                    <Button
                      onClick={() => handleReprint(selected)}
                      disabled={isLoading}
                      className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Reprint Receipt
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={reprintOpen} onOpenChange={setReprintOpen}>
          <DialogContent className="border-[#0ea5e9]/30 max-w-2xl max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-neutral-900 dark:text-white">Transaction Receipt</DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-white/70">Reprint of a completed checkout</DialogDescription>
            </DialogHeader>
            {reprintTransaction ? (
              <div className="space-y-3">
                <Invoice
                  ref={receiptRef}
                  invoiceNo={reprintNo || String(reprintTransaction.id).slice(0, 6).toUpperCase()}
                  date={reprintTransaction.transaction_date || reprintTransaction.created_at}
                  customer={{ name: customerName, address: customerAddress, phone: customerPhone }}
                  items={receiptItems.map((it: any) => ({
                    qty: it.quantity,
                    description: it.name,
                    mn: it.model_no || "",
                    sn: it.serial_no || "",
                    rate: it.price_per_unit,
                  }))}
                  total={Number(reprintTransaction.total_amount)}
                />
                <div className="flex flex-wrap gap-2 justify-center sticky bottom-0 pt-2">
                  <Button onClick={handlePrintReceipt} className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white">
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/dashboard/checkout/receipt/${reprintTransaction.id}?print=1`, "_blank")}
                    className="border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10"
                  >
                    Open Full Page
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
