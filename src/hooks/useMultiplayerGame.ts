'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from './useWebSocket';
import { useInterpolation, usePaddleInterpolation } from './useInterpolation';
import {
  createGameEngine,
  updatePhysics,
  GameEngine,
  GameBodies,
} from '@/lib/physics/engine';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import type { Player, Scores } from '@/types/game';

const PUCK_SYNC_RATE = 33; // Send puck state every 33ms (~30Hz)

interface UseMultiplayerGameOptions {
  onOpponentLeft?: () => void;
}

export function useMultiplayerGame(options: UseMultiplayerGameOptions = {}) {
  const { onOpponentLeft } = options;

  const gameEngineRef = useRef<GameEngine | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const puckSeqRef = useRef<number>(0);
  const lastPuckSyncRef = useRef<number>(0);

  // Game store
  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const isHost = useGameStore((state) => state.isHost);
  const roomId = useGameStore((state) => state.roomId);
  const lastScorer = useGameStore((state) => state.lastScorer);
  const scores = useGameStore((state) => state.scores);
  const maxScore = useGameStore((state) => state.maxScore);
  const scoreGoal = useGameStore((state) => state.scoreGoal);
  const resumeAfterGoal = useGameStore((state) => state.resumeAfterGoal);
  const setMultiplayerScores = useGameStore((state) => state.setMultiplayerScores);

  // Interpolation hooks
  const puckInterpolation = useInterpolation({ delayMs: 50 });
  const opponentPaddleInterpolation = usePaddleInterpolation(0.25);

  // Track if we're in multiplayer mode
  const isMultiplayer = mode === 'multiplayer' && roomId !== null;

  // WebSocket handlers
  const handlePuckUpdate = useCallback(
    (state: { x: number; y: number; vx: number; vy: number; seq: number }) => {
      if (!isHost) {
        puckInterpolation.addSnapshot(state);
      }
    },
    [isHost, puckInterpolation]
  );

  const handleOpponentPaddle = useCallback(
    (state: { x: number; y: number }) => {
      opponentPaddleInterpolation.setTarget(state.x, state.y);
    },
    [opponentPaddleInterpolation]
  );

  const handleGameStart = useCallback(
    (num: 1 | 2) => {
      // Game store is already updated by MultiplayerLobby
      // Clear interpolation buffers
      puckInterpolation.clear();
      opponentPaddleInterpolation.clear();
      puckSeqRef.current = 0;
    },
    [puckInterpolation, opponentPaddleInterpolation]
  );

  const handleGoalConfirmed = useCallback(
    (scorer: 'player1' | 'player2', newScores: Scores) => {
      // Server is authoritative on scores in multiplayer
      setMultiplayerScores(newScores);
    },
    [setMultiplayerScores]
  );

  const handleGameOver = useCallback(
    (winner: 'player1' | 'player2', finalScores: Scores) => {
      setMultiplayerScores(finalScores);
    },
    [setMultiplayerScores]
  );

  const handleOpponentLeftCallback = useCallback(() => {
    puckInterpolation.clear();
    opponentPaddleInterpolation.clear();
    onOpponentLeft?.();
  }, [puckInterpolation, opponentPaddleInterpolation, onOpponentLeft]);

  // WebSocket hook
  const ws = useWebSocket({
    autoConnect: isMultiplayer,
    onPuckUpdate: handlePuckUpdate,
    onOpponentPaddle: handleOpponentPaddle,
    onGameStart: handleGameStart,
    onGoalConfirmed: handleGoalConfirmed,
    onGameOver: handleGameOver,
    onOpponentLeft: handleOpponentLeftCallback,
  });

  // Initialize engine
  useEffect(() => {
    const handleGoal = (scorer: Player) => {
      if (isMultiplayer) {
        // In multiplayer, only host reports goals
        if (isHost) {
          ws.sendGoal(scorer);
        }
        // Don't call scoreGoal directly - wait for server confirmation
      } else {
        // Single player mode
        scoreGoal(scorer);
      }
    };

    const gameEngine = createGameEngine({
      onGoal: handleGoal,
      onPaddleHit: () => {},
      onWallHit: () => {},
    });

    gameEngineRef.current = gameEngine;

    return () => {
      gameEngine.cleanup();
    };
  }, [isMultiplayer, isHost, scoreGoal, ws]);

  // Handle goal pause and reset
  useEffect(() => {
    if (status === 'goal') {
      const timer = setTimeout(() => {
        if (gameEngineRef.current) {
          const serveToward = lastScorer === 'player1' ? 'player2' : 'player1';
          gameEngineRef.current.resetPuck({
            serveToward,
            isGameStart: false,
          });

          // Clear puck interpolation buffer on reset
          if (!isHost) {
            puckInterpolation.clear();
          }
        }
        resumeAfterGoal();
      }, PHYSICS_CONFIG.game.goalPauseMs);

      return () => clearTimeout(timer);
    }
  }, [status, lastScorer, resumeAfterGoal, isHost, puckInterpolation]);

  // Reset puck when game starts
  useEffect(() => {
    if (status === 'playing' && gameEngineRef.current) {
      const store = useGameStore.getState();
      if (store.scores.player1 === 0 && store.scores.player2 === 0) {
        gameEngineRef.current.resetPuck({ isGameStart: true });
        puckInterpolation.clear();
        opponentPaddleInterpolation.clear();
        puckSeqRef.current = 0;
      }
    }
  }, [status, puckInterpolation, opponentPaddleInterpolation]);

  // Game loop
  useEffect(() => {
    if (status !== 'playing') {
      lastTimeRef.current = 0;
      return;
    }

    const gameLoop = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const delta = Math.min(currentTime - lastTimeRef.current, 32);
      lastTimeRef.current = currentTime;

      if (gameEngineRef.current) {
        // In multiplayer:
        // - Host runs physics and sends puck state
        // - Client uses interpolated puck position
        if (!isMultiplayer || isHost) {
          updatePhysics(gameEngineRef.current.engine, delta);

          // Host sends puck state at sync rate
          if (isMultiplayer && isHost) {
            const now = Date.now();
            if (now - lastPuckSyncRef.current >= PUCK_SYNC_RATE) {
              const puck = gameEngineRef.current.bodies.puck;
              ws.sendPuck(
                puck.position.x,
                puck.position.y,
                puck.velocity.x,
                puck.velocity.y,
                puckSeqRef.current++
              );
              lastPuckSyncRef.current = now;
            }
          }
        }

        // Client: Update puck body with interpolated position
        if (isMultiplayer && !isHost) {
          const interpolated = puckInterpolation.getInterpolatedPosition();
          if (interpolated && gameEngineRef.current) {
            const puck = gameEngineRef.current.bodies.puck;
            // Directly set position (Matter.js Body.setPosition)
            const Matter = require('matter-js');
            Matter.Body.setPosition(puck, interpolated);
          }
        }

        // Update opponent paddle position from network
        if (isMultiplayer) {
          const opponentPos = opponentPaddleInterpolation.getPosition();
          if (opponentPos && gameEngineRef.current) {
            // Determine which paddle is opponent
            const opponentPlayer: Player = playerNumber === 1 ? 'player2' : 'player1';
            gameEngineRef.current.movePaddle(opponentPlayer, opponentPos.x, opponentPos.y);
          }
        }
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [status, isMultiplayer, isHost, playerNumber, ws, puckInterpolation, opponentPaddleInterpolation]);

  // Move paddle function - sends to network in multiplayer
  const movePaddle = useCallback(
    (player: Player, x: number, y: number) => {
      if (gameEngineRef.current && status === 'playing') {
        // In multiplayer, only move your own paddle locally
        if (isMultiplayer) {
          const myPlayer: Player = playerNumber === 1 ? 'player1' : 'player2';
          if (player === myPlayer) {
            gameEngineRef.current.movePaddle(player, x, y);
            ws.sendPaddle(x, y);
          }
        } else {
          // Single player - move any paddle
          gameEngineRef.current.movePaddle(player, x, y);
        }
      }
    },
    [status, isMultiplayer, playerNumber, ws]
  );

  // Get current bodies for rendering
  const getBodies = useCallback((): GameBodies | null => {
    return gameEngineRef.current?.bodies ?? null;
  }, []);

  // Get which player the local user controls
  const getMyPlayer = useCallback((): Player => {
    if (isMultiplayer && playerNumber) {
      return playerNumber === 1 ? 'player1' : 'player2';
    }
    return 'player1'; // Default for single player
  }, [isMultiplayer, playerNumber]);

  return {
    // Game actions
    movePaddle,
    getBodies,
    getMyPlayer,

    // Multiplayer state from WebSocket
    ws,

    // Helpers
    isMultiplayer,
    isHost,
    playerNumber,
  };
}
