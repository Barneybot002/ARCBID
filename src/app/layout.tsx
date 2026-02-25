import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ArcBid — Sealed-Bid Auctions on Solana",
  description:
    "ArcBid is a trustless sealed-bid auction platform where bids are fully encrypted using multi-party computation, powered by Arcium on Solana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* ─── Rich Background Layer ─── */}
        <div className="site-bg" aria-hidden="true" />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
