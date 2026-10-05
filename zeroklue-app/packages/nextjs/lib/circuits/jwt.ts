import { initProver } from "../lazy-modules";
import { EphemeralKey } from "../types";
import { bytesToHex } from "../utils";
import { type CompiledCircuit, InputMap } from "@noir-lang/noir_js";
import { generateInputs } from "noir-jwt";

const MAX_DOMAIN_LENGTH = 64;
const MAX_AUDIENCE_LENGTH = 80;

// Circuit artifact is loaded from public folder
const CIRCUIT_PATH = "/circuits/circuit.json";

export type ProofProgress = {
  stage: "loading" | "witness" | "proving" | "done" | "error";
  progress: number;
  message: string;
};

/**
 * Proof and public inputs generated for the on-chain verifier.
 */
export interface ContractProof {
  /** Raw proof bytes as hex string (0x...) */
  proofHex: `0x${string}`;
  /** Public inputs as bytes32[] (167 elements) */
  publicInputs: `0x${string}`[];
  /** The ephemeral public key for sybil resistance (index 164) */
  ephemeralPubkey: `0x${string}`;
}

/**
 * Generate ZK proof material from the configured circuit artifact.
 */
export const generateProof = async (
  credential: {
    idToken: string;
    jwtPubkey: JsonWebKey;
    ephemeralKey: EphemeralKey;
    domain: string;
    audience: string;
    jwtExpiry: number;
  },
  onProgress?: (progress: ProofProgress) => void
): Promise<ContractProof> => {
  const { idToken, jwtPubkey, ephemeralKey, domain, audience, jwtExpiry } = credential;

  if (!idToken || !jwtPubkey) {
    throw new Error("[JWT Circuit] Proof generation failed: idToken and jwtPubkey are required");
  }

  const domainBytes = new TextEncoder().encode(domain);
  const audienceBytes = new TextEncoder().encode(audience);
  if (domainBytes.length === 0 || domainBytes.length > MAX_DOMAIN_LENGTH) {
    throw new Error("[JWT Circuit] Hosted domain exceeds the circuit's byte limit");
  }
  if (audienceBytes.length === 0 || audienceBytes.length > MAX_AUDIENCE_LENGTH) {
    throw new Error("[JWT Circuit] OAuth audience exceeds the circuit's byte limit");
  }
  if (!Number.isSafeInteger(jwtExpiry) || jwtExpiry <= 0) {
    throw new Error("[JWT Circuit] JWT expiry must be a positive integer timestamp");
  }

  if (onProgress) onProgress({ stage: "loading", progress: 10, message: "Initializing circuit..." });

  const jwtInputs = await generateInputs({
    jwt: idToken,
    pubkey: jwtPubkey,
    shaPrecomputeTillKeys: ["email", "email_verified", "nonce", "iss", "aud", "exp", "hd"],
    maxSignedDataLength: 1024, // Increased from 640 to handle larger Google JWTs
  });

  const domainInput = new Uint8Array(MAX_DOMAIN_LENGTH);
  domainInput.set(domainBytes);
  const audienceInput = new Uint8Array(MAX_AUDIENCE_LENGTH);
  audienceInput.set(audienceBytes);

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
    audience: {
      storage: Array.from(audienceInput),
      len: audienceBytes.length,
    },
    domain: {
      storage: Array.from(domainInput),
      len: domainBytes.length,
    },
    jwt_expiry: jwtExpiry.toString(),
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

  // Generate proof with keccak hash for EVM/Solidity verifier compatibility
  // CRITICAL: The { keccak: true } option MUST match the --oracle_hash keccak used during VK generation
  const { proof, publicInputs } = await backend.generateProof(witness, { keccak: true });
  const provingTime = performance.now() - startTime;

  console.log(`[ZeroKlue] Proof generated in ${(provingTime / 1000).toFixed(1)}s`);
  console.log(`[ZeroKlue DEBUG] Raw proof type: ${typeof proof}`);
  console.log(`[ZeroKlue DEBUG] Raw proof length (bytes): ${proof.length}`);
  console.log(`[ZeroKlue DEBUG] Public inputs count: ${publicInputs.length}`);
  console.log(`[ZeroKlue DEBUG] Public inputs (first 5):`, publicInputs.slice(0, 5));
  console.log(`[ZeroKlue DEBUG] Public inputs (last 5):`, publicInputs.slice(-5));

  // Format for smart contract
  const proofHex = bytesToHex(proof) as `0x${string}`;

  if (publicInputs.length !== 167) {
    throw new Error(`[JWT Circuit] Expected 167 public inputs, received ${publicInputs.length}`);
  }

  const formattedInputs = publicInputs.map((input: string) => {
    const hex = input.startsWith("0x") ? input.slice(2) : input;
    if (!/^[0-9a-fA-F]{1,64}$/.test(hex)) {
      throw new Error("[JWT Circuit] Invalid public input encoding");
    }
    return `0x${hex.padStart(64, "0")}` as `0x${string}`;
  });

  // The ephemeral public key is at index 164
  const ephemeralPubkey = formattedInputs[164];

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
