"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f0b0c] p-4">
      <div className="w-full max-w-md">
        <Card className="border-[#0ea5e9]/30 ">
          <CardHeader>
            <CardTitle className="text-neutral-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Authentication Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600 dark:text-white/70">
              There was an error with your authentication. Please try again or contact support.
            </p>
            <div className="flex gap-2">
              <Link href="/auth/login" className="flex-1">
                <Button className="w-full bg-[#0ea5e9] hover:bg-[#0284c7] text-white">Back to Login</Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-[#0ea5e9]/30 text-neutral-700 dark:text-white/80 hover:bg-[#0ea5e9]/10 dark:hover:bg-white/10 bg-transparent"
                >
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
