'use client';

/**
 * LineraProvider - React Context Provider for Linera Blockchain Operations
 *
 * Provides:
 * - Linera client instance for game operations
 * - Transaction state management
 * - Event subscriptions for game events
 *
 * Note: Wallet connection is handled by WalletAuthProvider.
 * This provider assumes wallet is already connected.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import {
  getLineraClient,
  isUsingMockClient,
  LINERA_CONFIG,
} from '@/lib/linera';
import type {
  LineraClient,
  WalletState,
  GameCreatedEvent,
  GameJoinedEvent,
  GameCompletedEvent,
  GameCancelledEvent,
} from '@/lib/linera/types';
import { useWalletAuth } from './WalletAuthProvider';

// Transaction state
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export interface TransactionState {
  status: TransactionStatus;
  hash: string | null;
  error: string | null;
  description: string | null;
}

// Provider context value
export interface LineraContextValue {
  // Client
  client: LineraClient | null;
  isInitialized: boolean;
  isMockMode: boolean;

  // Wallet state (from WalletAuthProvider)
  walletState: WalletState;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;

  // Actions (delegated to WalletAuthProvider)
  connect: () => Promise<string>;
  disconnect: () => void;

  // Transaction state
  transaction: TransactionState;
  resetTransaction: () => void;
  setTransactionPending: (description: string) => void;
  setTransactionConfirming: (hash: string) => void;
  setTransactionSuccess: (hash: string) => void;
  setTransactionError: (error: string) => void;

  // Event handlers (set by consumers)
  setGameCreatedHandler: (handler: ((event: GameCreatedEvent) => void) | null) => void;
  setGameJoinedHandler: (handler: ((event: GameJoinedEvent) => void) | null) => void;
  setGameCompletedHandler: (handler: ((event: GameCompletedEvent) => void) | null) => void;
  setGameCancelledHandler: (handler: ((event: GameCancelledEvent) => void) | null) => void;

  // Config
  config: typeof LINERA_CONFIG;
}

// Create context
const LineraContext = createContext<LineraContextValue | null>(null);

// Provider props
interface LineraProviderProps {
  children: ReactNode;
}

// Default transaction state
const defaultTransactionState: TransactionState = {
  status: 'idle',
  hash: null,
  error: null,
  description: null,
};

/**
 * LineraProvider Component
 */
export function LineraProvider({ children }: LineraProviderProps) {
  // Get wallet state from WalletAuthProvider
  const {
    address,
    isConnected,
    isConnecting,
    connect: walletConnect,
    disconnect: walletDisconnect,
  } = useWalletAuth();

  // Client ref
  const clientRef = useRef<(LineraClient & {
    onWalletStateChange: (callback: (state: WalletState) => void) => () => void;
  }) | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMockMode, setIsMockMode] = useState(true);
  const [transaction, setTransaction] = useState<TransactionState>(defaultTransactionState);

  // Construct wallet state from WalletAuthProvider
  const walletState: WalletState = {
    status: isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected',
    address: address,
    chainId: null, // Could be enhanced to get from WalletAuthProvider
    balance: BigInt(0), // Could be enhanced to fetch balance
    error: null,
  };

  // Event handlers refs
  const gameCreatedHandlerRef = useRef<((event: GameCreatedEvent) => void) | null>(null);
  const gameJoinedHandlerRef = useRef<((event: GameJoinedEvent) => void) | null>(null);
  const gameCompletedHandlerRef = useRef<((event: GameCompletedEvent) => void) | null>(null);
  const gameCancelledHandlerRef = useRef<((event: GameCancelledEvent) => void) | null>(null);

  // Initialize client (client-side only)
  useEffect(() => {
    setIsMockMode(isUsingMockClient());

    const client = getLineraClient();
    clientRef.current = client;

    // Subscribe to game events
    const unsubscribeCreated = client.onGameCreated((event) => {
      gameCreatedHandlerRef.current?.(event);
    });
    const unsubscribeJoined = client.onGameJoined((event) => {
      gameJoinedHandlerRef.current?.(event);
    });
    const unsubscribeCompleted = client.onGameCompleted((event) => {
      gameCompletedHandlerRef.current?.(event);
    });
    const unsubscribeCancelled = client.onGameCancelled((event) => {
      gameCancelledHandlerRef.current?.(event);
    });

    setIsInitialized(true);

    return () => {
      unsubscribeCreated();
      unsubscribeJoined();
      unsubscribeCompleted();
      unsubscribeCancelled();
    };
  }, []);

  // Connect wallet (delegate to WalletAuthProvider)
  const connect = useCallback(async (): Promise<string> => {
    return walletConnect();
  }, [walletConnect]);

  // Disconnect wallet (delegate to WalletAuthProvider)
  const disconnect = useCallback(() => {
    walletDisconnect();
  }, [walletDisconnect]);

  // Transaction state management
  const resetTransaction = useCallback(() => {
    setTransaction(defaultTransactionState);
  }, []);

  const setTransactionPending = useCallback((description: string) => {
    setTransaction({
      status: 'pending',
      hash: null,
      error: null,
      description,
    });
  }, []);

  const setTransactionConfirming = useCallback((hash: string) => {
    setTransaction((prev) => ({
      ...prev,
      status: 'confirming',
      hash,
    }));
  }, []);

  const setTransactionSuccess = useCallback((hash: string) => {
    setTransaction((prev) => ({
      ...prev,
      status: 'success',
      hash,
    }));
  }, []);

  const setTransactionError = useCallback((error: string) => {
    setTransaction((prev) => ({
      ...prev,
      status: 'error',
      error,
    }));
  }, []);

  // Event handler setters
  const setGameCreatedHandler = useCallback(
    (handler: ((event: GameCreatedEvent) => void) | null) => {
      gameCreatedHandlerRef.current = handler;
    },
    []
  );

  const setGameJoinedHandler = useCallback(
    (handler: ((event: GameJoinedEvent) => void) | null) => {
      gameJoinedHandlerRef.current = handler;
    },
    []
  );

  const setGameCompletedHandler = useCallback(
    (handler: ((event: GameCompletedEvent) => void) | null) => {
      gameCompletedHandlerRef.current = handler;
    },
    []
  );

  const setGameCancelledHandler = useCallback(
    (handler: ((event: GameCancelledEvent) => void) | null) => {
      gameCancelledHandlerRef.current = handler;
    },
    []
  );

  // Context value
  const contextValue: LineraContextValue = {
    client: clientRef.current,
    isInitialized,
    isMockMode,
    walletState,
    isConnected,
    isConnecting,
    address,
    connect,
    disconnect,
    transaction,
    resetTransaction,
    setTransactionPending,
    setTransactionConfirming,
    setTransactionSuccess,
    setTransactionError,
    setGameCreatedHandler,
    setGameJoinedHandler,
    setGameCompletedHandler,
    setGameCancelledHandler,
    config: LINERA_CONFIG,
  };

  return (
    <LineraContext.Provider value={contextValue}>
      {children}
    </LineraContext.Provider>
  );
}

/**
 * Hook to access Linera context
 */
export function useLineraContext(): LineraContextValue {
  const context = useContext(LineraContext);
  if (!context) {
    throw new Error('useLineraContext must be used within a LineraProvider');
  }
  return context;
}

/**
 * Hook to check if within Linera provider
 */
export function useIsInLineraProvider(): boolean {
  const context = useContext(LineraContext);
  return context !== null;
}

export default LineraProvider;
