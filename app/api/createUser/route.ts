import { NextRequest, NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebaseAdmin"
import { verifyAuth } from "@/lib/verifyAuth"

// Creates a Firestore user document on first login,
// and updates lastLoginAt + profile fields on subsequent logins.
export async function POST(req: NextRequest) {
    try {
        // Verify the caller is a real Firebase-authenticated user
        let decoded
        try {
            decoded = await verifyAuth(req)
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { displayName, email, photoURL } = body

        // Always use the uid from the verified token — never trust the client
        const uid = decoded.uid

        const ref = adminDb.collection("users").doc(uid)
        const snap = await ref.get()

        if (!snap.exists) {
            // First-time login — create the full document
            await ref.set({
                coupleId: null,
                displayName: displayName ?? null,
                email: email ?? null,
                photoURL: photoURL ?? null,
                createdAt: FieldValue.serverTimestamp(),
                lastLoginAt: FieldValue.serverTimestamp(),
            })
            return NextResponse.json({ message: "User created" })
        } else {
            // Returning user — refresh mutable profile fields
            await ref.update({
                displayName: displayName ?? null,
                email: email ?? null,
                photoURL: photoURL ?? null,
                lastLoginAt: FieldValue.serverTimestamp(),
            })
            return NextResponse.json({ message: "User updated" })
        }
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to create/update user" }, { status: 500 })
    }
}