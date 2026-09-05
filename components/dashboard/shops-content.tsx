"use client"

import { useState } from "react"
import DashboardLayout from "./dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import snackbar from "@/lib/ui/snackbar"

export default function ShopsContent({ admin, shops, user }: any) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ name: "", address: "", contact_phone: "", contact_email: "" })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCreate = async () => {
    if (!form.name.trim()) {
      snackbar.error("Shop name is required")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/shops/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to create shop")
      setOpen(false)
      setForm({ name: "", address: "", contact_phone: "", contact_email: "" })
      snackbar.success("Shop created")
      window.location.reload()
    } catch (e: any) {
      snackbar.error(e?.message || "Failed to create shop")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/shops/${deleteTarget.id}/delete`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to delete shop")
      snackbar.success(`"${deleteTarget.name}" deleted`)
      setDeleteOpen(false)
      setDeleteTarget(null)
      window.location.reload()
    } catch (e: any) {
      snackbar.error(e?.message || "Failed to delete shop")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Manage Shops</h2>
            <p className="text-neutral-600 dark:text-white/70">Create, view and delete branches and warehouses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white">Add New Shop</Button>
            </DialogTrigger>
            <DialogContent className="border-[#0ea5e9]/30">
              <DialogHeader>
                <DialogTitle className="text-neutral-900 dark:text-white">Add New Shop</DialogTitle>
                <DialogDescription className="text-neutral-600 dark:text-white/70">Create a new branch or warehouse</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Shop Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="Physical Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <Input placeholder="Contact Phone (optional)" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
                <Input placeholder="Contact Email (optional)" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? "Saving..." : "Create Shop"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops?.length ? (
            shops.map((shop: any) => (
              <div key={shop.id} className="group relative">
                <Link href={`/dashboard/shops/${shop.id}`} className="block">
                  <Card className="border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 dark:hover:bg-white/5 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-neutral-900 dark:text-white">{shop.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-neutral-600 dark:text-white/70">{shop.address || "No address"}</div>
                      <div className="text-sm text-neutral-500 dark:text-white/60 mt-1">{shop.status || "active"}</div>
                    </CardContent>
                  </Card>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Delete ${shop.name}`}
                  title="Delete shop"
                  onClick={() => {
                    setDeleteTarget({ id: shop.id, name: shop.name })
                    setDeleteOpen(true)
                  }}
                  className="absolute top-3 right-3 h-8 w-8 border-red-300 text-red-500 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 bg-white/80 backdrop-blur"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <Card className="border-[#0ea5e9]/30 ">
              <CardContent className="p-8 text-center text-neutral-600 dark:text-white/70">No shops yet</CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-[#0ea5e9]/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 dark:text-white">Delete Shop</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 dark:text-white/70">
              This action cannot be undone. This will permanently delete
              {deleteTarget ? ` "${deleteTarget.name}"` : " this shop"}. Products assigned to this shop will keep
              their records but will no longer be linked to a branch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setDeleteOpen(false); setDeleteTarget(null) }} className="border-[#0ea5e9]/30">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Shop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
