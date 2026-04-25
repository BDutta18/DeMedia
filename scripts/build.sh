#!/bin/bash
# Build script for DeMedia Soroban Contracts

set -e

echo "Building DeMedia Soroban Smart Contracts..."

# Add wasm target if not present
rustup target add wasm32-unknown-unknown 2>/dev/null || true

# Build contracts
echo "Building AccessControl..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/access_control/Cargo.toml

echo "Building ContentNFT..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/content_nft/Cargo.toml

echo "Building RoyaltyManager..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/royalty_manager/Cargo.toml

echo "Building PaymentEscrow..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/payment_escrow/Cargo.toml

echo "Building SubscriptionManager..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/subscription_manager/Cargo.toml

echo "Building ContentRegistry..."
cargo build --release --target wasm32-unknown-unknown --manifest-path contracts/content_registry/Cargo.toml

echo ""
echo "Build complete! WASM files in: target/wasm32-unknown-unknown/release/"
ls -la target/wasm32-unknown-unknown/release/*.wasm
