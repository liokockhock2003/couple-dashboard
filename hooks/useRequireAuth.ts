"use client"

import { useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/AuthContext"

/**
 * Use this hook at the top of any page that requires login.
 * Redirects to /login if not authenticated.
 * Redirects to /connect if authenticated but no partner yet (optional).
 *
 * @param requireCouple - if true, also redirects to /connect when coupleId is null
 */
export function useRequireAuth(requireCouple = false) {
    const { user, loading } = useContext(AuthContext)
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        if (!user) {
            router.push("/login")
            return
        }

        if (requireCouple && user.coupleId === null) {
            router.push("/connect")
        }
    }, [user, loading, router, requireCouple])

    return { user, loading }
}