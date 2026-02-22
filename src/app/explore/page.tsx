import Navbar from "@/components/Navbar";

export default function ExplorePage() {
    return (
        <>
            <Navbar />
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="animate-pulse-glow absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[128px]" />
                <div className="animate-pulse-glow absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[128px]" style={{ animationDelay: "2s" }} />
            </div>
            <main className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
                <div className="text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">Coming Soon</h1>
                    <p className="mt-3 max-w-md text-gray-400">
                        The explore marketplace is being built. Check back soon to browse encrypted auctions.
                    </p>
                </div>
            </main>
        </>
    );
}
