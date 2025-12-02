"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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
import DashboardLayout from "./dashboard-layout"
import { Plus, Lock, Unlock, Edit3, Trash2, KeyRound } from "lucide-react"
import { snackbar } from "@/lib/ui/snackbar"

export default function AdminManagementContent({ currentAdmin, admins, user }: any) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "store_manager",
  })
  const supabase = createClient()
  const router = useRouter()

  const totalAdmins = Array.isArray(admins) ? admins.length : 0
  const activeAdmins = Array.isArray(admins) ? admins.filter((a: any) => a.status === "active").length : 0

  const handleCreateAdmin = async () => {
    if (!formData.username || !formData.password || !formData.full_name) {
      snackbar.error("Please complete all admin fields")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/admins/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create admin")

      await supabase.from("activity_log").insert({
        admin_id: user.id,
        action_type: "admin_created",
        entity_type: "admin",
        entity_id: data.id,
        details: { username: formData.username, role: formData.role },
      })

      setFormData({ username: "", password: "", full_name: "", role: "store_manager" })
      setOpen(false)
      router.refresh()
      snackbar.success("Admin created")
    } catch (error) {
      console.error("Error creating admin:", error)
      snackbar.error("Error creating admin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (adminId: string, currentStatus: string) => {
    setIsLoading(true)
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active"
      const res = await fetch(`/api/admins/${adminId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update status")

      await supabase.from("activity_log").insert({
        admin_id: user.id,
        action_type: "admin_status_changed",
        entity_type: "admin",
        entity_id: adminId,
        details: { new_status: newStatus },
      })

      router.refresh()
      snackbar.success(`Admin ${newStatus}`)
    } catch (error) {
      console.error("Error updating admin status:", error)
      snackbar.error("Error updating admin status")
    } finally {
      setIsLoading(false)
    }
  }

  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null)
  const [editData, setEditData] = useState({ full_name: "", role: "store_manager", status: "active" })
  const [passwordValue, setPasswordValue] = useState("")

  const openEdit = (admin: any) => {
    setSelectedAdmin(admin)
    setEditData({ full_name: admin.full_name || "", role: admin.role, status: admin.status })
    setEditOpen(true)
  }

  const openPassword = (admin: any) => {
    setSelectedAdmin(admin)
    setPasswordValue("")
    setPasswordOpen(true)
  }

  const openDelete = (admin: any) => {
    setSelectedAdmin(admin)
    setDeleteOpen(true)
  }

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admins/${selectedAdmin.id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update admin")

      await supabase.from("activity_log").insert({
        admin_id: user.id,
        action_type: "admin_updated",
        entity_type: "admin",
        entity_id: selectedAdmin.id,
        details: editData,
      })

      setEditOpen(false)
      setSelectedAdmin(null)
      router.refresh()
      snackbar.success("Admin updated")
    } catch (error) {
      console.error("Error updating admin:", error)
      snackbar.error("Error updating admin")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!selectedAdmin || !passwordValue) {
      snackbar.error("Enter a new password")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admins/${selectedAdmin.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to change password")

      await supabase.from("activity_log").insert({
        admin_id: user.id,
        action_type: "admin_password_changed",
        entity_type: "admin",
        entity_id: selectedAdmin.id,
      })

      setPasswordOpen(false)
      setSelectedAdmin(null)
      router.refresh()
      snackbar.success("Password changed")
    } catch (error) {
      console.error("Error changing password:", error)
      snackbar.error("Error changing password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admins/${selectedAdmin.id}/delete`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to delete admin")

      await supabase.from("activity_log").insert({
        admin_id: user.id,
        action_type: "admin_deleted",
        entity_type: "admin",
        entity_id: selectedAdmin.id,
      })

      setDeleteOpen(false)
      setSelectedAdmin(null)
      router.refresh()
      snackbar.success("Admin deleted")
    } catch (error) {
      console.error("Error deleting admin:", error)
      snackbar.error("Error deleting admin")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout admin={currentAdmin} user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Admin Management</h1>
            <p className="text-neutral-600 dark:text-white/70 mt-1">Manage system administrators</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7a1632] hover:bg-[#66122a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-white">Create New Admin</DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-white/70">Add a new administrator account</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Username</Label>
                  <Input
                    type="text"
                    placeholder="john_doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Password</Label
                >
                  <Input
                    type="password"
                    placeholder=""
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                  />
                </div>
                <div>
                  <Label className="text-neutral-700 dark:text-white/80">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30">
                      <SelectItem value="store_manager" className="text-neutral-900 dark:text-white">
                        Store Manager
                      </SelectItem>
                      <SelectItem value="super_admin" className="text-neutral-900 dark:text-white">
                        Super Admin
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateAdmin}
                  disabled={isLoading}
                  className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white"
                >
                  {isLoading ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardContent className="p-6">
              <p className="text-neutral-600 dark:text-white/70 text-sm">Total Admins</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{totalAdmins}</p>
            </CardContent>
          </Card>
          <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
            <CardContent className="p-6">
              <p className="text-neutral-600 dark:text-white/70 text-sm">Active Admins</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-1">{activeAdmins}</p>
            </CardContent>
          </Card>
        </div>

        {/* Admins List */}
        <div className="grid gap-4">
          {admins?.map((admin: any) => (
            <Card key={admin.id} className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13] hover:bg-[#7a1632]/5 dark:hover:bg-white/5 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{admin.full_name}</h3>
                      <Badge className={admin.role === "super_admin" ? "bg-purple-600" : "bg-[#7a1632]"}>
                        {admin.role.replace("_", " ")}
                      </Badge>
                      <Badge className={admin.status === "active" ? "bg-green-600" : "bg-red-600"}>
                        {admin.status}
                      </Badge>
                    </div>
                    <p className="text-neutral-600 dark:text-white/70 text-sm">@{admin.username}</p>
                    {admin.last_login && (
                      <p className="text-neutral-500 dark:text-white/70 text-xs mt-2">
                        Last login: {new Date(admin.last_login).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(admin.id, admin.status)}
                      disabled={isLoading || admin.id === user.id}
                      className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
                    >
                      {admin.status === "active" ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(admin)}
                      disabled={isLoading}
                      className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPassword(admin)}
                      disabled={isLoading}
                      className="border-[#7a1632]/30 text-neutral-700 dark:text-white/80 hover:bg-[#7a1632]/10 dark:hover:bg-white/10"
                    >
                      <KeyRound className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDelete(admin)}
                      disabled={isLoading || admin.id === user.id}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!admins || admins.length === 0 ? (
            <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
              <CardContent className="p-8 text-center">
                <p className="text-neutral-600 dark:text-white/70">No admins found. Use "Add Admin" to create one.</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Edit Admin Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Edit Admin</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-white/70">Update profile, role, or status</DialogDescription>
          </DialogHeader>
          {selectedAdmin ? (
            <div className="space-y-4">
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Full Name</Label>
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                />
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Role</Label>
                <Select value={editData.role} onValueChange={(value) => setEditData({ ...editData, role: value })}>
                  <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30">
                    <SelectItem value="store_manager" className="text-neutral-900 dark:text-white">
                      Store Manager
                    </SelectItem>
                    <SelectItem value="super_admin" className="text-neutral-900 dark:text-white">
                      Super Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-neutral-700 dark:text-white/80">Status</Label>
                <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                  <SelectTrigger className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30 text-neutral-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#140a0f] border-[#7a1632]/30">
                    <SelectItem value="active" className="text-neutral-900 dark:text-white">
                      Active
                    </SelectItem>
                    <SelectItem value="suspended" className="text-neutral-900 dark:text-white">
                      Suspended
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateAdmin} disabled={isLoading} className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Change Password</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-white/70">Set a new password for this admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-neutral-700 dark:text-white/80">New Password</Label>
              <Input
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isLoading} className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white dark:bg-[#1a0d13] border-[#7a1632]/30">
          <DialogHeader>
            <DialogTitle className="text-neutral-900 dark:text-white">Delete Admin</DialogTitle>
            <DialogDescription className="text-neutral-600 dark:text-white/70">This action cannot be undone</DialogDescription>
          </DialogHeader>
          {selectedAdmin ? (
            <div className="space-y-4">
              <p className="text-neutral-700 dark:text-white/80">Are you sure you want to delete @{selectedAdmin.username}?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="border-[#7a1632]/30" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteAdmin} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
