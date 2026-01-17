/**
 * Hash email using Poseidon (placeholder)
 * 
 * TODO for Person 2:
 * - Use actual Poseidon hash implementation
 * - Coordinate with Person 3 (circuits) to use same hash
 * - Options:
 *   1. circomlibjs (has Poseidon in JS)
 *   2. poseidon-lite (lighter weight)
 *   3. Custom implementation
 * 
 * For now, using simple SHA256 as placeholder
 */
import crypto from 'crypto';

export function hashEmail(email: string): string {
  // Placeholder: Use SHA256
  // TODO: Replace with Poseidon hash
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return '0x' + hash;
}

/**
 * Convert Ethereum address to Field element
 */
export function addressToField(address: string): string {
  // Remove 0x prefix
  const hex = address.replace('0x', '');
  return '0x' + hex;
}

/**
 * Generate nullifier from email hash
 */
export function generateNullifier(emailHash: string): string {
  // nullifier = poseidon(emailHash)
  // TODO: Use actual Poseidon
  return hashEmail(emailHash);
}
