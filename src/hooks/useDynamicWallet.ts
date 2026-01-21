'use client';

/**
 * useDynamicWallet Hook
 *
 * A focused React hook for wallet UI components.
 * Provides only wallet-related state and actions, hiding game and Linera specifics.
 *
 * Note: This hook maintains backward compatibility by wrapping the new LineraDirectProvider.
 * The "Dynamic" in the name is historical - it no longer uses Dynamic Labs.
 */

import { useCallback, useMemo } from 'react';
import { useLinera } from '@/providers/LineraDirectProvider';
import type { StakeAmount } from '@/lib/linera/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Wallet connection status
 */
export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected';

/**
 * Return type for useDynamicWallet hook
 */
export interface UseDynamicWalletReturn {
  // Connection State
  isConnected: boolean;
  isConnecting: boolean;
  status: WalletConnectionStatus;

  // Address Info
  address: string | null;
  shortAddress: string | null;

  // Balance Info
  balance: StakeAmount | null;
  formattedBalance: string | null;

  // Linera Status
  isLineraConnected: boolean;
  chainId: string | null;
  isApplicationReady: boolean;
  isMockMode: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;

  // Error Handling
  error: Error | null;
  clearError: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Shorten address for display
 */
function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useDynamicWallet(): UseDynamicWalletReturn {
  const context = useLinera();

  const {
    isInitialized,
    isConnected,
    isConnecting,
    walletAddress,
    chainId,
    balanceFormatted,
    createWallet,
    disconnect: contextDisconnect,
    error,
    clearError: contextClearError,
  } = context;

  // Compute connection status
  const status = useMemo<WalletConnectionStatus>(() => {
    if (isConnecting) return 'connecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  }, [isConnecting, isConnected]);

  // Compute short address
  const shortAddress = useMemo(() => {
    if (!walletAddress) return null;
    return shortenAddress(walletAddress);
  }, [walletAddress]);

  // Convert balance to StakeAmount format
  const balance = useMemo<StakeAmount | null>(() => {
    if (!balanceFormatted) return null;
    // Parse the string value to bigint (handle decimal values by multiplying)
    let bigintValue: bigint;
    try {
      // Try to parse as a simple integer first
      bigintValue = BigInt(balanceFormatted.value.replace(/[^0-9]/g, '') || '0');
    } catch {
      bigintValue = BigInt(0);
    }
    return {
      value: balanceFormatted.value,
      bigint: bigintValue,
      formatted: balanceFormatted.formatted,
    };
  }, [balanceFormatted]);

  // Formatted balance string
  const formattedBalance = useMemo(() => {
    if (!balance) return null;
    return balance.formatted;
  }, [balance]);

  // Connect action - calls createWallet from the new provider
  const connect = useCallback(async () => {
    await createWallet();
  }, [createWallet]);

  // Disconnect action
  const disconnect = useCallback(() => {
    contextDisconnect();
  }, [contextDisconnect]);

  // Clear error action
  const clearError = useCallback(() => {
    contextClearError();
  }, [contextClearError]);

  return {
    // Connection State
    isConnected,
    isConnecting,
    status,

    // Address Info
    address: walletAddress,
    shortAddress,

    // Balance Info
    balance,
    formattedBalance,

    // Linera Status (mapped from new interface)
    isLineraConnected: isConnected && isInitialized,
    chainId,
    isApplicationReady: isInitialized,
    isMockMode: false, // No longer using mock mode

    // Actions
    connect,
    disconnect,

    // Error Handling
    error,
    clearError,
  };
}

/**
 * useWalletAddress - Returns just the wallet address
 */
export function useWalletAddress(): string | null {
  const { address } = useDynamicWallet();
  return address;
}

/**
 * useWalletConnected - Returns just whether the wallet is connected
 */
export function useWalletConnected(): boolean {
  const { isConnected } = useDynamicWallet();
  return isConnected;
}

/**
 * useWalletBalance - Returns just the wallet balance
 */
export function useWalletBalance(): StakeAmount | null {
  const { balance } = useDynamicWallet();
  return balance;
}

export default useDynamicWallet;
