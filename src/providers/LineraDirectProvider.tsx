'use client';

/**
 * LineraDirectProvider - React Context Provider for Linera Integration
 *
 * This provider uses the backend REST API to communicate with Linera.
 * The backend runs the Linera CLI service and handles all blockchain operations.
 *
 * Architecture:
 *   Browser (this provider) → REST API → Node.js Server → Linera CLI → Blockchain
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { lineraAPI, Game, LineraStatus } from '@/lib/api/linera-api';

// ============================================================================
// Types
// ============================================================================

export type { Game };

export interface LineraContextValue {
  // Connection state
  isInitialized: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  backendStatus: LineraStatus | null;

  // Error state
  error: Error | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;

  // Game operations
  createGame: (stake: string, roomCode: string) => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  getOpenGames: () => Promise<Game[]>;
  getMyGames: () => Promise<Game[]>;
  getGame: (gameId: string) => Promise<Game | null>;
  submitResult: (gameId: string, p1Score: number, p2Score: number) => Promise<void>;
  cancelGame: (gameId: string) => Promise<void>;

  // For backwards compatibility
  walletAddress: string | null;
  chainId: string | null;
  balanceFormatted: { value: string; formatted: string } | null;
  createWallet: () => Promise<void>;
  loadWallet: (json: string) => Promise<void>;
  exportWallet: () => string | null;
  refreshBalance: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const LineraDirectContext = createContext<LineraContextValue | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface LineraDirectProviderProps {
  children: ReactNode;
}

export function LineraDirectProvider({ children }: LineraDirectProviderProps) {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [backendStatus, setBackendStatus] = useState<LineraStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await lineraAPI.health();
        if (health.status === 'healthy') {
          setIsInitialized(true);

          // Get linera service status
          const status = await lineraAPI.getStatus();
          setBackendStatus(status);

          if (status.running) {
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.warn('[LineraDirectProvider] Backend not available:', err);
        // Still mark as initialized so UI can show appropriate state
        setIsInitialized(true);
        setError(new Error('Backend server not available. Start the server with: cd server && npm run dev'));
      }
    };

    checkBackend();

    // Poll for status every 10 seconds
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  // Connect to backend
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const status = await lineraAPI.getStatus();
      setBackendStatus(status);

      if (status.running) {
        setIsConnected(true);
      } else {
        throw new Error('Linera service is not running on the backend');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect (just clear state, server keeps running)
  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Game operations
  const createGame = useCallback(async (stake: string, roomCode: string): Promise<string> => {
    if (!isConnected) {
      throw new Error('Not connected to Linera backend');
    }

    try {
      const result = await lineraAPI.createGame(stake, roomCode);
      return result.gameId;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create game');
      setError(error);
      throw error;
    }
  }, [isConnected]);

  const joinGame = useCallback(async (gameId: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Not connected to Linera backend');
    }

    try {
      await lineraAPI.joinGame(gameId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join game');
      setError(error);
      throw error;
    }
  }, [isConnected]);

  const getOpenGames = useCallback(async (): Promise<Game[]> => {
    try {
      return await lineraAPI.getOpenGames();
    } catch (err) {
      console.error('[LineraDirectProvider] Failed to get open games:', err);
      return [];
    }
  }, []);

  const getMyGames = useCallback(async (): Promise<Game[]> => {
    // TODO: Implement when backend has /api/games/mine endpoint
    console.log('[LineraDirectProvider] getMyGames not yet implemented on backend');
    return [];
  }, []);

  const getGame = useCallback(async (gameId: string): Promise<Game | null> => {
    try {
      return await lineraAPI.getGame(gameId);
    } catch (err) {
      console.error('[LineraDirectProvider] Failed to get game:', err);
      return null;
    }
  }, []);

  const submitResult = useCallback(async (gameId: string, p1Score: number, p2Score: number): Promise<void> => {
    if (!isConnected) {
      throw new Error('Not connected to Linera backend');
    }

    try {
      await lineraAPI.submitResult(gameId, p1Score, p2Score);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit result');
      setError(error);
      throw error;
    }
  }, [isConnected]);

  const cancelGame = useCallback(async (gameId: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Not connected to Linera backend');
    }

    try {
      await lineraAPI.cancelGame(gameId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel game');
      setError(error);
      throw error;
    }
  }, [isConnected]);

  // Backwards compatibility stubs (wallet management is server-side now)
  const createWallet = useCallback(async () => {
    await connect();
  }, [connect]);

  const loadWallet = useCallback(async () => {
    await connect();
  }, [connect]);

  const exportWallet = useCallback(() => {
    return null; // Wallet is managed server-side
  }, []);

  const refreshBalance = useCallback(async () => {
    // Balance is managed server-side
  }, []);

  // Context value
  const contextValue = useMemo<LineraContextValue>(() => ({
    // State
    isInitialized,
    isConnected,
    isConnecting,
    backendStatus,
    error,

    // Actions
    connect,
    disconnect,
    clearError,

    // Game operations
    createGame,
    joinGame,
    getOpenGames,
    getMyGames,
    getGame,
    submitResult,
    cancelGame,

    // Backwards compatibility
    walletAddress: backendStatus?.chainId || null,
    chainId: backendStatus?.chainId || null,
    balanceFormatted: null, // Server manages balance
    createWallet,
    loadWallet,
    exportWallet,
    refreshBalance,
  }), [
    isInitialized,
    isConnected,
    isConnecting,
    backendStatus,
    error,
    connect,
    disconnect,
    clearError,
    createGame,
    joinGame,
    getOpenGames,
    getMyGames,
    getGame,
    submitResult,
    cancelGame,
    createWallet,
    loadWallet,
    exportWallet,
    refreshBalance,
  ]);

  return (
    <LineraDirectContext.Provider value={contextValue}>
      {children}
    </LineraDirectContext.Provider>
  );
}

// ============================================================================
// Hooks
// ============================================================================

export function useLinera(): LineraContextValue {
  const context = useContext(LineraDirectContext);
  if (!context) {
    throw new Error('useLinera must be used within a LineraDirectProvider');
  }
  return context;
}

export function useIsInLineraDirectProvider(): boolean {
  const context = useContext(LineraDirectContext);
  return context !== null;
}

export default LineraDirectProvider;
