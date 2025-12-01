import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Activity,
  Settings,
  Lock,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react"

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-xl font-bold text-white">DevI System</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-slate-300 hover:text-white transition">
              Features
            </a>
            <a href="#overview" className="text-slate-300 hover:text-white transition">
              Overview
            </a>
            <Link href="/auth/login">
              <Button className="bg-blue-600 hover:bg-blue-700">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">DevI Inventory Management System</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Complete store management solution designed for MARSHALL ETHEL NIG. LTD. Manage inventory, sales, staff, and
            financial operations all in one unified platform.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Admin Access
            </Button>
          </Link>
        </div>
      </section>

      {/* System Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-white mb-12 text-center">Powerful Features</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Package,
              title: "Stock Management",
              description: "Real-time inventory tracking with buying/selling price management and profit calculations.",
            },
            {
              icon: ShoppingCart,
              title: "Point of Sale",
              description: "Fast checkout system with automatic stock updates and receipt generation.",
            },
            {
              icon: Users,
              title: "Staff Management",
              description: "Employee tracking, salary management, and employment status monitoring.",
            },
            {
              icon: BarChart3,
              title: "Financial Reports",
              description: "Detailed reports on sales, expenses, and profit analysis with visual charts.",
            },
            {
              icon: Activity,
              title: "Activity Audit Trail",
              description: "Complete logging of all transactions and administrative actions for security.",
            },
            {
              icon: Lock,
              title: "Admin Control",
              description: "Role-based access control with Super Admin and Store Manager permissions.",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon as any
            return (
              <Card key={idx} className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                <CardContent className="p-6">
                  <Icon className="w-10 h-10 text-blue-500 mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* System Overview */}
      <section id="overview" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl font-bold text-white mb-12 text-center">System Overview</h3>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-6">What You Can Do</h4>
              <div className="space-y-4">
                {[
                  { icon: Package, label: "Add and manage product inventory" },
                  { icon: ShoppingCart, label: "Process sales transactions easily" },
                  { icon: DollarSign, label: "Track profit margins automatically" },
                  { icon: Users, label: "Manage staff and salary records" },
                  { icon: TrendingUp, label: "View sales analytics and reports" },
                  { icon: Activity, label: "Monitor all system activities" },
                ].map((item, idx) => {
                  const Icon = item.icon as any
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-blue-500" />
                      <span className="text-slate-300">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-white mb-6">Dashboard Navigation</h4>
              <div className="space-y-3">
                {[
                  { name: "Dashboard", description: "Main overview and quick stats" },
                  { name: "Products", description: "Manage store inventory" },
                  { name: "Checkout", description: "Process sales and generate receipts" },
                  { name: "Staff", description: "Employee and salary management" },
                  { name: "Admin Management", description: "Create and manage admin accounts (Super Admin only)" },
                  { name: "Activity History", description: "View audit trail of all actions" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-blue-500/50 transition"
                  >
                    <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                    <p className="text-slate-400 text-xs mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 border-t border-slate-700 pt-12">
            {[
              {
                icon: Lock,
                title: "Secure Access",
                description: "Username and password protected with role-based permissions",
              },
              {
                icon: Clock,
                title: "Real-time Updates",
                description: "All inventory and sales data updates instantly",
              },
              {
                icon: Settings,
                title: "Easy Management",
                description: "Intuitive interface designed for store operations",
              },
            ].map((item, idx) => {
              const Icon = item.icon as any
              return (
                <div key={idx} className="text-center">
                  <Icon className="w-12 h-12 text-blue-500 mb-4 mx-auto" />
                  <h5 className="font-semibold text-white mb-2">{item.title}</h5>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600/20 to-slate-600/20 border border-blue-500/30 rounded-xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Log in to access the complete DevI system and start managing your store operations efficiently.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Login to DevI System
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center text-slate-400 text-sm">
            <p>DevI Inventory & Salary Management System for MARSHALL ETHEL NIG. LTD.</p>
            <p className="mt-2">&copy; 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
