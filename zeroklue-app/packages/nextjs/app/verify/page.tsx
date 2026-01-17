"use client";

import { Navbar } from "~~/components/Landing/Navbar";
import { VerificationCard } from "~~/components/VerificationCard";

export default function VerifyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0a0a2e' }}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary glow - top right */}
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-[100px]"
          style={{ background: '#7c3aed' }}
        />
        {/* Secondary glow - bottom left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 blur-[100px]"
          style={{ background: '#4c1d95' }}
        />
        {/* Accent glow - center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: '#06b6d4' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Student Verification
          </h1>
          <p className="text-lg text-white/50">
            Prove your academic status with zero-knowledge cryptography.
            Your email stays private — only the domain is verified.
          </p>
        </div>

        {/* Card */}
        <VerificationCard />
      </main>
    </div>
  );
}
