#!/bin/bash

# Don't use set -e - we want the server to start even if wallet init fails
# The server will run in degraded mode if Linera is unavailable

# Initialize Linera wallet if it doesn't exist
WALLET_DIR="/root/.config/linera"

if [ ! -d "$WALLET_DIR" ] || [ ! -f "$WALLET_DIR/wallet.json" ]; then
    echo "[Startup] Initializing Linera wallet..."

    # Create wallet directory
    mkdir -p "$WALLET_DIR"

    # Initialize wallet with Conway testnet faucet (v0.15.x syntax)
    # Step 1: Initialize the wallet
    if linera wallet init --faucet https://faucet.testnet-conway.linera.net; then
        echo "[Startup] Wallet initialized"

        # Step 2: Request a new chain from the faucet and set it as default
        echo "[Startup] Requesting new chain from faucet..."
        if linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net --set-default; then
            echo "[Startup] Wallet initialized successfully"
        else
            echo "[Startup] WARNING: Failed to request chain from faucet"
            echo "[Startup] Server will start in degraded mode"
        fi
    else
        echo "[Startup] WARNING: Failed to initialize wallet"
        echo "[Startup] Server will start in degraded mode"
    fi
else
    echo "[Startup] Wallet already exists"
fi

# Start the Node.js server (always, even if wallet init failed)
echo "[Startup] Starting Air Hockey server..."
exec node dist/index.js
