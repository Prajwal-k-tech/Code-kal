"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useStudentVerification } from "~~/hooks/useStudentVerification";

interface Step {
  id: string;
  label: string;
  description: string;
  done: boolean;
  active: boolean;
}

export function VerificationCard() {
  const { verify, reset, status, error, domain, txHash, progress, isLoading } = useStudentVerification();

  const steps: Step[] = useMemo(
    () => [
      {
        id: "wallet",
        label: "Wallet Connected",
        description: "Connect a wallet via RainbowKit",
        done: status !== "idle" && status !== "connecting_wallet",
        active: status === "connecting_wallet",
      },
      {
        id: "oauth",
        label: "Google OAuth",
        description: "Sign in with Google Workspace",
        done: status === "generating_proof" || status === "submitting_tx" || status === "success",
        active: status === "authenticating" || status === "generating_proof",
      },
      {
        id: "proof",
        label: "ZK Proof",
        description: "Generate JWT proof (20-40s)",
        done: status === "submitting_tx" || status === "success",
        active: status === "generating_proof",
      },
      {
        id: "mint",
        label: "On-chain Mint",
        description: "verifyAndMint on ZeroKlue",
        done: status === "success",
        active: status === "submitting_tx",
      },
    ],
    [status],
  );

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-2xl">
      <div className="card-body gap-6">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="card-title">ZeroKlue Verification</h2>
            <p className="text-sm opacity-70">Google Workspace → ZK proof → Soulbound NFT</p>
          </div>
          <ConnectButton showBalance={false} />
        </header>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Status</p>
              <p className="text-sm opacity-70 capitalize">{status.replaceAll("_", " ")}</p>
            </div>
            <div className="flex items-center gap-2">
              {txHash && (
                <Link href={`/blockexplorer/tx/${txHash}`} className="link link-primary text-sm" prefetch={false}>
                  View Tx
                </Link>
              )}
              {domain && <span className="badge badge-outline">{domain}</span>}
            </div>
          </div>
          <progress className="progress progress-primary w-full" value={progress} max={100} />
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {steps.map(step => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border ${
                step.done
                  ? "border-success/50 bg-success/10"
                  : step.active
                    ? "border-primary/40 bg-primary/5"
                    : "border-base-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{step.label}</div>
                {step.done ? (
                  <span className="text-success">●</span>
                ) : step.active ? (
                  <span className="text-primary">●</span>
                ) : (
                  <span>○</span>
                )}
              </div>
              <p className="text-sm opacity-70 mt-1">{step.description}</p>
            </div>
          ))}
        </section>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="btn btn-sm" onClick={reset}>
              Dismiss
            </button>
          </div>
        )}

        <div className="card-actions justify-between items-center flex-col sm:flex-row gap-3">
          <div className="text-sm opacity-70 text-center sm:text-left">
            Proof generation runs in-browser; keep the tab open. If Google popup closes, try again.
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={reset} disabled={isLoading && status !== "error"}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={verify} disabled={isLoading}>
              {isLoading ? "Working..." : "Verify with Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
