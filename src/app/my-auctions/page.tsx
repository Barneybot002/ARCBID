"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

interface Auction {
    id: string;
    title: string;
    image_urls: string[];
    status: string;
    end_time: string;
    bid_count: number;
    auction_type: string;
    category: string;
}

function timeRemaining(endTime: string): string {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${mins}m left`;
}

function statusColor(status: string): string {
    switch (status) {
        case "active": return "text-teal-400 bg-teal-500/10 border-teal-500/20";
        case "ended": return "text-gray-400 bg-gray-500/10 border-gray-500/20";
        case "sold": return "text-violet-400 bg-violet-500/10 border-violet-500/20";
        default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
}

export default function MyAuctionsPage() {
    const { publicKey, connected } = useWallet();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAuctions = useCallback(async () => {
        if (!publicKey) return;
        setLoading(true);
        setError("");
        try {
            const { data, error: fetchError } = await supabase
                .from("auctions")
                .select("id, title, image_urls, status, end_time, bid_count, auction_type, category")
                .eq("seller_wallet", publicKey.toBase58())
                .order("created_at", { ascending: false });
            if (fetchError) throw new Error(fetchError.message);
            setAuctions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load auctions.");
        } finally {
            setLoading(false);
        }
    }, [publicKey]);

    useEffect(() => {
        if (connected && publicKey) fetchAuctions();
        else setLoading(false);
    }, [connected, publicKey, fetchAuctions]);

    // ─── Wallet Gate ───
    if (!connected) {
        return (
            <>
                <Navbar />
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
                </div>
                <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
                    <div className="text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">Connect Your Wallet</h1>
                        <p className="mt-3 max-w-md text-gray-400">
                            Please connect your Solana wallet to view your auctions.
                        </p>
                        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
                <div className="animate-pulse-glow absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[128px]" style={{ animationDelay: "2s" }} />
            </div>

            <main className="relative min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl">My Auctions</h1>
                            <p className="animate-fade-in-delay mt-2 text-gray-400">
                                Manage your listed auctions.
                            </p>
                        </div>
                        <Link
                            href="/create-auction"
                            className="animate-fade-in hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            New Auction
                        </Link>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="mt-16 flex justify-center">
                            <svg className="h-8 w-8 animate-spin text-violet-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && auctions.length === 0 && (
                        <div className="mt-16 text-center">
                            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                            </div>
                            <p className="text-lg font-medium text-gray-300">You haven&apos;t created any auctions yet.</p>
                            <p className="mt-2 text-sm text-gray-500">Create your first sealed-bid auction to get started.</p>
                            <Link
                                href="/create-auction"
                                className="mt-6 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                Create Auction
                            </Link>
                        </div>
                    )}

                    {/* Auction Cards */}
                    {!loading && auctions.length > 0 && (
                        <div className="animate-fade-in mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {auctions.map((auction) => (
                                <div
                                    key={auction.id}
                                    className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a]/60 backdrop-blur-sm transition-all hover:border-violet-500/20 hover:shadow-lg hover:shadow-violet-500/5"
                                >
                                    {/* Image */}
                                    <div className="aspect-[4/3] overflow-hidden bg-white/[0.02]">
                                        {auction.image_urls?.[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={auction.image_urls[0]}
                                                alt={auction.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-gray-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-white line-clamp-1">{auction.title}</h3>
                                            <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusColor(auction.status)}`}>
                                                {auction.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {timeRemaining(auction.end_time)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                                                {auction.bid_count} bid{auction.bid_count !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
