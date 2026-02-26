"use client"

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const floatingHearts = [
    { size: "text-2xl", top: "10%", left: "8%", delay: "0s", duration: "6s" },
    { size: "text-lg", top: "20%", left: "80%", delay: "1s", duration: "7s" },
    { size: "text-3xl", top: "55%", left: "5%", delay: "2s", duration: "8s" },
    { size: "text-xl", top: "70%", left: "88%", delay: "0.5s", duration: "5s" },
    { size: "text-2xl", top: "85%", left: "20%", delay: "1.5s", duration: "9s" },
    { size: "text-lg", top: "40%", left: "92%", delay: "3s", duration: "6.5s" },
    { size: "text-3xl", top: "15%", left: "50%", delay: "2.5s", duration: "7.5s" },
]

export default function LoginPage() {
    const router = useRouter()

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        // AuthContext will handle user state; always land on dashboard first
        router.push("/dashboard")
    }

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
            <div className="relative z-10 flex flex-col items-center gap-8 rounded-3xl bg-white/70 px-12 py-14 shadow-2xl backdrop-blur-md border border-pink-100 max-w-sm w-full mx-4">

                {/* Icon */}
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-pink-400 to-rose-400 shadow-lg text-4xl">
                    💑
                </div>

                {/* Heading */}
                <div className="text-center space-y-2">
                    <h1 className="font-pacifico text-4xl text-rose-400 leading-tight">
                        Our Space
                    </h1>
                    <p className="text-sm text-pink-400 tracking-wide">
                        a little corner just for two 🌸
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 h-px bg-pink-200" />
                    <span className="text-pink-300 text-xs">sign in to continue</span>
                    <div className="flex-1 h-px bg-pink-200" />
                </div>

                {/* Google button */}
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 w-full justify-center rounded-2xl border border-pink-200 bg-white px-6 py-3.5 text-sm font-medium text-rose-500 shadow-sm transition-all duration-200 hover:bg-pink-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                    {/* Google icon */}
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                {/* Footer */}
                <p className="text-center text-xs text-pink-300 leading-relaxed">
                    made with 💗 for us
                </p>
            </div>
        </div>
    )
}
