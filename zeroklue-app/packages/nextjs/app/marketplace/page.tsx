"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { OfferStack } from "./components/OfferStack";
import { offers } from "./data/offers";
import { motion } from "framer-motion";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { useStudentNFT } from "~~/hooks/scaffold-eth/useStudentNFT";

/**
 * Marketplace Page (Redesigned)
 * 
 * Checks ACTUAL on-chain verification status via useStudentNFT hook.
 */
export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check REAL on-chain verification status
  const { hasNFT, isLoading } = useStudentNFT();

  // Also check URL param for immediate unlock after verification redirect
  const urlVerified = searchParams.get("verified") === "true";
  const isUnlocked = hasNFT || urlVerified;

  // If verified via URL param, refresh to clear param and show clean URL
  useEffect(() => {
    if (urlVerified && hasNFT) {
      // Clean up URL after verification
      router.replace("/marketplace");
    }
  }, [urlVerified, hasNFT, router]);

  return (
    <div className="min-h-screen text-white overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Animated Background Layer */}
      <AnimatedBackground />

      <main className="container mx-auto px-4 pt-6 pb-12 relative z-10">

        {/* Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 relative max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
            A place to claim your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              student perks.
            </span>
          </h1>

          <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto font-light">
            Zero-knowledge proof verification. Keep your identity private,
            unlock <span className={isUnlocked ? "text-cyan-400 font-bold" : "font-bold"}>{isUnlocked ? "verified" : "exclusive"}</span> benefits.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            {isLoading ? (
              <div className="btn btn-lg bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-8 pointer-events-none">
                <span className="loading loading-spinner loading-sm"></span>
                Checking status...
              </div>
            ) : !isUnlocked ? (
              <Link
                href="/verify"
                className="btn btn-lg bg-white text-black hover:bg-cyan-50 rounded-full px-8 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
              >
                Get Verified
              </Link>
            ) : (
              <div className="btn btn-lg bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-8 pointer-events-none">
                ✓ Identity Verified
              </div>
            )}
          </div>
        </motion.header>

        {/* Stack/Fan Component */}
        <section className="relative">
          <OfferStack offers={offers} isUnlocked={isUnlocked} />

          <div className="text-center mt-10">
            <p className="text-sm text-gray-400">
              {isUnlocked ? "All offers unlocked! Click to claim." : "Hover over the stack to reveal your offers."}
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
