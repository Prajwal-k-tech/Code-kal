# ✅ ZeroKlue Project Status

**Last Updated**: Hour 0  
**Time Remaining**: 22.5 hours  
**Team**: 4 people  

---

## 🎯 What We're Building

**ZeroKlue**: Privacy-preserving student verification using zero-knowledge proofs on Ethereum.

Students verify their university email once → get cryptographic credential → generate ZK proof → receive on-chain NFT → use everywhere without sharing personal data.

**Key Innovation**: Timestamp-based verification lets merchants set their own freshness policies.

---

## ✅ Completed Setup

- ✅ **Scaffold-ETH 2 installed** at `zeroklue-app/`
  - Foundry contracts ready
  - Next.js frontend ready
  - RainbowKit + wagmi configured
  
- ✅ **Documentation complete**:
  - PITCH.md (2-minute pitch, elevator pitch)
  - HACKATHON_QA.md (Q&A prep, updated with timestamp logic)
  - PRD.md (product requirements)
  - TEAM_PLAN.md (4-person, 22.5-hour breakdown)
  - ENGINEERING_PLAN.md (realistic tech plan)
  - QUICKSTART.md (onboarding guide)
  
- ✅ **Smart contract template** created at `zeroklue-app/packages/foundry/contracts/ZeroKlue.sol`
  - Timestamp-based verification
  - Flexible merchant policies
  - Nullifier prevention
  - Reverification support
  - Ready for Person 4 to implement

---

## 📦 Project Structure

```
zeroklue-app/              # Scaffold-ETH (main)
├── packages/
│   ├── foundry/           # Smart contracts (Person 4)
│   │   └── contracts/
│   │       └── ZeroKlue.sol ✅ Created
│   └── nextjs/            # Frontend (Person 1)
│       ├── app/
│       └── components/

backend/                   # Express API (Person 2)
├── src/
│   ├── routes/
│   ├── services/
│   └── utils/

circuits/                  # Noir ZK circuits (Person 3)
└── src/
    └── main.nr

docs/                      # Documentation ✅
├── PITCH.md
├── HACKATHON_QA.md
├── PRD.md
├── TEAM_PLAN.md
├── ENGINEERING_PLAN.md
└── QUICKSTART.md
```

---

## 🚀 Next Steps (Right Now!)

### Everyone (Next 30 minutes)
1. Read **QUICKSTART.md** for your role
2. Set up your environment
3. Verify you can run basic commands

### Then (Next 2 hours)

**Person 1**: 
- Remove Scaffold-ETH example UI
- Create 3 pages: `/verify`, `/marketplace`, `/merchant-demo`

**Person 2**:
- Set up Express + Redis + Resend
- Create `/api/verify/email` endpoint
- Send test email

**Person 3**:
- Install Noir (`noirup`)
- Study Anon-Aadhaar circuit
- Create basic circuit structure

**Person 4**:
- Study ZeroKlue.sol template
- Write Foundry tests
- Get Holesky testnet ETH

---

## 🎯 Key Technical Decisions

### 1. Timestamp Anti-Abuse Solution ✅

**Problem**: Students might abuse discounts years after graduation

**Solution**: NFT stores `verifiedAt` timestamp
```solidity
// Merchants check freshness
if (block.timestamp - nft.verifiedAt > 365 days) {
    // Too old, ask to reverify
}
```

**Benefits**:
- ✅ Flexible per merchant (strict vs relaxed)
- ✅ Students can reverify anytime
- ✅ NFT never expires (just gets "stale")
- ✅ Each merchant sets own policy

### 2. Scaffold-ETH for Speed ✅

**Why**: Saves 4-6 hours of boilerplate setup
- Pre-configured Foundry + Next.js
- RainbowKit wallet integration
- Beautiful UI components
- Deployment scripts ready

### 3. EdDSA (not ECDSA) for Circuits

**Why**: 10x fewer constraints in ZK circuit
- Faster proving (<5s vs 50s+)
- BabyJubJub curve well-supported in Noir
- Smaller proof size

### 4. OTP (not zkEmail) for Verification

**Why**: zkEmail circuits are massive (>100K constraints)
- OTP is "good enough" for hackathon
- Can upgrade to zkEmail post-hackathon
- Saves 10+ hours of development

---

## 📊 Development Roadmap

