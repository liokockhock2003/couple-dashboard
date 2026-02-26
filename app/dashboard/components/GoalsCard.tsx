"use client"

import { useState } from "react"
import {
    addDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
    onSnapshot,
} from "firebase/firestore"
import { goalsCol, goalDoc } from "@/lib/firestore"
import { GoalDoc } from "@/lib/schema"
import { useEffect } from "react"

interface Props {
    coupleId: string
}

export default function GoalsCard({ coupleId }: Props) {
    const [goals, setGoals] = useState<(GoalDoc & { id: string })[]>([])
    const [input, setInput] = useState("")
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        const q = query(
            goalsCol,
            where("coupleId", "==", coupleId),
            orderBy("createdAt", "desc")
        )
        const unsub = onSnapshot(q, (snap) => {
            setGoals(
                snap.docs.map((d) => ({ id: d.id, ...d.data() }))
            )
        })
        return () => unsub()
    }, [coupleId])

    const addGoal = async () => {
        if (!input.trim()) return
        setAdding(true)
        await addDoc(goalsCol, {
            title: input.trim(),
            completed: false,
            coupleId,
            createdAt: serverTimestamp(),
        })
        setInput("")
        setAdding(false)
    }

    const toggleGoal = async (id: string, current: boolean) => {
        await updateDoc(goalDoc(id), { completed: !current })
    }

    const pending = goals.filter((g) => !g.completed)
    const done = goals.filter((g) => g.completed)

    return (
        <div className="flex flex-col gap-4 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-lg p-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <h2 className="font-pacifico text-xl text-rose-400">Our Goals</h2>
                <span className="ml-auto text-xs text-pink-300">
                    {pending.length} left
                </span>
            </div>

            {/* Add input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                    placeholder="add a new goal... 🌟"
                    className="flex-1 rounded-2xl border border-pink-200 bg-white/80 px-4 py-2 text-sm text-pink-700 placeholder-pink-300 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                />
                <button
                    onClick={addGoal}
                    disabled={adding || !input.trim()}
                    className="rounded-2xl bg-rose-400 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-40"
                >
                    +
                </button>
            </div>

            {/* Goal list */}
            <ul className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {goals.length === 0 && (
                    <p className="text-center text-sm text-pink-300 py-4">
                        no goals yet — dream together 💫
                    </p>
                )}
                {pending.map((g) => (
                    <GoalItem key={g.id} goal={g} onToggle={toggleGoal} />
                ))}
                {done.length > 0 && (
                    <>
                        <li className="text-xs text-pink-300 pt-1">completed ✅</li>
                        {done.map((g) => (
                            <GoalItem key={g.id} goal={g} onToggle={toggleGoal} />
                        ))}
                    </>
                )}
            </ul>
        </div>
    )
}

function GoalItem({
    goal,
    onToggle,
}: {
    goal: GoalDoc & { id: string }
    onToggle: (id: string, current: boolean) => void
}) {
    return (
        <li
            onClick={() => onToggle(goal.id, goal.completed)}
            className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 transition hover:bg-pink-50 group"
        >
            <span className="text-lg">
                {goal.completed ? "💗" : "🤍"}
            </span>
            <span
                className={`text-sm flex-1 ${goal.completed
                        ? "line-through text-pink-300"
                        : "text-pink-700"
                    }`}
            >
                {goal.title}
            </span>
        </li>
    )
}
