"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useStudentVerification } from "~~/hooks/useStudentVerification";

interface Step {
  id: string;
  label: string;
  description: string;
}

export function VerificationCard() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { verify, reset, status, error, domain, txHash, progress, isLoading } = useStudentVerification();

  // Redirect on success state
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (status === "success" && !redirecting) {
      setRedirecting(true);
      // Wait 2 seconds to show "Completed" then redirect
      const timeout = setTimeout(() => {
        router.push("/marketplace?verified=true");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, redirecting, router]);

  // Test mode - for previewing the stepper animation
  const [testStep, setTestStep] = useState(0);
  const isTestMode = false; // Set to true to test animation with buttons

  const steps: Step[] = useMemo(
    () => [
      { id: "wallet", label: "Connect", description: "Link your wallet" },
      { id: "oauth", label: "Authenticate", description: "Sign in with Google" },
      { id: "proof", label: "Generate", description: "ZK proof creation" },
      { id: "mint", label: "Mint", description: "Soulbound NFT" },
    ],
    [],
  );

  // Calculate current step based on wallet connection AND verification status
  const currentStepIndex = useMemo(() => {
    // Step 1 (Connect) is complete when wallet is connected
    if (!isConnected) return 0;

    // Wallet connected - at least step 1 is done
    if (status === "idle") return 1; // Wallet connected, ready to authenticate
    if (status === "connecting_wallet") return 1;
    if (status === "authenticating") return 1; // In progress on step 2
    if (status === "generating_proof") return 2; // In progress on step 3
    if (status === "submitting_tx") return 3; // In progress on step 4
    if (status === "success") return 4; // All done
    return 1;
  }, [status, isConnected]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.3) 0%, rgba(10, 10, 46, 0.98) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.35)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(124, 58, 237, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
        />

        <div className="relative z-10 p-8">
          {/* Header - Only show wallet info when connected, no extra connect button */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Get Verified</h2>
              <p className="text-white/50 text-sm">Prove your student status privately</p>
            </div>
            {/* Only show wallet address when connected - no duplicate connect button */}
            {isConnected && (
              <div className="flex items-center gap-3">
                <ConnectButton.Custom>
                  {({ account }) => account && (
                    <span className="px-4 py-2 rounded-xl text-sm font-medium text-[#06b6d4] bg-[#06b6d4]/10 border border-[#06b6d4]/20">
                      {account.displayName}
                    </span>
                  )}
                </ConnectButton.Custom>
                <button onClick={() => disconnect()} className="text-xs text-white/40 hover:text-red-400 transition-colors">
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Progress Stepper - Liquid Flow Style */}
          <div className="mb-10">
            <div className="flex items-start">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                const showBar = index < steps.length - 1;
                const barFilled = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-start" style={{ flex: showBar ? 1 : 'none' }}>
                    {/* Step Circle - Blob */}
                    <div className="flex flex-col items-center" style={{ width: '48px' }}>
                      <motion.div
                        className="w-12 h-12 rounded-full flex items-center justify-center relative"
                        style={{
                          background: isCompleted || isActive
                            ? 'linear-gradient(135deg, #7c3aed, #4c1d95)'
                            : '#0a0a2e',
                          border: !isCompleted && !isActive ? '2px solid rgba(255, 255, 255, 0.15)' : 'none',
                          boxShadow: isActive ? '0 0 30px rgba(124, 58, 237, 0.5)' : 'none',
                        }}
                        animate={{
                          scale: isActive ? [1, 1.05, 1] : 1,
                        }}
                        transition={{
                          duration: 2,
                          repeat: isActive ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                      >
                        {isCompleted ? (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-white/30'}`}>
                            {index + 1}
                          </span>
                        )}
                      </motion.div>

                      {/* Labels */}
                      <div className="mt-3 text-center">
                        <p className={`text-sm font-medium ${isCompleted ? 'text-[#c4b5fd]' : isActive ? 'text-white' : 'text-white/40'}`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5 hidden sm:block whitespace-nowrap">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connecting Bar - Liquid Flow */}
                    {showBar && (
                      <div
                        className="flex-1 relative self-start"
                        style={{ height: '48px', display: 'flex', alignItems: 'center' }}
                      >
                        {/* Bar background */}
                        <div
                          className="w-full h-1.5 rounded-full"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        {/* Bar fill - liquid */}
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #7c3aed, #4c1d95)',
                            boxShadow: '0 0 10px rgba(124, 58, 237, 0.3)'
                          }}
                          initial={{ width: '0%' }}
                          animate={{ width: barFilled ? '100%' : '0%' }}
                          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Controls (Disabled) */}
          {isTestMode && (
            <div className="hidden" />
          )}

          {/* Status Display */}
          {!isTestMode && status !== "idle" && status !== "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#7c3aed] animate-pulse" />
                <span className="text-white/80 capitalize">{status.replaceAll("_", " ")}</span>
                {domain && (
                  <span className="ml-auto px-3 py-1 rounded-full text-xs bg-[#7c3aed]/20 text-[#c4b5fd]">
                    {domain}
                  </span>
                )}
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #7c3aed, #4c1d95)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {(currentStepIndex === 4) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(76, 29, 149, 0.1))' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }}
              >
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Verification Complete</h3>
              <p className="text-white/60 mb-4">Your soulbound credential has been minted</p>
              {txHash && (
                <Link href={`/blockexplorer/tx/${txHash}`} className="inline-flex items-center gap-2 text-sm text-[#c4b5fd] hover:text-white hover:underline transition-colors">
                  View transaction →
                </Link>
              )}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={reset} className="mt-2 text-xs text-red-400 hover:text-red-300 underline">
                Try again
              </button>
            </motion.div>
          )}

          {/* Action Button */}
          {!isTestMode && (
            <div className="flex justify-center">
              {!isConnected ? (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openConnectModal}
                      className="px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                        boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      Connect Wallet to Start
                    </motion.button>
                  )}
                </ConnectButton.Custom>
              ) : currentStepIndex === 4 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled
                  className="px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Completed — Redirecting...
                  </span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  onClick={verify}
                  disabled={isLoading}
                  className="px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Verify with Google"
                  )}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
