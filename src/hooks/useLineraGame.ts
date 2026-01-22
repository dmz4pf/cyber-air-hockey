'use client';

/**
 * useLineraGame Hook
 *
 * A simplified React hook for game components that need to interact with the Linera blockchain.
 */

import { useCallback, useState } from 'react';
import { useLinera, type Game } from '@/providers/LineraDirectProvider';

// ============================================================================
// Types
// ============================================================================

export type { Game };

export interface CreateGameParams {
  stake: string;
  roomCode: string;
}

export interface SubmitResultParams {
  gameId: string;
  player1Score: number;
  player2Score: number;
}

export interface UseLineraGameReturn {
  // State
  isReady: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  isLineraConnected: boolean;
  error: Error | null;

  // Game Operations
  createGame: (stake: string, roomCode: string) => Promise<string>;
  joinGame: (gameIdOrRoomCode: string) => Promise<{ gameId: string; game: Game }>;
  submitResult: (gameId: string, player1Score: number, player2Score: number) => Promise<void>;
  cancelGame: (gameId: string) => Promise<void>;

  // Queries
  getOpenGames: () => Promise<Game[]>;
  getMyGames: () => Promise<Game[]>;
  getGame: (gameId: string) => Promise<Game | null>;

  // Utility
  clearError: () => void;
  connect: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLineraGame(): UseLineraGameReturn {
  const [operationLoading, setOperationLoading] = useState(false);
  const context = useLinera();

  const {
    isInitialized,
    isConnected,
    isConnecting,
    error: contextError,
    clearError: contextClearError,
    createWallet,
    createGame: contextCreateGame,
    joinGame: contextJoinGame,
    submitResult: contextSubmitResult,
    cancelGame: contextCancelGame,
    getOpenGames: contextGetOpenGames,
    getMyGames: contextGetMyGames,
    getGame: contextGetGame,
  } = context;

  // Computed state - map to legacy interface names
  const isAuthenticated = isConnected;
  const isLineraConnected = isConnected && isInitialized;
  const isApplicationReady = isInitialized;
  const isReady = isConnected && isInitialized;
  const isLoading = isConnecting || operationLoading || !isInitialized;

  // Wrapped Operations with Loading State
  const createGame = useCallback(async (stake: string, roomCode: string): Promise<string> => {
    setOperationLoading(true);
    try {
      const gameId = await contextCreateGame(stake, roomCode);
      return gameId;
    } finally {
      setOperationLoading(false);
    }
  }, [contextCreateGame]);

  const joinGame = useCallback(async (gameIdOrRoomCode: string): Promise<{ gameId: string; game: Game }> => {
    setOperationLoading(true);
    try {
      return await contextJoinGame(gameIdOrRoomCode);
    } finally {
      setOperationLoading(false);
    }
  }, [contextJoinGame]);

  const submitResult = useCallback(async (
    gameId: string,
    player1Score: number,
    player2Score: number
  ): Promise<void> => {
    setOperationLoading(true);
    try {
      await contextSubmitResult(gameId, player1Score, player2Score);
    } finally {
      setOperationLoading(false);
    }
  }, [contextSubmitResult]);

  const cancelGame = useCallback(async (gameId: string): Promise<void> => {
    setOperationLoading(true);
    try {
      await contextCancelGame(gameId);
    } finally {
      setOperationLoading(false);
    }
  }, [contextCancelGame]);

  const getOpenGames = useCallback(async (): Promise<Game[]> => {
    setOperationLoading(true);
    try {
      return await contextGetOpenGames();
    } finally {
      setOperationLoading(false);
    }
  }, [contextGetOpenGames]);

  const getMyGames = useCallback(async (): Promise<Game[]> => {
    setOperationLoading(true);
    try {
      return await contextGetMyGames();
    } finally {
      setOperationLoading(false);
    }
  }, [contextGetMyGames]);

  const getGame = useCallback(async (gameId: string): Promise<Game | null> => {
    setOperationLoading(true);
    try {
      return await contextGetGame(gameId);
    } finally {
      setOperationLoading(false);
    }
  }, [contextGetGame]);

  // Connect now calls createWallet from the new provider
  const connect = useCallback(async (): Promise<void> => {
    await createWallet();
  }, [createWallet]);

  const clearError = useCallback(() => {
    contextClearError();
  }, [contextClearError]);

  return {
    // State
    isReady,
    isLoading,
    isConnecting,
    isAuthenticated,
    isLineraConnected,
    error: contextError,

    // Game Operations
    createGame,
    joinGame,
    submitResult,
    cancelGame,

    // Queries
    getOpenGames,
    getMyGames,
    getGame,

    // Utility
    clearError,
    connect,
  };
}

export default useLineraGame;
