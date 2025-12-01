"use client"

import { useState } from "react"
import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryContent({ admin, logs, user }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionType, setActionType] = useState("all")
  const [adminName, setAdminName] = useState("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<any | null>(null)

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
    return "bg-blue-600"
  }


  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Log</h1>
          <p className="text-slate-400 mt-1">Complete history of all system actions</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={actionType === "all" ? "default" : "outline"}
                onClick={() => setActionType("all")}
                className={actionType === "all" ? "bg-slate-600" : "border-slate-600 text-slate-300"}
              >
                All ({totalCount})
              </Button>
              <Button
                variant={actionType === "login_success" ? "default" : "outline"}
                onClick={() => setActionType("login_success")}
                className={actionType === "login_success" ? "bg-slate-600" : "border-slate-600 text-slate-300"}
              >
                Logins ({loginSuccessCount})
              </Button>
              <Button
                variant={actionType === "login_failure" ? "default" : "outline"}
                onClick={() => setActionType("login_failure")}
                className={actionType === "login_failure" ? "bg-slate-600" : "border-slate-600 text-slate-300"}
              >
                Failures ({loginFailureCount})
              </Button>
              <Button
                variant={actionType === "logout" ? "default" : "outline"}
                onClick={() => setActionType("logout")}
                className={actionType === "logout" ? "bg-slate-600" : "border-slate-600 text-slate-300"}
              >
                Logouts ({logoutCount})
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300">Search</Label>
                <Input
                  placeholder="Search actions, items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Admin</Label>
                <Select value={adminName} onValueChange={setAdminName}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All admins" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All</SelectItem>
                    {adminNames.map((n: string) => (
                      <SelectItem key={n} value={n} className="text-white">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Action Type</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all" className="text-white">All</SelectItem>
                    {actionTypes.map((t: string) => (
                      <SelectItem key={t} value={t} className="text-white">
                        {t.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {!logs ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-slate-700 bg-slate-800/50">
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
              <Card
                key={log.id}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 cursor-pointer"
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
                          <Badge className="bg-slate-600 text-white">+{log.grouped.length} related</Badge>
                        )}
                        {log.entity_type && <span className="text-xs text-slate-400">{log.entity_type}</span>}
                      </div>
                      <p className="text-slate-300 text-sm">by {log.admins?.full_name || "Unknown"}</p>
                      {getAffectedItem(log) && (
                        <p className="text-slate-400 text-xs mt-1">{getAffectedItem(log)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                      <a href={`/dashboard/history/${log.id}`} className="text-xs text-blue-400 underline">Open</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No activities found</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Activity Details</DialogTitle>
              <DialogDescription className="text-slate-400">Full information about the selected activity</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Action</span>
                  <span className="text-white font-medium">{selected.action_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entity</span>
                  <span className="text-white">{selected.entity_type || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entity ID</span>
                  <span className="text-white">{selected.entity_id || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin</span>
                  <span className="text-white">{selected.admins?.full_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp</span>
                  <span className="text-white">{new Date(selected.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Details</span>
                  <div className="mt-2 rounded bg-slate-700/50 p-3 text-slate-200 break-words">
                    {typeof selected.details === "object" && selected.details !== null
                      ? Object.entries(selected.details).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-slate-300">{k}</span>
                            <span className="text-white">{String(v)}</span>
                          </div>
                        ))
                      : String(selected.details || "-")}
                  </div>
                </div>
                {Array.isArray((selected as any).grouped) && (selected as any).grouped.length > 0 && (
                  <div>
                    <span className="text-slate-400">Related</span>
                    <div className="mt-2 space-y-2">
                      {(selected as any).grouped.map((g: any) => (
                        <div key={g.id} className="rounded border border-slate-700 p-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionColor(g.action_type)}>{g.action_type.replace("_", " ")}</Badge>
                            <span className="text-xs text-slate-400">{new Date(g.created_at).toLocaleString()}</span>
                          </div>
                          <div className="mt-1 rounded bg-slate-700/50 p-2 text-slate-200 break-words">
                            {typeof g.details === "object" && g.details !== null
                              ? Object.entries(g.details).map(([k, v]) => (
                                  <div key={k} className="flex justify-between">
                                    <span className="text-slate-300">{k}</span>
                                    <span className="text-white">{String(v)}</span>
                                  </div>
                                ))
                              : String(g.details || "-")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
