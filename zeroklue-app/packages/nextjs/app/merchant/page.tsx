"use client";

import { useState } from "react";
import { useStudentNFT } from "~~/hooks/scaffold-eth/useStudentNFT";
import Link from "next/link";

/**
 * Merchant Demo Page
 * Simulates TechMart electronics store with student discount
 * 
 * @owner Frontend Dev 2
 */
export default function MerchantPage() {
  const { hasNFT, isLoading, isConnected } = useStudentNFT();
  const [quantity, setQuantity] = useState(1);

  const originalPrice = 999;
  const studentDiscount = 200;
  const finalPrice = hasNFT ? originalPrice - studentDiscount : originalPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white font-bold text-2xl">
            💻 TechMart
          </div>
          <div className="flex items-center gap-4">
            {hasNFT && (
              <span className="badge badge-success gap-1">
                ✓ Student Verified
              </span>
            )}
            <Link href="/marketplace" className="btn btn-ghost btn-sm text-white">
              ← Back to ZeroKlue
            </Link>
          </div>
        </div>
      </header>

      {/* Product */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <div className="bg-white/5 rounded-3xl p-12 backdrop-blur-sm">
            <div className="text-center text-9xl">💻</div>
            <p className="text-white/60 text-center mt-4">
              TechMart Pro Laptop 2026
            </p>
          </div>

          {/* Product Details */}
          <div className="text-white space-y-6">
            <h1 className="text-4xl font-bold">
              TechMart Pro Laptop
            </h1>
            <p className="text-white/60 text-lg">
              The most powerful laptop for students. M3 Max chip, 
              32GB RAM, 1TB SSD. Perfect for coding, design, and everything in between.
            </p>

            {/* Price Section */}
            <div className="bg-white/10 rounded-2xl p-6 space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 bg-white/20 rounded w-1/2" />
                  <div className="h-6 bg-white/20 rounded w-1/3" />
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold">
                      ${finalPrice}
                    </span>
                    {hasNFT && (
                      <span className="text-white/60 line-through text-xl">
                        ${originalPrice}
                      </span>
                    )}
                  </div>

                  {hasNFT ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <span>🎓</span>
                      <span>Student discount applied: -${studentDiscount}</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                      <p className="text-yellow-200 font-medium">
                        🎓 Students save ${studentDiscount}!
                      </p>
                      <p className="text-yellow-200/60 text-sm mt-1">
                        {isConnected 
                          ? "Verify with ZeroKlue to unlock student pricing"
                          : "Connect wallet and verify with ZeroKlue to unlock"
                        }
                      </p>
                      <Link 
                        href="/verify" 
                        className="btn btn-warning btn-sm mt-3"
                      >
                        Verify Student Status
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="join">
                <button 
                  className="btn join-item"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="btn join-item pointer-events-none">
                  {quantity}
                </span>
                <button 
                  className="btn join-item"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <button className="btn btn-primary flex-1">
                Add to Cart - ${finalPrice * quantity}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl mb-2">🚀</div>
                <p className="text-sm text-white/60">M3 Max Chip</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl mb-2">💾</div>
                <p className="text-sm text-white/60">32GB RAM</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-2xl mb-2">📦</div>
                <p className="text-sm text-white/60">Free Shipping</p>
              </div>
            </div>
          </div>
        </div>

        {/* ZeroKlue Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full">
            <span className="text-white/60">Powered by</span>
            <span className="font-bold text-white">ZeroKlue</span>
            <span className="text-white/60">• Privacy-Preserving Student Verification</span>
          </div>
        </div>
      </main>
    </div>
  );
}
