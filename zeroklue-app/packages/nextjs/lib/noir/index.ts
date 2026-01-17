/**
 * ⚠️ DEPRECATED - DO NOT USE
 * 
 * This file was for the old OTP/EdDSA-based approach.
 * 
 * The actual proof generation now lives in:
 *   lib/circuits/jwt.ts
 * 
 * The verification hook is:
 *   hooks/useStudentVerification.ts
 * 
 * See FRONTEND_GUIDE.md for current implementation.
 */

// Re-export from actual location for backwards compatibility
export * from '../circuits/jwt';

