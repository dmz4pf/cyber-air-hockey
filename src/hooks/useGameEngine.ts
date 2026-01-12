'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createGameEngine,
  updatePhysics,
  GameEngine,
  GameBodies,
  ResetPuckOptions,
} from '@/lib/physics/engine';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import { useGameStore } from '@/stores/gameStore';
import { Player } from '@/types/game';

export function useGameEngine() {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const status = useGameStore((state) => state.status);
  const lastScorer = useGameStore((state) => state.lastScorer);
  const scoreGoal = useGameStore((state) => state.scoreGoal);
  const resumeAfterGoal = useGameStore((state) => state.resumeAfterGoal);

  // Initialize engine
  useEffect(() => {
    const gameEngine = createGameEngine({
      onGoal: (scorer: Player) => {
        // scoreGoal handles status transition internally
        scoreGoal(scorer);
      },
      onPaddleHit: () => {
        // Could add sound here
      },
      onWallHit: () => {
        // Could add sound here
      },
    });

    gameEngineRef.current = gameEngine;

    return () => {
      gameEngine.cleanup();
    };
  }, [scoreGoal]);

  // Handle goal pause and reset
  useEffect(() => {
    if (status === 'goal') {
      const timer = setTimeout(() => {
        if (gameEngineRef.current) {
          // Reset puck to the loser's end, stationary
          const serveToward =
            lastScorer === 'player1' ? 'player2' : 'player1';
          gameEngineRef.current.resetPuck({
            serveToward,
            isGameStart: false, // Stationary at loser's end
          });
        }
        resumeAfterGoal();
      }, PHYSICS_CONFIG.game.goalPauseMs);

      return () => clearTimeout(timer);
    }
  }, [status, lastScorer, resumeAfterGoal]);

  // Reset puck when game starts (scores are 0-0)
  useEffect(() => {
    if (status === 'playing' && gameEngineRef.current) {
      // Only reset if scores are 0-0 (new game)
      const store = useGameStore.getState();
      if (store.scores.player1 === 0 && store.scores.player2 === 0) {
        gameEngineRef.current.resetPuck({ isGameStart: true });
      }
    }
  }, [status]);

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
        updatePhysics(gameEngineRef.current.engine, delta);
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [status]);

  // Move paddle function
  const movePaddle = useCallback(
    (player: Player, x: number, y: number) => {
      if (gameEngineRef.current && status === 'playing') {
        gameEngineRef.current.movePaddle(player, x, y);
      }
    },
    [status]
  );

  // Reset puck function
  const resetPuck = useCallback((options?: ResetPuckOptions) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.resetPuck(options);
    }
  }, []);

  // Get current bodies for rendering
  const getBodies = useCallback((): GameBodies | null => {
    return gameEngineRef.current?.bodies ?? null;
  }, []);

  return {
    movePaddle,
    resetPuck,
    getBodies,
  };
}
