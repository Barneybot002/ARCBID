"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const ITEMS = [
    {
        title: "MacBook Pro M3",
        category: "Electronics",
        image: "/demo-items/macbook.png",
        initialSeconds: 2 * 86400 + 14 * 3600 + 32 * 60 + 17,
    },
    {
        title: "Jordan 4 Retro",
        category: "Fashion",
        image: "/demo-items/jordan4.png",
        initialSeconds: 1 * 86400 + 8 * 3600 + 15 * 60 + 43,
    },
    {
        title: "Ape Genesis PFP",
        category: "NFT",
        image: "/demo-items/ape-pfp.png",
        initialSeconds: 5 * 3600 + 42 * 60 + 9,
    },
    {
        title: "Cyberpunk Avatar",
        category: "Digital Art",
        image: "/demo-items/cyberpunk-art.png",
        initialSeconds: 3 * 86400 + 1 * 3600 + 20 * 60 + 55,
    },
    {
        title: "Solana Drip Hoodie",
        category: "Web3 Merch",
        image: "/demo-items/solana-merch.png",
        initialSeconds: 6 * 3600 + 55 * 60 + 31,
    },
];

const ROTATE_MS = 4000;

function formatCountdown(totalSeconds: number): string {
    if (totalSeconds <= 0) return "Ended";
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    if (d > 0) return `${d}d ${h}h ${pad(m)}m ${pad(s)}s`;
    return `${h}h ${pad(m)}m ${pad(s)}s`;
}

function wrap(i: number): number {
    return ((i % ITEMS.length) + ITEMS.length) % ITEMS.length;
}

export default function FeaturedCarousel() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [countdowns, setCountdowns] = useState(() =>
        ITEMS.map((item) => item.initialSeconds)
    );
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    const lastTickRef = useRef(Date.now());

    // Tick countdowns every second
    const tickCountdowns = useCallback(() => {
        setCountdowns((prev) =>
            prev.map((s) => (s > 0 ? s - 1 : 0))
        );
    }, []);

    useEffect(() => {
        const timer = setInterval(tickCountdowns, 1000);
        return () => clearInterval(timer);
    }, [tickCountdowns]);

    // Auto-rotate with progress bar
    useEffect(() => {
        if (paused) return;
        lastTickRef.current = Date.now();

        const frame = () => {
            const now = Date.now();
            const elapsed = now - lastTickRef.current;
            progressRef.current += elapsed;
            lastTickRef.current = now;

            if (progressRef.current >= ROTATE_MS) {
                progressRef.current = 0;
                setActive((prev) => (prev + 1) % ITEMS.length);
            }
            setProgress(Math.min(progressRef.current / ROTATE_MS, 1));
        };

        intervalRef.current = setInterval(frame, 50);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [paused]);

    // Reset progress on manual navigation
    const goTo = useCallback((i: number) => {
        progressRef.current = 0;
        setProgress(0);
        setActive(i);
    }, []);

    const item = ITEMS[active];
    const prevIdx = useMemo(() => wrap(active - 1), [active]);
    const nextIdx = useMemo(() => wrap(active + 1), [active]);

    return (
        <section className="featured-section-bg relative py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Section Heading */}
                <div className="mb-14 text-center">
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">
                        Featured Auctions
                    </h2>
                    <p className="mt-2 text-sm text-[#666]">
                        Premium items up for sealed bidding
                    </p>
                </div>

                {/* ─── Stacked Card Carousel ─── */}
                <div className="relative flex items-center justify-center" style={{ minHeight: 420 }}>
                    {/* Previous card — peeking behind left */}
                    <div
                        className="absolute z-0 cursor-pointer transition-all duration-700 ease-in-out"
                        style={{
                            transform: "translateX(-55%) scale(0.78)",
                            opacity: 0.35,
                            filter: "brightness(0.5)",
                        }}
                        onClick={() => goTo(prevIdx)}
                    >
                        <div className="h-[280px] w-[240px] overflow-hidden rounded-3xl border border-white/[0.04] bg-[#161618] p-4 shadow-xl sm:h-[340px] sm:w-[280px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={ITEMS[prevIdx].image}
                                alt={ITEMS[prevIdx].title}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Next card — peeking behind right */}
                    <div
                        className="absolute z-0 cursor-pointer transition-all duration-700 ease-in-out"
                        style={{
                            transform: "translateX(55%) scale(0.78)",
                            opacity: 0.35,
                            filter: "brightness(0.5)",
                        }}
                        onClick={() => goTo(nextIdx)}
                    >
                        <div className="h-[280px] w-[240px] overflow-hidden rounded-3xl border border-white/[0.04] bg-[#161618] p-4 shadow-xl sm:h-[340px] sm:w-[280px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={ITEMS[nextIdx].image}
                                alt={ITEMS[nextIdx].title}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Active card — front and center */}
                    <div
                        className="relative z-10 transition-all duration-700 ease-in-out"
                        onMouseEnter={() => setPaused(true)}
                        onMouseLeave={() => setPaused(false)}
                    >
                        <div className="h-[300px] w-[260px] overflow-hidden rounded-3xl border border-purple-500/15 bg-[#161618] p-5 shadow-2xl shadow-purple-500/10 sm:h-[360px] sm:w-[310px]">
                            {ITEMS.map((it, i) => (
                                <div
                                    key={i}
                                    className="absolute inset-0 flex items-center justify-center p-6 transition-opacity duration-700"
                                    style={{
                                        opacity: i === active ? 1 : 0,
                                        pointerEvents: i === active ? "auto" : "none",
                                    }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={it.image}
                                        alt={it.title}
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Item Info ─── */}
                <div className="relative z-10 mt-8 text-center">
                    <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-0.5 text-xs font-medium text-purple-300">
                        {item.category}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                        {item.title}
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm text-amber-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatCountdown(countdowns[active])}
                    </div>
                </div>

                {/* ─── Progress Bar ─── */}
                <div className="mx-auto mt-8 h-1 max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                        className="h-full rounded-full bg-purple-500 transition-[width] duration-75 ease-linear"
                        style={{ width: `${progress * 100}%` }}
                    />
                </div>

                {/* ─── Dot Navigation ─── */}
                <div className="mt-5 flex items-center justify-center gap-2">
                    {ITEMS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === active
                                    ? "w-6 bg-purple-500"
                                    : "w-1.5 bg-white/[0.1] hover:bg-white/[0.2]"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
