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
    <div className="min-h-screen bg-white dark:bg-[#0f0b0c]">
      {/* Navigation */}
      <nav className="border-b border-[#7a1632]/20 bg-white/90 dark:bg-[#1a0d13]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7a1632] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold text-[#7a1632] dark:text-white">MARSHALL ETHEL</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-[#7a1632]/70 hover:text-[#7a1632] dark:text-white/80 dark:hover:text-white transition">
              Features
            </a>
            <a href="#overview" className="text-[#7a1632]/70 hover:text-[#7a1632] dark:text-white/80 dark:hover:text-white transition">
              Overview
            </a>
            <Link href="/auth/login">
              <Button className="bg-[#7a1632] hover:bg-[#66122a] text-white">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#7a1632] dark:text-white mb-4">Marshall-ethel</h2>
          <p className="text-lg md:text-xl text-neutral-700 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Complete store management solution designed for MARSHALL ETHEL NIG. LTD. Manage inventory, sales, staff, and
            financial operations all in one unified platform.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-[#7a1632] hover:bg-[#66122a] text-white">
              Admin Access
            </Button>
          </Link>
        </div>
      </section>

      {/* System Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl md:text-4xl font-bold text-[#7a1632] dark:text-white mb-12 text-center">Powerful Features</h3>
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
              <Card key={idx} className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13] hover:shadow-lg transition">
                <CardContent className="p-6">
                  <Icon className="w-10 h-10 text-[#7a1632] mb-4" />
                  <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{feature.title}</h4>
                  <p className="text-neutral-600 dark:text-white/70 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
              )
            })}
        </div>
      </section>

      {/* System Overview */}
      <section id="overview" className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-3xl md:text-4xl font-bold text-[#7a1632] dark:text-white mb-12 text-center">System Overview</h3>
        <div className="bg-white dark:bg-[#1a0d13] border border-[#7a1632]/30 rounded-xl p-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">What You Can Do</h4>
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
                      <Icon className="w-5 h-5 text-[#7a1632]" />
                      <span className="text-neutral-700 dark:text-white/80">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Dashboard Navigation</h4>
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
                    className="rounded-lg p-4 border border-[#7a1632]/30 bg-white dark:bg-[#140a0f] hover:border-[#7a1632]/50 transition"
                  >
                    <h5 className="font-semibold text-neutral-900 dark:text-white text-sm">{item.name}</h5>
                    <p className="text-neutral-600 dark:text-white/70 text-xs mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6 border-t border-[#7a1632]/20 pt-12">
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
                  <Icon className="w-12 h-12 text-[#7a1632] mb-4 mx-auto" />
                  <h5 className="font-semibold text-neutral-900 dark:text-white mb-2">{item.title}</h5>
                  <p className="text-neutral-600 dark:text-white/70 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="border border-[#7a1632]/30 rounded-xl p-12 text-center bg-white dark:bg-[#140a0f]">
          <h3 className="text-3xl font-bold text-[#7a1632] dark:text-white mb-4">Ready to Get Started?</h3>
          <p className="text-neutral-700 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Log in to access the complete Marshall-ethel system and start managing your store operations efficiently.
          </p>
          <Link href="/auth/login">
            <Button size="lg" className="bg-[#7a1632] hover:bg-[#66122a] text-white">
              Login to Marshall-ethel
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#7a1632]/20 bg-white dark:bg-[#1a0d13] mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center text-neutral-600 dark:text-white/70 text-sm">
            <p>Marshall-ethel Inventory & Salary Management System</p>
            <p className="mt-2">&copy; 2025 All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
