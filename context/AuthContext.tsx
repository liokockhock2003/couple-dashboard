"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface AppUser {
    uid: string
    coupleId: string | null
    displayName: string | null
    email: string | null
    photoURL: string | null
}

export const AuthContext = createContext<{
    user: AppUser | null
    loading: boolean
    refreshUser: () => Promise<void>
}>({
    user: null,
    loading: true,
    refreshUser: async () => { },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [firebaseUid, setFirebaseUid] = useState<string | null>(null)

    const refreshUser = async () => {
        if (!firebaseUid) return
        const snap = await getDoc(doc(db, "users", firebaseUid))
        if (snap.exists()) {
            const data = snap.data()
            // ✅ Fix 2 — actually update the user state
            setUser({
                uid: firebaseUid,
                coupleId: data.coupleId ?? null,
                displayName: data.displayName ?? null,
                email: data.email ?? null,
                photoURL: data.photoURL ?? null,
            })
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null)
                setFirebaseUid(null)
                setLoading(false)
                return
            }

            setFirebaseUid(firebaseUser.uid)

            try {
                // ✅ Fix 1 — get the ID token and send it in the Authorization header
                const idToken = await getIdToken(firebaseUser)

                await fetch("/api/createUser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                    }),
                })

                // Read the Firestore doc to get coupleId and other stored fields
                const snap = await getDoc(doc(db, "users", firebaseUser.uid))
                if (snap.exists()) {
                    const data = snap.data()
                    setUser({
                        uid: firebaseUser.uid,
                        coupleId: data.coupleId ?? null,
                        displayName: data.displayName ?? null,
                        email: data.email ?? null,
                        photoURL: data.photoURL ?? null,
                    })
                }
            } catch (err) {
                console.error("AuthContext error:", err)
            } finally {
                setLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}