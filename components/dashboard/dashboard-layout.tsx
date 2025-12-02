"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, ShoppingCart, Users, History, Settings, LogOut, Menu, X, Moon, Sun, Eye } from "lucide-react"
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
    <div className="min-h-screen bg-white dark:bg-[#0f0b0c]">
      {/* Header */}
      <header className="border-b border-[#7a1632]/20 bg-white/90 dark:bg-[#1a0d13]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-[#7a1632] hover:text-[#66122a] dark:text-white">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7a1632] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-xl font-bold text-[#7a1632] dark:text-white hidden sm:inline">MARSHALL ETHEL</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#7a1632] dark:text-white">{admin?.full_name || user?.email}</p>
              <p className="text-xs text-neutral-600 dark:text-white/70 capitalize">{admin?.role?.replace("_", " ")}</p>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-[#2a1620] hover:bg-neutral-200 dark:hover:bg-[#3a1a28] text-[#7a1632] dark:text-white transition-colors"
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
              className="border-[#7a1632]/40 text-[#7a1632] hover:bg-[#7a1632]/10 bg-transparent dark:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 border-r border-[#7a1632]/20 bg-white dark:bg-[#1a0d13] p-4 fixed md:static md:h-[calc(100vh-73px)] z-30`}
        >
          <nav className="space-y-2">
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
                      ? "bg-[#7a1632] text-white"
                      : "text-[#7a1632] hover:bg-[#7a1632]/10 dark:text-white dark:hover:bg-white/10"
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
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
