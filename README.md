# DeMedia - Decentralized Media Content Platform on Stellar

DeMedia is a decentralized media content platform built on the Stellar testnet with Soroban smart contracts.
Creators can upload media, register its fingerprint on-chain, mint NFTs, and manage content ownership with wallet-based auth.

# Deployed Link:
https://de-media-xi.vercel.app/

# Mobile Responsive:
<img width="654" height="1280" alt="image" src="https://github.com/user-attachments/assets/224bd3b1-d17d-44cb-852c-2e6b3ac1a614" />

## What Is Fully Integrated Now

- One upload action now runs a complete backend pipeline:
  1. Media upload to IPFS (Pinata)
  2. Metadata creation + upload to IPFS
  3. Content fingerprint registration on `ContentRegistry`
  4. NFT mint on `ContentNFT`
  5. MongoDB state sync (including tx references)
- Wallet disconnect is wired end-to-end (`Freighter/StellarWalletsKit disconnect` + local app logout).
- Purchase path uses royalty-enabled escrow call (`instant_settle_with_royalty`) from production backend flow.
- Frontend API routes now use a single normalized backend base URL helper.
- Explorer links are aligned to Stellar testnet.

## Belt Requirement Mapping

### Belt 1 (White Belt)

- Wallet setup and testnet usage:
  - `frontend/app/auth/page.tsx`
  - `frontend/lib/wallet-kit.ts`
- Wallet connect/disconnect:
  - Connect in `frontend/app/auth/page.tsx`
  - Disconnect in `frontend/app/wallet/page.tsx`
- XLM balance fetch and UI display:
  - `frontend/app/wallet/page.tsx`
- Send XLM transaction on Stellar testnet with user feedback and tx hash:
  - `frontend/app/wallet/page.tsx`

### Belt 2

- Multi-wallet integration via StellarWalletsKit:
  - `frontend/lib/wallet-kit.ts`
- Error handling (wallet not found / rejected / insufficient balance):
  - `frontend/lib/errors.ts`
  - `backend/src/utils/stellarError.ts`
- Contract invocation from frontend-backed API routes:
  - Upload pipeline entry: `frontend/app/api/upload/route.ts`
  - Buy pipeline entry: `frontend/app/api/nft/buy/route.ts`
- Transaction status tracking:
  - `backend/src/services/txTracker.ts`
  - `backend/src/controllers/tx.Controller.ts`
  - `frontend/app/post/[id]/post-detail.tsx`
- Event streaming endpoint:
  - `backend/src/routes/tx.Routes.ts`

### Belt 3

- Mini dApp flows implemented (auth, upload, wallet, profile, gallery).
- At least 3 passing tests:
  - `backend/src/__tests__/stellarError.test.ts`
- Loading states and caching present:
  - `frontend/lib/cache.ts`
  - `frontend/app/content/page.tsx`
  - `frontend/app/my-nfts/page.tsx`
  - `frontend/app/post/[id]/post-detail.tsx`
- 

### Belt 4 (current implemented scope)

- Inter-contract call path used in backend purchase flow:
  - `contracts/payment_escrow/src/lib.rs` (`instant_settle_with_royalty`)
  - `backend/src/web3/buyNFT.ts`
- Inter-contract call working (if applicable).
- Custom token or pool deployed (if used).
- CI/CD workflow:
  - `.github/workflows/ci.yml`
- CI/CD running.
- Mobile responsive frontend pages exist across app routes.

Note: Real-time buyer/seller settlement beyond current prototype scope is intentionally not claimed here.

## CI/CD Pipeline

```yaml
name: CI

on:
  push:
    branches: ["main", "master"]
  pull_request:

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.33.2

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Build
        run: pnpm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

  contracts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      - name: Build contracts
        run: bash scripts/build.sh
```

## Core Architecture

- Frontend: Next.js + TypeScript (`frontend/`)
- Backend: Express + TypeScript (`backend/`)
- Contracts: Soroban Rust contracts (`contracts/`)
- Contract integration layer: `backend/src/contract-integration.ts` (details in `CONTRACT_INTEGRATION.md`)
- DB: MongoDB
- Storage: Pinata/IPFS
- Wallet: Freighter and StellarWalletsKit

## Key Smart Contracts (Testnet)

| Contract | Address |
| :--- | :--- |
| AccessControl | `CAUXZFU6GH57S5QWSPO7M2I2ZMWWIX7VA4RFXOA6AT6724D5PTKBZ22A` |
| ContentNFT | `CA7VIJCB4D3A7LU2UZHIQDKKCREREBHRT6RLFS35NPT3GKCBMV73WBRW` |
| RoyaltyManager | `CBUKJDKA2DSQ4HF5IGAQDUJJ7TLDU3C44ZNA3D7T2IKEFG77T7XMNITS` |
| PaymentEscrow | `CC565PKCVD7OODIUP37R3UWRSDVYVPTWAIDKF22D3GNF6WCIYTT4VCGY` |
| SubscriptionManager | `CAPJ45XLMHCS75XDYCYJRGTVCXGFZM5FIGP2EBNV7A3C6WTL7COC5HC5` |
| ContentRegistry | `CBODPDB5DDR624WR5AFY4ISLYBI5CE3ENFZRZTDAP4FC5M4O6VRX5XKX` |

## Deployment Verification (Stellar Testnet)

| Contract | Deployment Tx |
| :--- | :--- |
| AccessControl | [613ce04f66fe55baa26a1e01a62482f9097fefa11744eca61ce75a72ec440aec](https://stellar.expert/explorer/testnet/tx/613ce04f66fe55baa26a1e01a62482f9097fefa11744eca61ce75a72ec440aec) |
| ContentNFT | [fbed31b73a19bf82f7cc3a55d5d6acb85b2c82a3751728cc7b460ad9c8301061](https://stellar.expert/explorer/testnet/tx/fbed31b73a19bf82f7cc3a55d5d6acb85b2c82a3751728cc7b460ad9c8301061) |
| ContentRegistry | [5afb51098967c84459a5d3cd47798596292983d46a314cc54d9f33af087d2d7c](https://stellar.expert/explorer/testnet/tx/5afb51098967c84459a5d3cd47798596292983d46a314cc54d9f33af087d2d7c) |
| RoyaltyManager | [383a3e46ff068df29397fc25115d86f768fb8f3819af5a0898f4e9918cebe08b](https://stellar.expert/explorer/testnet/tx/383a3e46ff068df29397fc25115d86f768fb8f3819af5a0898f4e9918cebe08b) |

## Environment

Set these values before running locally:

- `NEXT_PUBLIC_API_BASE_URL`
- `RPC_URL`
- `PRIVATE_KEY`
- `PINATA_JWT`
- `PINATA_GATEWAY`
- `JWT_SECRET`
- `MONGO_URI`
- `CONTRACT_ADDRESS_CONTENTNFT`
- `CONTRACT_ADDRESS_CONTENTREGISTRY`
- `CONTRACT_ADDRESS_PAYMENTESCROW`
- `CONTRACT_ADDRESS_ROYALTYMANAGER`

## Local Run

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd ../frontend
npm install
npm run dev
```

## Verification Commands

```bash
# backend tests (includes 3 passing tests)
cd backend && npm test

# frontend build
cd frontend && npm run build
```
