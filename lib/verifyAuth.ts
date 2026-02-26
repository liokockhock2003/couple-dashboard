import "server-only"
import { adminAuth } from "@/lib/firebaseAdmin"
import { NextRequest } from "next/server"

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Returns the decoded token (with uid) or throws if invalid/missing.
 *
 * Usage in any API route:
 *   const decoded = await verifyAuth(request)
 *   const uid = decoded.uid
 */
export async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing or invalid Authorization header")
    }

    const idToken = authHeader.split("Bearer ")[1]
    const decoded = await adminAuth.verifyIdToken(idToken)
    return decoded
}