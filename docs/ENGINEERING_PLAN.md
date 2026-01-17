# ZeroKlue Engineering Plan

**Version**: 2.0 (StealthNote Fork)  
**Last Updated**: January 17, 2026

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                USER'S BROWSER                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐               │
│  │   RainbowKit  │    │  Google OAuth │    │    NoirJS     │               │
│  │   (Wallet)    │    │  (JWT Token)  │    │  (Proof Gen)  │               │
│  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘               │
│          │                    │                    │                        │
│          └────────────────────┼────────────────────┘                        │
│                               │                                             │
│                    ┌──────────▼──────────┐                                  │
│                    │   Next.js Frontend  │                                  │
│                    │   (Scaffold-ETH 2)  │                                  │
│                    └──────────┬──────────┘                                  │
│                               │                                             │
└───────────────────────────────┼─────────────────────────────────────────────┘
                                │
                                │ JSON-RPC (wagmi/viem)
                                │
┌───────────────────────────────▼─────────────────────────────────────────────┐
│                          ANVIL LOCAL CHAIN                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────┐         ┌───────────────────────┐               │
│  │     Verifier.sol      │         │     ZeroKlue.sol      │               │
│  │  (Auto-generated)     │◄───────►│    (ERC-721 NFT)      │               │
│  ├───────────────────────┤         ├───────────────────────┤               │
│  │ • verify(proof, pub)  │         │ • verifyAndMint()     │               │
│  │ • UltraHonk verifier  │         │ • usedNullifiers[]    │               │
│  │ • ~300K gas           │         │ • tokenDomainHash[]   │               │
│  └───────────────────────┘         │ • Soulbound (no xfer) │               │
│                                    └───────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure (Final)

```
codekal/
├── packages/
│   ├── circuits/                    # Noir ZK circuit (ported from StealthNote)
│   │   ├── Nargo.toml               # noir-jwt dependency
│   │   └── src/
│   │       └── main.nr              # JWT verification circuit
│   │
│   └── backend/                     # NOT NEEDED ANYMORE (can delete)
│
└── zeroklue-app/                    # Scaffold-ETH 2 base
    └── packages/
        ├── foundry/                 # Smart contracts
        │   ├── contracts/
        │   │   ├── Verifier.sol     # Generated from bb
        │   │   └── ZeroKlue.sol     # NFT + verification
        │   ├── script/
        │   │   └── Deploy.s.sol     # Deploy script
        │   └── test/
        │       └── ZeroKlue.t.sol   # Contract tests
        │
        └── nextjs/                  # Frontend
            ├── app/
            │   └── page.tsx         # Main page
            ├── components/
            │   ├── VerifyStudent.tsx
            │   ├── DiscountMarketplace.tsx
            │   └── StudentNFT.tsx
            ├── lib/
            │   ├── google-oauth.ts          # From StealthNote
            │   ├── circuits/
            │   │   ├── jwt.ts               # From StealthNote
            │   │   └── ephemeral-key.ts     # From StealthNote
            │   └── artifacts/
            │       └── main.json            # Compiled circuit
            └── hooks/
                └── useStudentVerification.ts
```

---

## Step-by-Step Implementation

### Phase 1: Port StealthNote Circuit (Hour 0-2)

**Step 1.1: Copy Circuit Files**
```bash
# From research folder
cp -r /tmp/research-zk/stealthnote/circuit/* /home/prajwal-k/VS\ Code/codekal/packages/circuits/
```

**Step 1.2: Verify Nargo.toml**
```toml
[package]
name = "zeroklue"
type = "bin"
authors = ["ZeroKlue Team"]
compiler_version = ">=1.0.0-beta.0"

[dependencies]
jwt = { tag = "v0.4.4", git = "https://github.com/saleel/noir-jwt" }
```

**Step 1.3: Compile**
```bash
cd packages/circuits
nargo compile
# Should produce target/main.json
```

---

### Phase 2: Generate Solidity Verifier (Hour 2-3)

**Step 2.1: Install Barretenberg**
```bash
# If not installed
curl -L https://raw.githubusercontent.com/AztecProtocol/aztec-packages/master/barretenberg/cpp/installation/install | bash
```

**Step 2.2: Generate Verifier**
```bash
cd packages/circuits
bb write_vk -b ./target/main.json -o ./target --oracle_hash keccak
bb write_solidity_verifier -k ./target/vk -o ../../zeroklue-app/packages/foundry/contracts/Verifier.sol
```

**Expected Output**: ~3000 line Solidity file with `verify(bytes calldata proof, bytes32[] calldata publicInputs)` function.

---

### Phase 3: ZeroKlue.sol Contract (Hour 3-5)

**Step 3.1: Write Contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verifier.sol";

