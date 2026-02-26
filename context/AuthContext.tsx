"use client"

import {
    onAuthStateChanged, getIdToken
} from "firebase/auth"
import {
    doc,
    getDoc,
} from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { createContext, useEffect, useState } from "react"

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

    // Re-reads the Firestore user doc and updates context state.
    // Call this after any operation that changes the user doc (e.g. connecting a partner).
    const refreshUser = async () => {
        if (!firebaseUid) return
        const snap = await getDoc(doc(db, "users", firebaseUid))
        if (snap.exists()) {
            const data = snap.data()
            setUser((prev) => prev ? {
                ...prev,
                coupleId: data.coupleId ?? null,
                displayName: data.displayName ?? prev.displayName,
                email: data.email ?? prev.email,
                photoURL: data.photoURL ?? prev.photoURL,
            } : null)
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

            const docRef = doc(db, "users", firebaseUser.uid)
            const snap = await getDoc(docRef)

            if (!snap.exists()) {
                // First-time login → create user
                const idToken = await getIdToken(firebaseUser)
                await fetch("/api/createUser", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,   // ← add this
                    },
                    body: JSON.stringify({
                        uid: firebaseUser.uid,
                        displayName: firebaseUser.displayName,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL,
                    }),
                })

                setUser({
                    uid: firebaseUser.uid,
                    coupleId: null,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                })
            } else {
                const data = snap.data()
                setUser({
                    uid: firebaseUser.uid,
                    coupleId: data.coupleId ?? null,
                    displayName: data.displayName ?? firebaseUser.displayName,
                    email: data.email ?? firebaseUser.email,
                    photoURL: data.photoURL ?? firebaseUser.photoURL,
                })
            }

            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}