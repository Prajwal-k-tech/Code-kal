"use client";

import { useState, useCallback } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { verifyWithGoogle, GoogleVerificationResult } from "~~/lib/providers/google-oauth";
import { generateEphemeralKey } from "~~/lib/ephemeral-key";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
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
 * Handles: wallet check → ephemeral key → Google OAuth → ZK proof → contract call
 */
export function useStudentVerification() {
  const [state, setState] = useState<StudentVerificationState>(initialState);
  const { address, isConnected } = useAccount();
  const { data: zeroKlueContract } = useDeployedContractInfo("ZeroKlue");
  
  const { writeContract, data: writeData } = useWriteContract();
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

      setState(s => ({ ...s, progress: 25 }));

      // 3. Google OAuth + ZK proof generation
      let result: GoogleVerificationResult;
      try {
        result = await verifyWithGoogle(ephemeralKey);
      } catch (err: any) {
        if (err.message.includes("popup")) {
          throw new Error("Google sign-in was cancelled. Please try again.");
        }
        throw err;
      }

      setState(s => ({ 
        ...s, 
        status: "generating_proof", 
        domain: result.domain,
        progress: 70 
      }));

      // 4. Submit to smart contract
      setState(s => ({ ...s, status: "submitting_tx", progress: 85 }));

      const { contractProof } = result;
      
      writeContract({
        address: zeroKlueContract.address,
        abi: zeroKlueContract.abi,
        functionName: "verifyAndMint",
        args: [contractProof.proofHex, contractProof.publicInputs],
      });

    } catch (err: any) {
      console.error("[ZeroKlue] Verification failed:", err);
      setState(s => ({
        ...s,
        status: "error",
        error: err.message || "Verification failed. Please try again.",
        progress: 0,
      }));
    }
  }, [isConnected, address, zeroKlueContract, writeContract]);

  // Update state when transaction completes
  if (isTxSuccess && state.status === "submitting_tx") {
    setState(s => ({
      ...s,
      status: "success",
      txHash: writeData || null,
      progress: 100,
    }));
  }

  // Update progress while tx is pending
  if (isTxPending && state.status === "submitting_tx" && state.progress < 95) {
    setState(s => ({ ...s, progress: 95 }));
  }

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
