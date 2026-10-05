import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";
import { createPublicClient, createWalletClient, http, isAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";

nextEnv.loadEnvConfig(process.cwd());

const rpcUrl = "http://127.0.0.1:8545";
const workspaceDomain = process.env.ZERO_KLUE_WORKSPACE_DOMAIN?.trim().toLowerCase();
const audience = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
const privateKey = process.env.ZERO_KLUE_ADMIN_PRIVATE_KEY;

if (!workspaceDomain || !audience || !privateKey) {
  throw new Error(
    "Set ZERO_KLUE_WORKSPACE_DOMAIN, NEXT_PUBLIC_GOOGLE_CLIENT_ID, and ZERO_KLUE_ADMIN_PRIVATE_KEY in .env.local.",
  );
}

const domainBytes = new TextEncoder().encode(workspaceDomain);
const audienceBytes = new TextEncoder().encode(audience);
if (domainBytes.length === 0 || domainBytes.length > 64 || audienceBytes.length === 0 || audienceBytes.length > 80) {
  throw new Error("Workspace domain must be at most 64 bytes and OAuth audience at most 80 bytes.");
}

const deploymentSource = await readFile(new URL("../contracts/deployedContracts.ts", import.meta.url), "utf8");
const deployedAddress = deploymentSource.match(/ZeroKlue:\s*\{\s*address:\s*["'](0x[0-9a-fA-F]{40})["']/s)?.[1];
const contractAddress = process.env.ZERO_KLUE_CONTRACT_ADDRESS ?? deployedAddress;
if (!contractAddress || !isAddress(contractAddress)) {
  throw new Error("No local ZeroKlue address found. Deploy the contracts first.");
}

const account = privateKeyToAccount(privateKey);
const publicClient = createPublicClient({ chain: foundry, transport: http(rpcUrl) });
const walletClient = createWalletClient({ account, chain: foundry, transport: http(rpcUrl) });
if ((await publicClient.getChainId()) !== foundry.id) {
  throw new Error("Refusing to configure allowlists: expected the local Anvil chain (31337).");
}

const abi = [
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "address" }] },
  {
    type: "function",
    name: "setTrustedJwtKey",
    stateMutability: "nonpayable",
    inputs: [
      { name: "modulusLimbs", type: "bytes32[18]" },
      { name: "trusted", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setApprovedDomain",
    stateMutability: "nonpayable",
    inputs: [
      { name: "domainBytes", type: "bytes32[64]" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "setApprovedAudience",
    stateMutability: "nonpayable",
    inputs: [
      { name: "audienceBytes", type: "bytes32[80]" },
      { name: "audienceLength", type: "uint256" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
];

const owner = await publicClient.readContract({ address: contractAddress, abi, functionName: "owner" });
if (owner.toLowerCase() !== account.address.toLowerCase()) {
  throw new Error(`The configured key ${account.address} does not own ZeroKlue at ${contractAddress}.`);
}

const jwksResponse = await fetch("https://www.googleapis.com/oauth2/v3/certs");
if (!jwksResponse.ok) throw new Error(`Google JWKS request failed (${jwksResponse.status}).`);
const jwks = await jwksResponse.json();
const signingKeys = jwks.keys.filter(key => key.kty === "RSA" && key.alg === "RS256" && key.e === "AQAB" && key.n);
if (signingKeys.length === 0) throw new Error("Google JWKS returned no supported RS256 signing keys.");

const fieldHex = value => `0x${BigInt(value).toString(16).padStart(64, "0")}`;
const textFields = (bytes, length) =>
  Array.from({ length }, (_, index) => fieldHex(index < bytes.length ? bytes[index] : 0));
const modulusLimbs = modulusBase64Url => {
  const modulus = BigInt(`0x${Buffer.from(modulusBase64Url, "base64url").toString("hex")}`);
  if (modulus.toString(2).length !== 2048) throw new Error("Google returned an RSA key that is not 2048 bits.");
  const mask = (1n << 120n) - 1n;
  return Array.from({ length: 18 }, (_, index) => fieldHex((modulus >> (120n * BigInt(index))) & mask));
};

async function send(functionName, args) {
  const hash = await walletClient.writeContract({ address: contractAddress, abi, functionName, args });
  await publicClient.waitForTransactionReceipt({ hash });
}

for (const key of signingKeys) {
  await send("setTrustedJwtKey", [modulusLimbs(key.n), true]);
  console.log(`Approved current Google JWKS key ${key.kid}.`);
}
await send("setApprovedDomain", [textFields(domainBytes, 64), true]);
await send("setApprovedAudience", [textFields(audienceBytes, 80), audienceBytes.length, true]);
console.log(`Configured local ZeroKlue for ${workspaceDomain} and ${account.address}.`);
