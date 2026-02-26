"use client"

import { useContext, useEffect } from "react"
import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function Home() {
  const { user, loading } = useContext(AuthContext)
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (!user.coupleId) {
      router.push("/connect")
    } else {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-pink-100 via-rose-50 to-fuchsia-100">
      <p className="font-pacifico text-2xl text-rose-300 animate-pulse">loading our space... 🌸</p>
    </div>
  )
}