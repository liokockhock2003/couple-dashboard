import "server-only"
import admin from "firebase-admin"

// Prevent re-initializing during hot reload in development
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Replace \n in the private key (environment variables escape newlines)
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    })
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()