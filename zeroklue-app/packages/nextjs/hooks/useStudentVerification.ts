"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { generateEphemeralKey } from "~~/lib/ephemeral-key";
import { GoogleVerificationResult, verifyWithGoogle } from "~~/lib/providers/google-oauth";
import { VerificationStatus } from "~~/lib/types";

export interface StudentVerificationState {
  status: VerificationStatus;
  error: string | null;
  domain: string | null;
  txHash: string | null;
  progress: number; // 0-100
}

const initialState: StudentVerificationState = {
  status: "idle",
  error: null,
  domain: null,
  txHash: null,
  progress: 0,
};

/**
 * Hook for student/professional verification flow
 * 
 * NEW FLOW (Client-Side Verification):
 * 1. Check wallet connection
 * 2. Generate ephemeral key
 * 3. Google OAuth + ZK proof generation in browser
 * 4. Verify proof CLIENT-SIDE (BarretenbergVerifier)
 * 5. If valid, call registerStudent(ephemeralPubkey) to store attestation
 */
export function useStudentVerification() {
  const [state, setState] = useState<StudentVerificationState>(initialState);
  const { address, isConnected } = useAccount();
  const { data: zeroKlueContract } = useDeployedContractInfo("ZeroKlue");

  const { writeContractAsync, data: writeData } = useWriteContract();
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const verify = useCallback(async () => {
    // Reset state
    setState({ ...initialState, status: "connecting_wallet", progress: 5 });

    try {
      // 1. Check wallet connection
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      if (!zeroKlueContract) {
        throw new Error("ZeroKlue contract not found. Please check your network.");
      }

      setState(s => ({ ...s, status: "authenticating", progress: 15 }));

      // 2. Generate ephemeral key (binds proof to this session)
      const ephemeralKey = await generateEphemeralKey();

      setState(s => ({ ...s, progress: 30, status: "generating_proof" }));

      // 3. Google OAuth + ZK proof generation + CLIENT-SIDE VERIFICATION
      let result: GoogleVerificationResult;
      try {
        result = await verifyWithGoogle(ephemeralKey);
      } catch (err: any) {
        if (err.message?.includes("popup") || err.message?.includes("cancelled")) {
          throw new Error("Google sign-in was cancelled. Please try again.");
        }
        throw err;
      }

      setState(s => ({
        ...s,
        domain: result.domain,
        progress: 70,
      }));

      // 4. Submit attestation to smart contract
      setState(s => ({ ...s, status: "submitting_tx", progress: 85 }));

      // Get ephemeral pubkey from the proof result
      const ephemeralPubkey = result.contractProof.ephemeralPubkey as `0x${string}`;

      console.log("[ZeroKlue] === CONTRACT CALL DEBUG ===");
      console.log("[ZeroKlue] Contract address:", zeroKlueContract.address);
      console.log("[ZeroKlue] Ephemeral pubkey:", ephemeralPubkey);
      console.log("[ZeroKlue] Ephemeral pubkey length:", ephemeralPubkey.length);

      try {
        await writeContractAsync({
          address: zeroKlueContract.address,
          abi: zeroKlueContract.abi,
          functionName: "registerStudent",
          args: [ephemeralPubkey],
        });
        console.log("[ZeroKlue] Transaction submitted successfully!");
      } catch (contractError: any) {
        console.error("[ZeroKlue] CONTRACT CALL FAILED:", contractError);
        console.error("[ZeroKlue] Error message:", contractError.message);
        console.error("[ZeroKlue] Error shortMessage:", contractError.shortMessage);
        throw contractError;
      }
    } catch (err: any) {
      console.error("[ZeroKlue] Verification failed:", err);
      setState(s => ({
        ...s,
        status: "error",
        error: err.message || "Verification failed. Please try again.",
        progress: 0,
      }));
    }
  }, [isConnected, address, zeroKlueContract, writeContractAsync]);

  useEffect(() => {
    if (!isTxSuccess) return;
    setState(s =>
      s.status === "submitting_tx" ? { ...s, status: "success", txHash: writeData || null, progress: 100 } : s,
    );
  }, [isTxSuccess, writeData]);

  useEffect(() => {
    if (!isTxPending) return;
    setState(s => (s.status === "submitting_tx" && s.progress < 95 ? { ...s, progress: 95 } : s));
  }, [isTxPending]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    verify,
    reset,
    isLoading: state.status !== "idle" && state.status !== "success" && state.status !== "error",
  };
}
