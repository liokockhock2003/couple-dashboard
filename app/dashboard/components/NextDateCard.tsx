"use client"

import { useState } from "react"
import { Timestamp, updateDoc } from "firebase/firestore"
import { CoupleDoc } from "@/lib/schema"
import { coupleDoc } from "@/lib/firestore"

interface Props {
    couple: CoupleDoc | null
    coupleId: string
}

export default function NextDateCard({ couple, coupleId }: Props) {
    const [editing, setEditing] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const nextDate = couple?.nextDate ? couple.nextDate.toDate() : null

    const daysUntil = nextDate
        ? Math.ceil(
            (nextDate.getTime() - new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24)
        )
        : null

    const formatted = nextDate
        ? nextDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })
        : null

    const label =
        daysUntil === null
            ? null
            : daysUntil < 0
                ? "date has passed 🥺"
                : daysUntil === 0
                    ? "today! 🎉"
                    : `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`

    const openEditor = () => {
        // Pre-fill with existing date if set
        if (nextDate) {
            const y = nextDate.getFullYear()
            const m = String(nextDate.getMonth() + 1).padStart(2, "0")
            const d = String(nextDate.getDate()).padStart(2, "0")
            setInputValue(`${y}-${m}-${d}`)
        } else {
            setInputValue("")
        }
        setError(null)
        setEditing(true)
    }

    const handleSave = async () => {
        if (!inputValue) { setError("please pick a date 🗓️"); return }
        setSaving(true)
        setError(null)
        try {
            const [y, m, d] = inputValue.split("-").map(Number)
            const date = new Date(y, m - 1, d)
            await updateDoc(coupleDoc(coupleId), {
                nextDate: Timestamp.fromDate(date),
            })
            setEditing(false)
        } catch {
            setError("couldn't save, try again 🥺")
        } finally {
            setSaving(false)
        }
    }

    const handleClear = async () => {
        setSaving(true)
        setError(null)
        try {
            await updateDoc(coupleDoc(coupleId), { nextDate: null })
            setEditing(false)
        } catch {
            setError("couldn't clear, try again 🥺")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-lg p-6 text-center">
            <span className="text-4xl">🗓️</span>

            {editing ? (
                <div className="flex flex-col items-center gap-3 w-full">
                    <p className="text-sm font-medium text-pink-500">set your next date</p>
                    <input
                        type="date"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full rounded-2xl border border-pink-200 bg-white/80 px-4 py-2 text-sm text-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-300 text-center"
                    />
                    {error && <p className="text-xs text-rose-400">{error}</p>}
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 rounded-2xl bg-rose-400 py-2 text-sm font-medium text-white transition-all hover:bg-rose-500 disabled:opacity-50"
                        >
                            {saving ? "saving…" : "💗 save"}
                        </button>
                        <button
                            onClick={() => setEditing(false)}
                            disabled={saving}
                            className="rounded-2xl border border-pink-200 px-4 py-2 text-sm text-pink-400 transition-all hover:bg-pink-50 disabled:opacity-50"
                        >
                            cancel
                        </button>
                    </div>
                    {nextDate && (
                        <button
                            onClick={handleClear}
                            disabled={saving}
                            className="text-xs text-pink-300 hover:text-rose-400 transition-colors disabled:opacity-50"
                        >
                            clear date
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {formatted ? (
                        <>
                            <p className="font-pacifico text-2xl text-rose-400">{label}</p>
                            <p className="text-sm font-medium text-pink-500">next date</p>
                            <p className="text-xs text-pink-300">{formatted}</p>
                        </>
                    ) : (
                        <>
                            <p className="font-pacifico text-3xl text-rose-300">—</p>
                            <p className="text-sm text-pink-400">no date planned yet</p>
                        </>
                    )}
                    <button
                        onClick={openEditor}
                        className="mt-1 text-xs text-pink-300 hover:text-rose-400 transition-colors"
                    >
                        {formatted ? "✏️ change date" : "✨ plan a date"}
                    </button>
                </>
            )}
        </div>
    )
}
