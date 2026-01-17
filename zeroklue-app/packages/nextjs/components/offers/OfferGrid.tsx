"use client";

import { OfferCard } from "./OfferCard";
import { offers } from "./offers-data";
import { useStudentNFT } from "~~/hooks/scaffold-eth/useStudentNFT";

/**
 * Grid of offer cards
 * Checks NFT ownership to determine locked/unlocked state
 * 
 * @owner Frontend Dev 2
 */
export function OfferGrid() {
  const { hasNFT, isLoading } = useStudentNFT();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-24">
      {offers.map((offer) => (
        <OfferCard 
          key={offer.id} 
          offer={offer} 
          isLocked={!hasNFT}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
