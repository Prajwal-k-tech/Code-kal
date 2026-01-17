# ZeroKlue Backend

Express API for email verification and credential signing.

## Features

- ✅ University email domain validation
- ✅ OTP generation and delivery via email
- ✅ EdDSA credential signing
- ✅ Redis-based OTP storage
- ✅ Rate limiting (TODO)
- ✅ CORS enabled

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Required Environment Variables

```env
PORT=4000
REDIS_URL=redis://localhost:6379
RESEND_API_KEY=re_...  # Get from resend.com
ISSUER_PRIVATE_KEY=...  # Generate with cryptoService
ALLOWED_DOMAINS=iiitkottayam.ac.in,iitb.ac.in,iisc.ac.in
```

### Generate Issuer Keypair

```bash
# Run this once to generate your issuer keys
npm run dev

# In another terminal:
curl http://localhost:4000/api/generate-keys
```

## Development

```bash
# Start with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### POST /api/verify/email

Send OTP to university email.

**Request:**
```json
{
  "email": "student@iiitkottayam.ac.in"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "expiresIn": 600
}
```

### POST /api/verify/otp

Verify OTP and get signed credential.

**Request:**
```json
{
  "email": "student@iiitkottayam.ac.in",
  "otp": "123456",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "credential": {
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "emailHash": "0x...",
    "signature": {
      "r": "0x...",
      "s": "0x..."
    },
    "issuerPublicKey": {
      "x": "0x...",
      "y": "0x..."
    },
    "nullifier": "0x..."
  }
}
```

## Architecture

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │
       │ POST /api/verify/email
       ▼
┌─────────────┐
│   Express   │────────┐
│   Server    │        │
└──────┬──────┘        │
       │               │
       │ Store OTP     │ Send Email
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│    Redis    │  │   Resend    │
└─────────────┘  └─────────────┘

       │
       │ POST /api/verify/otp
       ▼
┌─────────────┐
│   EdDSA     │
│   Signing   │
└──────┬──────┘
       │
       │ Return credential
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

## Tech Stack

- **Framework**: Express.js + TypeScript
- **Email**: Resend (resend.com)
- **Cache**: Redis (OTP storage)
- **Crypto**: @noble/curves (EdDSA on BabyJubJub)
- **Validation**: Zod

## Testing

```bash
# Run tests
npm test

# Manual testing
curl -X POST http://localhost:4000/api/verify/email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@iiitkottayam.ac.in"}'
```

## Deployment

### Railway

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard
railway variables set RESEND_API_KEY=re_...

# Deploy
railway up
```

### Render

1. Create new Web Service
2. Connect GitHub repo
3. Build command: `cd packages/backend && npm install && npm run build`
4. Start command: `cd packages/backend && npm start`
5. Add environment variables in dashboard

## Implementation Notes for Person 2

### Critical TODOs

1. **Implement EdDSA Signing** (`src/services/cryptoService.ts`)
   ```typescript
   import { babyjub } from '@noble/curves/babyjub';
   // Sign message with BabyJubJub EdDSA
   ```

2. **Implement Poseidon Hash** (`src/utils/hash.ts`)
   ```bash
   npm install circomlibjs
   ```
   Use `poseidon` function from circomlibjs

3. **Generate Issuer Keys**
   ```typescript
   const privateKey = babyjub.utils.randomPrivateKey();
   const publicKey = babyjub.getPublicKey(privateKey);
   ```

4. **Coordinate with Person 3 (Circuits)**
   - Share test vectors (signature, message, pubkey)
   - Ensure hash function matches (Poseidon)
   - Verify signature format matches circuit expectations

### Testing Checklist

- [ ] OTP sends to email successfully
- [ ] OTP expires after 10 minutes
- [ ] Invalid OTP returns error
- [ ] Signature verifies in Noir circuit
- [ ] Nullifier matches circuit computation
- [ ] API handles invalid domains correctly

## Troubleshooting

**"Redis connection failed"**
```bash
# Install Redis locally
brew install redis  # macOS
sudo apt install redis  # Ubuntu

# Start Redis
redis-server
```

**"Resend API key invalid"**
- Sign up at https://resend.com
- Create API key
- Add to .env

**"Email not sending"**
- Check Resend dashboard for logs
- Verify domain is configured
- Check spam folder
- For testing, use console.log to print OTP

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Noble Curves](https://github.com/paulmillr/noble-curves)
- [CircomLibJS](https://github.com/iden3/circomlibjs)
