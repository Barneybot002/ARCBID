"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    async () =>
        (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
);

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-teal-400">
                        <span className="text-sm font-bold text-white">A</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-violet-400 to-teal-400 bg-clip-text text-transparent">
                            Arc
                        </span>
                        <span className="text-white">Bid</span>
                    </span>
                </div>

                {/* Wallet Button */}
                <WalletMultiButton
                    style={{
                        backgroundColor: "rgba(139, 92, 246, 0.15)",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                        borderRadius: "0.75rem",
                        fontSize: "0.875rem",
                        height: "2.5rem",
                        fontFamily: "inherit",
                    }}
                />
            </div>
        </nav>
    );
}
