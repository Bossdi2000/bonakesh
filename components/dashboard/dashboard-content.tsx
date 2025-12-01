"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "./dashboard-layout"

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
  return (
    <DashboardLayout admin={admin} user={user}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-400">Key stats and recent activity</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Total Stock Value</CardTitle>
              <CardDescription className="text-slate-400">Combined selling value of all items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">₦{stats.totalStockValue.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Total Bought Price</CardTitle>
              <CardDescription className="text-slate-400">Combined cost price of all items</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">₦{stats.totalBoughtPrice.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Total Sales Revenue</CardTitle>
              <CardDescription className="text-slate-400">All-time revenue from completed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">₦{stats.totalSellingPrice.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Total Expected Profit</CardTitle>
              <CardDescription className="text-slate-400">Selling − Buying (current stock)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={"text-3xl font-bold " + (stats.totalExpectedProfit >= 0 ? "text-green-500" : "text-red-500")}>
                ₦{stats.totalExpectedProfit.toLocaleString("en-NG")}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Total Transactions</CardTitle>
              <CardDescription className="text-slate-400">Count of completed sales</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{stats.totalTransactions.toLocaleString("en-NG")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <Card key={tx.id} className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm">{new Date(tx.date).toLocaleString()}</p>
                        <p className="text-white font-medium mt-1">{tx.productsSold.join(", ")}</p>
                        <p className="text-slate-400 text-sm mt-1">By {tx.adminName} • {tx.paymentType.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">₦{tx.totalPrice.toLocaleString("en-NG")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No recent transactions</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
