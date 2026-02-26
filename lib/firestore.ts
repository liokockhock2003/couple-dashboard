import {
    collection,
    doc,
    CollectionReference,
    DocumentReference,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { UserDoc, MoodDoc, GoalDoc, CoupleDoc } from "@/lib/schema"

// ── Typed collection references ───────────────────────────────────────────────

export const usersCol = collection(
    db, "users"
) as CollectionReference<UserDoc>

export const moodsCol = collection(
    db, "moods"
) as CollectionReference<MoodDoc>

export const goalsCol = collection(
    db, "goals"
) as CollectionReference<GoalDoc>

export const couplesCol = collection(
    db, "couples"
) as CollectionReference<CoupleDoc>

// ── Typed document references ─────────────────────────────────────────────────

export const userDoc = (userId: string) =>
    doc(db, "users", userId) as DocumentReference<UserDoc>

export const moodDoc = (moodId: string) =>
    doc(db, "moods", moodId) as DocumentReference<MoodDoc>

export const goalDoc = (goalId: string) =>
    doc(db, "goals", goalId) as DocumentReference<GoalDoc>

export const coupleDoc = (coupleId: string) =>
    doc(db, "couples", coupleId) as DocumentReference<CoupleDoc>
