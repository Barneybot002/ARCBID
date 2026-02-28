import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}
      >
        <div className="site-bg" aria-hidden="true" />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
