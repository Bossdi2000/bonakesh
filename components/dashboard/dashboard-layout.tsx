"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, ShoppingCart, Users, History, Settings, LogOut, Menu, X, Moon, Sun, Eye, Building2 } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export default function DashboardLayout({ admin, user, children }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { theme, toggleTheme, mounted } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    try {
      await fetch("/api/auth/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "logout" }),
      })
    } catch {}
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const menuItems = (
    admin?.role === "super_admin"
      ? [
          { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
          { href: "/dashboard/products", label: "Stock", icon: Package },
          { href: "/dashboard/shops", label: "Manage Shops", icon: Building2 },
          { href: "/dashboard/checkout", label: "Checkout", icon: ShoppingCart },
          { href: "/dashboard/checkout/view", label: "Customer View", icon: Eye },
          { href: "/dashboard/staff", label: "Staff", icon: Users },
          { href: "/dashboard/history", label: "History", icon: History },
          { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
          { href: "/dashboard/admins", label: "Admins", icon: Settings },
        ]
      : [
          { href: "/dashboard/checkout", label: "Checkout", icon: ShoppingCart },
          { href: "/dashboard/history", label: "History", icon: History },
        ]
  )

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="border-b border-sky-200 dark:border-sky-900/40 bg-white/90 dark:bg-[#0a0f14]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-sky-600 hover:text-sky-700 dark:text-sky-300">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[#0ea5e9]/40">
                <Image src="/logo.jpg" alt="Marshall Ethel Logo" width={40} height={40} className="object-cover w-full h-full" />
              </div>
              <h1 className="text-xl font-bold text-sky-700 dark:text-sky-300 hidden sm:inline">MARSHALL ETHEL</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-sky-800 dark:text-sky-100">{admin?.full_name || user?.email}</p>
              <p className="text-xs text-sky-600/80 dark:text-sky-300/70 capitalize">{admin?.role?.replace("_", " ")}</p>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 hover:bg-sky-200 dark:hover:bg-sky-800/50 text-sky-700 dark:text-sky-200 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}
            <Button
              onClick={handleLogout}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-sky-300 text-sky-700 hover:bg-sky-50 bg-transparent dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900/40"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex items-start">
        {/* Sidebar - sticky, stays in place while content scrolls, own bg image */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 border-r border-sky-200 dark:border-sky-900/40 p-4 sticky top-[73px] z-30 overflow-y-auto max-h-[calc(100vh-73px)] md:shrink-0 bg-cover bg-center relative`}
          style={{
            backgroundImage:
              theme === "dark"
                ? "linear-gradient(rgba(10,15,20,0.92), rgba(10,15,20,0.92)), url('/dashboard-bg.jpg')"
                : "linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), url('/dashboard-bg.jpg')",
          }}
        >
          <nav className="space-y-2 relative">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-sky-900 hover:bg-sky-100 dark:text-sky-100 dark:hover:bg-sky-900/40"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 w-full min-w-0">{children}</main>
      </div>
    </div>
  )
}
