"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore"
import { moodsCol, moodDoc } from "@/lib/firestore"
import { MoodDoc, MoodValue } from "@/lib/schema"

const MOODS: { value: MoodValue; emoji: string; label: string }[] = [
    { value: "happy", emoji: "😊", label: "Happy" },
    { value: "excited", emoji: "🥳", label: "Excited" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "tired", emoji: "😴", label: "Tired" },
    { value: "anxious", emoji: "😰", label: "Anxious" },
    { value: "sad", emoji: "🥺", label: "Sad" },
    { value: "angry", emoji: "😤", label: "Angry" },
]

interface Props {
    userId: string
    displayName: string | null
    photoURL: string | null
    isOwner: boolean          // true = current user, false = partner (read-only)
}

export default function MoodCard({ userId, displayName, photoURL, isOwner }: Props) {
    const [todayEntry, setTodayEntry] = useState<(MoodDoc & { id: string }) | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Stable start-of-today timestamp (recalculated only on mount)
    const todayStartTs = (() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return Timestamp.fromDate(d)
    })()

    useEffect(() => {
        const q = query(
            moodsCol,
            where("userId", "==", userId),
            where("date", ">=", todayStartTs),
            orderBy("date", "desc"),
            limit(1)
        )
        const unsub = onSnapshot(q, (snap) => {
            if (!snap.empty) {
                const d = snap.docs[0]
                setTodayEntry({ id: d.id, ...d.data() })
            } else {
                setTodayEntry(null)
            }
            setLoading(false)
        })
        return () => unsub()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])

    const selectMood = async (mood: MoodValue) => {
        if (!isOwner || saving) return
        setSaving(true)
        if (todayEntry) {
            await updateDoc(moodDoc(todayEntry.id), { mood })
        } else {
            await addDoc(moodsCol, {
                userId,
                mood,
                note: "",
                date: Timestamp.fromDate(new Date()),
                createdAt: serverTimestamp(),
            })
        }
        setSaving(false)
    }

    const currentMood = MOODS.find((m) => m.value === todayEntry?.mood)

    return (
        <div className="flex flex-col gap-4 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                {photoURL ? (
                    <Image
                        src={photoURL}
                        alt={displayName ?? "user"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-200"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center text-lg">
                        🧸
                    </div>
                )}
                <div>
                    <p className="font-medium text-pink-700 text-sm leading-tight">
                        {displayName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-pink-300">
                        {isOwner ? "your mood today" : "their mood today"}
                    </p>
                </div>
                {currentMood && (
                    <span className="ml-auto text-3xl">{currentMood.emoji}</span>
                )}
            </div>

            {/* Mood picker — only shown to owner */}
            {isOwner && !loading && (
                <div className="grid grid-cols-7 gap-1">
                    {MOODS.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => selectMood(m.value)}
                            title={m.label}
                            className={`flex flex-col items-center gap-0.5 rounded-2xl p-2 text-xl transition hover:bg-pink-50 ${todayEntry?.mood === m.value
                                    ? "bg-rose-100 ring-2 ring-rose-300"
                                    : ""
                                }`}
                        >
                            {m.emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Partner view — just show the mood or placeholder */}
            {!isOwner && !loading && (
                <div className="flex items-center justify-center py-2">
                    {currentMood ? (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-5xl">{currentMood.emoji}</span>
                            <span className="text-sm text-pink-400">{currentMood.label}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-pink-300">
                            hasn&apos;t logged a mood yet 🌙
                        </p>
                    )}
                </div>
            )}

            {loading && (
                <p className="text-center text-xs text-pink-300 py-2">loading...</p>
            )}
        </div>
    )
}
