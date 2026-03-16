"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
interface AuctionItem {
    id: string;
    title: string;
    image: string;
    category: string;
    seller: string;
    endTime: string;
    bidCount: number;
    isDemo: boolean;
    status: string;
}

function isEnded(item: AuctionItem): boolean {
    return item.status === "ended" || new Date(item.endTime).getTime() <= Date.now();
}

/* ─── Demo Items ─── */
const DEMO_ITEMS: AuctionItem[] = [
    {
        id: "demo-1",
        title: "MacBook Pro M3",
        image: "/demo-items/macbook.png",
        category: "Electronics",
        seller: "9xHd...f3Kp",
        endTime: new Date(Date.now() + 2 * 86400000 + 14 * 3600000).toISOString(),
        bidCount: 12,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-2",
        title: "Jordan 4 Retro",
        image: "/demo-items/jordan4.png",
        category: "Fashion",
        seller: "4kLm...q8Wr",
        endTime: new Date(Date.now() + 1 * 86400000 + 8 * 3600000).toISOString(),
        bidCount: 7,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-3",
        title: "Ape Genesis PFP",
        image: "/demo-items/ape-pfp.png",
        category: "NFTs",
        seller: "7bNx...t2Qs",
        endTime: new Date(Date.now() + 5 * 3600000).toISOString(),
        bidCount: 23,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-4",
        title: "Cyberpunk Avatar",
        image: "/demo-items/cyberpunk-art.png",
        category: "Art",
        seller: "2pRt...y5Jn",
        endTime: new Date(Date.now() + 3 * 86400000 + 1 * 3600000).toISOString(),
        bidCount: 4,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-5",
        title: "Solana Drip Hoodie",
        image: "/demo-items/solana-merch.png",
        category: "Web3 Merch",
        seller: "6wAz...k9Dm",
        endTime: new Date(Date.now() + 6 * 3600000).toISOString(),
        bidCount: 15,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-6",
        title: "Genesis Collection #42",
        image: "/demo-items/ape-pfp.png",
        category: "Collectibles",
        seller: "3mFk...h7Bp",
        endTime: new Date(Date.now() + 4 * 86400000).toISOString(),
        bidCount: 9,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-7",
        title: "Pixel Quest Skin",
        image: "/demo-items/cyberpunk-art.png",
        category: "Gaming",
        seller: "8tYx...n4Rc",
        endTime: new Date(Date.now() + 12 * 3600000).toISOString(),
        bidCount: 18,
        isDemo: true,
        status: "active",
    },
    {
        id: "demo-8",
        title: "MacBook Air M2",
        image: "/demo-items/macbook.png",
        category: "Electronics",
        seller: "5jHw...s1Lv",
        endTime: new Date(Date.now() + 1 * 86400000).toISOString(),
        bidCount: 6,
        isDemo: true,
        status: "active",
    },
];

const CATEGORIES = [
    "All",
    "NFTs",
    "Art",
    "Electronics",
    "Fashion",
    "Gaming",
    "Web3 Merch",
    "Collectibles",
];

/* ─── Helpers ─── */
function timeRemaining(endTime: string): string {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
}

function truncateWallet(w: string): string {
    if (w.length <= 10) return w;
    return `${w.slice(0, 4)}...${w.slice(-4)}`;
}

