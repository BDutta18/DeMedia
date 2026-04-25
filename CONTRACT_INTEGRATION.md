# Contract Integration Overview

This project integrates Soroban smart contracts through a dedicated backend integration layer.

## Integration Entry Point

- Primary file (judge-facing): `backend/src/contract-integration.ts`
  - Exposes unified methods for contract actions (`registerContent`, `mintContentNft`, `buyNftWithRoyalty`).
  - Exposes integration verification helpers (`getConfiguredContractAddresses`, `verifyContractIntegration`).
  - Validates required env configuration for contract calls.
- Internal wiring file: `backend/src/web3/contractIntegration.ts`
  - Centralized contract + signer + RPC initialization.

## Integrated Contracts

- `CONTRACT_ADDRESS_CONTENTREGISTRY`
- `CONTRACT_ADDRESS_CONTENTNFT`
- `CONTRACT_ADDRESS_PAYMENTESCROW`
- `CONTRACT_ADDRESS_ROYALTYMANAGER`

## Where Contracts Are Invoked

- Content registration: `backend/src/web3/uploadContent.ts`
  - Calls `register_content` on ContentRegistry.
- NFT minting: `backend/src/utils/mintNFT.ts`
  - Calls `mint` on ContentNFT.
- NFT purchase and royalty settlement: `backend/src/web3/buyNFT.ts`
  - Calls `instant_settle_with_royalty` on PaymentEscrow.

## API Routes that Trigger On-Chain Calls

- `POST /api/upload/upload` -> upload + content registration + mint flow
- `POST /api/nft/buy` -> buy flow with royalty settlement

## Network

- Default network passphrase: Stellar Testnet
- Override supported with `STELLAR_NETWORK_PASSPHRASE`
