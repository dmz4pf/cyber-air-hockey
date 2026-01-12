/**
 * useLineraApp Hook - Linera Application Operations
 *
 * High-level hook for interacting with the Air Hockey contract.
 * Combines:
 * - Linera client operations
 * - Transaction state management
 * - Event subscriptions
 * - Error handling with retry logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLineraContext } from '@/providers/LineraProvider';
import { formatStake, parseStake, shortenAddress } from '@/lib/linera';
import type {
  ChainGame,
  GameLobbyItem,
  StakeAmount,
  GameCreatedEvent,
  GameJoinedEvent,
  GameCompletedEvent,
  GameCancelledEvent,
} from '@/lib/linera/types';

// Operation options
export interface OperationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  retryCount?: number;
}

// Return type
export interface UseLineraAppReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  balance: StakeAmount | null;

  // Actions
  connect: () => Promise<string>;
  disconnect: () => void;

  // Game operations
  createGame: (
    stakeValue: string,
    roomCode: string,
    options?: OperationOptions
  ) => Promise<number>;
  joinGame: (gameId: number, options?: OperationOptions) => Promise<void>;
  submitResult: (
    gameId: number,
    player1Score: number,
    player2Score: number,
    options?: OperationOptions
  ) => Promise<void>;
  cancelGame: (gameId: number, options?: OperationOptions) => Promise<void>;
  claimWinnings: (gameId: number, options?: OperationOptions) => Promise<void>;

  // Queries
  getGame: (gameId: number) => Promise<ChainGame | null>;
  getOpenGames: () => Promise<GameLobbyItem[]>;
  getMyGames: () => Promise<GameLobbyItem[]>;
  refreshBalance: () => Promise<void>;

  // Transaction state
  isLoading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  transactionHash: string | null;
  transactionDescription: string | null;

  // Error state
  error: string | null;
  clearError: () => void;

  // Event subscriptions
  onGameCreated: (handler: (event: GameCreatedEvent) => void) => () => void;
  onGameJoined: (handler: (event: GameJoinedEvent) => void) => () => void;
  onGameCompleted: (handler: (event: GameCompletedEvent) => void) => () => void;
  onGameCancelled: (handler: (event: GameCancelledEvent) => void) => () => void;

  // Configuration
  isMockMode: boolean;
  config: typeof import('@/lib/linera/config').LINERA_CONFIG;
}

/**
 * Convert ChainGame to GameLobbyItem
 */
function gameToLobbyItem(game: ChainGame, currentAddress: string | null): GameLobbyItem {
  return {
    id: game.id,
    creatorAddress: game.creator,
    creatorShort: shortenAddress(game.creator),
    stake: {
      value: formatStake(game.stake),
      bigint: game.stake,
      formatted: `${formatStake(game.stake)} LINERA`,
    },
    createdAt: new Date(game.createdAt),
    status: game.status,
    roomCode: game.roomCode,
    isOwn: game.creator === currentAddress,
  };
}

/**
 * Hook for Linera application operations
 */
