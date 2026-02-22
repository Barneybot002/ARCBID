"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const CATEGORIES = ["Electronics", "Collectibles", "Fashion", "Gaming", "Art", "Other"];
const AUCTION_TYPES = [
    { value: "first_price", label: "First Price" },
    { value: "second_price", label: "Second Price / Vickrey" },
];
const DURATIONS = [
    { value: 12, label: "12 Hours" },
    { value: 24, label: "24 Hours" },
    { value: 72, label: "3 Days" },
    { value: 168, label: "7 Days" },
];

export default function CreateAuctionPage() {
    const { publicKey, connected } = useWallet();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [auctionType, setAuctionType] = useState(AUCTION_TYPES[0].value);
    const [duration, setDuration] = useState(DURATIONS[1].value);
    const [reservePrice, setReservePrice] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).slice(0, 3);
        setPhotos(files);
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => {
            if (prev[index]) URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!publicKey) return;
        if (!title.trim()) { setError("Title is required."); return; }
        if (photos.length === 0) { setError("Please upload at least one photo."); return; }

        setSubmitting(true);
        setError("");

        try {
            // Upload images
            const imageUrls: string[] = [];
            for (const file of photos) {
                const ext = file.name.split(".").pop();
                const fileName = `${publicKey.toBase58()}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("auction-images")
                    .upload(fileName, file, { contentType: file.type });
                if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                const { data: urlData } = supabase.storage
                    .from("auction-images")
                    .getPublicUrl(fileName);
                imageUrls.push(urlData.publicUrl);
            }

            // Calculate end time
            const endTime = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

            // Insert auction
            const { error: insertError } = await supabase.from("auctions").insert({
                title: title.trim(),
                description: description.trim(),
                image_urls: imageUrls,
                category,
                seller_wallet: publicKey.toBase58(),
                auction_type: auctionType,
                duration_hours: duration,
                end_time: endTime,
                reserve_price: reservePrice ? parseFloat(reservePrice) : null,
                status: "active",
                bid_count: 0,
            });

            if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

            setSuccess(true);
            setTimeout(() => router.push("/"), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Wallet Gate ───
    if (!connected) {
        return (
            <>
                <Navbar />
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
                </div>
                <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
                    <div className="text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M22 10H2" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white sm:text-3xl">Connect Your Wallet</h1>
                        <p className="mt-3 max-w-md text-gray-400">
                            Please connect your Solana wallet to create an auction.
                        </p>
                        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
                <div className="animate-pulse-glow absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[128px]" style={{ animationDelay: "2s" }} />
            </div>

            <main className="relative min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl">
                    <h1 className="animate-fade-in text-3xl font-bold text-white sm:text-4xl">
                        Create Auction
                    </h1>
                    <p className="animate-fade-in-delay mt-2 text-gray-400">
                        List your item with encrypted sealed bidding.
                    </p>

                    {/* Success Toast */}
                    {success && (
                        <div className="mt-6 flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/10 px-5 py-4">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-400" />
                            </span>
                            <p className="text-sm font-medium text-teal-300">Auction created successfully! Redirecting…</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="animate-fade-in-delay mt-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Item Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Rare Solana Monkey Business #1234"
                                className="arc-input"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your item, its condition, and any relevant details…"
                                rows={4}
                                className="arc-input resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="arc-input"
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Photos */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">Photos (up to 3)</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotos}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.02] py-8 text-sm text-gray-400 transition-colors hover:border-violet-500/30 hover:text-gray-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                {photos.length > 0 ? `${photos.length} photo(s) selected` : "Click to upload images"}
                            </button>
                            {previews.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 gap-3">
                                    {previews.map((src, i) => (
                                        <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Auction Type & Duration */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Auction Type</label>
                                <select
                                    value={auctionType}
                                    onChange={(e) => setAuctionType(e.target.value)}
                                    className="arc-input"
                                >
                                    {AUCTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">Duration</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="arc-input"
                                >
                                    {DURATIONS.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Reserve Price */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-300">
                                Reserve Price <span className="text-gray-500">(optional, in SOL)</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={reservePrice}
                                onChange={(e) => setReservePrice(e.target.value)}
                                placeholder="0.00"
                                className="arc-input"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || success}
                            className="relative w-full rounded-xl bg-gradient-to-r from-violet-600 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Auction…
                                </span>
                            ) : success ? (
                                "Auction Created ✓"
                            ) : (
                                "Create Auction"
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
