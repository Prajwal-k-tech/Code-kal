"use client";

import { useState } from "react";
import { OfferStack } from "./components/OfferStack";
import { offers } from "./data/offers";
import { motion } from "framer-motion";

/**
 * Marketplace Page (Redesigned)
 * 
 * "Pallet Ross" inspired aesthetic.
 */
export default function MarketplacePage() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-base-content overflow-x-hidden selection:bg-black selection:text-white">
      {/* Navbar Placeholder (if needed, else standard nav) */}
      
      <main className="container mx-auto px-4 pt-10 pb-20">
        
        {/* Hero Section */}
        <motion.header 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-center mb-20 relative max-w-4xl mx-auto"
        >
          {/* Floating Badges (Decorations) */}
          <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute -top-10 -left-10 md:left-0 hidden md:flex items-center gap-2 bg-[#4F46E5] text-white px-4 py-2 rounded-full shadow-lg rotate-[-6deg] z-10"
          >
            <span className="font-bold">@student</span>
          </motion.div>

          <motion.div 
             animate={{ y: [0, 15, 0] }}
             transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
             className="absolute top-20 -right-10 md:right-0 hidden md:flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-full shadow-lg rotate-[4deg] z-10"
          >
            <span className="font-bold">@verified</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#111827] leading-[0.9]">
            A place to claim your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              student perks.
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
            Zero-knowledge proof verification. Keep your identity private, 
            unlock <span className={isUnlocked ? "text-green-600 font-bold" : "font-bold"}>{isUnlocked ? "verified" : "exclusive"}</span> benefits.
          </p>

          <div className="mt-8 flex justify-center gap-4">
             {!isUnlocked && (
               <button 
                  onClick={() => setIsUnlocked(true)}
                  className="btn btn-lg bg-[#111827] text-white hover:bg-black rounded-full px-8 border-none shadow-xl hover:scale-105 transition-transform"
               >
                 Unmask Discounts
               </button>
             )}
             {isUnlocked && (
               <div className="btn btn-lg bg-green-100 text-green-800 rounded-full px-8 pointer-events-none border-green-200">
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
