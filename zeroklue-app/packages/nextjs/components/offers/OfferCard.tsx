"use client";

import Link from "next/link";
import type { Offer } from "./offers-data";

/**
 * Individual offer card with locked/unlocked states
 *
 * @owner Frontend Dev 2
 *
 * TODO:
 * - Add Lottie unlock animation
 * - Add hover effects
 * - Add grayscale filter for locked state
 */

interface OfferCardProps {
  offer: Offer;
  isLocked: boolean;
  isLoading?: boolean;
}

export function OfferCard({ offer, isLocked, isLoading }: OfferCardProps) {
  return (
    <div
      className={`
        card bg-base-100 shadow-xl transition-all duration-500
        ${isLocked ? "grayscale opacity-75" : "hover:scale-105"}
        ${isLoading ? "animate-pulse" : ""}
      `}
    >
      {/* Logo/Image */}
      <figure className={`px-6 pt-6 ${isLocked ? "blur-sm" : ""}`}>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
          style={{ backgroundColor: offer.color + "20" }}
        >
          {offer.icon}
        </div>
      </figure>

      <div className="card-body items-center text-center">
        <h2 className="card-title">{offer.name}</h2>
        <p className="text-base-content/60">{offer.description}</p>

        <div className="text-2xl font-bold text-primary">{offer.discount}</div>

        <div className="card-actions mt-4 w-full">
          {isLocked ? (
            <div className="btn btn-disabled w-full gap-2">
              <span>🔒</span> Locked
            </div>
          ) : offer.isMerchantDemo ? (
            <Link href="/merchant" className="btn btn-primary w-full">
              Claim Offer
            </Link>
          ) : (
            <a href={offer.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full">
              Visit Site
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
