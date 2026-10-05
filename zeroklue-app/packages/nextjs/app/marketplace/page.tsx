"use client";

import Link from "next/link";
import { OfferStack } from "./components/OfferStack";
import { offers } from "./data/offers";
import { motion } from "framer-motion";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { useStudentNFT } from "~~/hooks/scaffold-eth/useStudentNFT";

/**
 * Marketplace Page (Redesigned)
 * 
 * Checks the prototype registry flag via useStudentNFT. This is not proof of student status.
 */
export default function MarketplacePage() {
  // Check the prototype's on-chain registry flag; it is not credential verification.
  const { hasNFT, isLoading } = useStudentNFT();
  const isUnlocked = hasNFT;

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
            Prototype proof gating only. The circuit does not constrain the JWT signing key to Google’s trusted keys or establish student status.
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
                Try Prototype Flow
              </Link>
            ) : (
              <div className="btn btn-lg bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-8 pointer-events-none">
                Registry Entry Found
              </div>
            )}
          </div>
        </motion.header>

        {/* Stack/Fan Component */}
        <section className="relative">
          <OfferStack offers={offers} isUnlocked={isUnlocked} />

          <div className="text-center mt-10">
            <p className="text-sm text-gray-400">
              {isUnlocked
                ? "Demo offers unlocked after on-chain proof verification. The prototype does not establish student eligibility."
                : "Hover over the stack to reveal the demo offers."}
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
