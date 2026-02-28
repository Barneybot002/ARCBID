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
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050505]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700">
                        <span className="text-sm font-bold text-white">A</span>
                    </div>
                    <span className="font-heading text-lg font-semibold tracking-tight text-white">
                        Arc<span className="text-violet-400">Bid</span>
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <WalletMultiButton
                        style={{
                            backgroundColor: "rgba(124, 58, 237, 0.12)",
                            border: "1px solid rgba(124, 58, 237, 0.25)",
                            borderRadius: "9999px",
                            fontSize: "0.8125rem",
                            height: "2.25rem",
                            padding: "0 1rem",
                            fontFamily: "inherit",
                        }}
                    />

                    {connected && (
                        <>
                            {hasAuctions ? (
                                <Link
                                    href="/my-auctions"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 sm:px-4 h-9 text-xs font-medium text-violet-300 transition-all hover:bg-violet-500/15 hover:border-violet-500/40"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                    <span className="hidden sm:inline">My Auctions</span>
                                </Link>
                            ) : (
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 sm:px-4 h-9 text-xs font-medium text-zinc-600 cursor-not-allowed select-none"
                                    title={checking ? "Checking..." : "No auctions yet"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
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
