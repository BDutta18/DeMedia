#!/bin/bash

set -e

echo "DeMedia Smart Contracts Test Script"
echo "================================="

echo "Running AccessControl tests..."
cargo test --manifest-path contracts/access_control/Cargo.toml -- --nocapture

echo "Running ContentNFT tests..."
cargo test --manifest-path contracts/content_nft/Cargo.toml -- --nocapture

echo "Running RoyaltyManager tests..."
cargo test --manifest-path contracts/royalty_manager/Cargo.toml -- --nocapture

echo "Running PaymentEscrow tests..."
cargo test --manifest-path contracts/payment_escrow/Cargo.toml -- --nocapture

echo "Running SubscriptionManager tests..."
cargo test --manifest-path contracts/subscription_manager/Cargo.toml -- --nocapture

echo "Running ContentRegistry tests..."
cargo test --manifest-path contracts/content_registry/Cargo.toml -- --nocapture

echo ""
echo "All tests passed!"
