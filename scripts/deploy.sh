#!/bin/bash
# Deploy script for DeMedia Soroban Contracts to Testnet

set -e

NETWORK=${1:-testnet}
SOURCE=${2:-}

if [ -z "$SOURCE" ]; then
    echo "Usage: ./deploy.sh <network> <source_secret_key>"
    echo "Example: ./deploy.sh testnet SAMPLE_SECRET_KEY"
    exit 1
fi

echo "Deploying DeMedia Contracts to $NETWORK..."

WASM_DIR="target/wasm32-unknown-unknown/release"

# Deploy AccessControl
echo "Deploying AccessControl..."
ACCESS_CONTROL_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/access_control.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "AccessControl: $ACCESS_CONTROL_ID"

# Deploy ContentNFT
echo "Deploying ContentNFT..."
CONTENT_NFT_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/content_nft.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "ContentNFT: $CONTENT_NFT_ID"

# Deploy RoyaltyManager
echo "Deploying RoyaltyManager..."
ROYALTY_MANAGER_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/royalty_manager.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "RoyaltyManager: $ROYALTY_MANAGER_ID"

# Deploy PaymentEscrow
echo "Deploying PaymentEscrow..."
PAYMENT_ESCROW_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/payment_escrow.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "PaymentEscrow: $PAYMENT_ESCROW_ID"

# Deploy SubscriptionManager
echo "Deploying SubscriptionManager..."
SUBSCRIPTION_MANAGER_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/subscription_manager.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "SubscriptionManager: $SUBSCRIPTION_MANAGER_ID"

# Deploy ContentRegistry
echo "Deploying ContentRegistry..."
CONTENT_REGISTRY_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/content_registry.wasm \
    --source "$SOURCE" \
    --network $NETWORK)
echo "ContentRegistry: $CONTENT_REGISTRY_ID"

echo ""
echo "Deployment complete!"
echo "Save these contract IDs:"
cat > deployment/${NETWORK}-addresses.json << EOF
{
  "network": "$NETWORK",
  "contracts": {
    "access_control": "$ACCESS_CONTROL_ID",
    "content_nft": "$CONTENT_NFT_ID",
    "royalty_manager": "$ROYALTY_MANAGER_ID",
    "payment_escrow": "$PAYMENT_ESCROW_ID",
    "subscription_manager": "$SUBSCRIPTION_MANAGER_ID",
    "content_registry": "$CONTENT_REGISTRY_ID"
  },
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

cat deployment/${NETWORK}-addresses.json
