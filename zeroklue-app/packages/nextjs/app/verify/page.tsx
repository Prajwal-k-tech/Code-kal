"use client";

import { Navbar } from "~~/components/Landing/Navbar";
import { VerificationCard } from "~~/components/VerificationCard";

/**
 * Verification Page
 * 
 * Main page for student verification flow:
 * 1. Connect wallet
 * 2. Google OAuth (get JWT)
 * 3. Generate ZK proof
 * 4. Mint soulbound NFT
 */
export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2a1b3d] to-[#1a0b2e]">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Verify Your Student Status
            </h1>
            <p className="text-gray-300">
              Sign in with your university Google account. Your email is never stored - 
              we generate a zero-knowledge proof that validates your domain privately.
            </p>
          </div>

          <VerificationCard />

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>🔒 Your email is processed locally in your browser</p>
            <p>📜 Powered by StealthNote JWT circuits</p>
          </div>
        </div>
      </main>
    </div>
  );
}
