/**
 * Linera Library Exports
 *
 * Exports the appropriate Linera client based on configuration.
 * - Development: Uses MockLineraClient for local testing
 * - Production: Uses RealLineraClient with @linera/client
 */

import { USE_MOCK_CLIENT, logConfig } from './config';
import { MockLineraClient, getLineraClient as getMockClient } from './client';
import { RealLineraClient, getRealLineraClient } from './linera-client';
import type { LineraClient, WalletState } from './types';

// Log configuration on module load (development only)
if (typeof window !== 'undefined') {
  logConfig();
}

// Export all types
export * from './types';

// Export config
export { LINERA_CONFIG, USE_MOCK_CLIENT, validateConfig, logConfig } from './config';

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
export { RealLineraClient } from './linera-client';

/**
 * Get the Linera client instance
 *
 * Returns either MockLineraClient or RealLineraClient based on configuration.
 * The returned client implements the LineraClient interface.
 */
// Track if we've logged the client type
let hasLoggedClientType = false;

export function getLineraClient(): LineraClient & {
  onWalletStateChange: (callback: (state: WalletState) => void) => () => void;
} {
  // Only log once per session
  if (!hasLoggedClientType && typeof window !== 'undefined') {
    hasLoggedClientType = true;
    console.log(`[Linera] Using ${USE_MOCK_CLIENT ? 'mock' : 'real'} client`);
  }

  if (USE_MOCK_CLIENT) {
    return getMockClient();
  }

  return getRealLineraClient();
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
export function getClientType(): 'mock' | 'real' {
  return USE_MOCK_CLIENT ? 'mock' : 'real';
}