export function useLineraApp(): UseLineraAppReturn {
  const {
    client,
    isInitialized,
    isMockMode,
    walletState,
    isConnected,
    isConnecting,
    address,
    connect: contextConnect,
    disconnect: contextDisconnect,
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
    config,
  } = useLineraContext();

  // Local state
  const [balance, setBalance] = useState<StakeAmount | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Event handler refs (for cleanup)
  const createdHandlerRef = useRef<((event: GameCreatedEvent) => void) | null>(null);
  const joinedHandlerRef = useRef<((event: GameJoinedEvent) => void) | null>(null);
  const completedHandlerRef = useRef<((event: GameCompletedEvent) => void) | null>(null);
  const cancelledHandlerRef = useRef<((event: GameCancelledEvent) => void) | null>(null);

  // Update balance when wallet state changes
  useEffect(() => {
    if (isConnected && walletState.balance > BigInt(0)) {
      setBalance({
        value: formatStake(walletState.balance),
        bigint: walletState.balance,
        formatted: `${formatStake(walletState.balance)} LINERA`,
      });
    } else {
      setBalance(null);
    }
  }, [isConnected, walletState.balance]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!client || !address) return;

    try {
      const balanceResponse = await client.getBalance(address);
      const total = balanceResponse.available + balanceResponse.locked;
      setBalance({
        value: formatStake(total),
        bigint: total,
        formatted: `${formatStake(total)} LINERA`,
      });
    } catch (err) {
      console.warn('[useLineraApp] Failed to refresh balance:', err);
    }
  }, [client, address]);

  // Connect
  const connect = useCallback(async (): Promise<string> => {
    setError(null);
    try {
      const addr = await contextConnect();
      await refreshBalance();
      return addr;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      throw err;
    }
  }, [contextConnect, refreshBalance]);

  // Disconnect
  const disconnect = useCallback(() => {
    contextDisconnect();
    setBalance(null);
    setError(null);
    resetTransaction();
  }, [contextDisconnect, resetTransaction]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    resetTransaction();
  }, [resetTransaction]);

  // Create game
  const createGame = useCallback(
    async (
      stakeValue: string,
      roomCode: string,
      options?: OperationOptions
    ): Promise<number> => {
      if (!client) throw new Error('Client not initialized');

      setIsLoading(true);
      setError(null);
      setTransactionPending('Creating staked game...');

      try {
        const stake = parseStake(stakeValue);
        const receipt = await client.createGame({ stake, roomCode });

        setTransactionConfirming(receipt.hash);
        // In real implementation, we'd wait for confirmation
        setTransactionSuccess(receipt.hash);

        options?.onSuccess?.();
        return receipt.gameId;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create game';
        setError(message);
        setTransactionError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, setTransactionPending, setTransactionConfirming, setTransactionSuccess, setTransactionError]
  );

  // Join game
  const joinGame = useCallback(
    async (gameId: number, options?: OperationOptions): Promise<void> => {
      if (!client) throw new Error('Client not initialized');

      setIsLoading(true);
      setError(null);
      setTransactionPending('Joining game...');

      try {
        const receipt = await client.joinGame({ gameId });

        setTransactionConfirming(receipt.hash);
        setTransactionSuccess(receipt.hash);

        options?.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join game';
        setError(message);
        setTransactionError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, setTransactionPending, setTransactionConfirming, setTransactionSuccess, setTransactionError]
  );

  // Submit result
  const submitResult = useCallback(
    async (
      gameId: number,
      player1Score: number,
      player2Score: number,
      options?: OperationOptions
    ): Promise<void> => {
      if (!client) throw new Error('Client not initialized');

      setIsLoading(true);
      setError(null);
      setTransactionPending('Submitting game result...');

      try {
        const receipt = await client.submitResult({
          gameId,
          player1Score,
          player2Score,
          signature: '', // Would be generated in real implementation
        });

        setTransactionConfirming(receipt.hash);
        setTransactionSuccess(receipt.hash);

        options?.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit result';
        setError(message);
        setTransactionError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, setTransactionPending, setTransactionConfirming, setTransactionSuccess, setTransactionError]
  );

  // Cancel game
  const cancelGame = useCallback(
    async (gameId: number, options?: OperationOptions): Promise<void> => {
      if (!client) throw new Error('Client not initialized');

      setIsLoading(true);
      setError(null);
      setTransactionPending('Cancelling game...');

      try {
        const receipt = await client.cancelGame(gameId);

        setTransactionConfirming(receipt.hash);
        setTransactionSuccess(receipt.hash);

        options?.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel game';
        setError(message);
        setTransactionError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, setTransactionPending, setTransactionConfirming, setTransactionSuccess, setTransactionError]
  );

  // Claim winnings
  const claimWinnings = useCallback(
    async (gameId: number, options?: OperationOptions): Promise<void> => {
      if (!client) throw new Error('Client not initialized');

      setIsLoading(true);
      setError(null);
      setTransactionPending('Claiming winnings...');

      try {
        const receipt = await client.claimWinnings({ gameId });

        setTransactionConfirming(receipt.hash);
        setTransactionSuccess(receipt.hash);
        await refreshBalance();

        options?.onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to claim winnings';
        setError(message);
        setTransactionError(message);
        options?.onError?.(err instanceof Error ? err : new Error(message));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client, setTransactionPending, setTransactionConfirming, setTransactionSuccess, setTransactionError, refreshBalance]
  );

  // Get single game
  const getGame = useCallback(
    async (gameId: number): Promise<ChainGame | null> => {
      if (!client) return null;
      return client.getGame(gameId);
    },
    [client]
  );

  // Get open games
  const getOpenGames = useCallback(async (): Promise<GameLobbyItem[]> => {
    if (!client) return [];

    try {
      const response = await client.getOpenGames();
      return response.games.map((g) => gameToLobbyItem(g, address));
    } catch (err) {
      console.warn('[useLineraApp] Failed to get open games:', err);
      return [];
    }
  }, [client, address]);

  // Get my games
  const getMyGames = useCallback(async (): Promise<GameLobbyItem[]> => {
    if (!client || !address) return [];

    try {
      const response = await client.getMyGames(address);
      return response.games.map((g) => gameToLobbyItem(g, address));
    } catch (err) {
      console.warn('[useLineraApp] Failed to get my games:', err);
      return [];
    }
  }, [client, address]);

  // Event subscription helpers
  const onGameCreated = useCallback(
    (handler: (event: GameCreatedEvent) => void): (() => void) => {
      createdHandlerRef.current = handler;
      setGameCreatedHandler(handler);
      return () => {
        if (createdHandlerRef.current === handler) {
          createdHandlerRef.current = null;
          setGameCreatedHandler(null);
        }
      };
    },
    [setGameCreatedHandler]
  );

  const onGameJoined = useCallback(
    (handler: (event: GameJoinedEvent) => void): (() => void) => {
      joinedHandlerRef.current = handler;
      setGameJoinedHandler(handler);
      return () => {
        if (joinedHandlerRef.current === handler) {
          joinedHandlerRef.current = null;
          setGameJoinedHandler(null);
        }
      };
    },
    [setGameJoinedHandler]
  );

  const onGameCompleted = useCallback(
    (handler: (event: GameCompletedEvent) => void): (() => void) => {
      completedHandlerRef.current = handler;
      setGameCompletedHandler(handler);
      return () => {
        if (completedHandlerRef.current === handler) {
          completedHandlerRef.current = null;
          setGameCompletedHandler(null);
        }
      };
    },
    [setGameCompletedHandler]
  );

  const onGameCancelled = useCallback(
    (handler: (event: GameCancelledEvent) => void): (() => void) => {
      cancelledHandlerRef.current = handler;
      setGameCancelledHandler(handler);
      return () => {
        if (cancelledHandlerRef.current === handler) {
          cancelledHandlerRef.current = null;
          setGameCancelledHandler(null);
        }
      };
    },
    [setGameCancelledHandler]
  );

  // Computed values
  const shortAddress = address ? shortenAddress(address) : null;
  const isPending = transaction.status === 'pending';
  const isConfirming = transaction.status === 'confirming';

  return {
    // Connection state
    isConnected,
    isConnecting,
    address,
    shortAddress,
    balance,

    // Actions
    connect,
    disconnect,

    // Game operations
    createGame,
    joinGame,
    submitResult,
    cancelGame,
    claimWinnings,

    // Queries
    getGame,
    getOpenGames,
    getMyGames,
    refreshBalance,

    // Transaction state
    isLoading,
    isPending,
    isConfirming,
    transactionHash: transaction.hash,
    transactionDescription: transaction.description,

    // Error state
    error,
    clearError,

    // Event subscriptions
    onGameCreated,
    onGameJoined,
    onGameCompleted,
    onGameCancelled,

    // Configuration
    isMockMode,
    config,
  };
}

export default useLineraApp;
