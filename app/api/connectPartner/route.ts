import { NextRequest, NextResponse } from "next/server"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebaseAdmin"
import { verifyAuth } from "@/lib/verifyAuth"

export async function POST(req: NextRequest) {
    try {
        // Verify the caller is a real Firebase-authenticated user
        let decoded
        try {
            decoded = await verifyAuth(req)
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { partnerEmail, anniversaryDate } = await req.json()

        // Always use the uid from the verified token — never trust the client
        const uid = decoded.uid

        if (!partnerEmail) {
            return NextResponse.json(
                { error: "Missing partnerEmail" },
                { status: 400 }
            )
        }

        // 1. Find partner by email
        const partnerQuery = await adminDb
            .collection("users")
            .where("email", "==", partnerEmail.trim().toLowerCase())
            .get()

        if (partnerQuery.empty) {
            return NextResponse.json(
                { error: "No user found with that email. Make sure your partner has signed in first." },
                { status: 404 }
            )
        }

        const partnerDocSnap = partnerQuery.docs[0]
        const partnerUid = partnerDocSnap.id
        const partnerData = partnerDocSnap.data()

        // 2. Prevent connecting to yourself
        if (partnerUid === uid) {
            return NextResponse.json(
                { error: "You can't connect with yourself 😅" },
                { status: 400 }
            )
        }

        // 3. Check partner isn't already in a couple
        if (partnerData.coupleId != null && partnerData.coupleId !== "null" && partnerData.coupleId !== "") {
            return NextResponse.json(
                { error: "That user is already connected to a partner." },
                { status: 409 }
            )
        }

        // 4. Check that the requesting user isn't already coupled
        const selfSnap = await adminDb.collection("users").doc(uid).get()
        if (selfSnap.exists) {
            const selfData = selfSnap.data()!
            if (selfData.coupleId != null && selfData.coupleId !== "null" && selfData.coupleId !== "") {
                return NextResponse.json(
                    { error: "You are already connected to a partner." },
                    { status: 409 }
                )
            }
        }

        // 5. Create the couple document
        const anniversary = anniversaryDate
            ? Timestamp.fromDate(new Date(anniversaryDate))
            : Timestamp.fromDate(new Date())

        const coupleRef = await adminDb.collection("couples").add({
            members: [uid, partnerUid],
            anniversaryDate: anniversary,
            nextDate: null,
            createdAt: FieldValue.serverTimestamp(),
        })

        const coupleId = coupleRef.id

        // 6. Update both user documents with the new coupleId
        await Promise.all([
            adminDb.collection("users").doc(uid).update({ coupleId }),
            adminDb.collection("users").doc(partnerUid).update({ coupleId }),
        ])

        return NextResponse.json({ message: "Connected!", coupleId })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
    }
}
