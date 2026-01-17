import { initProver, initVerifier } from "../lazy-modules";
import { EphemeralKey } from "../types";
import { bytesToHex } from "../utils";
import { type CompiledCircuit, InputMap } from "@noir-lang/noir_js";
import { generateInputs } from "noir-jwt";

const MAX_DOMAIN_LENGTH = 64;

// Circuit artifact is loaded from public folder
const CIRCUIT_PATH = "/circuits/circuit.json";

export type ProofProgress = {
  stage: "loading" | "witness" | "proving" | "done" | "error";
  progress: number;
  message: string;
};

/**
 * Proof result formatted for the ZeroKlue smart contract
 */
export interface ContractProof {
  /** Raw proof bytes as hex string (0x...) */
  proofHex: `0x${string}`;
  /** Public inputs as bytes32[] (85 elements) */
  publicInputs: `0x${string}`[];
  /** The ephemeral public key for sybil resistance (index 83) */
  ephemeralPubkey: `0x${string}`;
}

/**
 * Generate a ZK proof for student/professional verification
 */
export const generateProof = async (
  credential: {
    idToken: string;
    jwtPubkey: JsonWebKey;
    ephemeralKey: EphemeralKey;
    domain: string;
  },
  onProgress?: (progress: ProofProgress) => void
): Promise<ContractProof> => {
  const { idToken, jwtPubkey, ephemeralKey, domain } = credential;

  if (!idToken || !jwtPubkey) {
    throw new Error("[JWT Circuit] Proof generation failed: idToken and jwtPubkey are required");
  }

  if (onProgress) onProgress({ stage: "loading", progress: 10, message: "Initializing circuit..." });

  const jwtInputs = await generateInputs({
    jwt: idToken,
    pubkey: jwtPubkey,
    shaPrecomputeTillKeys: ["email", "email_verified", "nonce"],
    maxSignedDataLength: 640,
  });

  const domainUint8Array = new Uint8Array(MAX_DOMAIN_LENGTH);
  domainUint8Array.set(Uint8Array.from(new TextEncoder().encode(domain)));

  const inputs = {
    partial_data: jwtInputs.partial_data,
    partial_hash: jwtInputs.partial_hash,
    full_data_length: jwtInputs.full_data_length,
    base64_decode_offset: jwtInputs.base64_decode_offset,
    jwt_pubkey_modulus_limbs: jwtInputs.pubkey_modulus_limbs,
    jwt_pubkey_redc_params_limbs: jwtInputs.redc_params_limbs,
    jwt_signature_limbs: jwtInputs.signature_limbs,
    ephemeral_pubkey: (ephemeralKey.publicKey >> 3n).toString(),
    ephemeral_pubkey_salt: ephemeralKey.salt.toString(),
    ephemeral_pubkey_expiry: Math.floor(ephemeralKey.expiry.getTime() / 1000).toString(),
    domain: {
      storage: Array.from(domainUint8Array),
      len: domain.length,
    },
  };

  console.log("[ZeroKlue] JWT circuit inputs prepared");
  if (onProgress) onProgress({ stage: "witness", progress: 30, message: "Generating witness..." });

  const { Noir, UltraHonkBackend } = await initProver();

  // Load circuit from public folder
  const circuitResponse = await fetch(CIRCUIT_PATH);
  const circuitArtifact = await circuitResponse.json();

  const backend = new UltraHonkBackend(circuitArtifact.bytecode, { threads: 8 });
  const noir = new Noir(circuitArtifact as CompiledCircuit);

  // Generate witness and prove
  console.log("[ZeroKlue] Starting proof generation...");
  const startTime = performance.now();
  const { witness } = await noir.execute(inputs as InputMap);
  
  if (onProgress) onProgress({ stage: "proving", progress: 60, message: "Proving (identifying)..." });
  
  const { proof, publicInputs } = await backend.generateProof(witness);
  const provingTime = performance.now() - startTime;

  console.log(`[ZeroKlue] Proof generated in ${(provingTime / 1000).toFixed(1)}s`);

  // Format for smart contract
  const proofHex = bytesToHex(proof) as `0x${string}`;

  const formattedInputs = publicInputs.map(input => {
    if (typeof input === "string") {
      return input.startsWith("0x") ? (input as `0x${string}`) : (`0x${input}` as `0x${string}`);
    }
    return `0x${input.toString(16).padStart(64, "0")}` as `0x${string}`;
  });

  // The ephemeral public key is at index 83
  const ephemeralPubkey = formattedInputs[83];

  return {
    proofHex,
    publicInputs: formattedInputs,
    ephemeralPubkey,
  };
};

/**
 * Format proof result for contract call
 * (Helper wrapper)
 */
export const formatProofForContract = (proofResult: ContractProof) => {
  return {
    proof: proofResult.proofHex,
    publicInputs: proofResult.publicInputs,
  };
};

export const JWTCircuitHelper = {
  version: "0.1.0",
  generateProof,
};
