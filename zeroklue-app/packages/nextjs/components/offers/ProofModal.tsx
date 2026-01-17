"use client";

import { useState, useEffect } from "react";
import { generateProof, formatProofForContract, type ProofProgress } from "~~/lib/noir";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * Proof generation modal
 * Shows progress of ZK proof generation and NFT minting
 * 
 * @owner Frontend Dev 2
 * 
 * TODO:
 * - Add better error handling
 * - Add retry functionality
 * - Add cancel functionality
 */

interface ProofModalProps {
  onClose: () => void;
}

export function ProofModal({ onClose }: ProofModalProps) {
  const [progress, setProgress] = useState<ProofProgress>({
    stage: "loading",
    progress: 0,
    message: "Initializing...",
  });
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "ZeroKlue",
  });

  useEffect(() => {
    startProofGeneration();
  }, []);

  const startProofGeneration = async () => {
    try {
      // Get credential from localStorage
      const credentialStr = localStorage.getItem("zeroklue_credential");
      if (!credentialStr) {
        setError("No credential found. Please verify your email first.");
        return;
      }

      const credential = JSON.parse(credentialStr);

      // Generate ZK proof
      const proofResult = await generateProof(credential, setProgress);

      // Submit to contract
      setProgress({
        stage: "proving",
        progress: 90,
        message: "Submitting to blockchain...",
      });

      const { proof, publicInputs } = formatProofForContract(proofResult);

      const hash = await writeContractAsync({
        functionName: "verifyAndMint",
        args: [proof, publicInputs],
      });

      setTxHash(hash);
      setProgress({
        stage: "done",
        progress: 100,
        message: "NFT minted successfully!",
      });

      // Reload page after 2 seconds to show unlocked offers
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Proof generation failed:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Generating Your Proof</h3>
        
        <div className="py-6">
          {error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="w-full bg-base-300 rounded-full h-4 mb-4">
                <div 
                  className="bg-primary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>

              {/* Stage indicators */}
              <div className="flex justify-between text-sm mb-4">
                <span className={progress.stage === "loading" ? "text-primary font-bold" : ""}>
                  {progress.stage === "loading" ? "→" : "✓"} Loading
                </span>
                <span className={progress.stage === "witness" ? "text-primary font-bold" : ""}>
                  {["witness", "proving", "done"].includes(progress.stage) ? "✓" : "○"} Witness
                </span>
                <span className={progress.stage === "proving" ? "text-primary font-bold" : ""}>
                  {["proving", "done"].includes(progress.stage) ? "✓" : "○"} Proving
                </span>
                <span className={progress.stage === "done" ? "text-primary font-bold" : ""}>
                  {progress.stage === "done" ? "✓" : "○"} Done
                </span>
              </div>

              <p className="text-center text-base-content/60">
                {progress.message}
              </p>

              {progress.stage !== "done" && (
                <p className="text-center text-sm text-base-content/40 mt-2">
                  This takes about 15 seconds...
                </p>
              )}

              {txHash && (
                <div className="mt-4 text-center">
                  <p className="text-success font-medium">🎉 Success!</p>
                  <a 
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary text-sm"
                  >
                    View transaction
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-action">
          {(error || progress.stage === "done") && (
            <button className="btn" onClick={onClose}>
              {progress.stage === "done" ? "Close" : "Try Again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
