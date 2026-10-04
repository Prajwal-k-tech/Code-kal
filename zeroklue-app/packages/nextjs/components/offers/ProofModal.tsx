"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useStudentVerification } from "~~/hooks/useStudentVerification";

interface ProofModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Runs the same OAuth and browser proof-generation flow as the verification
 * page. The current contract stores a demo key and does not verify the proof.
 */
export function ProofModal({ onClose, onSuccess }: ProofModalProps) {
  const { verify, status, error, domain, txHash, progress, isLoading } = useStudentVerification();
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (status !== "success" || !onSuccessRef.current) return;
    const timeout = window.setTimeout(() => onSuccessRef.current?.(), 1500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const stage =
    status === "authenticating"
      ? "Sign in with Google"
      : status === "generating_proof"
        ? "Generate proof in this browser"
        : status === "submitting_tx"
          ? "Record a demo key on-chain"
          : status === "success"
            ? "Demo record saved"
            : status === "error"
              ? "Could not finish the prototype"
              : "Connect a wallet to begin";

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="proof-modal-title">
      <div className="modal-box">
        <h3 id="proof-modal-title" className="font-bold text-lg">
          Run the ZeroKlue prototype
        </h3>

        <div className="alert alert-warning mt-4">
          <span>
            The browser generates proof material, but the contract does not verify it. A recorded key is not proof of
            student status.
          </span>
        </div>

        <div className="py-6">
          {error ? (
            <div className="alert alert-error" role="alert">
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="w-full bg-base-300 rounded-full h-3 mb-4" aria-label={`Progress ${progress}%`}>
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-center font-medium" role="status" aria-live="polite">
                {stage}
              </p>
              {domain && <p className="text-center text-sm text-base-content/60 mt-1">Workspace domain: {domain}</p>}
              {status === "submitting_tx" && (
                <p className="text-center text-sm text-base-content/60 mt-2">
                  The transaction only records a key; it does not submit or verify the proof.
                </p>
              )}
              {txHash && (
                <div className="mt-4 text-center">
                  <Link href={`/blockexplorer/transaction/${txHash}`} className="link link-primary text-sm">
                    View transaction
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-action">
          {status === "idle" || status === "error" ? (
            <button className="btn btn-primary" onClick={() => void verify()}>
              {status === "error" ? "Try again" : "Connect and run prototype"}
            </button>
          ) : status === "success" ? (
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          ) : (
            <button className="btn" onClick={onClose} disabled={isLoading}>
              Close
            </button>
          )}
          {status !== "success" && (
            <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
          )}
        </div>
      </div>
      <button className="modal-backdrop" aria-label="Close prototype dialog" onClick={onClose} disabled={isLoading} />
    </div>
  );
}
