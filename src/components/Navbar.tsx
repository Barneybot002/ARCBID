"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

const WalletMultiButton = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function Navbar() {
    const { publicKey, connected } = useWallet();
    const [hasAuctions, setHasAuctions] = useState(false);
    const [checking, setChecking] = useState(false);

    const checkAuctions = useCallback(async () => {
        if (!publicKey) {
            setHasAuctions(false);
            return;
        }
        setChecking(true);
        try {
            const { count } = await supabase
                .from("auctions")
                .select("*", { count: "exact", head: true })
                .eq("seller_wallet", publicKey.toBase58());
            setHasAuctions((count ?? 0) > 0);
        } catch {
            setHasAuctions(false);
        } finally {
            setChecking(false);
        }
    }, [publicKey]);

    useEffect(() => {
        if (connected && publicKey) {
            checkAuctions();
        } else {
            setHasAuctions(false);
        }
    }, [connected, publicKey, checkAuctions]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#0d0d0d]/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-amber-400">
                        <span className="text-sm font-bold text-white">A</span>
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        Arc<span className="text-purple-400">Bid</span>
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <WalletMultiButton
                        style={{
                            backgroundColor: "rgba(168, 85, 247, 0.12)",
                            border: "1px solid rgba(168, 85, 247, 0.25)",
                            borderRadius: "0.75rem",
                            fontSize: "0.875rem",
                            height: "2.5rem",
                            fontFamily: "inherit",
                        }}
                    />

                    {/* My Auctions button — only visible when wallet connected */}
                    {connected && (
                        <>
                            {hasAuctions ? (
                                <Link
                                    href="/my-auctions"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 sm:px-4 h-10 text-sm font-medium text-amber-300 transition-all hover:bg-amber-500/15 hover:border-amber-500/40"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                    <span className="hidden sm:inline">My Auctions</span>
                                </Link>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 sm:px-4 h-10 text-sm font-medium text-gray-600 cursor-not-allowed select-none"
                                    title={checking ? "Checking..." : "No auctions yet"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                    <span className="hidden sm:inline">My Auctions</span>
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
