# Air Hockey Server with Linera Blockchain Support
# Build time: ~10-15 minutes for Rust compilation

# =============================================================================
# Stage 1: Install Linera CLI
# =============================================================================
FROM rust:1.82-bookworm AS linera-builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    protobuf-compiler \
    clang \
    && rm -rf /var/lib/apt/lists/*

# Set cargo home explicitly
ENV CARGO_HOME=/usr/local/cargo
ENV PATH="${CARGO_HOME}/bin:${PATH}"

# Install Linera CLI from crates.io
RUN cargo install --locked linera-service@0.15.8

# Debug: List installed binaries
RUN ls -la ${CARGO_HOME}/bin/

# Verify installation
RUN ${CARGO_HOME}/bin/linera --version

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

# Copy Linera binary from builder (correct path for rust docker image)
COPY --from=linera-builder /usr/local/cargo/bin/linera /usr/local/bin/linera

# Make sure linera is executable
RUN chmod +x /usr/local/bin/linera

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
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Start the server
CMD ["npm", "start"]
