"use client";

import ScrollReveal from "./ScrollReveal";

const FEATURES = [
    {
        title: "Encrypted Bidding",
        description: "Bids sealed with multi-party computation — no one sees your bid until the auction ends.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        large: true,
    },
    {
        title: "Built on Solana",
        description: "Fast confirmations and near-zero transaction fees for every auction interaction.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        large: true,
    },
    {
        title: "Powered by Arcium",
        description: "Trustless privacy layer for encrypted computation on-chain.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        large: false,
    },
    {
        title: "Vickrey Auctions",
        description: "Winner pays second-highest bid — honest bidding is always rewarded.",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
        ),
        large: false,
    },
];

export default function FeaturesGrid() {
    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <ScrollReveal>
                    <div className="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                                Why ArcBid?
                            </h2>
                        </div>
                        <p className="max-w-sm text-sm text-zinc-500">
                            Crypto trusted privacy infrastructure. Try sealed auctions and experience true bid privacy.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid gap-4 sm:grid-cols-2">
                    {FEATURES.map((f, i) => (
                        <ScrollReveal key={i} delay={i * 100}>
                            <div
                                className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/20 hover:scale-[1.01] hover:shadow-lg hover:shadow-violet-500/5 ${f.large ? "p-8 sm:p-10" : "p-7 sm:p-8"
                                    }`}
                            >
                                {/* Decorative glow */}
                                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/8 blur-3xl transition-opacity group-hover:opacity-100 opacity-0" />

                                <div className="relative">
                                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                                        {f.icon}
                                    </div>
                                    <h3 className="font-heading text-lg font-semibold text-white sm:text-xl">
                                        {f.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                                        {f.description}
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
