"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import WelcomeToast from "@/components/WelcomeToast";
import StarField from "@/components/StarField";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import FeaturesGrid from "@/components/FeaturesGrid";
import FAQSection from "@/components/FAQSection";
import TestimonialSection from "@/components/TestimonialSection";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const ORBIT_ITEMS = [
  { image: "/demo-items/macbook.png", size: 48, delay: 0 },
  { image: "/demo-items/jordan4.png", size: 44, delay: 2 },
  { image: "/demo-items/ape-pfp.png", size: 40, delay: 4 },
  { image: "/demo-items/cyberpunk-art.png", size: 42, delay: 6 },
  { image: "/demo-items/solana-merch.png", size: 38, delay: 8 },
];

export default function Home() {
  const { connected } = useWallet();

  return (
    <>
      <Navbar />
      <WelcomeToast />
      <StarField />

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        {/* Hero glow */}
        <div className="pointer-events-none absolute -top-20 right-0 h-[600px] w-[600px] rounded-full bg-violet-600/12 blur-[160px]" />

        <div className="relative mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center lg:gap-16">
          {/* Left — Text */}
          <div className="max-w-2xl flex-1 pt-8 lg:pt-16">
            {/* Badge */}
            <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-xs text-zinc-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-400" />
              </span>
              Live on Solana Devnet
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polyline points="9 18 15 12 9 6" /></svg>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-white">Sealed bids.</span>
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                Encrypted auctions.
              </span>
              <br />
              <span className="text-zinc-600">Powered by Arcium.</span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-delay mt-6 max-w-lg text-base leading-relaxed text-zinc-500 sm:text-lg">
              ArcBid is a trustless auction platform where bids are fully
              encrypted using multi-party computation. No one sees your bid —
              not even the auctioneer — until the auction ends.
            </p>

            {/* CTA Buttons */}
            <div className="animate-fade-in-delay-2 mt-10 flex flex-col gap-4 sm:flex-row">
              {connected ? (
                <>
                  <Link
                    href="/create-auction"
                    className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-500/25"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18M5 12h14" />
                    </svg>
                    Create Auction
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white/[0.1] bg-transparent px-7 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] hover:border-white/[0.15]"
                  >
                    Explore Items
                  </Link>
                </>
              ) : (
                <>
                  <button className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:bg-violet-500 hover:shadow-xl hover:shadow-violet-500/25">
                    Get Started
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                  <button className="inline-flex h-12 items-center gap-2 rounded-full border border-white/[0.1] bg-transparent px-7 text-sm font-semibold text-zinc-300 transition-all hover:bg-white/[0.04] hover:border-white/[0.15]">
                    Learn More
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right — Floating Orbit Items */}
          <div className="relative mt-16 flex flex-1 items-center justify-center lg:mt-0">
            <div className="relative h-[320px] w-[320px] sm:h-[400px] sm:w-[400px]">
              {/* Orbit rings */}
              <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
              <div className="absolute inset-8 rounded-full border border-white/[0.03]" />
              <div className="absolute inset-16 rounded-full border border-white/[0.02]" />

              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-20 w-20 rounded-full bg-violet-500/20 blur-2xl" />
                <div className="absolute h-8 w-8 rounded-full bg-violet-400/30 blur-sm" />
              </div>

              {/* Orbiting items */}
              {ORBIT_ITEMS.map((item, i) => {
                const angle = (360 / ORBIT_ITEMS.length) * i;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      animation: `orbit ${20 + i * 4}s linear ${item.delay}s infinite`,
                      animationDirection: i % 2 === 0 ? "normal" : "reverse",
                    }}
                  >
                    <div
                      className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-[#0a0a0f]/80 p-2 shadow-lg shadow-violet-500/5 backdrop-blur-sm"
                      style={{
                        width: item.size,
                        height: item.size,
                        transform: `rotate(${-angle}deg)`,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Auctions ─── */}
      <ScrollReveal>
        <FeaturedCarousel />
      </ScrollReveal>

      {/* ─── Features Grid ─── */}
      <FeaturesGrid />

      {/* ─── FAQ ─── */}
      <FAQSection />

      {/* ─── Testimonial ─── */}
      <TestimonialSection />

      {/* ─── Footer ─── */}
      <Footer />
    </>
  );
}
