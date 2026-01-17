"use client";

import { useAccount, useReadContract } from "wagmi";
import { useEffect, useState } from "react";

/**
 * Hook to check if connected wallet has a ZeroKlue Student NFT
 * Also checks for stored credential in localStorage
 * 
 * @owner Frontend Dev 2
 * 
 * TODO:
 * - Add proper contract address
 * - Add proper ABI import
 */

export function useStudentNFT() {
  const { address, isConnected } = useAccount();
  const [hasCredential, setHasCredential] = useState(false);

  // Check localStorage for credential
  useEffect(() => {
    const credential = localStorage.getItem("zeroklue_credential");
    setHasCredential(!!credential);
  }, []);

  // Check contract for NFT
  const { data: verificationData, isLoading } = useReadContract({
    address: process.env.NEXT_PUBLIC_ZEROKLUE_CONTRACT as `0x${string}`,
    abi: [
      {
        name: "verifications",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "student", type: "address" }],
        outputs: [
          { name: "verifiedAt", type: "uint256" },
          { name: "nullifier", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
      },
    ],
    functionName: "verifications",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    },
  });

  const hasNFT = verificationData?.[2] ?? false; // exists field

  return {
    hasNFT,
    hasCredential,
    isLoading,
    isConnected,
    address,
    verifiedAt: verificationData?.[0],
  };
}
