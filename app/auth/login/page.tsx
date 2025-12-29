"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import snackbar from "@/lib/ui/snackbar"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error("Authentication service not configured")
      }
      const supabase = createClient()
      // Derive email from username (seeded users use temp emails)
      const uname = username.trim()
      const candidates = [
        `${uname}@dev.local`,
        `${uname}@devI.local`,
      ]

      let signedIn = false
      for (const email of candidates) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError) {
          signedIn = true
          break
        }
      }

      if (!signedIn) throw new Error("Invalid username or password")
      try {
        await fetch("/api/auth/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "login_success" }),
        })
      } catch {}
      snackbar.success("Logged in successfully")
      router.push("/dashboard")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred"
      setError(message)
      try {
        const uname = username.trim()
        await fetch("/api/auth/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "login_failure", username: uname, reason: message }),
        })
      } catch {}
      snackbar.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f0b0c] p-4">
      <div className="w-full max-w-md">
        <Card className="border-[#7a1632]/30 bg-white dark:bg-[#1a0d13]">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-[#7a1632] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-2xl font-bold text-[#7a1632] dark:text-white">MARSHALL ETHEL</h1>
            </div>
            <CardTitle className="text-neutral-900 dark:text-white">Welcome Back</CardTitle>
            <CardDescription className="text-neutral-600 dark:text-white/70">Login to your admin account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-neutral-700 dark:text-white/80">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white placeholder:text-neutral-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-700 dark:text-white/80">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white placeholder:text-neutral-400"
                />
                <div className="flex justify-end">
                  <Link 
                    href="/password/reset" 
                    className="text-xs text-[#7a1632] hover:text-[#66122a] font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-500">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={isLoading} className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-neutral-600 dark:text-white/70">
              Need help?{" "}
              <Link href="/" className="text-[#7a1632] hover:text-[#66122a]">
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
