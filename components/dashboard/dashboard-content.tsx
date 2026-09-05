"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "./dashboard-layout"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import snackbar from "@/lib/ui/snackbar"

type Stats = {
  totalStockValue: number
  totalBoughtPrice: number
  totalSellingPrice: number
  totalExpectedProfit: number
  totalTransactions: number
  totalStaffSalaries: number
  paidSalaries: number
  monthlyGrossProfit: number
  monthlyNetProfit: number
}

type RecentTx = {
  id: string
  date: string
  productsSold: string[]
  totalPrice: number
  adminName: string
  paymentType: string
}

export default function DashboardContent({ user, admin, stats, recentTransactions }: { user: any; admin: any; stats: Stats; recentTransactions: RecentTx[] }) {
  const ACCESS_KEY = "marshall-ethel-secret"
  const [hidden, setHidden] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accessKey, setAccessKey] = useState("")

  const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG")}`

  const handleToggle = () => {
    if (hidden) {
      // Hidden -> clicking the eye opens the access-key dialog
      setDialogOpen(true)
    } else {
      // Visible -> hide balances immediately
      setHidden(true)
    }
  }

  const handleSubmit = () => {
    if (accessKey.trim() === ACCESS_KEY) {
      setHidden(false)
      setDialogOpen(false)
      setAccessKey("")
      snackbar.success("Balances visible")
    } else {
      snackbar.error("Invalid access key")
    }
  }

  const handleCloseDialog = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setAccessKey("")
  }
  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Dashboard Overview</h2>
          <p className="text-neutral-600 dark:text-white/70">Key stats and recent activity</p>
        </div>

        <div className="flex justify-end mb-3">
          <Button variant="ghost" size="icon" onClick={handleToggle} className="text-[#0ea5e9] dark:text-white">
            {hidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Stock Value</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-white/70">Combined selling value of all items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#0ea5e9] dark:text-white">{hidden ? "₦••••" : formatCurrency(stats.totalStockValue)}</p>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Bought Price</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-white/70">Combined cost price of all items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{hidden ? "₦••••" : formatCurrency(stats.totalBoughtPrice)}</p>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Sales Revenue</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-white/70">All-time revenue from completed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#0ea5e9] dark:text-white">{hidden ? "₦••••" : formatCurrency(stats.totalSellingPrice)}</p>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Expected Profit</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-white/70">Selling − Buying (current stock)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={"text-3xl font-bold " + (stats.totalExpectedProfit >= 0 ? "text-[#0ea5e9] dark:text-white" : "text-red-500")}> 
                {hidden ? "₦••••" : formatCurrency(stats.totalExpectedProfit)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#0ea5e9]/30 ">
            <CardHeader>
              <CardTitle className="text-neutral-900 dark:text-white">Total Transactions</CardTitle>
              <CardDescription className="text-neutral-600 dark:text-white/70">Count of completed sales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{hidden ? "••••" : stats.totalTransactions.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Access Key</DialogTitle>
              <DialogDescription>Enter the access key to show balances</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <Input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Access key"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleCloseDialog(false)}>Cancel</Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <Card key={tx.id} className="border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 dark:hover:bg-white/5 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-neutral-600 dark:text-white/70 text-sm">{new Date(tx.date).toLocaleString()}</p>
                        <p className="text-neutral-900 dark:text-white font-medium mt-1">{tx.productsSold.join(", ")}</p>
                        <p className="text-neutral-600 dark:text-white/70 text-sm mt-1">By {tx.adminName} • {tx.paymentType.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-neutral-900 dark:text-white font-bold">₦{tx.totalPrice.toLocaleString("en-NG")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-[#0ea5e9]/30 ">
                <CardContent className="p-8 text-center">
                  <p className="text-neutral-600 dark:text-white/70">No recent transactions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
