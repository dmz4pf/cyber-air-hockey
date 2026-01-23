#!/bin/bash
set -e

# Initialize Linera wallet if it doesn't exist
WALLET_DIR="/root/.config/linera"

if [ ! -d "$WALLET_DIR" ] || [ ! -f "$WALLET_DIR/wallet.json" ]; then
    echo "[Startup] Initializing Linera wallet..."

    # Create wallet directory
    mkdir -p "$WALLET_DIR"

    # Initialize wallet with Conway testnet faucet (v0.15.x syntax)
    # Step 1: Initialize the wallet
    linera wallet init --faucet https://faucet.testnet-conway.linera.net

    # Step 2: Request a new chain from the faucet and set it as default
    echo "[Startup] Requesting new chain from faucet..."
    linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net --set-default

    echo "[Startup] Wallet initialized successfully"
else
    echo "[Startup] Wallet already exists"
fi

# Start the Node.js server
echo "[Startup] Starting Air Hockey server..."
exec node dist/index.js
