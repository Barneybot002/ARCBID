"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";

/* ─── Types ─── */
interface AuctionData {
    id: string;
    title: string;
    description: string | null;
    image_urls: string[];
    category: string;
    seller_wallet: string;
    auction_type: string;
    end_time: string;
    reserve_price: number | null;
    status: string;
    bid_count: number;
    created_at: string;
}

interface BidRow {
    id: string;
    bidder_wallet: string;
    bid_amount: number;
    created_at: string;
}

/* ─── Helpers ─── */
function timeRemainingObj(endTime: string) {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true };
    return {
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ended: false,
    };
}

function timeAgo(date: string): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
}

function truncate(w: string, n = 4): string {
    if (!w || w.length <= n * 2 + 3) return w || "";
    return `${w.slice(0, n)}...${w.slice(-n)}`;
}

function auctionTypeLabel(t: string): string {
    return t === "second_price" ? "Vickrey" : "First Price";
}

function auctionTypeDesc(t: string): string {
    return t === "second_price"
        ? "Winner pays the second-highest bid price, encouraging honest bidding."
        : "Highest sealed bid wins and pays their bid amount.";
}

/* ─── Copy helper ─── */
function copyText(text: string) {
    navigator.clipboard.writeText(text).catch(() => { });
}

/* ─── Component ─── */
export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params?.id as string;

    const [auction, setAuction] = useState<AuctionData | null>(null);
    const [bids, setBids] = useState<BidRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedImg, setSelectedImg] = useState(0);
    const [activeTab, setActiveTab] = useState<"description" | "bids" | "details">("description");
    const [, setTick] = useState(0);
    const [copied, setCopied] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState("");
    const [bidError, setBidError] = useState("");
    const [bidSubmitting, setBidSubmitting] = useState(false);
    const [bidSuccess, setBidSuccess] = useState(false);
    const { publicKey, connected } = useWallet();

    // Tick every second for countdown
    useEffect(() => {
        const t = setInterval(() => setTick((v) => v + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch auction + bids
    const fetchData = useCallback(async () => {
        if (!auctionId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("auctions")
                .select("*")
                .eq("id", auctionId)
                .single();
            if (error || !data) {
                setNotFound(true);
                return;
            }
            // Get real bid count from bids table
            const { count: realCount } = await supabase
                .from("bids")
                .select("*", { count: "exact", head: true })
                .eq("auction_id", auctionId);

            setAuction({ ...(data as AuctionData), bid_count: realCount ?? 0 });

            const { data: bidData } = await supabase
                .from("bids")
                .select("*")
                .eq("auction_id", auctionId)
                .order("created_at", { ascending: false });
            setBids((bidData as BidRow[]) || []);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [auctionId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function handleCopy(text: string) {
        copyText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    async function handlePlaceBid() {
        if (!publicKey || !auction) return;
        setBidError("");
        setBidSuccess(false);

        const amount = parseFloat(bidAmount);
        if (!bidAmount || isNaN(amount) || amount <= 0) {
            setBidError("Please enter a valid bid amount greater than zero.");
            return;
        }
        if (auction.reserve_price && amount < auction.reserve_price) {
            setBidError(`Bid must be at least ${auction.reserve_price} SOL.`);
            return;
        }

        setBidSubmitting(true);
        try {
            // Insert bid
            console.log('Bid data:', {
                auction_id: auctionId,
                bidder_wallet: publicKey.toString(),
                bid_amount: parseFloat(bidAmount)
            });
            const { data: newBid, error: bidErr } = await supabase
                .from("bids")
                .insert({
                    auction_id: auctionId,
                    bidder_wallet: publicKey.toString(),
                    bid_amount: amount,
                })
                .select("*")
                .single();

            if (bidErr) {
                console.log('Supabase error:', bidErr);
                throw bidErr;
            }

            // Count all bids for this auction and update the auction
            const { count } = await supabase
                .from("bids")
                .select("*", { count: "exact", head: true })
                .eq("auction_id", auctionId);

            await supabase
                .from("auctions")
                .update({ bid_count: count })
                .eq("id", auctionId);

            // Re-fetch auction + bids to update UI with real data
            const { data: freshAuction } = await supabase
                .from("auctions")
                .select("*")
                .eq("id", auctionId)
                .single();
            if (freshAuction) setAuction({ ...(freshAuction as AuctionData), bid_count: count ?? 0 });

            const { data: freshBids } = await supabase
                .from("bids")
                .select("*")
                .eq("auction_id", auctionId)
                .order("created_at", { ascending: false });
            setBids((freshBids as BidRow[]) || []);

            setBidAmount("");
            setBidSuccess(true);
            setTimeout(() => setBidSuccess(false), 4000);
        } catch {
            setBidError("Something went wrong, please try again.");
        } finally {
            setBidSubmitting(false);
        }
    }

    /* ─── Render ─── */
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                </div>
            </>
        );
    }

    if (notFound || !auction) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                    <h2 className="font-heading text-2xl font-bold text-white">Auction not found</h2>
                    <p className="text-zinc-500">The auction you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link href="/explore" className="mt-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500">
                        Explore Auctions
                    </Link>
                </div>
            </>
        );
    }

    const tr = timeRemainingObj(auction.end_time);
    const isActive = auction.status === "active" && !tr.ended;
    const endDate = new Date(auction.end_time);
    const createDate = auction.created_at ? new Date(auction.created_at) : null;

    const TABS = [
        { key: "description" as const, label: "Description" },
        { key: "bids" as const, label: "Bid History" },
        { key: "details" as const, label: "Details" },
    ];

    return (
        <>
            <Navbar />

            <style jsx>{`
                .tooltip-fade { opacity:0; pointer-events:none; transition: opacity 0.2s; }
                .tooltip-fade.show { opacity:1; pointer-events:auto; }
            `}</style>

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-violet-600/8 blur-[180px]" />
                <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[160px]" />
            </div>

            <main className="relative min-h-screen px-4 pt-24 pb-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Back */}
                    <Link href="/explore" className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 transition-all hover:bg-white/[0.05] hover:text-zinc-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Back to Explore
                    </Link>

                    {/* ─── Two Column ─── */}
                    <div className="grid gap-8 lg:grid-cols-[45%_1fr]">
                        {/* ═══ LEFT — Image ═══ */}
                        <div>
                            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md shadow-[0_0_30px_rgba(124,58,237,0.06)]">
                                <div className="relative aspect-square">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={auction.image_urls?.[selectedImg] || auction.image_urls?.[0] || "/demo-items/macbook.png"}
                                        alt={auction.title}
                                        className={`h-full w-full object-contain p-4${!isActive ? " grayscale opacity-75" : ""}`}
                                    />
                                    {/* Expand icon */}
                                    <button className="absolute right-3 top-3 rounded-lg border border-white/[0.1] bg-black/50 p-2 text-zinc-400 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {auction.image_urls && auction.image_urls.length > 1 && (
                                <div className="mt-3 flex gap-2">
                                    {auction.image_urls.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImg(i)}
                                            className={`overflow-hidden rounded-lg border transition-all ${i === selectedImg ? "border-violet-500/50 ring-1 ring-violet-500/30" : "border-white/[0.06] hover:border-white/[0.12]"}`}
                                            style={{ width: 64, height: 64 }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ═══ RIGHT — Info ═══ */}
                        <div className="flex flex-col gap-5">
                            {/* Title + badges */}
                            <div>
                                <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">{auction.title}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                                        {auction.category}
                                    </span>
                                    <div className="relative">
                                        <button
                                            onMouseEnter={() => setTooltipOpen(true)}
                                            onMouseLeave={() => setTooltipOpen(false)}
                                            className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400"
                                        >
                                            {auctionTypeLabel(auction.auction_type)}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                        </button>
                                        <div className={`tooltip-fade ${tooltipOpen ? "show" : ""} absolute left-0 top-full z-10 mt-2 w-60 rounded-lg border border-white/[0.08] bg-[#0a0a0f] p-3 text-xs text-zinc-400 shadow-xl`}>
                                            {auctionTypeDesc(auction.auction_type)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-sm text-zinc-500">
                                    <span>Seller:</span>
                                    <span className="font-mono text-zinc-300">{truncate(auction.seller_wallet, 6)}</span>
                                    <button onClick={() => handleCopy(auction.seller_wallet)} className="text-zinc-600 transition hover:text-violet-400">
                                        {copied ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Auction Info Card */}
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-md">
                                {/* Status + Countdown */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-block h-2 w-2 rounded-full ${isActive ? "bg-green-400 animate-pulse" : "bg-zinc-500"}`} />
                                        <span className={`text-xs font-medium ${isActive ? "text-green-400" : "text-zinc-500"}`}>
                                            {isActive ? "Active" : "Ended"}
                                        </span>
                                    </div>
                                </div>

                                {/* Timer */}
                                <div className="mt-4 text-center">
                                    {tr.ended ? (
                                        <>
                                            <p className="font-heading text-2xl font-bold text-zinc-500">Auction Ended</p>
                                            <p className="mt-1 text-xs text-zinc-600">
                                                Ended {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                                                {endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            {[
                                                { v: tr.d, l: "Days" },
                                                { v: tr.h, l: "Hours" },
                                                { v: tr.m, l: "Min" },
                                                { v: tr.s, l: "Sec" },
                                            ].map((u) => (
                                                <div key={u.l} className="flex flex-col items-center">
                                                    <span className="font-heading text-2xl font-bold text-white sm:text-3xl">{String(u.v).padStart(2, "0")}</span>
                                                    <span className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">{u.l}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-zinc-600">
                                        Auction ends {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                                        {endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>

                                {/* Stats row */}
                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                                        <p className="text-xs text-zinc-600">Total Bids</p>
                                        <p className="font-heading text-lg font-bold text-white">{auction.bid_count}</p>
                                    </div>
                                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                                        <p className="text-xs text-zinc-600">Reserve Price</p>
                                        <p className="font-heading text-lg font-bold text-white">
                                            {auction.reserve_price ? `${auction.reserve_price} SOL` : "No Reserve"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area — Bid Input */}
                            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-md">
                                {!isActive ? (
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-zinc-500">This auction has ended.</p>
                                    </div>
                                ) : (
                                    <>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-500">Your Bid (SOL)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Enter bid amount"
                                            value={bidAmount}
                                            onChange={(e) => { setBidAmount(e.target.value); setBidError(""); setBidSuccess(false); }}
                                            disabled={!connected || bidSubmitting}
                                            className="w-full rounded-xl border border-white/[0.06] bg-[#0a0a0f]/80 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all duration-300 focus:border-violet-500/40 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] focus:ring-1 focus:ring-violet-500/25 disabled:opacity-50"
                                        />
                                        {auction.reserve_price && (
                                            <p className="mt-1.5 text-xs text-zinc-600">Minimum bid: {auction.reserve_price} SOL</p>
                                        )}
                                        {bidError && (
                                            <p className="mt-2 text-xs text-red-400">{bidError}</p>
                                        )}
                                        {bidSuccess && (
                                            <p className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                Bid placed — your bid is sealed 🔒
                                            </p>
                                        )}
                                        <button
                                            onClick={handlePlaceBid}
                                            disabled={!connected || bidSubmitting}
                                            className={`mt-3 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-300 ${connected
                                                ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:from-violet-500 hover:to-violet-400"
                                                : "cursor-not-allowed bg-violet-600/20 text-violet-300/40"
                                                } disabled:opacity-60`}
                                        >
                                            {bidSubmitting ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                    Placing bid...
                                                </span>
                                            ) : !connected ? (
                                                "Connect Wallet to Bid"
                                            ) : (
                                                "Place Bid"
                                            )}
                                        </button>
                                        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                            Sealed bids powered by Arcium — your bid amount is fully encrypted.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─── Tabs ─── */}
                    <div className="mt-10">
                        <div className="flex gap-0 border-b border-white/[0.06]">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative px-5 py-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-violet-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-md min-h-[200px]">
                            {/* Description */}
                            {activeTab === "description" && (
                                <div className="text-sm leading-relaxed text-zinc-400">
                                    {auction.description || "No description provided."}
                                </div>
                            )}

                            {/* Bid History */}
                            {activeTab === "bids" && (
                                bids.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-zinc-700"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        <p className="text-sm text-zinc-500">No bids placed yet. Be the first to bid.</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/[0.06] text-left">
                                                <th className="pb-3 font-medium text-zinc-500">Bidder</th>
                                                <th className="pb-3 font-medium text-zinc-500">Amount</th>
                                                <th className="pb-3 text-right font-medium text-zinc-500">Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bids.map((bid) => (
                                                <tr key={bid.id} className="border-b border-white/[0.04]">
                                                    <td className="py-3 font-mono text-zinc-300">{truncate(bid.bidder_wallet, 4)}</td>
                                                    <td className="py-3">
                                                        <span className="flex items-center gap-1.5 text-zinc-400">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                            Encrypted 🔒
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right text-zinc-600">{timeAgo(bid.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )
                            )}

                            {/* Details */}
                            {activeTab === "details" && (
                                <div className="space-y-4">
                                    {[
                                        { label: "Seller", value: auction.seller_wallet, mono: true, copy: true },
                                        { label: "Auction Type", value: `${auctionTypeLabel(auction.auction_type)} — ${auctionTypeDesc(auction.auction_type)}` },
                                        { label: "Created", value: createDate ? createDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—" },
                                        { label: "End Date", value: endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + " at " + endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
                                        { label: "Category", value: auction.category },
                                        { label: "Auction ID", value: auction.id, mono: true, copy: true },
                                    ].map((row) => (
                                        <div key={row.label} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
                                            <span className="w-32 flex-shrink-0 text-xs uppercase tracking-wider text-zinc-600">{row.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm ${row.mono ? "font-mono" : ""} text-zinc-300 break-all`}>{row.value}</span>
                                                {row.copy && (
                                                    <button onClick={() => handleCopy(String(row.value))} className="flex-shrink-0 text-zinc-600 transition hover:text-violet-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ─── Bottom Stats Bar ─── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#050505]/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
                    {[
                        { label: "Status", value: isActive ? "Active" : "Ended" },
                        { label: "Time Left", value: tr.ended ? "Ended" : `${tr.d}d ${tr.h}h ${tr.m}m ${tr.s}s` },
                        { label: "Total Bids", value: String(auction.bid_count) },
                        { label: "Type", value: auctionTypeLabel(auction.auction_type) },
                        { label: "Category", value: auction.category },
                    ].map((s) => (
                        <div key={s.label} className="flex items-center gap-1.5 text-xs">
                            <span className="text-zinc-600">{s.label}:</span>
                            <span className="font-medium text-white">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
