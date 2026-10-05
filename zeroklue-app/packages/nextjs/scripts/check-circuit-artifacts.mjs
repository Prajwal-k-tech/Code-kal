import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");
const read = (path) => readFileSync(resolve(root, path));
const same = (a, b) => a.equals(b);

const checks = [
  [
    "frontend verification key matches circuit package",
    read("packages/nextjs/public/circuits/vk"),
    read("../packages/circuits/vk/vk"),
  ],
  [
    "JSON verification key matches frontend verification key",
    Buffer.from(JSON.parse(read("packages/nextjs/public/circuits/circuit-vkey.json"))),
    read("packages/nextjs/public/circuits/vk"),
  ],
  [
    "Foundry verifier matches generated circuit verifier",
    read("packages/foundry/contracts/HonkVerifier.sol"),
    read("../packages/circuits/HonkVerifier.sol"),
  ],
];

let failed = false;
for (const [label, left, right] of checks) {
  const matches = same(left, right);
  console.log(`${matches ? "PASS" : "FAIL"} ${label}`);
  failed ||= !matches;
}
if (failed) process.exitCode = 1;
