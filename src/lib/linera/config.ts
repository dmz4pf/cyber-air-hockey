/**
 * Linera Configuration
 *
 * Environment-based configuration for Linera blockchain integration.
 * Supports both development (mock) and production (real) modes.
 */

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Use mock only if explicitly set to 'true', otherwise use real client
// This allows development to use real Linera for testing
export const USE_MOCK_CLIENT = process.env.NEXT_PUBLIC_USE_MOCK_LINERA === 'true';

// Linera Network Configuration
export const LINERA_CONFIG = {
  // Faucet URL for testnet wallet creation (Conway testnet)
  faucetUrl: process.env.NEXT_PUBLIC_LINERA_FAUCET_URL || 'https://faucet.testnet-conway.linera.net',

  // Node service URL (GraphQL endpoint)
  // Use Conway testnet RPC by default for production
  nodeServiceUrl: process.env.NEXT_PUBLIC_LINERA_NODE_URL || 'https://rpc.testnet-conway.linera.net',

  // Deployed application ID
  applicationId: process.env.NEXT_PUBLIC_LINERA_APPLICATION_ID || '',

  // Chain ID for the application
  chainId: process.env.NEXT_PUBLIC_LINERA_CHAIN_ID || '',

  // Network name for display
  networkName: process.env.NEXT_PUBLIC_LINERA_NETWORK || 'Linera Testnet',

  // Token decimals (Linera uses 18 decimals like Ethereum)
  tokenDecimals: 18,

  // Token symbol
  tokenSymbol: 'LINERA',

  // Block confirmation timeout (ms)
  confirmationTimeout: 30000,

  // Polling interval for state updates (ms)
  pollingInterval: 5000,
} as const;

// GraphQL Endpoints
export const GRAPHQL_ENDPOINTS = {
  // Main application queries/mutations
  application: `${LINERA_CONFIG.nodeServiceUrl}/applications/${LINERA_CONFIG.applicationId}`,

  // Chain state queries
  chain: `${LINERA_CONFIG.nodeServiceUrl}/chains/${LINERA_CONFIG.chainId}`,

  // System queries (balance, etc.)
  system: LINERA_CONFIG.nodeServiceUrl,
} as const;

// WebSocket Configuration (for real-time updates)
export const WS_CONFIG = {
  // WebSocket URL for game server
  gameServerUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',

  // WebSocket URL for Linera notifications (if separate)
  lineraNotificationsUrl: process.env.NEXT_PUBLIC_LINERA_WS_URL || '',

  // Reconnection settings
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  reconnectDelayMax: 30000,
} as const;

// Validation helpers
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!USE_MOCK_CLIENT) {
    if (!LINERA_CONFIG.applicationId) {
      errors.push('NEXT_PUBLIC_LINERA_APPLICATION_ID is required for production');
    }
    if (!LINERA_CONFIG.chainId) {
      errors.push('NEXT_PUBLIC_LINERA_CHAIN_ID is required for production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Debug logging
export function logConfig() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Linera Config]', {
      useMock: USE_MOCK_CLIENT,
      faucetUrl: LINERA_CONFIG.faucetUrl,
      nodeServiceUrl: LINERA_CONFIG.nodeServiceUrl,
      applicationId: LINERA_CONFIG.applicationId ? '***configured***' : 'NOT SET',
      chainId: LINERA_CONFIG.chainId ? '***configured***' : 'NOT SET',
    });
  }
}