contract ZeroKlue is ERC721, Ownable {
    // The ZK proof verifier (generated from Noir circuit)
    UltraVerifier public immutable verifier;
    
    // Nullifiers prevent double-minting
    mapping(bytes32 => bool) public usedNullifiers;
    
    // Token metadata
    mapping(uint256 => bytes32) public tokenDomainHash;
    mapping(uint256 => uint256) public tokenVerifiedAt;
    
    uint256 private _tokenIdCounter;
    
    // Events
    event StudentVerified(
        address indexed student,
        bytes32 indexed domainHash,
        bytes32 indexed nullifier,
        uint256 tokenId
    );
    
    constructor(address _verifier) 
        ERC721("ZeroKlue Student Pass", "ZKSP") 
        Ownable(msg.sender)
    {
        verifier = UltraVerifier(_verifier);
    }
    
    /**
     * @notice Verify a ZK proof and mint a soulbound NFT
     * @param proof The ZK proof bytes
     * @param publicInputs Array of public inputs [domainHash, nullifier, ...]
     */
    function verifyAndMint(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external {
        require(publicInputs.length >= 2, "Invalid public inputs");
        
        bytes32 domainHash = publicInputs[0];
        bytes32 nullifier = publicInputs[1];
        
        // 1. Check nullifier not already used
        require(!usedNullifiers[nullifier], "Already verified");
        
        // 2. Verify the ZK proof
        require(verifier.verify(proof, publicInputs), "Invalid proof");
        
        // 3. Mark nullifier as used
        usedNullifiers[nullifier] = true;
        
        // 4. Mint soulbound NFT
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(msg.sender, tokenId);
        
        // 5. Store metadata
        tokenDomainHash[tokenId] = domainHash;
        tokenVerifiedAt[tokenId] = block.timestamp;
        
        emit StudentVerified(msg.sender, domainHash, nullifier, tokenId);
    }
    
    /**
     * @notice Override to make NFT soulbound (non-transferable)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)), block transfers
        if (from != address(0) && to != address(0)) {
            revert("ZeroKlue: Soulbound NFT cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Check if address has a valid student verification
     */
    function isVerifiedStudent(address user) external view returns (bool) {
        return balanceOf(user) > 0;
    }
    
    /**
     * @notice Check if verification is within a time window
     * @param user Address to check
     * @param maxAge Maximum age in seconds (e.g., 365 days = 31536000)
     */
    function isRecentlyVerified(
        address user, 
        uint256 maxAge
    ) external view returns (bool) {
        if (balanceOf(user) == 0) return false;
        
        // Get user's first token (simplified - assumes one per user)
        uint256 tokenId = tokenOfOwnerByIndex(user, 0);
        uint256 verifiedAt = tokenVerifiedAt[tokenId];
        
        return (block.timestamp - verifiedAt) <= maxAge;
    }
    
    /**
     * @notice Get domain hash for a token
     */
    function getDomainHash(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenDomainHash[tokenId];
    }
}
```

**Step 3.2: Write Tests**

```solidity
// test/ZeroKlue.t.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/ZeroKlue.sol";

contract MockVerifier {
    bool public shouldVerify = true;
    
    function setShouldVerify(bool _should) external {
        shouldVerify = _should;
    }
    
    function verify(bytes calldata, bytes32[] calldata) external view returns (bool) {
        return shouldVerify;
    }
}

contract ZeroKlueTest is Test {
    ZeroKlue public nft;
    MockVerifier public mockVerifier;
    
    address public alice = address(0x1);
    
    function setUp() public {
        mockVerifier = new MockVerifier();
        nft = new ZeroKlue(address(mockVerifier));
    }
    
    function testMintWithValidProof() public {
        bytes memory proof = hex"1234";
        bytes32[] memory inputs = new bytes32[](2);
        inputs[0] = bytes32(uint256(1)); // domainHash
        inputs[1] = bytes32(uint256(2)); // nullifier
        
        vm.prank(alice);
        nft.verifyAndMint(proof, inputs);
        
        assertEq(nft.balanceOf(alice), 1);
        assertTrue(nft.isVerifiedStudent(alice));
    }
    
    function testCannotDoubleMint() public {
        bytes memory proof = hex"1234";
        bytes32[] memory inputs = new bytes32[](2);
        inputs[0] = bytes32(uint256(1));
        inputs[1] = bytes32(uint256(2)); // same nullifier
        
        vm.prank(alice);
        nft.verifyAndMint(proof, inputs);
        
        vm.prank(alice);
        vm.expectRevert("Already verified");
        nft.verifyAndMint(proof, inputs);
    }
    
    function testSoulbound() public {
        bytes memory proof = hex"1234";
        bytes32[] memory inputs = new bytes32[](2);
        inputs[0] = bytes32(uint256(1));
        inputs[1] = bytes32(uint256(2));
        
        vm.prank(alice);
        nft.verifyAndMint(proof, inputs);
        
        vm.prank(alice);
        vm.expectRevert("ZeroKlue: Soulbound NFT cannot be transferred");
        nft.transferFrom(alice, address(0x2), 0);
    }
}
```

---

### Phase 4: Port OAuth & Proof Generation (Hour 3-6)

**Step 4.1: Copy StealthNote Helpers**

```bash
# OAuth
cp /tmp/research-zk/stealthnote/app/lib/providers/google-oauth.ts \
   zeroklue-app/packages/nextjs/lib/

# Circuit helpers
mkdir -p zeroklue-app/packages/nextjs/lib/circuits
cp /tmp/research-zk/stealthnote/app/lib/circuits/jwt.ts \
   zeroklue-app/packages/nextjs/lib/circuits/
cp /tmp/research-zk/stealthnote/app/lib/circuits/ephemeral-key.ts \
   zeroklue-app/packages/nextjs/lib/circuits/
```

**Step 4.2: Install Dependencies**

```bash
cd zeroklue-app/packages/nextjs
yarn add @noir-lang/noir_js @aztec/bb.js
```

**Step 4.3: Create Verification Hook**

```typescript
// hooks/useStudentVerification.ts
import { useState, useCallback } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { signInWithGoogle } from '~~/lib/google-oauth';
import { JWTCircuitHelper } from '~~/lib/circuits/jwt';
import { generateEphemeralKey } from '~~/lib/circuits/ephemeral-key';

export type VerificationStatus = 
  | 'idle' 
  | 'connecting' 
  | 'authenticating'
  | 'generating_proof'
  | 'minting'
  | 'success'
  | 'error';

export function useStudentVerification() {
  const { address } = useAccount();
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();
  
  const verify = useCallback(async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setStatus('authenticating');
      
      // 1. Generate ephemeral key (binds proof to session)
      const ephemeralKey = await generateEphemeralKey();
      
      // 2. Google OAuth with nonce
      const idToken = await signInWithGoogle({
        nonce: ephemeralKey.ephemeralPubkeyHash.toString(),
      });
      
      if (!idToken) {
        throw new Error('Failed to authenticate with Google');
      }
      
      setStatus('generating_proof');
      
      // 3. Generate ZK proof
      const { proof, publicInputs } = await JWTCircuitHelper.generateProof({
        idToken,
        ephemeralKey,
      });
      
      setStatus('minting');
      
      // 4. Submit to contract
      await writeContractAsync({
        address: ZEROKLUE_ADDRESS, // From deployedContracts
        abi: ZEROKLUE_ABI,
        functionName: 'verifyAndMint',
        args: [proof, publicInputs],
      });
      
      setStatus('success');
    } catch (e: any) {
      setError(e.message || 'Verification failed');
      setStatus('error');
    }
  }, [address, writeContractAsync]);
  
  return { verify, status, error };
}
```

---

### Phase 5: Frontend Components (Hour 6-12)

**See TEAM_PLAN.md for detailed component assignments.**

Key components:
1. `VerifyStudent.tsx` - Main verification flow
2. `DiscountMarketplace.tsx` - Offer grid
3. `StudentNFT.tsx` - NFT display card

---

## Environment Variables

```bash
# zeroklue-app/packages/nextjs/.env.local

