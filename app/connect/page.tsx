"use client"

import { useContext, useState } from "react"
import { AuthContext } from "@/context/AuthContext"
import { auth } from "@/lib/firebase"
import { getIdToken } from "firebase/auth"
import { useRouter } from "next/navigation"
import { useRequireAuth } from "@/hooks/useRequireAuth"

const floatingHearts = [
    { size: "text-2xl", top: "10%", left: "8%", delay: "0s", duration: "6s" },
    { size: "text-lg", top: "20%", left: "80%", delay: "1s", duration: "7s" },
    { size: "text-3xl", top: "55%", left: "5%", delay: "2s", duration: "8s" },
    { size: "text-xl", top: "70%", left: "88%", delay: "0.5s", duration: "5s" },
    { size: "text-2xl", top: "85%", left: "20%", delay: "1.5s", duration: "9s" },
    { size: "text-lg", top: "40%", left: "92%", delay: "3s", duration: "6.5s" },
    { size: "text-3xl", top: "15%", left: "50%", delay: "2.5s", duration: "7.5s" },
]

type Status = "idle" | "loading" | "success" | "error"

export default function ConnectPage() {
    useRequireAuth()   // redirects to /login if not authenticated
    const { user, refreshUser } = useContext(AuthContext)
    const router = useRouter()

    const [email, setEmail] = useState("")
    const [anniversaryDate, setAnniversaryDate] = useState("")
    const [status, setStatus] = useState<Status>("idle")
    const [message, setMessage] = useState("")

    const handleConnect = async () => {
        if (!user || !email.trim()) return

        setStatus("loading")
        setMessage("")

        try {
            // Get a fresh ID token to authenticate the API call
            const idToken = await getIdToken(auth.currentUser!)

            const res = await fetch("/api/connectPartner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    partnerEmail: email.trim().toLowerCase(),
                    anniversaryDate: anniversaryDate || null,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setStatus("error")
                setMessage(data.error ?? "Something went wrong.")
                return
            }

            setStatus("success")
            setMessage("You're connected! 💑 Taking you to your space...")
            // Refresh AuthContext so coupleId is updated before navigating
            await refreshUser()
            setTimeout(() => router.push("/dashboard"), 2000)
        } catch {
            setStatus("error")
            setMessage("Network error. Please try again.")
        }
    }

    // Render nothing while auth is resolving / redirecting to /login
    if (!user) return null

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-pink-100 via-rose-50 to-fuchsia-100">

            {/* Floating hearts */}
            {floatingHearts.map((h, i) => (
                <span
                    key={i}
                    className={`pointer-events-none absolute select-none ${h.size} animate-bounce opacity-30`}
                    style={{
                        top: h.top,
                        left: h.left,
                        animationDelay: h.delay,
                        animationDuration: h.duration,
                    }}
                >
                    🩷
                </span>
            ))}

            {/* Card */}
            <div className="relative z-10 flex flex-col items-center gap-7 rounded-3xl bg-white/70 px-10 py-12 shadow-2xl backdrop-blur-md border border-pink-100 max-w-sm w-full mx-4">

                {/* Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-pink-400 to-rose-400 shadow-lg text-4xl">
                    💌
                </div>

                {/* Heading */}
                <div className="text-center space-y-2">
                    <h1 className="font-pacifico text-3xl text-rose-400 leading-tight">
                        Find Your Person
                    </h1>
                    <p className="text-sm text-pink-400">
                        enter your partner&apos;s email to link your spaces together 🔗
                    </p>
                </div>

                {/* Your own email hint */}
                {user?.email && (
                    <div className="w-full rounded-2xl bg-pink-50 border border-pink-100 px-4 py-3 flex items-center gap-3">
                        <span className="text-lg">🧸</span>
                        <div className="min-w-0">
                            <p className="text-xs text-pink-300">you&apos;re signed in as</p>
                            <p className="text-sm font-medium text-pink-600 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-pink-200" />
                    <span className="text-pink-300 text-xs whitespace-nowrap">partner&apos;s email</span>
                    <div className="flex-1 h-px bg-pink-200" />
                </div>

                {/* Email + Date inputs */}
                <div className="w-full flex flex-col gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setMessage("") }}
                        onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                        placeholder="partner@email.com"
                        disabled={status === "loading" || status === "success"}
                        className="w-full rounded-2xl border border-pink-200 bg-white/80 px-5 py-3 text-sm text-pink-700 placeholder-pink-300 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 disabled:opacity-50 transition"
                    />

                    {/* Anniversary date picker */}
                    <div className="w-full rounded-2xl border border-pink-200 bg-white/80 px-5 py-3 flex items-center gap-3 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition">
                        <span className="text-lg shrink-0">💝</span>
                        <div className="flex flex-col flex-1 min-w-0">
                            <label className="text-xs text-pink-300 leading-none mb-1">
                                when did you become official?
                            </label>
                            <input
                                type="date"
                                value={anniversaryDate}
                                onChange={(e) => setAnniversaryDate(e.target.value)}
                                max={new Date().toISOString().split("T")[0]}
                                disabled={status === "loading" || status === "success"}
                                className="bg-transparent text-sm text-pink-700 outline-none disabled:opacity-50 w-full"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={!email.trim() || status === "loading" || status === "success"}
                        className="w-full rounded-2xl bg-rose-400 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-rose-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:scale-100"
                    >
                        {status === "loading" ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">🌸</span> connecting...
                            </span>
                        ) : status === "success" ? (
                            "connected! 💑"
                        ) : (
                            "connect with partner �"
                        )}
                    </button>
                </div>

                {/* Status message */}
                {message && (
                    <div
                        className={`w-full rounded-2xl px-4 py-3 text-sm text-center ${status === "error"
                            ? "bg-red-50 border border-red-200 text-red-400"
                            : "bg-emerald-50 border border-emerald-200 text-emerald-500"
                            }`}
                    >
                        {message}
                    </div>
                )}

                {/* Footer note */}
                <p className="text-center text-xs text-pink-300 leading-relaxed">
                    your partner must have signed in at least once 🌙
                </p>
            </div>
        </div>
    )
}
