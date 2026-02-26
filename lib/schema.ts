import { Timestamp } from "firebase/firestore"

// ─────────────────────────────────────────────
// Collection: users
// Document ID: userId
// ─────────────────────────────────────────────
export interface UserDoc {
    coupleId: string | null
    createdAt: Timestamp
    // Google profile info
    displayName: string | null
    email: string | null
    photoURL: string | null
    // Last seen timestamp, updated on every login
    lastLoginAt: Timestamp
}

// ─────────────────────────────────────────────
// Collection: moods
// Document ID: moodId
// ─────────────────────────────────────────────
export type MoodValue = "happy" | "sad" | "angry" | "anxious" | "neutral" | "excited" | "tired"

export interface MoodDoc {
    userId: string
    date: Timestamp
    mood: MoodValue
    note: string
    createdAt: Timestamp
}

// ─────────────────────────────────────────────
// Collection: goals
// Document ID: goalId
// ─────────────────────────────────────────────
export interface GoalDoc {
    completed: boolean
    coupleId: string
    createdAt: Timestamp
    title: string
}

// ─────────────────────────────────────────────
// Collection: couples
// Document ID: coupleId
// ─────────────────────────────────────────────
export interface CoupleDoc {
    anniversaryDate: Timestamp
    createdAt: Timestamp
    members: [string, string]   // exactly two userIds
    nextDate: Timestamp | null
}