# Google OAuth (create at console.cloud.google.com)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# For localhost development, no additional config needed
# In production, add authorized domains in Google Console
```

---

## Deployment Commands

```bash
# 1. Start local chain
cd zeroklue-app
yarn chain

# 2. Deploy contracts (in new terminal)
yarn deploy

# 3. Start frontend (in new terminal)
yarn start

# Open http://localhost:3000
```

---

## Gas Estimates

| Operation | Estimated Gas | Notes |
|-----------|---------------|-------|
| Deploy Verifier | ~3-5M gas | One-time |
| Deploy ZeroKlue | ~1M gas | One-time |
| verifyAndMint() | ~300-500K gas | Per user |

On local Anvil chain, gas is free. For mainnet, ~$10-20 at current prices.

---

## Troubleshooting

### Circuit Won't Compile
```bash
# Check Noir version
nargo --version
# Should be 1.0.0-beta.x

# Update if needed
noirup
```

### Verifier Too Large
If the generated Verifier.sol exceeds contract size limit:
1. Use `--oracle_hash keccak` flag (already included)
2. Consider splitting circuit
3. Use recursive proofs (advanced)

### Google OAuth Errors
- Ensure CLIENT_ID is correct
- For localhost, add `http://localhost:3000` to authorized origins
- Check browser console for CORS errors

---

## References

- [StealthNote Repo](https://github.com/saleel/stealthnote)
- [noir-jwt Library](https://github.com/saleel/noir-jwt)
- [Noir Docs](https://noir-lang.org/docs)
- [Scaffold-ETH 2](https://docs.scaffoldeth.io)
