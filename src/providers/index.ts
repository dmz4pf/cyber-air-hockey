/**
 * Providers Index
 */

// Legacy providers (MetaMask-based)
export { LineraProvider, useLineraContext, useIsInLineraProvider } from './LineraProvider';
export type { LineraContextValue, TransactionState, TransactionStatus } from './LineraProvider';

export { WalletAuthProvider, useWalletAuth, useIsInWalletAuthProvider } from './WalletAuthProvider';
export type { WalletAuthState, WalletAuthContextValue, WalletConnectionStatus } from './WalletAuthProvider';

// Direct Linera integration (uses REST API to backend server)
export {
  LineraDirectProvider,
  useLinera,
  useIsInLineraDirectProvider,
} from './LineraDirectProvider';
export type {
  LineraContextValue as LineraDirectContextValue,
  Game,
} from './LineraDirectProvider';

// Backward compatibility aliases (for code that was using DynamicLineraProvider)
export {
  LineraDirectProvider as DynamicLineraProvider,
  useLinera as useDynamicLinera,
  useIsInLineraDirectProvider as useIsInDynamicLineraProvider,
} from './LineraDirectProvider';
export type { LineraContextValue as DynamicLineraContextValue } from './LineraDirectProvider';
