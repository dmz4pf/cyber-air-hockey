/**
 * useLinera Hook - React hook for Linera blockchain interactions
 *
 * Provides wallet connection, balance management, and game operations
 * for staked multiplayer matches.
 *
 * This hook can be used either:
 * 1. Within a LineraProvider context (recommended)
 * 2. Standalone with direct client access (for backward compatibility)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getLineraClient,
  formatStake,
  parseStake,
  shortenAddress,
} from '@/lib/linera';
import type {
  WalletState,
  ChainGame,
  GameLobbyItem,
  StakeAmount,
  GameCreatedEvent,
  GameJoinedEvent,
  GameCompletedEvent,
  GameCancelledEvent,
} from '@/lib/linera/types';

interface UseLineraOptions {
  autoConnect?: boolean;
  onGameCreated?: (event: GameCreatedEvent) => void;
  onGameJoined?: (event: GameJoinedEvent) => void;
  onGameCompleted?: (event: GameCompletedEvent) => void;
  onGameCancelled?: (event: GameCancelledEvent) => void;
}

interface UseLineraReturn {
  // Wallet state
  walletState: WalletState;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  balance: StakeAmount | null;

  // Actions
  connect: () => Promise<string>;
  disconnect: () => void;

  // Game operations
  createGame: (stakeValue: string, roomCode: string) => Promise<number>;
  joinGame: (gameId: number) => Promise<void>;
  submitResult: (gameId: number, player1Score: number, player2Score: number) => Promise<void>;
  claimWinnings: (gameId: number) => Promise<void>;
  cancelGame: (gameId: number) => Promise<void>;

  // Queries
  getOpenGames: () => Promise<GameLobbyItem[]>;
  getMyGames: () => Promise<GameLobbyItem[]>;
  getGame: (gameId: number) => Promise<ChainGame | null>;

  // Loading states
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

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

export function useLinera(options: UseLineraOptions = {}): UseLineraReturn {
  const {
    autoConnect = false,
    onGameCreated,
    onGameJoined,
    onGameCompleted,
    onGameCancelled,
  } = options;

  const client = useRef(getLineraClient());
  const [walletState, setWalletState] = useState<WalletState>(client.current.getWalletState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = client.current.onWalletStateChange(setWalletState);
    return unsubscribe;
  }, []);

  // Subscribe to game events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (onGameCreated) {
      unsubscribers.push(client.current.onGameCreated(onGameCreated));
    }
    if (onGameJoined) {
      unsubscribers.push(client.current.onGameJoined(onGameJoined));
    }
    if (onGameCompleted) {
      unsubscribers.push(client.current.onGameCompleted(onGameCompleted));
    }
    if (onGameCancelled) {
      unsubscribers.push(client.current.onGameCancelled(onGameCancelled));
    }

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  }, [onGameCreated, onGameJoined, onGameCompleted, onGameCancelled]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && walletState.status === 'disconnected') {
      client.current.connect().catch(console.error);
    }
  }, [autoConnect, walletState.status]);

  // Derived state
  const isConnected = walletState.status === 'connected';
  const isConnecting = walletState.status === 'connecting';
  const address = walletState.address;
  const shortAddress = address ? shortenAddress(address) : null;
  const balance: StakeAmount | null = isConnected
    ? {
        value: formatStake(walletState.balance),
        bigint: walletState.balance,
        formatted: `${formatStake(walletState.balance)} LINERA`,
      }
    : null;

  // Actions
  const connect = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const addr = await client.current.connect();
      return addr;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    client.current.disconnect();
  }, []);

  const createGame = useCallback(async (stakeValue: string, roomCode: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const stake = parseStake(stakeValue);
      const receipt = await client.current.createGame({ stake, roomCode });
      return receipt.gameId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create game';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const joinGame = useCallback(async (gameId: number) => {
    setError(null);
    setIsLoading(true);
    try {
      await client.current.joinGame({ gameId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join game';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitResult = useCallback(
    async (gameId: number, player1Score: number, player2Score: number) => {
      setError(null);
      setIsLoading(true);
      try {
        await client.current.submitResult({
          gameId,
          player1Score,
          player2Score,
          signature: 'mock-signature', // Would be real signature in production
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to submit result';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const claimWinnings = useCallback(async (gameId: number) => {
    setError(null);
    setIsLoading(true);
    try {
      await client.current.claimWinnings({ gameId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim winnings';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelGame = useCallback(async (gameId: number) => {
    setError(null);
    setIsLoading(true);
    try {
      await client.current.cancelGame(gameId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel game';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Queries
  const getOpenGames = useCallback(async (): Promise<GameLobbyItem[]> => {
    setError(null);
    try {
      const response = await client.current.getOpenGames();
      return response.games.map((g) => gameToLobbyItem(g, address));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch open games';
      setError(message);
      return [];
    }
  }, [address]);

  const getMyGames = useCallback(async (): Promise<GameLobbyItem[]> => {
    if (!address) return [];
    setError(null);
    try {
      const response = await client.current.getMyGames(address);
      return response.games.map((g) => gameToLobbyItem(g, address));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch your games';
      setError(message);
      return [];
    }
  }, [address]);

  const getGame = useCallback(async (gameId: number): Promise<ChainGame | null> => {
    setError(null);
    try {
      return await client.current.getGame(gameId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch game';
      setError(message);
      return null;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    walletState,
    isConnected,
    isConnecting,
    address,
    shortAddress,
    balance,
    connect,
    disconnect,
    createGame,
    joinGame,
    submitResult,
    claimWinnings,
    cancelGame,
    getOpenGames,
    getMyGames,
    getGame,
    isLoading,
    error,
    clearError,
  };
}

export default useLinera;
