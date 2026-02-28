import ScrollReveal from "./ScrollReveal";

export default function TestimonialSection() {
    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <ScrollReveal>
                    <div className="relative overflow-hidden rounded-3xl border border-violet-500/15 bg-gradient-to-br from-violet-600/20 via-violet-900/10 to-transparent p-8 sm:p-12">
                        {/* Decorative glow */}
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-violet-500/15 blur-[100px]" />
                        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/10 blur-[100px]" />

                        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                            {/* Quote */}
                            <div className="max-w-lg">
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/20">
                                        <span className="text-sm font-bold text-violet-300">AK</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Alex Kimura</p>
                                        <p className="text-xs text-zinc-500">Developer at Solana Labs</p>
                                    </div>
                                </div>
                                <blockquote className="text-base leading-relaxed text-zinc-300 sm:text-lg">
                                    &ldquo;ArcBid finally makes on-chain auctions fair. No more front-running, no more bid sniping. Just pure encrypted competition. The Vickrey auction format combined with MPC encryption is a game-changer.&rdquo;
                                </blockquote>
                            </div>

                            {/* Stats */}
                            <div className="flex shrink-0 flex-col gap-6 sm:text-right">
                                <div>
                                    <p className="font-heading text-3xl font-bold text-white">100%</p>
                                    <p className="text-xs text-zinc-500">Bid Privacy</p>
                                </div>
                                <div>
                                    <p className="font-heading text-3xl font-bold text-white">0</p>
                                    <p className="text-xs text-zinc-500">Bids Exposed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
