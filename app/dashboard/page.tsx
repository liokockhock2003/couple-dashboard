"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getDoc, onSnapshot } from "firebase/firestore"
import { coupleDoc, userDoc } from "@/lib/firestore"
import { CoupleDoc } from "@/lib/schema"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import DaysTogetherCard from "./components/DaysTogetherCard"
import NextDateCard from "./components/NextDateCard"
import GoalsCard from "./components/GoalsCard"
import MoodCard from "./components/MoodCard"
import Link from "next/link"

const floatingHearts = [
    { size: "text-2xl", top: "8%", left: "6%", delay: "0s", duration: "6s" },
    { size: "text-lg", top: "18%", left: "82%", delay: "1.2s", duration: "7s" },
    { size: "text-3xl", top: "50%", left: "3%", delay: "2s", duration: "8s" },
    { size: "text-xl", top: "72%", left: "90%", delay: "0.5s", duration: "5s" },
    { size: "text-2xl", top: "88%", left: "22%", delay: "1.8s", duration: "9s" },
    { size: "text-lg", top: "38%", left: "94%", delay: "3s", duration: "6.5s" },
    { size: "text-3xl", top: "14%", left: "48%", delay: "2.5s", duration: "7.5s" },
]

interface PartnerInfo {
    uid: string
    displayName: string | null
    photoURL: string | null
}

export default function Dashboard() {
    const { user, loading } = useRequireAuth()
    const router = useRouter()

    const [couple, setCouple] = useState<CoupleDoc | null>(null)
    const [partner, setPartner] = useState<PartnerInfo | null>(null)
    const [dataLoading, setDataLoading] = useState(false)
    const partnerFetchedRef = useRef(false)

    useEffect(() => {
        if (loading || !user) { return }

        // No partner yet — stay on dashboard, show connect card
        if (user.coupleId === null) { return }

        partnerFetchedRef.current = false

        // Live listener on couple doc — re-renders on every field change (e.g. nextDate)
        const unsub = onSnapshot(coupleDoc(user.coupleId), async (snap) => {
            if (!snap.exists()) { setDataLoading(false); return }
            const coupleData = snap.data()
            setCouple(coupleData)
            setDataLoading(false)

            // Only fetch partner profile once per session (it rarely changes)
            if (!partnerFetchedRef.current) {
                partnerFetchedRef.current = true
                const partnerUid = coupleData.members.find((id: string) => id !== user.uid)
                if (partnerUid) {
                    const partnerSnap = await getDoc(userDoc(partnerUid))
                    if (partnerSnap.exists()) {
                        const pd = partnerSnap.data()
                        setPartner({
                            uid: partnerUid,
                            displayName: pd.displayName,
                            photoURL: pd.photoURL,
                        })
                    }
                }
            }
        })

        return () => unsub()
    }, [user, loading, router])

    if (loading || dataLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-pink-100 via-rose-50 to-fuchsia-100">
                <p className="font-pacifico text-2xl text-rose-300 animate-pulse">
                    loading our space... 🌸
                </p>
            </div>
        )
    }

    // Still redirecting (user is null but not loading yet)
    if (!user) return null

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-linear-to-br from-pink-100 via-rose-50 to-fuchsia-100">

            {/* Floating hearts */}
            {floatingHearts.map((h, i) => (
                <span
                    key={i}
                    className={`pointer-events-none fixed select-none ${h.size} animate-bounce opacity-20`}
                    style={{
                        top: h.top,
                        left: h.left,
                        animationDelay: h.delay,
                        animationDuration: h.duration,
                    }}
                >
                    🩷
                </span>
            ))}

            <div className="relative z-10 mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">

                {/* Header */}
                <div className="text-center space-y-1">
                    <h1 className="font-pacifico text-4xl text-rose-400">Our Space 💑</h1>
                    <p className="text-sm text-pink-400">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </p>
                </div>

                {!user!.coupleId ? (
                    /* No partner yet — connect card */
                    <div className="flex flex-col items-center gap-6 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-100 shadow-xl px-8 py-14 text-center">
                        <span className="text-6xl">💌</span>
                        <div className="space-y-2">
                            <h2 className="font-pacifico text-2xl text-rose-400">
                                your space is ready
                            </h2>
                            <p className="text-sm text-pink-400 max-w-xs mx-auto">
                                connect with your partner to unlock your shared dashboard — mood tracker, goals, next date and more 🌸
                            </p>
                        </div>
                        <Link
                            href="/connect"
                            className="flex items-center gap-2 rounded-2xl bg-rose-400 px-8 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-rose-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        >
                            💗 find your person
                        </Link>
                        <p className="text-xs text-pink-300">
                            already have a partner? ask them to share their email 🔗
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Top row: shared couple stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DaysTogetherCard couple={couple} />
                            <NextDateCard couple={couple} coupleId={user!.coupleId} />
                        </div>

                        {/* Goals */}
                        <GoalsCard coupleId={user!.coupleId} />

                        {/* Bottom row: individual mood cards */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-px bg-pink-200" />
                                <span className="text-xs text-pink-300 whitespace-nowrap">mood check-in 💭</span>
                                <div className="flex-1 h-px bg-pink-200" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <MoodCard
                                    userId={user!.uid}
                                    displayName={user!.displayName}
                                    photoURL={user!.photoURL}
                                    isOwner={true}
                                />
                                {partner ? (
                                    <MoodCard
                                        userId={partner.uid}
                                        displayName={partner.displayName}
                                        photoURL={partner.photoURL}
                                        isOwner={false}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/50 backdrop-blur-md border border-dashed border-pink-200 shadow-sm p-6 text-center">
                                        <span className="text-4xl opacity-40">🧸</span>
                                        <p className="text-sm text-pink-300">
                                            waiting for your partner to join ��
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-pink-300 pb-4">
                    made with 💗 for us
                </p>
            </div>
        </div>
    )
}