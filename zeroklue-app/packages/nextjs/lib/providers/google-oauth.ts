import { ContractProof, JWTCircuitHelper } from "../circuits/jwt";
import { EphemeralKey } from "../types";
import { pubkeyModulusFromJWK } from "../utils";

/**
 * Google OAuth provider for ZeroKlue student verification
 * Verifies user belongs to a Google Workspace domain (e.g., university.edu)
 */

export interface GoogleVerificationResult {
  /** Proof data formatted for ZeroKlue contract */
  contractProof: ContractProof;
  /** The verified domain (e.g., "university.edu") */
  domain: string;
  /** Google's key ID used for verification */
  keyId: string;
  /** Email (only used locally, never sent on-chain) */
  email: string;
}

/**
 * Complete verification flow: OAuth → JWT → ZK Proof
 * @param ephemeralKey - Generated ephemeral key to bind proof to wallet
 * @returns Proof data ready for the ZeroKlue smart contract
 */
export async function verifyWithGoogle(ephemeralKey: EphemeralKey): Promise<GoogleVerificationResult> {
  // Load Google OAuth script
  await loadGoogleOAuthScript();

  // Sign in with Google with ephemeralPubkeyHash as nonce
  const idToken = await signInWithGoogle({
    nonce: ephemeralKey.ephemeralPubkeyHash.toString(),
  });

  const [headersB64, payloadB64] = idToken.split(".");
  const headers = JSON.parse(atob(headersB64));
  const payload = JSON.parse(atob(payloadB64));

  // Check for Google Workspace domain
  const domain = payload.hd;
  if (!domain) {
    throw new Error(
      "Your Google account must be part of an organization (Google Workspace). " +
        "Personal Gmail accounts are not supported.",
    );
  }

  const email = payload.email;
  if (!payload.email_verified) {
    throw new Error("Your email must be verified by Google.");
  }

  // Get Google's public key for JWT verification
  const keyId = headers.kid;
  const googleJWTPubkey = await fetchGooglePublicKey(keyId);
  if (!googleJWTPubkey) {
    throw new Error("Failed to fetch Google's public key");
  }

  console.log(`[ZeroKlue] Verified domain: ${domain}`);
  console.log(`[ZeroKlue] Generating ZK proof...`);

  // Generate ZK proof using JWT circuit
  const contractProof = await JWTCircuitHelper.generateProof({
    idToken,
    jwtPubkey: googleJWTPubkey,
    ephemeralKey: ephemeralKey,
    domain,
  });

  console.log(`[ZeroKlue] Proof generated successfully!`);

  return {
    contractProof,
    domain,
    keyId,
    email, // Only used locally for display, never sent to chain
  };
}

/**
 * Get a logo URL for a domain
 */
export function getDomainLogo(domain: string): string {
  return `https://img.logo.dev/${domain}?token=pk_SqdEexoxR3akcyJz7PneXg`;
}

// ============ Internal Helpers ============

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (params: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

async function loadGoogleOAuthScript(): Promise<void> {
  return new Promise<void>(resolve => {
    if (typeof window.google !== "undefined" && window.google.accounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

async function signInWithGoogle({ nonce }: { nonce: string }): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in environment");
  }

  try {
    // Try One Tap first (less intrusive)
    return await signInWithGoogleOneTap({ nonce, clientId });
  } catch (error) {
    console.log("[ZeroKlue] One Tap failed, using popup method");
    return signInWithGooglePopup({ nonce, clientId });
  }
}

async function signInWithGoogleOneTap({ nonce, clientId }: { nonce: string; clientId: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string; error?: string }) => {
        if (response.credential) {
          resolve(response.credential);
        } else {
          reject(new Error(response.error || "One Tap sign-in failed"));
        }
      },
      nonce: nonce,
    });

    window.google?.accounts.id.prompt();

    // Timeout after 10 seconds
    setTimeout(() => reject(new Error("One Tap sign-in timed out")), 10000);
  });
}

async function signInWithGooglePopup({ nonce, clientId }: { nonce: string; clientId: string }): Promise<string> {
  const redirectUri = `${window.location.origin}/oauth-callback`;

  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  localStorage.setItem("zeroklue_oauth_state", state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    nonce: nonce,
    state: state,
    prompt: "select_account",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  // Open popup
  const popup = window.open(authUrl, "google-oauth", "width=500,height=600");
  if (!popup) {
    throw new Error("Failed to open popup. Please allow popups for this site.");
  }

  // Wait for callback
  return new Promise((resolve, reject) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "OAUTH_CALLBACK") {
        window.removeEventListener("message", handleMessage);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else if (event.data.idToken) {
          // Verify state
          const savedState = localStorage.getItem("zeroklue_oauth_state");
          if (event.data.state !== savedState) {
            reject(new Error("OAuth state mismatch"));
            return;
          }
          localStorage.removeItem("zeroklue_oauth_state");
          resolve(event.data.idToken);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Check if popup was closed without completing
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
        reject(new Error("OAuth popup was closed"));
      }
    }, 500);
  });
}

async function fetchGooglePublicKey(keyId: string): Promise<JsonWebKey | null> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  const data = await response.json();

  const key = data.keys.find((k: { kid: string }) => k.kid === keyId);
  return key || null;
}
