"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { OfferStack } from "./components/OfferStack";
import { offers } from "./data/offers";
import { motion } from "framer-motion";
import { AnimatedBackground } from "./components/AnimatedBackground";

/**
 * Marketplace Page (Redesigned)
 * 
 * "Pallet Ross" inspired aesthetic with User's Color Palette.
 */
export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Auto-unmask offers if coming from successful verification
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setIsUnlocked(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen text-white overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Animated Background Layer */}
      <AnimatedBackground />

      {/* Navbar Placeholder (if needed, else standard nav) */}

      <main className="container mx-auto px-4 pt-6 pb-12 relative z-10">

        {/* Hero Section */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 relative max-w-4xl mx-auto"
        >
          {/* Floating Badges (Decorations) - Updated colors to match theme */}




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
            {!isUnlocked && (
              <Link
                href="/verify"
                className="btn btn-lg bg-white text-black hover:bg-cyan-50 rounded-full px-8 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
              >
                Get Verified
              </Link>
            )}
            {isUnlocked && (
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
              Hover over the stack to reveal your offers.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
