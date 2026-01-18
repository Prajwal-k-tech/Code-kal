"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

/**
 * Hook to check if connected wallet has a ZeroKlue Student NFT (Soulbound credential)
 * Uses the dynamically deployed contract address from Scaffold-ETH
 */
export function useStudentNFT() {
  const { address, isConnected } = useAccount();
  const [hasCredential, setHasCredential] = useState(false);

  // Get contract info from Scaffold-ETH's deployedContracts
  const { data: zeroKlueContract } = useDeployedContractInfo("ZeroKlue");

  // Check localStorage for credential (fallback)
  useEffect(() => {
    const credential = localStorage.getItem("zeroklue_credential");
    setHasCredential(!!credential);
  }, []);

  // Check contract for verification status
  const { data: verificationData, isLoading } = useReadContract({
    address: zeroKlueContract?.address,
    abi: zeroKlueContract?.abi,
    functionName: "verifications",
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address && !!zeroKlueContract,
    },
  });

  // verifications returns: (verifiedAt, ephemeralPubkey, exists)
  const data = verificationData as any;
  const hasNFT = data?.[2] ?? false; // exists field

  return {
    hasNFT,
    hasCredential,
    isLoading,
    isConnected,
    address,
    verifiedAt: data?.[0],
    ephemeralPubkey: data?.[1],
  };
}