| Hour | Milestone | Status |
|------|-----------|--------|
| 0-2 | Environment setup | 🟢 In Progress |
| 2-6 | Individual piece development | ⚪ Pending |
| 6-10 | Continue development | ⚪ Pending |
| 10-12 | Test individual pieces | ⚪ Pending |
| 12-14 | Begin integration | ⚪ Pending |
| 14-16 | E2E flow working | ⚪ Pending |
| 16-18 | Deploy to production | ⚪ Pending |
| 18-20 | Polish + merchant demo | ⚪ Pending |
| 20-22 | Final testing | ⚪ Pending |
| 22-22.5 | Buffer | ⚪ Pending |

---

## 🔧 Tech Stack

### From Scaffold-ETH
- ✅ Foundry (contracts + testing)
- ✅ Next.js 14 (frontend)
- ✅ RainbowKit (wallet connection)
- ✅ wagmi/viem (Ethereum interaction)
- ✅ Tailwind CSS + daisyUI (styling)

### Custom Additions
- ⏳ Noir 0.38.0 (ZK circuits)
- ⏳ Express.js (backend API)
- ⏳ Redis (OTP storage)
- ⏳ Resend (email delivery)
- ⏳ @noble/curves (EdDSA signing)

### Infrastructure
- Vercel (frontend hosting)
- Railway/Render (backend hosting)
- Holesky (testnet deployment)

---

## 🎓 Key Resources

**Must Read**:
1. QUICKSTART.md - Get started in 30 minutes
2. ENGINEERING_PLAN.md - Full technical plan
3. TEAM_PLAN.md - Hour-by-hour breakdown

**Reference**:
- Scaffold-ETH docs: https://docs.scaffoldeth.io
- Noir docs: https://noir-lang.org/docs
- Anon-Aadhaar (inspiration): https://github.com/anon-aadhaar/anon-aadhaar-noir

**Team Coordination**:
- Meet every 4-6 hours for sync
- Use TEAM_PLAN.md for progress tracking
- Critical handoffs at Hours 7, 15, 16

---

## 🚨 Risk Mitigation

### High Risk: Circuit Development
**Risk**: Noir circuits can be tricky to debug  
**Mitigation**: 
- Start early (Person 3 begins immediately)
- Study Anon-Aadhaar reference implementation
- Have backup: pre-generated proofs for demo
- Worst case: mock verification in contract

### Medium Risk: Backend Crypto
**Risk**: EdDSA signing might not match circuit expectations  
**Mitigation**:
- Person 2 and Person 3 sync early (Hour 7)
- Share test vectors immediately
- Debug together if signature fails

### Low Risk: Frontend Integration
**Risk**: NoirJS might be slow in browser  
**Mitigation**:
- Test proof generation early
- Show progress bar during proving
- Fallback: server-side proving if needed

---

## 📈 Success Metrics

### Minimum Viable Demo (Hour 16)
- [ ] Email → OTP → Credential works
- [ ] Circuit generates proof
- [ ] Contract accepts proof
- [ ] NFT minted with timestamp
- [ ] Merchant can check NFT age

### Polished Demo (Hour 20)
- [ ] Beautiful UI
- [ ] Deployed to testnet
- [ ] Works 100% of the time
- [ ] Merchant demo impressive

### Demo Ready (Hour 22)
- [ ] Tested 5+ times end-to-end
- [ ] Backup video recorded
- [ ] Pitch rehearsed
- [ ] Team confident

---

## 💪 Team Motivation

**We have**:
- ✅ Clear plan (ENGINEERING_PLAN.md)
- ✅ Strong foundation (Scaffold-ETH)
- ✅ Great idea (timestamp-based verification)
- ✅ 22.5 hours (realistic timeline)
- ✅ 4 people (good team size)

**We don't need**:
- ❌ Perfect code
- ❌ Production-ready security
- ❌ Full decentralization
- ❌ Every feature

**We just need**:
✅ A working demo that shows the core value proposition

---

## 🎯 Current Action Items

### Right Now (Next 30 minutes):
1. **Everyone**: Read QUICKSTART.md for your role
2. **Person 1**: `cd zeroklue-app/packages/nextjs && yarn start`
3. **Person 2**: Install Redis, create backend/, get Resend key
4. **Person 3**: Install Noir (`noirup`), clone Anon-Aadhaar
5. **Person 4**: `cd zeroklue-app/packages/foundry && forge test`

### First Check-in (Hour 2):
- Quick 5-minute sync
- Show what you've built
- Identify any blockers
- Adjust plan if needed

---

**Let's build something incredible!** 🚀

*Remember: Hackathon code doesn't need to be perfect. It needs to DEMO well.*
