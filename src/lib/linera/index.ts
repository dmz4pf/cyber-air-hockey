/**
 * Linera Library Exports
 *
 * Exports the appropriate Linera client based on configuration.
 * - Development (USE_MOCK=true): Uses MockLineraClient for local testing
 * - Production (USE_MOCK=false): Uses ProductionLineraClient with real blockchain
 */

import { USE_MOCK_CLIENT, logConfig } from './config';
import { MockLineraClient, getLineraClient as getMockClient } from './client';
import { ProductionLineraClient, getProductionLineraClient } from './real-client';
import type { LineraClient, WalletState } from './types';

// Log configuration on module load (development only)
if (typeof window !== 'undefined') {
  logConfig();
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

// Export individual client classes
export { MockLineraClient } from './client';
export { ProductionLineraClient } from './real-client';

// Legacy export for backwards compatibility
export { RealLineraClient } from './linera-client';

/**
 * Get the Linera client instance
 *
 * Returns either MockLineraClient or ProductionLineraClient based on configuration.
 * The returned client implements the LineraClient interface.
 *
 * Configuration:
 * - Set NEXT_PUBLIC_USE_MOCK_LINERA=false for real blockchain
 * - Set NEXT_PUBLIC_LINERA_APPLICATION_ID for your deployed contract
 * - Set NEXT_PUBLIC_LINERA_CHAIN_ID for your chain
 */
let hasLoggedClientType = false;

export function getLineraClient(): LineraClient & {
  onWalletStateChange: (callback: (state: WalletState) => void) => () => void;
} {
  // Only log once per session
  if (!hasLoggedClientType && typeof window !== 'undefined') {
    hasLoggedClientType = true;
    console.log(`[Linera] Using ${USE_MOCK_CLIENT ? 'MOCK' : 'PRODUCTION'} client`);

    if (!USE_MOCK_CLIENT) {
      console.log('[Linera] Real blockchain mode enabled');
      console.log('[Linera] Transactions will consume gas tokens');
    }
  }

  if (USE_MOCK_CLIENT) {
    return getMockClient();
  }

  return getProductionLineraClient();
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

/**
 * Force get production client
 */
export function getRealLineraClient(): ProductionLineraClient {
  return getProductionLineraClient();
}
