/**
 * ZeroKlue Type Definitions
 * Adapted from StealthNote for student verification
 */

/**
 * Ephemeral key pair generated and stored in the browser's local storage
 * This key binds the JWT to the proof session
 */
export interface EphemeralKey {
  privateKey: bigint;
  publicKey: bigint;
  salt: bigint;
  expiry: Date;
  ephemeralPubkeyHash: bigint;
}

/**
 * Result of student verification
 */
export interface VerificationResult {
  /** The ZK proof bytes */
  proof: Uint8Array;
  /** Public inputs for the contract */
  publicInputs: string[];
  /** The domain that was verified (e.g., "university.edu") */
  domain: string;
  /** Google's key ID used for verification */
  keyId: string;
}

/**
 * Status of the verification flow
 */
export type VerificationStatus =
  | "idle"
  | "connecting_wallet"
  | "authenticating"
  | "generating_proof"
  | "submitting_tx"
  | "success"
  | "error";

/**
 * Student verification state
 */
export interface StudentVerificationState {
  status: VerificationStatus;
  error: string | null;
  domain: string | null;
  txHash: string | null;
  tokenId: number | null;
}

/**
 * Local storage keys for ZeroKlue
 */
export const LocalStorageKeys = {
  EphemeralKey: "zeroklue_ephemeralKey",
  GoogleOAuthState: "zeroklue_googleOAuthState",
  GoogleOAuthNonce: "zeroklue_googleOAuthNonce",
  VerifiedDomain: "zeroklue_verifiedDomain",
};

/**
 * Message to be signed with ephemeral key
 */
export interface Message {
  content: string;
  timestamp: number;
}

/**
 * Signed message with ephemeral key signature
 */
export interface SignedMessage extends Message {
  signature: Uint8Array;
  publicKey: bigint;
}

/**
 * Contract addresses (will be populated after deployment)
 */
export const ContractAddresses = {
  // Will be set after running `yarn deploy`
  ZeroKlue: process.env.NEXT_PUBLIC_ZEROKLUE_ADDRESS || "",
  Verifier: process.env.NEXT_PUBLIC_VERIFIER_ADDRESS || "",
};
