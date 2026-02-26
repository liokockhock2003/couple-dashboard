import "server-only"
import admin from "firebase-admin"

function getPrivateKey(): string {
    const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!key) {
        throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set")
    }

    // Strip surrounding quotes if Vercel wrapped the value
    const stripped = key.replace(/^["']|["']$/g, "")

    // If the key already contains real newlines, return as-is
    if (stripped.includes("\n")) {
        return stripped
    }

    // Otherwise convert escaped \n to real newlines
    return stripped.replace(/\\n/g, "\n")
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: getPrivateKey(),
            }),
        })
        console.log("Firebase Admin initialized successfully")
    } catch (error) {
        console.error("Firebase Admin initialization error:", error)
        throw error
    }
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()