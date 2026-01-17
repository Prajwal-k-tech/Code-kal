import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Shadcn UI utility for merging Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// ZeroKlue Utility Functions (from StealthNote)
// ============================================

/**
 * Convert Uint8Array to BigInt
 */
export function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    result = (result << BigInt(8)) + BigInt(bytes[i]);
  }
  return result;
}

/**
 * Convert BigInt to Uint8Array of specified length
 */
export function bigIntToBytes(bigInt: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[length - 1 - i] = Number((bigInt >> BigInt(i * 8)) & BigInt(0xff));
  }
  return bytes;
}

/**
 * Split a BigInt into limbs for circuit input
 */
export function splitBigIntToLimbs(
  bigInt: bigint,
  byteLength: number,
  numLimbs: number
): bigint[] {
  const chunks: bigint[] = [];
  const mask = (1n << BigInt(byteLength)) - 1n;
  for (let i = 0; i < numLimbs; i++) {
    const chunk = (bigInt / (1n << (BigInt(i) * BigInt(byteLength)))) & mask;
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Extract RSA modulus from JWK public key
 */
export async function pubkeyModulusFromJWK(jwk: JsonWebKey): Promise<bigint> {
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );

  const publicKeyJWK = await crypto.subtle.exportKey("jwk", publicKey);

  // Convert base64url to hex
  const modulusBase64 = publicKeyJWK.n as string;
  const modulusBytes = Uint8Array.from(atob(modulusBase64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  const modulusBigInt = bytesToBigInt(modulusBytes);

  return modulusBigInt;
}

/**
 * Get a logo URL for a domain
 */
export function getLogoUrl(domain: string): string {
  return `https://img.logo.dev/${domain}?token=pk_SqdEexoxR3akcyJz7PneXg`;
}

/**
 * Format a domain for display (capitalize first letter of each word)
 */
export function formatDomain(domain: string): string {
  return domain
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(".");
}

/**
 * Check if a domain is a valid university domain
 */
export function isUniversityDomain(domain: string): boolean {
  const eduPatterns = [
    /\.edu$/,           // US universities
    /\.edu\.[a-z]{2}$/, // Country-specific .edu (e.g., .edu.au)
    /\.ac\.[a-z]{2}$/,  // Academic domains (e.g., .ac.uk, .ac.in)
    /\.uni-.*$/,        // German universities
    /\.university$/,    // Generic
  ];

  return eduPatterns.some((pattern) => pattern.test(domain.toLowerCase()));
}

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert hex proof to bytes for contract
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
