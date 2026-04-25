#!/bin/bash
# Deploy DeMedia contracts to Stellar Testnet
# Usage: ./deploy-testnet.sh YOUR_SECRET_KEY

set -e

SOURCE="$1"

if [ -z "$SOURCE" ]; then
    echo "Usage: ./deploy-testnet.sh <YOUR_SECRET_KEY>"
    exit 1
fi

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
WASM_DIR="target/wasm32-unknown-unknown/release"

echo "=========================================="
echo "  DeMedia Contracts Deployment to Testnet"
echo "=========================================="
echo ""

# Configure network
echo "Configuring testnet network..."
soroban network add testnet --rpc-url "$RPC_URL" --network-passphrase "$PASSPHRASE" 2>/dev/null || true

# Deploy contracts and capture IDs
echo "Deploying contracts..."
echo ""

echo "1. AccessControl..."
ACCESS_CONTROL_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/access_control.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $ACCESS_CONTROL_ID"

echo "2. ContentNFT..."
CONTENT_NFT_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/content_nft.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $CONTENT_NFT_ID"

echo "3. RoyaltyManager..."
ROYALTY_MANAGER_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/royalty_manager.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $ROYALTY_MANAGER_ID"

echo "4. PaymentEscrow..."
PAYMENT_ESCROW_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/payment_escrow.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $PAYMENT_ESCROW_ID"

echo "5. SubscriptionManager..."
SUBSCRIPTION_MANAGER_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/subscription_manager.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $SUBSCRIPTION_MANAGER_ID"

echo "6. ContentRegistry..."
CONTENT_REGISTRY_ID=$(soroban contract deploy \
    --wasm $WASM_DIR/content_registry.wasm \
    --source "$SOURCE" \
    --network $NETWORK 2>/dev/null)
echo "   Contract ID: $CONTENT_REGISTRY_ID"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Contract IDs:"
echo "------------------------------------------"
echo "AccessControl:         $ACCESS_CONTROL_ID"
echo "ContentNFT:            $CONTENT_NFT_ID"
echo "RoyaltyManager:        $ROYALTY_MANAGER_ID"
echo "PaymentEscrow:         $PAYMENT_ESCROW_ID"
echo "SubscriptionManager:    $SUBSCRIPTION_MANAGER_ID"
echo "ContentRegistry:       $CONTENT_REGISTRY_ID"
echo ""

# Save to deployment file
mkdir -p deployment
cat > deployment/testnet-deployment.json << EOF
{
  "network": "testnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "access_control": {
      "id": "$ACCESS_CONTROL_ID",
      "name": "AccessControl",
      "wasm": "access_control.wasm"
    },
    "content_nft": {
      "id": "$CONTENT_NFT_ID",
      "name": "ContentNFT",
      "wasm": "content_nft.wasm"
    },
    "royalty_manager": {
      "id": "$ROYALTY_MANAGER_ID",
      "name": "RoyaltyManager",
      "wasm": "royalty_manager.wasm"
    },
    "payment_escrow": {
      "id": "$PAYMENT_ESCROW_ID",
      "name": "PaymentEscrow",
      "wasm": "payment_escrow.wasm"
    },
    "subscription_manager": {
      "id": "$SUBSCRIPTION_MANAGER_ID",
      "name": "SubscriptionManager",
      "wasm": "subscription_manager.wasm"
    },
    "content_registry": {
      "id": "$CONTENT_REGISTRY_ID",
      "name": "ContentRegistry",
      "wasm": "content_registry.wasm"
    }
  }
}
EOF

echo "Deployment details saved to: deployment/testnet-deployment.json"
