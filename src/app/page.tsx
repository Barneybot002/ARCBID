"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import WelcomeToast from "@/components/WelcomeToast";

export default function Home() {
  const { connected } = useWallet();

  return (
    <>
      <Navbar />
      <WelcomeToast />

      {/* ─── Background Effects ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
        <div
          className="animate-pulse-glow absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[128px]"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* ─── Hero Section ─── */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Live on Solana Devnet
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">Sealed bids.</span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              Encrypted auctions.
            </span>
            <br />
            <span className="text-gray-400">Powered by Arcium.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-delay mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-400 sm:text-lg">
            ArcBid is a trustless auction platform where bids are fully
            encrypted using multi-party computation. No one sees your bid — not
            even the auctioneer — until the auction ends.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-delay-2 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            {connected ? (
              <>
                <Link
                  href="/create-auction"
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  <span>Create Auction</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-8 text-sm font-semibold text-gray-300 transition-all hover:bg-white/[0.06] hover:border-white/[0.15]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <span>Explore Items</span>
                </Link>
              </>
            ) : (
              <>
                <button className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 px-8 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30">
                  <span>Start Exploring</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
                <span className="text-xs text-gray-500">
                  Connect your wallet to get started.
                </span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in-delay-2 mt-16 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8 sm:gap-8">
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">MPC</p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Encrypted Bidding
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                Solana
              </p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Fast & Low Cost
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white sm:text-3xl">
                Arcium
              </p>
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Privacy Layer
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
