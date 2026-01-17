"use client";

import Link from "next/link";

/**
 * Success step after verification
 * - Show confetti animation
 * - Display credential info
 * - Link to marketplace
 * 
 * @owner Frontend Dev 1
 * 
 * TODO:
 * - Add confetti animation (react-confetti)
 * - Add credential card visualization
 */

interface SuccessStepProps {
  university?: string;
}

export function SuccessStep({ university }: SuccessStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl animate-bounce">🎉</div>
      
      <div>
        <h2 className="text-2xl font-bold">Credential Created!</h2>
        {university && (
          <p className="text-base-content/60 mt-2">
            Verified student at {university}
          </p>
        )}
      </div>

      <div className="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-left">
          <p className="font-medium">Your credential is securely stored</p>
          <p className="text-sm opacity-80">
            It never leaves your browser. Generate proofs anytime to claim offers.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Link href="/marketplace" className="btn btn-primary w-full">
          Go to Marketplace →
        </Link>
        
        <Link href="/" className="btn btn-ghost w-full">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
