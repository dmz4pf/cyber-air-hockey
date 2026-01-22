/**
 * Linera Library Exports
 *
 * Exports the appropriate Linera client based on configuration and browser capabilities.
 * - Mock mode: Uses MockLineraClient for local testing
 * - WASM mode: Uses WasmLineraClient with real blockchain (Chrome/Firefox)
 * - Safari: Falls back to MockLineraClient (no credentialless COEP support)
 */

import { USE_MOCK_CLIENT, logConfig } from './config';
import { MockLineraClient, getLineraClient as getMockClient } from './client';
import { checkBrowserCompatibility, logCompatibility } from './browser-compat';
import type { LineraClient, WalletState } from './types';

// Log configuration on module load (development only)
if (typeof window !== 'undefined') {
  logConfig();
  logCompatibility();
}

// Export all types
export * from './types';

// Export config
export { LINERA_CONFIG, USE_MOCK_CLIENT, validateConfig, logConfig, GRAPHQL_ENDPOINTS, WS_CONFIG } from './config';

// Export utilities from client
export { formatStake, parseStake, shortenAddress } from './client';

// Export MetaMask utilities
export {
  isMetaMaskInstalled,
  connectMetaMask,
  getMetaMaskSigner,
  MetaMaskSigner,
  MetaMaskError,
  METAMASK_ERROR_CODES,
  getMetaMaskState,
  onAccountsChanged,
  onChainChanged,
  onDisconnect,
  signMessage,
  signTypedData,
} from './metamask';

// Export GraphQL utilities
export {
  GET_GAME,
  GET_OPEN_GAMES,
  GET_PLAYER_GAMES,
  GET_ACTIVE_GAMES,
  CREATE_GAME,
  JOIN_GAME,
  SUBMIT_RESULT,
  CANCEL_GAME,
  buildGraphQLRequest,
  parseGraphQLResponse,
  mapGameStatus,
  mapGraphQLGameToChainGame,
} from './graphql';

// Export browser compatibility utilities
export { checkBrowserCompatibility, canUseWasmClient, getCompatibilityStatus, logCompatibility } from './browser-compat';

// Export WASM loader utilities
export { loadLinera, isLineraLoaded, checkCrossOriginIsolation } from './linera-loader';

// Export key derivation utilities
export { connectAndDeriveLineraKey, deriveLineraKeyFromAddress, generateAuthMessage } from './key-derivation';

// Export individual client classes
export { MockLineraClient } from './client';

// Cached client instance
let clientInstance: (LineraClient & { onWalletStateChange: (callback: (state: WalletState) => void) => () => void }) | null = null;
let hasLoggedClientType = false;

/**
 * Get the Linera client instance (async version)
 *
 * Returns the appropriate client based on:
 * 1. Configuration (USE_MOCK_CLIENT)
 * 2. Browser capability (WASM support, cross-origin isolation)
 * 3. Environment (SSR vs browser)
 *
 * In supported browsers (Chrome, Firefox, Edge):
 * - Returns WasmLineraClient for real blockchain interactions
 *
 * In unsupported browsers (Safari) or SSR:
 * - Returns MockLineraClient as fallback
 */
export async function getLineraClientAsync(): Promise<LineraClient & {
  onWalletStateChange: (callback: (state: WalletState) => void) => () => void;
}> {
  // Return cached instance if available
  if (clientInstance) {
    return clientInstance;
  }

  // Server-side: always use mock
  if (typeof window === 'undefined') {
    if (!hasLoggedClientType) {
      hasLoggedClientType = true;
      console.log('[Linera] SSR detected, using MOCK client');
    }
    clientInstance = getMockClient();
    return clientInstance;
  }

  // If mock mode is forced, use mock
  if (USE_MOCK_CLIENT) {
    if (!hasLoggedClientType) {
      hasLoggedClientType = true;
      console.log('[Linera] Mock mode enabled, using MOCK client');
    }
    clientInstance = getMockClient();
    return clientInstance;
  }

  // Check browser compatibility for WASM
  const compat = checkBrowserCompatibility();

  if (!compat.canUseWasm) {
    if (!hasLoggedClientType) {
      hasLoggedClientType = true;
      console.warn(`[Linera] WASM unavailable: ${compat.reason}`);
      console.log('[Linera] Falling back to MOCK client');
    }
    clientInstance = getMockClient();
    return clientInstance;
  }

  // Try to load WASM client
  try {
    if (!hasLoggedClientType) {
      hasLoggedClientType = true;
      console.log('[Linera] Loading WASM client...');
    }

    // Dynamic import to avoid SSR issues
    const { WasmLineraClient } = await import('./wasm-client');
    clientInstance = new WasmLineraClient();
    console.log('[Linera] WASM client loaded successfully');
    return clientInstance;
  } catch (error) {
    console.error('[Linera] Failed to load WASM client:', error);
    console.log('[Linera] Falling back to MOCK client');
    clientInstance = getMockClient();
    return clientInstance;
  }
}

/**
 * Get the Linera client instance (sync version - for backwards compatibility)
 *
 * Note: This always returns MockLineraClient synchronously.
 * For WASM client, use getLineraClientAsync() instead.
 */
export function getLineraClient(): LineraClient & {
  onWalletStateChange: (callback: (state: WalletState) => void) => () => void;
} {
  // If we already have a cached instance, return it
  if (clientInstance) {
    return clientInstance;
  }

  // Only log once per session
  if (!hasLoggedClientType && typeof window !== 'undefined') {
    hasLoggedClientType = true;
    console.log('[Linera] Sync getLineraClient() called, using MOCK client');
    console.log('[Linera] For WASM support, use getLineraClientAsync() instead');
  }

  // Return mock client for sync access
  return getMockClient();
}

/**
 * Reset the cached client instance
 * Useful for testing or when switching between clients
 */
export function resetLineraClient(): void {
  clientInstance = null;
  hasLoggedClientType = false;
}

/**
 * Check if using mock client
 */
export function isUsingMockClient(): boolean {
  return USE_MOCK_CLIENT;
}

/**
 * Get client type string
 */
export function getClientType(): 'mock' | 'production' {
  return USE_MOCK_CLIENT ? 'mock' : 'production';
}

/**
 * Force get mock client (for testing)
 */
export function getMockLineraClient(): MockLineraClient {
  return getMockClient();
}
