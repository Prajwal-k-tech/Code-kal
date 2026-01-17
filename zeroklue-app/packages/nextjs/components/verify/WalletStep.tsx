"use client";

import { useAccount, useConnect } from "wagmi";
import { useEffect, useState } from "react";

/**
 * Wallet connection step
 * - Connect wallet via RainbowKit/wagmi
 * - Request credential signature from backend
 * - Store credential for proof generation
 * 
 * @owner Frontend Dev 1
 * 
 * TODO:
 * - Add wallet address display
 * - Add credential request to backend
 * - Handle wallet change
 */

interface WalletStepProps {
  email: string;
  onConnected: (credential: {
    signature: string;
    nullifier_seed: string;
    issuer_pubkey_x: string;
    issuer_pubkey_y: string;
    email_hash: string;
    wallet: string;
  }) => void;
}

export function WalletStep({ email, onConnected }: WalletStepProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // When wallet connects, get credential from backend
  useEffect(() => {
    if (isConnected && address) {
      getCredential(address);
    }
  }, [isConnected, address]);

  const getCredential = async (wallet: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/get-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, wallet }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to get credential");
        setLoading(false);
        return;
      }

      onConnected({
        signature: data.signature,
        nullifier_seed: data.nullifier_seed,
        issuer_pubkey_x: data.issuer_pubkey_x,
        issuer_pubkey_y: data.issuer_pubkey_y,
        email_hash: data.email_hash,
        wallet,
      });
      
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected && loading) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
        <p>Creating your credential...</p>
        <p className="text-sm text-base-content/60">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-bold">Email Verified!</h2>
        <p className="text-base-content/60 mt-2">
          Now connect your wallet to create your credential.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="btn btn-primary w-full"
          >
            Connect with {connector.name}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-base-content/60">
        Your credential will be bound to this wallet address
      </p>
    </div>
  );
}
