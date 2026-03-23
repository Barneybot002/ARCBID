import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import idl from "./idl/arcbid_program.json";

/** ArcBid program ID on Solana devnet. */
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ||
    "66BBhkds8KTby6PH2msQmLr9qDgzosefvTWf6KZRyzaf"
);

/** Solana devnet connection (shared singleton). */
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com",
  "confirmed"
);

/**
 * Returns an initialized Anchor Program instance.
 * Requires an AnchorWallet (from useAnchorWallet) and a Connection.
 */
export function getProgram(wallet: AnchorWallet, conn?: Connection) {
  const provider = new AnchorProvider(conn ?? connection, wallet, {
    commitment: "confirmed",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Program(idl as any, provider);
}

/** Lamports ↔ SOL conversion helpers. */
export const LAMPORTS_PER_SOL = 1_000_000_000;
export const solToLamports = (sol: number): number =>
  Math.round(sol * LAMPORTS_PER_SOL);
export const lamportsToSol = (lamports: number): number =>
  lamports / LAMPORTS_PER_SOL;
