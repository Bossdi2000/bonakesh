"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import DashboardLayout from "./dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from "lucide-react"
import { snackbar } from "@/lib/ui/snackbar"
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

export default function StaffContent({ admin, staff, user }: any) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [clearOpen, setClearOpen] = useState(false)
  const [statusErrorId, setStatusErrorId] = useState<string | null>(null)
  const [statusErrorMsg, setStatusErrorMsg] = useState<string>("")
  const [formData, setFormData] = useState({
    full_name: "",
    job_title: "",
    monthly_salary: "",
    employment_status: "active",
  })
  const supabase = createClient()
  const router = useRouter()

  const handleOpenDialog = (staffMember?: any) => {
    if (staffMember) {
      setEditingId(staffMember.id)
      setFormData({
        full_name: staffMember.full_name,
        job_title: staffMember.job_title,
        monthly_salary: staffMember.monthly_salary,
        employment_status: staffMember.employment_status,
      })
    } else {
      setEditingId(null)
      setFormData({
        full_name: "",
        job_title: "",
        monthly_salary: "",
        employment_status: "active",
      })
    }
    setOpen(true)
  }

  const handleSaveStaff = async () => {
    if (!formData.full_name || !formData.job_title || !formData.monthly_salary) {
      snackbar.error("Please complete all staff fields")
      return
    }

    setIsLoading(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/staff/${editingId}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name,
            job_title: formData.job_title,
            monthly_salary: Number.parseFloat(formData.monthly_salary as any),
            employment_status: formData.employment_status,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed")
        snackbar.success("Staff updated")
      } else {
        const res = await fetch(`/api/staff/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name,
            job_title: formData.job_title,
            monthly_salary: Number.parseFloat(formData.monthly_salary as any),
            employment_status: formData.employment_status,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || "Failed")
        snackbar.success("Staff created")
      }

      setOpen(false)
      setFormData({
        full_name: "",
        job_title: "",
        monthly_salary: "",
        employment_status: "active",
      })
      router.refresh()
    } catch (error) {
      console.error("Error saving staff:", error)
      snackbar.error("Error saving staff")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/staff/${id}/delete`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      router.refresh()
      snackbar.success("Staff deleted")
    } catch (error) {
      console.error("Error deleting staff:", error)
      snackbar.error("Error deleting staff")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPaymentStatus = async (id: string, newStatus: "paid" | "pending" | "withheld") => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/staff/${id}/payment-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed")
      router.refresh()
      snackbar.success(`Payment status set to ${newStatus}`)
      setStatusErrorId(null)
      setStatusErrorMsg("")
    } catch (error) {
      console.error("Error updating payment status:", error)
      snackbar.error("Error updating payment status")
      setStatusErrorId(id)
      setStatusErrorMsg(
        typeof error === "object" && error && "message" in (error as any)
          ? (error as any).message
          : "Failed to update payment status"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const totalMonthlySalaries = staff.reduce(
    (acc: number, s: any) => acc + (s.employment_status === "active" ? s.monthly_salary : 0),
    0,
  )
  const activeStaff = staff.filter((s: any) => s.employment_status === "active").length
  const paidSalaries = staff.filter((s: any) => s.payment_status === "paid").length
  const pendingSalaries = staff.filter((s: any) => s.payment_status === "pending").length
  const withheldSalaries = staff.filter((s: any) => s.payment_status === "withheld").length
  const [quickFilter, setQuickFilter] = useState<string>("all")
  const [bannerDismiss, setBannerDismiss] = useState<boolean>(false)
  const bannerKey = `staff_clear_banner:${new Date().getFullYear()}-${new Date().getMonth()+1}`
  useEffect(() => {
    try { setBannerDismiss(Boolean(localStorage.getItem(bannerKey))) } catch {}
  }, [bannerKey])
  const dismissBanner = () => { try { localStorage.setItem(bannerKey, "1"); setBannerDismiss(true) } catch {} }
  const filteredStaff = staff.filter((s: any) => {
    if (quickFilter === "active") return s.employment_status === "active"
    if (["paid","pending","withheld"].includes(quickFilter)) return s.payment_status === quickFilter
    return true
  })

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Staff Management</h1>
            <p className="text-slate-400 mt-1">Manage employees and salaries</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setClearOpen(true)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cleared
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">{editingId ? "Edit Staff Member" : "Add New Staff"}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingId ? "Update staff details" : "Create a new staff member"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Job Title</Label>
                  <Input
                    placeholder="e.g., Sales Associate"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Monthly Salary</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.monthly_salary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthly_salary: e.target.value,
                      })
                    }
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Employment Status</Label>
                  <Select
                    value={formData.employment_status}
                    onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="active" className="text-white">
                        Active
                      </SelectItem>
                      <SelectItem value="suspended" className="text-white">
                        Suspended
                      </SelectItem>
                      <SelectItem value="resigned" className="text-white">
                        Resigned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveStaff} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Saving..." : editingId ? "Update Staff" : "Add Staff"}
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-1">Active Staff</p>
              <p className="text-3xl font-bold text-white">{activeStaff}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-1">Total Monthly Salaries</p>
              <p className="text-3xl font-bold text-white">₦{totalMonthlySalaries.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm mb-1">Salaries Paid</p>
              <p className="text-3xl font-bold text-green-500">{paidSalaries}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={quickFilter === "all" ? "default" : "outline"} onClick={() => setQuickFilter("all")} className={quickFilter === "all" ? "bg-slate-600" : "border-slate-600 text-slate-300"}>All ({staff.length})</Button>
          <Button variant={quickFilter === "active" ? "default" : "outline"} onClick={() => setQuickFilter("active")} className={quickFilter === "active" ? "bg-slate-600" : "border-slate-600 text-slate-300"}>Active ({activeStaff})</Button>
          <Button variant={quickFilter === "outline" ? "default" : "outline"} onClick={() => setQuickFilter("paid")} className={quickFilter === "paid" ? "bg-slate-600" : "border-slate-600 text-slate-300"}>Paid ({paidSalaries})</Button>
          <Button variant={quickFilter === "outline" ? "default" : "outline"} onClick={() => setQuickFilter("pending")} className={quickFilter === "pending" ? "bg-slate-600" : "border-slate-600 text-slate-300"}>Pending ({pendingSalaries})</Button>
          <Button variant={quickFilter === "outline" ? "default" : "outline"} onClick={() => setQuickFilter("withheld")} className={quickFilter === "withheld" ? "bg-slate-600" : "border-slate-600 text-slate-300"}>Withheld ({withheldSalaries})</Button>
        </div>

        {/* Reminder Banner */}
        {!bannerDismiss && (
          <Card className="border-slate-700 bg-yellow-600/10">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="text-slate-300">Remember to clear monthly salary statuses.</div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-slate-600" onClick={dismissBanner}>Dismiss</Button>
                <Button
                  variant="outline"
                  onClick={() => setClearOpen(true)}
                  className="border-yellow-600 text-yellow-500 hover:bg-yellow-600/10"
                >
                  Clear Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        <div className="space-y-3">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((staffMember: any) => (
              <Card
                key={staffMember.id}
                className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{staffMember.full_name}</h3>
                        <Badge
                          className={
                            staffMember.employment_status === "active"
                              ? "bg-green-600"
                              : staffMember.employment_status === "suspended"
                                ? "bg-yellow-600"
                                : "bg-red-600"
                          }
                        >
                          {staffMember.employment_status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{staffMember.job_title}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Monthly Salary: </span>
                          <span className="text-white font-semibold">
                            ₦{staffMember.monthly_salary.toLocaleString("en-NG")}
                          </span>
                        </div>
                        <div>
                          <Badge
                            className={
                              staffMember.payment_status === "paid"
                                ? "bg-green-600"
                                : staffMember.payment_status === "withheld"
                                  ? "bg-red-600"
                                  : "bg-slate-600"
                            }
                          >
                            {staffMember.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPaymentStatus(staffMember.id, "paid")}
                        disabled={isLoading || staffMember.employment_status !== "active"}
                        className="border-slate-600 text-green-500 hover:bg-slate-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPaymentStatus(staffMember.id, "pending")}
                        disabled={isLoading || staffMember.employment_status !== "active"}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Pending
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetPaymentStatus(staffMember.id, "withheld")}
                        disabled={isLoading || staffMember.employment_status !== "active"}
                        className="border-red-600 text-red-500 hover:bg-red-600/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      {statusErrorId === staffMember.id && statusErrorMsg && (
                        <p className="text-red-500 text-xs ml-2 self-center">{statusErrorMsg}</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(staffMember)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleteId(staffMember.id)
                          setDeleteOpen(true)
                        }}
                        disabled={isLoading}
                        className="border-red-600 text-red-500 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">No staff members yet</p>
              </CardContent>
            </Card>
          )}
      </div>
      </div>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently remove the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)} className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return
                await handleDeleteStaff(deleteId)
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

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear Salary Cycle</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will reset paid statuses for active staff.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClearOpen(false)} className="border-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setIsLoading(true)
                try {
                  const res = await fetch("/api/staff/clear-cycle", { method: "POST" })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(data?.error || "Failed")
                  snackbar.success("Salary cycle cleared")
                  router.refresh()
                } catch (e) {
                  snackbar.error(typeof e === "object" && e && "message" in (e as any) ? (e as any).message : "Error clearing")
                } finally {
                  setIsLoading(false)
                  setClearOpen(false)
                }
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
