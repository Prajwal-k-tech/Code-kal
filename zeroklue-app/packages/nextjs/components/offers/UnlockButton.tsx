"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudentNFT } from "~~/hooks/scaffold-eth/useStudentNFT";
import { ProofModal } from "./ProofModal";

/**
 * Unlock button for marketplace
 * Shows based on NFT/credential status
 * 
 * @owner Frontend Dev 2
 */
export function UnlockButton() {
  const { hasNFT, hasCredential, isLoading } = useStudentNFT();
  const [showProofModal, setShowProofModal] = useState(false);

  if (isLoading) {
    return (
      <button className="btn btn-primary btn-lg loading">
        Checking status...
      </button>
    );
  }

  // Already has NFT - nothing to unlock
  if (hasNFT) {
    return null;
  }

  // Has credential but no NFT - can generate proof
  if (hasCredential) {
    return (
      <>
        <button 
          className="btn btn-primary btn-lg gap-2 shadow-lg"
          onClick={() => setShowProofModal(true)}
        >
          <span>🔓</span> Unlock All Offers
        </button>
        
        {showProofModal && (
          <ProofModal onClose={() => setShowProofModal(false)} />
        )}
      </>
    );
  }

  // No credential - need to verify first
  return (
    <Link href="/verify" className="btn btn-primary btn-lg gap-2 shadow-lg">
      <span>🔐</span> Verify to Unlock
    </Link>
  );
}
