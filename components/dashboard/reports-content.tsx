"use client"
import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsContent({ user, admin, report, admins }: any) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customStart, setCustomStart] = useState<string>(searchParams.get("start") || "")
  const [customEnd, setCustomEnd] = useState<string>(searchParams.get("end") || "")
  const [isLoading, setIsLoading] = useState(false)

  const period = (searchParams.get("period") || report?.period || "monthly").toLowerCase()
  const method = (searchParams.get("method") || "").toLowerCase()
  const adminFilter = searchParams.get("admin") || ""

  const formatCurrency = useCallback((n: number) => `₦${Number(n || 0).toLocaleString("en-NG")}` , [])

  const onPeriodChange = (value: string) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", value)
    if (value !== "custom") {
      params.delete("start")
      params.delete("end")
    } else {
      if (customStart) params.set("start", customStart)
      if (customEnd) params.set("end", customEnd)
    }
    router.replace(`/dashboard/reports?${params.toString()}`)
  }

  const onMethodChange = (value: string) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") params.set("method", value)
    else params.delete("method")
    router.replace(`/dashboard/reports?${params.toString()}`)
  }

  const onAdminChange = (value: string) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") params.set("admin", value)
    else params.delete("admin")
    router.replace(`/dashboard/reports?${params.toString()}`)
  }

  const onApplyCustom = () => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", "custom")
    if (customStart) params.set("start", customStart)
    if (customEnd) params.set("end", customEnd)
    router.replace(`/dashboard/reports?${params.toString()}`)
  }

  const exportPdf = () => {
    const w = window.open("", "print", "width=900,height=1200")
    if (!w) return
    const title = `Sales Report (${periodLabel})`
    const totals = report?.totals || {}
    const top = report?.topProducts || []
    const admins = report?.adminRank || []
    const range = report?.range || {}
    const html = `<!doctype html><html><head><meta charset=\"utf-8\"/><title>${title}</title>
      <style>
        @page{margin:20mm}
        body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#000}
        h1{margin:0 0 8px;font-size:22px}
        h2{margin:20px 0 8px;font-size:18px}
        table{width:100%;border-collapse:collapse;margin-top:8px}
        th,td{border:1px solid #000;padding:6px;font-size:12px;text-align:left}
        .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .card{border:1px solid #000;padding:10px}
        .brand{border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:12px;text-align:center}
        .footer{position:fixed;bottom:0;left:0;right:0;text-align:center;font-size:12px;padding:6px 0;border-top:1px solid #000}
        @media print {.footer:after{content: 'Page ' counter(page) ' of ' counter(pages);}}
      </style></head><body>
      <div class=\"brand\">
        <div style=\"font-weight:bold;font-size:20px\">MARSHALL ETHEL NIG. LTD.</div>
        <div style=\"font-size:12px;margin-top:6px\">Dealers on Electrical/Electronics</div>
        <div style=\"font-size:12px\">HEAD OFFICE HALL No. 10 Oko Road, SHALL ALL, Ekwulobia</div>
        <div style=\"font-size:12px\"><strong>08082838408</strong></div>
      </div>
      <h1>${title}</h1>
      <div>Range: ${range?.start || "-"} → ${range?.end || "-"}</div>
      <div class=\"grid\">
        <div class=\"card\"><strong>Sales Count</strong><div>${totals.salesCount || 0}</div></div>
        <div class=\"card\"><strong>Sales Value</strong><div>${formatCurrency(totals.salesValue || 0)}</div></div>
        <div class=\"card\"><strong>Buying Cost</strong><div>${formatCurrency(totals.buyingCost || 0)}</div></div>
        <div class=\"card\"><strong>Gross Profit</strong><div>${formatCurrency(totals.grossProfit || 0)}</div></div>
        <div class=\"card\"><strong>Salaries Deducted</strong><div>${formatCurrency(totals.salariesDeducted || 0)}</div></div>
        <div class=\"card\"><strong>Net Profit</strong><div>${formatCurrency(totals.netProfit || 0)}</div></div>
      </div>
      <h2>Top-Selling Products</h2>
      <table><thead><tr><th>Product</th><th>Quantity</th><th>Revenue</th></tr></thead><tbody>
        ${top.map((p:any)=>`<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatCurrency(p.revenue||0)}</td></tr>`).join("") || `<tr><td colspan=\"3\">No products in this period.</td></tr>`}
      </tbody></table>
      <h2>Admin Activity</h2>
      <table><thead><tr><th>Admin</th><th>Checkouts</th></tr></thead><tbody>
        ${admins.map((a:any)=>`<tr><td>${a.name}</td><td>${a.count}</td></tr>`).join("") || `<tr><td colspan=\"2\">No admin data.</td></tr>`}
      </tbody></table>
      <div class=\"footer\"></div>
      </body></html>`
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  const periodLabel = useMemo(() => {
    if (period === "custom") return "Custom Period"
    return period.charAt(0).toUpperCase() + period.slice(1)
  }, [period])

  const [compareMode, setCompareMode] = useState<string>("day")
  const cmp = report?.compare || {}
  const cmpData = compareMode && cmp[compareMode] ? [
    { label: compareMode === "day" ? "Yesterday" : compareMode === "week" ? "Last Week" : compareMode === "month" ? "Last Month" : "Last Year", value: cmp[compareMode].prev.value, count: cmp[compareMode].prev.count },
    { label: compareMode === "day" ? "Today" : compareMode === "week" ? "This Week" : compareMode === "month" ? "This Month" : "This Year", value: cmp[compareMode].curr.value, count: cmp[compareMode].curr.count },
  ] : []
  const prevVal = cmpData[0]?.value || 0
  const currVal = cmpData[1]?.value || 0
  const delta = currVal - prevVal
  const pct = prevVal > 0 ? (delta / prevVal) * 100 : (currVal > 0 ? 100 : 0)
  const prevLabel = compareMode === "day" ? "Yesterday" : compareMode === "week" ? "Last Week" : compareMode === "month" ? "Last Month" : "Last Year"
  const currLabel = compareMode === "day" ? "Today" : compareMode === "week" ? "This Week" : compareMode === "month" ? "This Month" : "This Year"

  useEffect(() => { if (report) setIsLoading(false) }, [report])

  return (
    <DashboardLayout user={user} admin={admin} title="Sales Reports" description="Business Performance Insight">
      <div className="flex items-center justify-between mb-4">
        <Tabs value={period} onValueChange={onPeriodChange} className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 ml-4">
          <Button variant="outline" className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10" onClick={() => window.print()}>Print</Button>
          <Button className="bg-[#7a1632] hover:bg-[#66122a] text-white" onClick={exportPdf}>Export PDF</Button>
        </div>
      </div>

      <Card className="mb-6 border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <Label className="text-neutral-700 dark:text-white/80">Payment Method</Label>
            <Select value={method || "all"} onValueChange={onMethodChange}>
              <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30">
                <SelectItem value="all" className="text-white">All</SelectItem>
                <SelectItem value="cash" className="text-white">Cash</SelectItem>
                <SelectItem value="transfer" className="text-white">Bank Transfer</SelectItem>
                <SelectItem value="pos" className="text-white">POS</SelectItem>
                <SelectItem value="card" className="text-white">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-neutral-700 dark:text-white/80">Admin</Label>
            <Select value={adminFilter || "all"} onValueChange={onAdminChange}>
              <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 max-h-64 overflow-auto">
                <SelectItem value="all" className="text-white">All</SelectItem>
                {(admins || []).map((a: any) => (
                  <SelectItem key={a.id} value={a.id} className="text-white">{a.full_name || a.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {period === "custom" && (
        <Card className="mb-6 border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
          <CardHeader>
            <CardTitle className="text-white">Select Custom Period</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-neutral-700 dark:text-white/80">Start Date</Label>
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white" />
            </div>
            <div>
              <Label className="text-neutral-700 dark:text-white/80">End Date</Label>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white" />
            </div>
            <div className="flex items-end">
              <Button onClick={onApplyCustom} disabled={!customStart || !customEnd} className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">Apply</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading || !report ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Sales Count</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-white">{report?.totals?.salesCount || 0}</CardContent>
            </Card>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Sales Value</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-green-500">{formatCurrency(report?.totals?.salesValue || 0)}</CardContent>
            </Card>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Buying Cost</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-white">{formatCurrency(report?.totals?.buyingCost || 0)}</CardContent>
            </Card>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Gross Profit</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-white">{formatCurrency(report?.totals?.grossProfit || 0)}</CardContent>
            </Card>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Salaries Deducted</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-white">{formatCurrency(report?.totals?.salariesDeducted || 0)}</CardContent>
            </Card>
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardHeader><CardTitle className="text-white">Net Profit</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold text-white">{formatCurrency(report?.totals?.netProfit || 0)}</CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
          <CardHeader><CardTitle className="text-white">Top-Selling Products</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !report ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2">Product</th>
                      <th className="py-2">Quantity</th>
                      <th className="py-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.topProducts || []).map((p: any) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2">{p.name}</td>
                        <td className="py-2">{p.quantity}</td>
                        <td className="py-2">{formatCurrency(p.revenue || 0)}</td>
                      </tr>
                    ))}
                    {(!report?.topProducts || report.topProducts.length === 0) && (
                      <tr><td className="py-2" colSpan={3}>No products in this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
          <CardHeader><CardTitle className="text-white">Admin Activity</CardTitle></CardHeader>
          <CardContent>
            {isLoading || !report ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <>
                {report?.mostActiveAdmin ? (
                  <div className="mb-2">Most Active: <span className="font-medium">{report.mostActiveAdmin.name}</span> ({report.mostActiveAdmin.count} checkouts)</div>
                ) : (
                  <div className="mb-2">No admin activity in this period.</div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2">Admin</th>
                        <th className="py-2">Checkouts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(report?.adminRank || []).map((a: any) => (
                        <tr key={a.id} className="border-t">
                          <td className="py-2">{a.name}</td>
                          <td className="py-2">{a.count}</td>
                        </tr>
                      ))}
                      {(!report?.adminRank || report.adminRank.length === 0) && (
                        <tr><td className="py-2" colSpan={2}>No admin data.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-white">Compare Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Button variant={compareMode === "day" ? "default" : "outline"} onClick={() => setCompareMode("day")} className={compareMode === "day" ? "bg-[#7a1632] text-white" : "border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"}>Day vs Day</Button>
            <Button variant={compareMode === "week" ? "default" : "outline"} onClick={() => setCompareMode("week")} className={compareMode === "week" ? "bg-[#7a1632] text-white" : "border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"}>Week vs Week</Button>
            <Button variant={compareMode === "month" ? "default" : "outline"} onClick={() => setCompareMode("month")} className={compareMode === "month" ? "bg-[#7a1632] text-white" : "border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"}>Month vs Month</Button>
            <Button variant={compareMode === "year" ? "default" : "outline"} onClick={() => setCompareMode("year")} className={compareMode === "year" ? "bg-[#7a1632] text-white" : "border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"}>Year vs Year</Button>
          </div>
          {cmpData.length === 2 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cmpData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d7b0bd" />
                    <XAxis dataKey="label" stroke="#7a1632" />
                    <YAxis tickFormatter={(v) => `₦${Number(v||0).toLocaleString("en-NG")}`} stroke="#7a1632" />
                    <Tooltip formatter={(v:any)=>[`₦${Number(v||0).toLocaleString("en-NG")}`, "Sales Value"]} labelFormatter={(l:any)=>String(l)} contentStyle={{ background: "#ffffff", border: "1px solid #7a1632", color: "#111" }} />
                    <Bar dataKey="value" fill="#7a1632" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <div className="text-neutral-700 dark:text-white/80">{prevLabel}: <span className="text-neutral-900 dark:text-white font-semibold">{formatCurrency(prevVal)}</span> • {cmpData[0]?.count || 0} sales</div>
                <div className="text-neutral-700 dark:text-white/80">{currLabel}: <span className="text-neutral-900 dark:text-white font-semibold">{formatCurrency(currVal)}</span> • {cmpData[1]?.count || 0} sales</div>
                <div className="text-neutral-700 dark:text-white/80">Change: <span className={delta>=0?"text-green-500":"text-red-500"}>{delta>=0?"+":""}{formatCurrency(Math.abs(delta))}</span> (<span className={pct>=0?"text-green-500":"text-red-500"}>{pct>=0?"+":""}{pct.toFixed(1)}%</span>)</div>
                <div className="text-neutral-600 dark:text-white/70 text-sm">{delta>=0?"Sales improved":"Sales declined"} compared to the previous period.</div>
              </div>
            </div>
          ) : (
            <div className="text-neutral-600 dark:text-white/70">No data available for comparison.</div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
