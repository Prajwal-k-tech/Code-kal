import { generateInputs } from "noir-jwt";
import { InputMap, type CompiledCircuit } from "@noir-lang/noir_js";
import { initProver, initVerifier } from "../lazy-modules";
import { EphemeralKey } from "../types";
import { splitBigIntToLimbs, bytesToHex } from "../utils";

const MAX_DOMAIN_LENGTH = 64;

// Circuit artifact is loaded from public folder
const CIRCUIT_PATH = "/circuits/circuit.json";

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

export const JWTCircuitHelper = {
  version: "0.1.0", // ZeroKlue version
  
  /**
   * Generate a ZK proof for student/professional verification
   * Returns proof data ready for the ZeroKlue smart contract
   */
  generateProof: async ({
    idToken,
    jwtPubkey,
    ephemeralKey,
    domain,
  }: {
    idToken: string;
    jwtPubkey: JsonWebKey;
    ephemeralKey: EphemeralKey;
    domain: string;
  }): Promise<ContractProof> => {
    if (!idToken || !jwtPubkey) {
      throw new Error(
        "[JWT Circuit] Proof generation failed: idToken and jwtPubkey are required"
      );
    }

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

    const { Noir, UltraHonkBackend } = await initProver();
    
    // Load circuit from public folder
    const circuitResponse = await fetch(CIRCUIT_PATH);
    const circuitArtifact = await circuitResponse.json();
    
    const backend = new UltraHonkBackend(circuitArtifact.bytecode, { threads: 8 });
    const noir = new Noir(circuitArtifact as CompiledCircuit);

    // Generate witness and prove
    console.log("[ZeroKlue] Starting proof generation (this may take 20-40 seconds)...");
    const startTime = performance.now();
    const { witness, returnValue } = await noir.execute(inputs as InputMap);
    const { proof, publicInputs } = await backend.generateProof(witness);
    const provingTime = performance.now() - startTime;

    console.log(`[ZeroKlue] Proof generated in ${(provingTime / 1000).toFixed(1)}s`);
    
    // Format for smart contract
    // proof is Uint8Array, convert to hex
    const proofHex = bytesToHex(proof) as `0x${string}`;
    
    // publicInputs from backend are already in the right format
    // They should be 85 bytes32 values
    const formattedInputs = publicInputs.map(input => {
      // Ensure each input is a proper 32-byte hex string
      if (typeof input === 'string') {
        return input.startsWith('0x') ? input as `0x${string}` : `0x${input}` as `0x${string}`;
      }
      return `0x${input.toString(16).padStart(64, '0')}` as `0x${string}`;
    });
    
    // The ephemeral public key is at index 83 (see TECHNICAL_DECISIONS.md)
    // Layout: pubkey_limbs(18) + domain(64) + domain_len(1) + ephemeral_pubkey(1) + expiry(1) = 85
    const ephemeralPubkey = formattedInputs[83];

    return {
      proofHex,
      publicInputs: formattedInputs,
      ephemeralPubkey,
    };
  },

  /**
   * Verify a proof client-side (for testing)
   * In production, verification happens on-chain via ZeroKlue.sol
   */
  verifyProofClientSide: async (
    proof: Uint8Array,
    publicInputs: string[]
  ): Promise<boolean> => {
    const { BarretenbergVerifier } = await initVerifier();

    // Load vkey from public folder
    const vkeyResponse = await fetch("/circuits/circuit-vkey.json");
    const vkey = await vkeyResponse.json();

    const proofData = {
      proof: proof,
      publicInputs,
    };

    const verifier = new BarretenbergVerifier({
      crsPath: process.env.TEMP_DIR,
    });
    
    const result = await verifier.verifyUltraHonkProof(
      proofData,
      Uint8Array.from(vkey)
    );

    return result;
  },
};
