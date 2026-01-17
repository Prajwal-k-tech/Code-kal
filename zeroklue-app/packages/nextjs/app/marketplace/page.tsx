"use client";

import { useState } from "react";
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
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <div className="min-h-screen text-white overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Animated Background Layer */}
      <AnimatedBackground />

      {/* Navbar Placeholder (if needed, else standard nav) */}
      
      <main className="container mx-auto px-4 pt-10 pb-20 relative z-10">
        
        {/* Hero Section */}
        <motion.header 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-center mb-20 relative max-w-4xl mx-auto"
        >
          {/* Floating Badges (Decorations) - Updated colors to match theme */}
          <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute -top-10 -left-10 md:left-0 hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-lg rotate-[-6deg] z-10"
          >
            <span className="font-bold">@student</span>
          </motion.div>

          <motion.div 
             animate={{ y: [0, 15, 0] }}
             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
             className="absolute top-20 -right-10 md:right-0 hidden md:flex items-center gap-2 bg-cyan-500/20 backdrop-blur-md border border-cyan-400/30 text-cyan-100 px-4 py-2 rounded-full shadow-lg rotate-[4deg] z-10"
          >
            <span className="font-bold">@verified</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
            A place to claim your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              student perks.
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mt-6 max-w-2xl mx-auto font-light">
            Zero-knowledge proof verification. Keep your identity private, 
            unlock <span className={isUnlocked ? "text-cyan-400 font-bold" : "font-bold"}>{isUnlocked ? "verified" : "exclusive"}</span> benefits.
          </p>

          <div className="mt-8 flex justify-center gap-4">
             {!isUnlocked && (
               <button 
                  onClick={() => setIsUnlocked(true)}
                  className="btn btn-lg bg-white text-black hover:bg-cyan-50 rounded-full px-8 border-none shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
               >
                 Unmask Discounts
               </button>
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
