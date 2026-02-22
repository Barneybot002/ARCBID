"use client";

import { useEffect, useState, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function WelcomeToast() {
    const { publicKey, connected } = useWallet();
    const [visible, setVisible] = useState(false);
    const prevConnected = useRef(false);

    useEffect(() => {
        if (connected && !prevConnected.current) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 5000);
            return () => clearTimeout(timer);
        }
        prevConnected.current = connected;
    }, [connected]);

    if (!visible || !publicKey) return null;

    const truncatedAddress = `${publicKey.toBase58().slice(0, 4)}...${publicKey
        .toBase58()
        .slice(-4)}`;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
            <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-[#12121a]/90 px-5 py-4 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
                {/* Glow dot */}
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
                </span>

                <div>
                    <p className="text-sm font-semibold text-white">
                        Welcome to ArcBid
                    </p>
                    <p className="text-xs text-gray-400">
                        Connected as{" "}
                        <span className="font-mono text-violet-400">
                            {truncatedAddress}
                        </span>
                    </p>
                </div>

                {/* Close button */}
                <button
                    onClick={() => setVisible(false)}
                    className="ml-2 text-gray-500 transition-colors hover:text-white"
                >
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
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
