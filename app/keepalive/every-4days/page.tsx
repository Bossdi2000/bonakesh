"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function KeepAlivePage() {
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [nextPing, setNextPing] = useState<number | null>(null)
    const [status, setStatus] = useState<"idle" | "pinging" | "success" | "error">("idle")
    const [lastPingTime, setLastPingTime] = useState<string | null>(null)
    const [logs, setLogs] = useState<string[]>([])

    // 4 days in milliseconds
    const INTERVAL_MS = 4 * 24 * 60 * 60 * 1000

    const supabase = createClient()

    useEffect(() => {
        // Load state from localStorage on mount
        const storedNextPing = localStorage.getItem("keepalive_next_ping")
        const storedLastPing = localStorage.getItem("keepalive_last_ping")

        if (storedNextPing) {
            setNextPing(parseInt(storedNextPing, 10))
        } else {
            resetTimer()
        }

        if (storedLastPing) {
            setLastPingTime(storedLastPing)
        }

        addLog("Keep-alive monitor started")
    }, [])

    useEffect(() => {
        if (!nextPing) return

        const timer = setInterval(() => {
            const now = Date.now()
            const diff = nextPing - now

            if (diff <= 0) {
                // Timer expired, trigger ping
                handlePing()
            } else {
                setTimeLeft(diff)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [nextPing])

    const resetTimer = () => {
        const next = Date.now() + INTERVAL_MS
        setNextPing(next)
        localStorage.setItem("keepalive_next_ping", next.toString())
        setTimeLeft(INTERVAL_MS)
    }

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString()
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50))
    }

    const handlePing = async () => {
        if (status === "pinging") return

        setStatus("pinging")
        addLog("Pinging Supabase database...")

        try {
            // Simple query to wake up the DB
            const { data, error } = await supabase.from('products').select('id').limit(1)

            if (error) throw error

            setStatus("success")
            const nowStr = new Date().toLocaleString()
            setLastPingTime(nowStr)
            localStorage.setItem("keepalive_last_ping", nowStr)
            addLog("Ping successful! Database is active.")

            // Verification
            setTimeout(() => {
                setStatus("idle")
                resetTimer() // Restart the 4-day countdown
            }, 2000)

        } catch (err: any) {
            console.error(err)
            setStatus("error")
            addLog(`Ping failed: ${err.message}`)

            // Retry in 1 hour if failed? Or just keep "error" state visible.
            // Let's reset purely so the user doesn't get stuck, but maybe shorter interval?
            // For now, adhere to 4-day reset to restart the loop.
            setTimeout(() => {
                setStatus("idle")
                resetTimer()
            }, 5000)
        }
    }

    const formatTime = (ms: number) => {
        if (ms < 0) return "00d 00h 00m 00s"
        const seconds = Math.floor((ms / 1000) % 60)
        const minutes = Math.floor((ms / (1000 * 60)) % 60)
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
        const days = Math.floor(ms / (1000 * 60 * 60 * 24))

        return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
    }

    const getProgress = () => {
        if (!nextPing) return 0
        const total = INTERVAL_MS
        const elapsed = total - timeLeft
        return Math.min(100, Math.max(0, (elapsed / total) * 100))
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f0b0c] p-6 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-2xl space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-[#7a1632] dark:text-white flex items-center justify-center gap-3">
                        <Activity className="w-8 h-8" />
                        Database Keep-Alive
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Prevent Supabase project pausing by automatically pinging the database every 4 days.
                    </p>
                    <p className="text-xs text-slate-500 bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 rounded-full inline-block">
                        ⚠️ Keep this tab open or pin it to ensure the timer runs accurately.
                    </p>
                </div>

                <Card className="border-[#7a1632]/20 shadow-lg bg-white dark:bg-[#1a0d13]">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center space-y-8">

                            {/* Timer Display */}
                            <div className="relative flex flex-col items-center justify-center w-64 h-64 border-8 border-slate-100 dark:border-slate-800 rounded-full">
                                <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none transform scale-[1.05]">
                                    <circle
                                        cx="50%" cy="50%" r="46%"
                                        fill="transparent"
                                        stroke="#7a1632"
                                        strokeWidth="8"
                                        strokeDasharray="289%" // Approx circum
                                        strokeDashoffset={`${289 - (289 * getProgress() / 100)}%`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-linear"
                                    />
                                </svg>

                                <div className="text-center z-10">
                                    <span className="block text-sm text-slate-400 uppercase tracking-widest mb-1">Time Remaining</span>
                                    <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500">
                                        Target: {nextPing ? new Date(nextPing).toLocaleString() : "Calculation..."}
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col items-center gap-4 w-full">
                                {status === "pinging" ? (
                                    <div className="flex items-center gap-2 text-[#7a1632] animate-pulse font-medium">
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Pinging database...
                                    </div>
                                ) : (
                                    <Button
                                        size="lg"
                                        onClick={handlePing}
                                        className="bg-[#7a1632] hover:bg-[#66122a] text-white px-8 rounded-full shadow-md transition-transform hover:scale-105"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Ping Now
                                    </Button>
                                )}

                                <div className="grid grid-cols-2 gap-4 w-full text-center mt-4 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</div>
                                        <div className="font-semibold flex items-center justify-center gap-1">
                                            {status === "success" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                            {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            {status === "idle" && <Clock className="w-4 h-4 text-slate-400" />}
                                            <span className={status === "success" ? "text-green-600" : status === "error" ? "text-red-600" : "text-slate-700 dark:text-slate-300"}>
                                                {status === "idle" ? "Waiting" : status === "success" ? "Success" : status === "error" ? "Failed" : "Working"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Ping</div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-300">
                                            {lastPingTime || "Never"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Logs */}
                <Card className="border-[#7a1632]/20 shadow-sm bg-white dark:bg-[#1a0d13]">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm uppercase tracking-widest text-slate-500">Activity Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-32 overflow-y-auto font-mono text-xs bg-slate-50 dark:bg-black rounded border border-slate-200 dark:border-slate-800 p-3 space-y-1">
                            {logs.length === 0 ? (
                                <span className="text-slate-400 italic">No activity recorded yet...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="text-slate-600 dark:text-slate-400 border-b border-dashed border-slate-200 dark:border-slate-800 last:border-0 pb-1">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
