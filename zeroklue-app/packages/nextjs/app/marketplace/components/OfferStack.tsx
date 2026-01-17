"use client";

import { useState, useEffect } from "react";
import { Offer } from "../data/offers";
import { OfferCard } from "./OfferCard";
import { motion, Variants, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface OfferStackProps {
  offers: Offer[];
  isUnlocked: boolean;
}

export const OfferStack = ({ offers, isUnlocked }: OfferStackProps) => {
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
  const [layoutState, setLayoutState] = useState<"fanned" | "grid">("fanned");

  const { scrollY } = useScroll();

  // Switch to grid layout when user scrolls down 100px
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50 && layoutState !== "grid") {
      setLayoutState("grid");
    } else if (latest <= 50 && layoutState !== "fanned") {
      setLayoutState("fanned");
    }
  });

  // Center index for calculations
  const center = (offers.length - 1) / 2;

  return (
    <div className="relative min-h-[1500px] w-full mt-10">
      <div className="sticky top-20 flex justify-center w-full"> 
      
      <motion.div 
        className="relative w-full max-w-6xl perspective-1000 h-[600px]"
        initial="fanned" 
        animate={layoutState}
      >
        {offers.map((offer, index) => {
          // --- Fanned Calculations ---
          const offset = index - center;
          const fannedX = offset * 110; 
          const fannedRotate = offset * 5;
          const fannedY = 0; // Starts higher up

          // --- Grid Calculations ---
          const colCount = 3;
          const col = index % colCount;
          const row = Math.floor(index / colCount);
          
          // Grid offsets - moved DOWN significantly (y + 400)
          // Increased spacing for larger cards
          const gridX = (col - 1) * 380; // Wider gap for w-80 cards
          const gridY = row * 500 + 100; // Taller gap for h-[450px] cards
          const gridRotate = 0;

          const isHovered = hoveredCardIndex === index;

          const cardVariants: Variants = {
            fanned: {
              x: fannedX,
              y: fannedY,
              rotate: fannedRotate,
              scale: 1,
              zIndex: index,
              transition: { type: "spring", stiffness: 60, damping: 15 }
            },
            grid: {
              x: gridX,
              y: gridY,
              rotate: gridRotate,
              scale: 1,
              zIndex: index, 
              transition: { type: "spring", stiffness: 60, damping: 15, delay: index * 0.05 }
            }
          };

          return (
            <motion.div
              key={offer.id}
              className="absolute left-1/2 top-10" // Center anchor
              style={{ marginLeft: -128 }} // Offset by half card width (w-64 = 256px / 2 = 128)
              variants={cardVariants}
              animate={isHovered ? {
                // Hover state overrides current layout position
                x: layoutState === "fanned" ? fannedX : gridX,
                y: (layoutState === "fanned" ? fannedY : gridY) - 30, // Rise up in place
                rotate: layoutState === "fanned" ? fannedRotate : gridRotate,
                scale: 1.05,
                zIndex: 100,
                transition: { duration: 0.2 }
              } : layoutState} 
              onMouseEnter={() => setHoveredCardIndex(index)}
              onMouseLeave={() => setHoveredCardIndex(null)}
            >
               {/* Dynamic Card Size: w-64 (fan) vs w-80 (grid) */}
               <motion.div 
                 className="shadow-2xl transition-all duration-500"
                 style={{ willChange: "transform" }} // Removed width/height hint to save RAM
                 animate={{
                    width: layoutState === "fanned" ? 256 : 340, // w-64 vs w-[340px]
                    height: layoutState === "fanned" ? 320 : 450, // h-80 vs h-[450px]
                 }}
               >
                 <OfferCard 
                    offer={offer} 
                    isUnlocked={isUnlocked} 
                    minimal={layoutState === "fanned"} 
                 />
               </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    </div>
  );
};