/* ─── Page ─── */
export default function ExplorePage() {
    const [items, setItems] = useState<AuctionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [, setTick] = useState(0);
    const [animKey, setAnimKey] = useState(0);

    // Live countdown tick every second
    useEffect(() => {
        const timer = setInterval(() => setTick((t) => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        async function fetchAuctions() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("auctions")
                    .select("id, title, image_urls, category, seller_wallet, end_time, bid_count, status")
                    .in("status", ["active", "ended"]);

                const realItems: AuctionItem[] = [];
                if (!error && data) {
                    for (const a of data) {
                        realItems.push({
                            id: a.id,
                            title: a.title || "Untitled",
                            image: a.image_urls?.[0] || "/demo-items/macbook.png",
                            category: a.category || "Other",
                            seller: truncateWallet(a.seller_wallet || ""),
                            endTime: a.end_time,
                            bidCount: a.bid_count || 0,
                            isDemo: false,
                            status: a.status || "active",
                        });
                    }
                }

                // Always show real auctions + all demo items
                setItems([...realItems, ...DEMO_ITEMS]);
            } catch {
                setItems(DEMO_ITEMS);
            } finally {
                setLoading(false);
            }
        }
        fetchAuctions();
    }, []);

    const filtered = useMemo(() => {
        let result = items;
        if (activeCategory !== "All") {
            result = result.filter((i) => i.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (i) =>
                    i.title.toLowerCase().includes(q) ||
                    i.category.toLowerCase().includes(q)
            );
        }
        // Sort: active first (by end_time asc), ended at bottom
        const active = result.filter((i) => !isEnded(i)).sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime());
        const ended = result.filter((i) => isEnded(i));
        return { active, ended };
    }, [items, activeCategory, search]);

    function handleCategory(cat: string) {
        setActiveCategory(cat);
        setAnimKey((k) => k + 1); // trigger re-animation
    }

    return (
        <>
            <Navbar />

            {/* ─── Inline styles for shimmer + stagger ─── */}
            <style jsx>{`
                .shimmer-text {
                    background: linear-gradient(
                        90deg,
                        #ffffff 0%,
                        #c4b5fd 40%,
                        #ffffff 50%,
                        #c4b5fd 60%,
                        #ffffff 100%
                    );
                    background-size: 200% 100%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer-sweep 3.5s ease-in-out infinite;
                }
                @keyframes shimmer-sweep {
                    0%, 100% { background-position: 100% 0; }
                    50% { background-position: -100% 0; }
                }
                .card-stagger {
                    opacity: 0;
                    transform: translateY(16px);
                    animation: card-appear 0.45s ease-out forwards;
                }
                @keyframes card-appear {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

            {/* Background glow — top purple radial */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-violet-600/8 blur-[180px]" />
                <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[160px]" />
                <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-violet-600/5 blur-[140px]" />
            </div>

            <main className="relative min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Back button */}
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-zinc-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Home
                    </Link>

                    {/* Header — no badge, shimmer heading */}
                    <div className="mb-5 text-center">
                        <h1 className="shimmer-text font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
                            Explore Auctions
                        </h1>
                        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                            Discover items up for sealed bidding.
                        </p>
                    </div>

                    {/* Search Bar — purple focus glow */}
                    <div className="mx-auto mb-4 max-w-lg">
                        <div className="relative">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search auctions by name or category..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-full border border-white/[0.06] bg-[#0a0a0f]/80 py-3 pl-12 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none backdrop-blur-sm transition-all duration-300 focus:border-violet-500/40 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] focus:ring-1 focus:ring-violet-500/25"
                            />
                        </div>
                    </div>

                    {/* Category Filters — segmented bar with smooth transition */}
                    <div className="mb-6 overflow-x-auto">
                        <div className="mx-auto inline-flex w-full items-center rounded-full border border-white/[0.06] bg-[#0a0a0f]/80 p-1.5 backdrop-blur-sm">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategory(cat)}
                                    className={`relative whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${activeCategory === cat
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                        </div>
                    ) : filtered.active.length === 0 && filtered.ended.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-600">No auctions found.</p>
                        </div>
                    ) : (
                        <div key={animKey}>
                            {/* Active auctions */}
                            {filtered.active.length > 0 && (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {filtered.active.map((item, i) => (
                                        <Link
                                            key={item.id}
                                            href={`/auction/${item.id}`}
                                            className="card-stagger group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)]"
                                            style={{ animationDelay: `${i * 0.07}s` }}
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                {item.isDemo && (
                                                    <span className="absolute left-3 top-3 rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-sm">Demo</span>
                                                )}
                                                <span className="absolute right-3 top-3 rounded-full border border-violet-500/20 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-medium text-violet-300 backdrop-blur-sm">{item.category}</span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-heading text-sm font-semibold text-white line-clamp-1 group-hover:text-violet-200 transition-colors">{item.title}</h3>
                                                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                    <span className="font-mono">{item.seller}</span>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-xs text-violet-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                        {timeRemaining(item.endTime)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                                        {item.bidCount} bids
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Ended auctions divider + grid */}
                            {filtered.ended.length > 0 && (
                                <>
                                    <div className="my-8 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">Ended Auctions</span>
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        {filtered.ended.map((item, i) => (
                                            <Link
                                                key={item.id}
                                                href={`/auction/${item.id}`}
                                                className="card-stagger group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.01] opacity-60 backdrop-blur-md transition-all duration-300 hover:opacity-80"
                                                style={{ animationDelay: `${(filtered.active.length + i) * 0.07}s` }}
                                            >
                                                <div className="relative aspect-[4/3] overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover grayscale" />
                                                    {item.isDemo && (
                                                        <span className="absolute left-3 top-3 rounded-md bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-sm">Demo</span>
                                                    )}
                                                    <span className="absolute right-3 top-3 rounded-full border border-zinc-500/20 bg-zinc-500/15 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500 backdrop-blur-sm">{item.category}</span>
                                                </div>
                                                <div className="p-4">
                                                    <h3 className="font-heading text-sm font-semibold text-zinc-400 line-clamp-1">{item.title}</h3>
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-700">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        <span className="font-mono">{item.seller}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            Ended
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-zinc-600">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                                            {item.bidCount} bids
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
