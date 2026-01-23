# Air Hockey Server with Linera CLI
# Multi-stage build for smaller final image

# =============================================================================
# Stage 1: Install Linera CLI from source
# =============================================================================
FROM rust:1.86-bookworm AS linera-builder

# Install dependencies for Linera
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    protobuf-compiler \
    clang \
    && rm -rf /var/lib/apt/lists/*

# Clone and install Linera from GitHub
WORKDIR /linera-build

# Clone the testnet branch
RUN git clone --depth 1 --branch testnet_babbage https://github.com/linera-io/linera-protocol.git .

# Install linera binaries
RUN cargo install --locked --path linera-service
RUN cargo install --locked --path linera-storage-service

# Verify installation
RUN /root/.cargo/bin/linera --version

# =============================================================================
# Stage 2: Build Node.js application
# =============================================================================
FROM node:20-bookworm-slim AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# =============================================================================
# Stage 3: Production runtime
# =============================================================================
FROM node:20-bookworm-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Linera binaries from builder
COPY --from=linera-builder /root/.cargo/bin/linera /usr/local/bin/linera
COPY --from=linera-builder /root/.cargo/bin/linera-server /usr/local/bin/linera-server
COPY --from=linera-builder /root/.cargo/bin/linera-proxy /usr/local/bin/linera-proxy

# Make sure linera is executable
RUN chmod +x /usr/local/bin/linera*

# Verify linera is available
RUN linera --version

# Copy node modules and built application
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/package*.json ./

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Start the server
CMD ["npm", "start"]
