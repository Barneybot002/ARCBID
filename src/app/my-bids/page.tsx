"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

const WalletMultiButton = dynamic(
    async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

/* ─── Types ─── */
interface BidAuction {
    auctionId: string;
    title: string;
    image: string;
    category: string;
    auctionType: string;
    status: string;
    endTime: string;
    winnerWallet: string | null;
    winningPrice: number | null;
    bidCreatedAt: string;
}

/* ─── Helpers ─── */
function timeRemainingStr(endTime: string): string {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${d}d ${h}h ${m}m ${s}s`;
}

function auctionTypeLabel(t: string): string {
    return t === "second_price" ? "Vickrey" : "First Price";
}

/* ─── Component ─── */
export default function MyBidsPage() {
    const { publicKey, connected } = useWallet();
    const [items, setItems] = useState<BidAuction[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setTick] = useState(0);

    // Live countdown tick
    useEffect(() => {
        const t = setInterval(() => setTick((v) => v + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const fetchBids = useCallback(async () => {
        if (!publicKey) { setItems([]); setLoading(false); return; }
        setLoading(true);
        try {
            // Get all bids by this wallet
            const { data: myBids } = await supabase
                .from("bids")
                .select("*")
                .eq("bidder_wallet", publicKey.toString());

            if (!myBids || myBids.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }

            // Unique auction IDs
            const auctionMap = new Map<string, string>(); // auctionId -> earliest bid created_at
            for (const b of myBids) {
                if (!auctionMap.has(b.auction_id)) {
                    auctionMap.set(b.auction_id, b.created_at);
                }
            }

            const auctionIds = Array.from(auctionMap.keys());

            // Fetch auction details
            const { data: auctions } = await supabase
                .from("auctions")
                .select("*")
                .in("id", auctionIds);

            if (!auctions) { setItems([]); setLoading(false); return; }

            const result: BidAuction[] = auctions.map((a) => ({
                auctionId: a.id,
                title: a.title || "Untitled",
                image: a.image_urls?.[0] || "/demo-items/macbook.png",
                category: a.category || "Other",
                auctionType: a.auction_type || "first_price",
                status: a.status || "active",
                endTime: a.end_time,
                winnerWallet: a.winner_wallet || null,
                winningPrice: a.winning_price || null,
                bidCreatedAt: auctionMap.get(a.id) || "",
            }));

            setItems(result);
        } catch (err) {
            console.log("Fetch bids error:", err);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [publicKey]);

    useEffect(() => { fetchBids(); }, [fetchBids]);

    // Categorize
    const wallet = publicKey?.toString() || "";
    const won = items.filter((i) => i.status === "settled" && i.winnerWallet === wallet);
    const active = items.filter((i) => i.status === "active" && new Date(i.endTime).getTime() > Date.now());
    const lost = items.filter((i) =>
        (i.status === "settled" && i.winnerWallet !== wallet) ||
        i.status === "no_winner" ||
        (i.status === "ended") ||
        (i.status === "active" && new Date(i.endTime).getTime() <= Date.now())
    );

    /* ─── Render ─── */
    return (
        <>
            <Navbar />

            <style jsx>{`
                .shimmer-text {
                    background: linear-gradient(90deg, #ffffff 0%, #c4b5fd 40%, #ffffff 50%, #c4b5fd 60%, #ffffff 100%);
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
                .skeleton-pulse {
                    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.02) 75%);
                    background-size: 200% 100%;
                    animation: skeleton-move 1.5s ease-in-out infinite;
                }
                @keyframes skeleton-move {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-violet-600/8 blur-[180px]" />
                <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[160px]" />
            </div>

            <main className="relative min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Back */}
                    <Link
                        href="/"
                        className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-zinc-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Home
                    </Link>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="shimmer-text font-heading text-3xl font-bold sm:text-4xl md:text-5xl">My Bids</h1>
                        <p className="mt-2 text-sm text-zinc-500 sm:text-base">Track all your sealed bids and results.</p>
                    </div>

                    {/* Not connected */}
                    {!connected ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-zinc-700"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <h2 className="font-heading text-xl font-bold text-white">Connect Your Wallet</h2>
                            <p className="mt-2 text-sm text-zinc-500">Please connect your wallet to view your bids.</p>
                            <div className="mt-4">
                                <WalletMultiButton
                                    style={{
                                        backgroundColor: "rgba(124, 58, 237, 0.15)",
                                        border: "1px solid rgba(124, 58, 237, 0.3)",
                                        borderRadius: "9999px",
                                        fontSize: "0.875rem",
                                        height: "2.75rem",
                                        padding: "0 1.5rem",
                                        fontFamily: "inherit",
                                    }}
                                />
                            </div>
                        </div>
                    ) : loading ? (
                        /* Loading skeletons */
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                                    <div className="skeleton-pulse aspect-[4/3]" />
                                    <div className="p-4 space-y-3">
                                        <div className="skeleton-pulse h-4 w-3/4 rounded" />
                                        <div className="skeleton-pulse h-3 w-1/2 rounded" />
                                        <div className="skeleton-pulse h-3 w-2/3 rounded" />
                                        <div className="skeleton-pulse h-9 w-full rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-zinc-700"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                            <h2 className="font-heading text-xl font-bold text-white">No bids yet</h2>
                            <p className="mt-2 text-sm text-zinc-500">You haven&apos;t placed any bids yet.</p>
                            <Link href="/explore" className="mt-4 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500">
                                Explore Auctions
                            </Link>
                        </div>
                    ) : (
                        /* Bid cards grouped */
                        <div>
                            {/* Won section */}
                            {won.length > 0 && (
                                <>
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-green-500/10" />
                                        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-green-400">
                                            <span>🏆</span> Won
                                        </span>
                                        <div className="h-px flex-1 bg-green-500/10" />
                                    </div>
                                    <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {won.map((item) => (
                                            <BidCard key={item.auctionId} item={item} variant="won" />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Active section */}
                            {active.length > 0 && (
                                <>
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Active Bids</span>
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                    </div>
                                    <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {active.map((item) => (
                                            <BidCard key={item.auctionId} item={item} variant="active" />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Lost / Past section */}
                            {lost.length > 0 && (
                                <>
                                    <div className="mb-5 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                        <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">Past Bids</span>
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                        {lost.map((item) => (
                                            <BidCard key={item.auctionId} item={item} variant="lost" />
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

/* ─── Card component ─── */
function BidCard({ item, variant }: { item: BidAuction; variant: "won" | "active" | "lost" }) {
    const isWon = variant === "won";
    const isLost = variant === "lost";
    const isActive = variant === "active";
    const timeStr = timeRemainingStr(item.endTime);

    const borderClass = isWon
        ? "border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.06)]"
        : isLost
            ? "border-white/[0.05] opacity-60"
            : "border-white/[0.07] hover:border-violet-500/30 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(124,58,237,0.10)]";

    return (
        <div className={`group relative overflow-hidden rounded-2xl border bg-white/[0.02] backdrop-blur-md transition-all duration-300 ${borderClass}`}>
            {/* Status badge - top right */}
            <div className="absolute right-3 top-3 z-10">
                {isWon && (
                    <span className="flex items-center gap-1 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-[10px] font-medium text-yellow-400 backdrop-blur-sm">
                        <span>🏆</span> Won
                    </span>
                )}
                {isActive && (
                    <span className="flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-medium text-green-400 backdrop-blur-sm">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" /> Active
                    </span>
                )}
                {isLost && (
                    <span className="flex items-center gap-1 rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2.5 py-1 text-[10px] font-medium text-zinc-500 backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        Lost
                    </span>
                )}
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={item.image}
                    alt={item.title}
                    className={`h-full w-full object-cover ${isLost ? "grayscale" : ""}`}
                />
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className={`font-heading text-sm font-semibold line-clamp-1 ${isLost ? "text-zinc-400" : "text-white"}`}>
                    {item.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                        {item.category}
                    </span>
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {auctionTypeLabel(item.auctionType)}
                    </span>
                </div>

                {/* Timer */}
                <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <span className={isActive ? "text-violet-400" : "text-zinc-600"}>{timeStr}</span>
                </div>

                {/* Your Bid */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    <span>Your Bid:</span>
                    <span className="text-zinc-400">Encrypted 🔒</span>
                </div>

                {/* Winning price for won */}
                {isWon && item.winningPrice != null && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                        <span className="text-zinc-600">Winning Price:</span>
                        <span className="font-semibold text-green-400">{item.winningPrice.toFixed(4)} SOL</span>
                    </div>
                )}

                {/* View button */}
                <Link
                    href={`/auction/${item.auctionId}`}
                    className={`mt-4 block w-full rounded-full py-2.5 text-center text-xs font-semibold transition-all duration-300 ${isWon
                        ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                        : isActive
                            ? "bg-violet-600/15 text-violet-300 border border-violet-500/20 hover:bg-violet-600/25"
                            : "bg-white/[0.03] text-zinc-500 border border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                >
                    View Auction
                </Link>
            </div>
        </div>
    );
}
