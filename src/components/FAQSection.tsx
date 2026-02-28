"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const FAQS = [
    {
        question: "What is ArcBid?",
        answer: "ArcBid is a trustless sealed-bid auction platform built on Solana. It uses multi-party computation (MPC) via Arcium to encrypt all bids, so no one — not even the auctioneer — can see individual bids until the auction ends.",
    },
    {
        question: "How do encrypted bids work?",
        answer: "When you place a bid, it is encrypted using Arcium's MPC protocol before being submitted on-chain. The encrypted bid is stored in a way that only the final auction resolution can reveal. This prevents front-running, bid sniping, and any form of bid manipulation.",
    },
    {
        question: "What is a Vickrey auction?",
        answer: "A Vickrey auction (second-price sealed-bid) is a format where the highest bidder wins but pays the price of the second-highest bid. This incentivizes honest bidding — you always bid your true value because you'll never overpay.",
    },
    {
        question: "Do I need an account to use ArcBid?",
        answer: "No account is needed. ArcBid is fully on-chain and permissionless. Just connect your Solana wallet (Phantom, Solflare, or any compatible wallet) and you can start creating or bidding on auctions immediately.",
    },
    {
        question: "What wallets are supported?",
        answer: "ArcBid supports all major Solana wallets including Phantom, Solflare, Backpack, and any wallet compatible with the Solana Wallet Adapter. Simply click 'Connect Wallet' in the navbar to get started.",
    },
];

export default function FAQSection() {
    const [activeIdx, setActiveIdx] = useState(1);

    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <ScrollReveal>
                    <div className="mb-14 text-center">
                        <span className="mb-3 inline-flex rounded-full border border-violet-500/20 bg-violet-500/8 px-4 py-1.5 text-xs font-medium text-violet-300">
                            FAQ
                        </span>
                        <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
                            Frequently Asked Questions
                        </h2>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Questions list */}
                        <div className="space-y-1">
                            {FAQS.map((faq, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIdx(i)}
                                    className={`flex w-full items-center justify-between rounded-xl px-5 py-4 text-left text-sm transition-all duration-300 ${i === activeIdx
                                            ? "bg-gradient-to-r from-violet-600/90 to-violet-500/70 text-white shadow-lg shadow-violet-500/10"
                                            : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-300"
                                        }`}
                                >
                                    <span className="font-medium">{faq.question}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`shrink-0 ml-3 transition-transform duration-300 ${i === activeIdx ? "rotate-45" : ""}`}
                                    >
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            ))}
                        </div>

                        {/* Answer panel */}
                        <div className="flex items-start rounded-2xl border border-white/[0.06] bg-[#0a0a0f]/80 p-7 sm:p-8">
                            <p className="text-sm leading-relaxed text-zinc-400" key={activeIdx}>
                                {FAQS[activeIdx].answer}
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
