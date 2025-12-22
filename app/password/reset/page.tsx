"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function PasswordResetPage() {
    const [username, setUsername] = useState("")
    const [fullName, setFullName] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            if (newPassword.length < 6) {
                throw new Error("Password must be at least 6 characters")
            }

            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, fullName, newPassword }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to reset password")
            }

            setSuccess(true)
            setUsername("")
            setFullName("")
            setNewPassword("")
        } catch (err: any) {
            setError(err.message)
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
                        <CardTitle className="text-neutral-900 dark:text-white">Reset Password</CardTitle>
                        <CardDescription className="text-neutral-600 dark:text-white/70">Enter your details to reset your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4">
                                <Alert className="border-green-500/50 bg-green-500/10">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <AlertDescription className="text-green-500">Password updated successfully</AlertDescription>
                                </Alert>
                                <Link href="/auth/login">
                                    <Button className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">
                                        Return to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-neutral-700 dark:text-white/80">Username</Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-neutral-700 dark:text-white/80">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-neutral-700 dark:text-white/80">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={isLoading}
                                        className="bg-white border-[#7a1632]/30 text-neutral-900 dark:bg-[#140a0f] dark:text-white"
                                    />
                                </div>

                                {error && (
                                    <Alert className="border-red-500/50 bg-red-500/10">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <AlertDescription className="text-red-500">{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button type="submit" disabled={isLoading} className="w-full bg-[#7a1632] hover:bg-[#66122a] text-white">
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>

                                <div className="text-center text-sm">
                                    <Link href="/auth/login" className="text-[#7a1632] hover:underline">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
