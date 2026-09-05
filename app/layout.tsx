import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Marshall-ethel",
  description: "Inventory and Salary Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <SonnerToaster richColors closeButton position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
