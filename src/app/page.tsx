"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import WelcomeToast from "@/components/WelcomeToast";
import FeaturedCarousel from "@/components/FeaturedCarousel";

export default function Home() {
  const { connected } = useWallet();

  return (
    <>
      <Navbar />
      <WelcomeToast />

      {/* ─── Background Effects ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div
          className="animate-pulse-glow absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[140px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ─── Hero Section ─── */}
      <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/15 bg-purple-500/8 px-4 py-1.5 text-sm text-purple-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
            </span>
            Live on Solana Devnet
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="text-white">Sealed bids.</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-amber-400 bg-clip-text text-transparent">
              Encrypted auctions.
            </span>
            <br />
            <span className="text-[#555]">Powered by Arcium.</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-delay mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#777] sm:text-lg">
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
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-purple-600 px-8 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  <span>Create Auction</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-8 text-sm font-semibold text-gray-300 transition-all hover:bg-white/[0.05] hover:border-white/[0.12]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <span>Explore Items</span>
                </Link>
              </>
            ) : (
              <>
                <button className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-purple-600 px-8 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:bg-purple-500 hover:shadow-xl hover:shadow-purple-500/25">
                  <span>Start Exploring</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
                <span className="text-xs text-[#555]">
                  Connect your wallet to get started.
                </span>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in-delay-2 mt-16 grid grid-cols-3 gap-4 border-t border-white/[0.04] pt-8 sm:gap-8">
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xl font-bold text-white sm:text-2xl">MPC</p>
              <p className="mt-1 text-xs text-[#666] sm:text-sm">
                Encrypted Bidding
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xl font-bold text-white sm:text-2xl">
                Solana
              </p>
              <p className="mt-1 text-xs text-[#666] sm:text-sm">
                Fast & Low Cost
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="text-xl font-bold text-white sm:text-2xl">
                Arcium
              </p>
              <p className="mt-1 text-xs text-[#666] sm:text-sm">
                Privacy Layer
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Featured Auctions Carousel ─── */}
      <FeaturedCarousel />
    </>
  );
}
