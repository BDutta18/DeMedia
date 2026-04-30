<p align="center">
  <img src="frontend/public/demedia-logo.svg" alt="DeMedia Logo" width="120" />
</p>

<h1 align="center">DeMedia</h1>

<p align="center">
  Decentralized Publishing for the Creator Economy
</p>

# DeMedia - Decentralized Media Content Platform on Stellar

DeMedia is a decentralized media content platform built on the Stellar testnet with Soroban smart contracts.
Creators can upload media, register its fingerprint on-chain, mint NFTs, and manage content ownership with wallet-based auth.

## Deployed Link
https://de-media-xi.vercel.app/

## Demo Video
https://www.youtube.com/watch?v=hcs871xpv-E

## UI Screenshots

### 1. Landing Page - Hero Section
![Landing Page Hero](docs/screenshots/homepage-hero.png)
Source: `Screenshot 2026-04-30 174136.png`

### 2. Dashboard - Creator Overview
![Dashboard Overview](docs/screenshots/dashboard-overview.png)
Source: `Screenshot 2026-04-30 174203.png`

### 3. Gallery - NFT Grid View
![Gallery Grid](docs/screenshots/gallery-grid.png)
Source: `Screenshot 2026-04-30 174233.png`

### 4. Wallet - Digital Vault
![Wallet Digital Vault](docs/screenshots/wallet-vault.png)

### User Wallet Addresses

Verifiable user wallet addresses (check each on Stellar Expert testnet):

1. `GDBMOOICQXCNUTYH7XFZ2XCGR7GYLG5UKHG5VRMWEL3YZ255LXBHMV6L`
2. `GBRVG3Q65COSUGCQJFASYSF6BGOTA4FGWM33AAFSZWWB3PL3J2HV3GS5`
3. `GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46`
4. `GCC6OFBPL43QGAJLJDQIMKHA7MS7KPH3PJKABRDIAMW7MVTPDNCFKF6F`
5. `GBVWV4DVBRTQ2Y3FHIQW7AN25FQDTYRFCI5BRIYFVY2SVVZZ3VFIK5CD`
6. `GBTEUTHKT3ZT6NZI2FCTJCDKM6XH7GHVIU723GTJ4LHQBB4YHX5A6DWM`
7. `GCPMZX4LZHUH73UDTNMAJONJ6IQWA4UOXV3WXGXQSGDDSKGVAMADR7RF`
8. `GANGX6WILRGPVTA3PO7JJHEJ3RYSVERIXDAZDY7GKPQ22MBNRGZENTB2`

### User Feedback (Actual Spreadsheet Responses)

<table width="100%">
  <thead>
    <tr>
      <th width="20%">Name</th>
      <th width="38%">Stellar Wallet Address (Full)</th>
      <th width="42%">Actual Feedback Response</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><sub>DEBASMIT BOSE</sub></td>
      <td><sub>GDBMOOICQXCNUTYH7XFZ2XCGR7GYLG5UKHG5VRMWEL3YZ255LXBHMV6L</sub></td>
      <td><sub>the search option could be at the top of the list since that js something most users u suppose would do. Also sorting of the nfts would be a great lift</sub></td>
    </tr>
    <tr>
      <td><sub>Shivanjan Saha</sub></td>
      <td><sub>GBRVG3Q65COSUGCQJFASYSF6BGOTA4FGWM33AAFSZWWB3PL3J2HV3GS5</sub></td>
      <td><sub>While uploading a document the preview is not showing and sometimes lagging</sub></td>
    </tr>
    <tr>
      <td><sub>Rupam Ghosh</sub></td>
      <td><sub>GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46</sub></td>
      <td><sub>Every feature properly working I don't found any bugs</sub></td>
    </tr>
    <tr>
      <td><sub>Himangshu Sharma</sub></td>
      <td><sub>GCC6OFBPL43QGAJLJDQIMKHA7MS7KPH3PJKABRDIAMW7MVTPDNCFKF6F</sub></td>
      <td><sub>Profile Picture is not showing as of now and after uploading the documents we can't preview</sub></td>
    </tr>
    <tr>
      <td><sub>Ruma Dey</sub></td>
      <td><sub>GBVWV4DVBRTQ2Y3FHIQW7AN25FQDTYRFCI5BRIYFVY2SVVZZ3VFIK5CD</sub></td>
      <td><sub>When Uploading Document the preview is not showing in the gallery.</sub></td>
    </tr>
    <tr>
      <td><sub>Adrija Hati</sub></td>
      <td><sub>GBTEUTHKT3ZT6NZI2FCTJCDKM6XH7GHVIU723GTJ4LHQBB4YHX5A6DWM</sub></td>
      <td><sub>Good</sub></td>
    </tr>
    <tr>
      <td><sub>Swastik Chatterjee</sub></td>
      <td><sub>GCPMZX4LZHUH73UDTNMAJONJ6IQWA4UOXV3WXGXQSGDDSKGVAMADR7RF</sub></td>
      <td><sub>Buying NFTs would be a great feature in Version 2</sub></td>
    </tr>
    <tr>
      <td><sub>Samriddha Mukherjee</sub></td>
      <td><sub>GANGX6WILRGPVTA3PO7JJHEJ3RYSVERIXDAZDY7GKPQ22MBNRGZENTB2</sub></td>
      <td><sub>Nil</sub></td>
    </tr>
  </tbody>
</table>

Feedback source:
https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit?gid=1205493588#gid=1205493588

## Feedback-Driven Update Status (April 30, 2026)

Implemented feedback commit ID (document preview reliability):
- [`785c6f014f80aa9512fe87598547bdaf282d3310`](https://github.com/BDutta18/DeMedia/commit/785c6f014f80aa9512fe87598547bdaf282d3310)

Feedback to action mapping:

1. Search should be top-priority in navigation
- Status: `Done`
- Update: Search moved near the start of the navbar list for faster discovery.

2. Add stronger NFT sorting
- Status: `Done`
- Update: Gallery sorting now includes `Newest`, `Oldest`, `Name A-Z`, `Creator A-Z`, `Token ID Low-High`, `Token ID High-Low`.

3. Document preview not showing / gallery preview issues
- Status: `In Progress`
- Update: Existing fix committed in `785c6f...` and additional reliability hardening is ongoing for all media types.

4. Upload lag while handling documents
- Status: `Planned`
- Update: Add progressive loading states and retry-friendly upload UX.

5. Profile picture not showing consistently
- Status: `Planned`
- Update: Add stronger avatar fallback and cache-busting refresh logic.

6. UI should be improved
- Status: `Done`
- Update: Refined visual system across Home, Gallery, and Dashboard; refreshed README screenshots with current UI.

7. Buying NFTs as a V2 feature
- Status: `Planned (Version 2)`
- Update: Marketplace purchase workflow extension tracked for next release cycle.

8. General positive responses (`Good`, `Nil`, `No bugs found`)
- Status: `Logged`
- Update: Stability baseline is good; focus remains on preview reliability and UX polish.

## Required Submission Links

- Live demo: https://de-media-xi.vercel.app/
- Demo video (full MVP): https://www.youtube.com/watch?v=hcs871xpv-E
- User feedback document: https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit?gid=1205493588#gid=1205493588
- Google Form link: https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform?usp=sharing&ouid=106184899408053478392

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

Note: Real-time buyer/seller settlement beyond current prototype scope is intentionally not claimed here.

## CI/CD Pipeline

CI/CD Status:

[![CI](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml/badge.svg)](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml)

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
