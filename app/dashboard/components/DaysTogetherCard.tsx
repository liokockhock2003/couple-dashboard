"use client"

import { CoupleDoc } from "@/lib/schema"

interface Props {
    couple: CoupleDoc | null
}

export default function DaysTogetherCard({ couple }: Props) {
    const now = new Date()

    const days = couple
        ? Math.floor(
            (now.getTime() - couple.anniversaryDate.toDate().getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : null

    const anniversary = couple
        ? couple.anniversaryDate.toDate().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : null

    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-lg p-6 text-center">
            <span className="text-4xl">💞</span>
            {days !== null ? (
                <>
                    <p className="font-pacifico text-5xl text-rose-400">{days}</p>
                    <p className="text-sm font-medium text-pink-500">days together</p>
                    <p className="text-xs text-pink-300">since {anniversary}</p>
                </>
            ) : (
                <>
                    <p className="font-pacifico text-3xl text-rose-300">—</p>
                    <p className="text-sm text-pink-400">anniversary not set yet</p>
                </>
            )}
        </div>
    )
}
