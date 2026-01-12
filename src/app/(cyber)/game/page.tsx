'use client';

/**
 * Cyber Esports Game Page
 *
 * Uses state machine to manage flow:
 * - mode-selection: Choose AI or Multiplayer
 * - ai-setup: Select difficulty for AI mode
 * - multiplayer-lobby: Create or Join game
 * - waiting: Creator waiting for opponent
 * - ready: Both connected, ready up
 * - countdown/playing/paused/goal/gameover: Game states
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore, GamePageState } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { GameCanvas, GameCanvasRef } from '@/components/game/GameCanvas';
import {
  GameHUD,
  ScoreOverlay,
  GameModeSelectorScreen,
  AISetupScreen,
  MultiplayerLobbyScreen,
  WaitingForOpponentScreen,
  GameReadyScreen,
} from '@/components/cyber/game';

export default function CyberGamePage() {
  const gameCanvasRef = useRef<GameCanvasRef>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  const pageState = useGameStore((state) => state.pageState);
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const maxScore = useGameStore((state) => state.maxScore);
  const difficulty = useGameStore((state) => state.difficulty);
  const mode = useGameStore((state) => state.mode);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const setCountdown = useGameStore((state) => state.setCountdown);
  const setMaxScore = useGameStore((state) => state.setMaxScore);
  const resetGame = useGameStore((state) => state.resetGame);

  const settings = useSettingsStore((state) => state.settings);

  // Sync maxScore with settings
  useEffect(() => {
    if (maxScore !== settings.game.scoreToWin) {
      setMaxScore(settings.game.scoreToWin);
    }
  }, [settings.game.scoreToWin, maxScore, setMaxScore]);

  // Keep canvas element ref in sync
  useEffect(() => {
    const updateCanvasRef = () => {
      const canvas = gameCanvasRef.current?.canvas;
      if (canvas && canvas !== canvasElementRef.current) {
        canvasElementRef.current = canvas;
      }
    };
    updateCanvasRef();
    const interval = setInterval(updateCanvasRef, 100);
    return () => clearInterval(interval);
  }, []);

  // Initialize game engine
  const { getBodies, resetPuck, movePaddle } = useGameEngine();

  // Get puck for AI
  const getPuck = useCallback(() => {
    const bodies = getBodies();
    return bodies?.puck ?? null;
  }, [getBodies]);

  // Handle player movement
  const handlePlayerMove = useCallback(
    (x: number, y: number) => {
      // In multiplayer, move the correct paddle based on player number
      if (mode === 'multiplayer' && playerNumber) {
        movePaddle(playerNumber === 1 ? 'player1' : 'player2', x, y);
      } else {
        movePaddle('player1', x, y);
      }
    },
    [movePaddle, mode, playerNumber]
  );

  // Handle AI movement
  const handleAIMove = useCallback(
    (x: number, y: number) => {
      movePaddle('player2', x, y);
    },
    [movePaddle]
  );

  // Handle player input with stable canvas ref
  usePlayerInput({
    canvasRef: canvasElementRef,
    onMove: handlePlayerMove,
    enabled: status === 'playing',
  });

  // Handle AI opponent (only for AI mode)
  useAIOpponent({
    enabled: status === 'playing' && mode === 'ai',
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Countdown timer
  useEffect(() => {
    if (status === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'countdown' && countdown === 0) {
      const timer = setTimeout(() => {
        setCountdown(-1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [status, countdown, setCountdown]);

  // Determine what to show based on pageState
  const showScoreboard = ['playing', 'paused', 'goal'].includes(status);
  const isInGame = ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);

  // Render based on page state
  const renderPageContent = (): React.ReactNode => {
    switch (pageState) {
      case 'mode-selection':
        return <GameModeSelectorScreen />;

      case 'ai-setup':
        return <AISetupScreen />;

      case 'multiplayer-lobby':
        return <MultiplayerLobbyScreen />;

      case 'waiting':
        return <WaitingForOpponentScreen />;

      case 'ready':
        return <GameReadyScreen />;

      case 'countdown':
      case 'playing':
      case 'paused':
      case 'goal':
      case 'gameover':
        // Show game canvas
        return (
          <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
              backgroundColor: cyberTheme.colors.bg.primary,
            }}
          >
            {/* Game container */}
            <div className="relative w-full max-w-md mx-auto">
              {/* Scoreboard - ABOVE the canvas */}
              {showScoreboard && <ScoreOverlay className="mb-4" />}

              {/* Canvas container with decorative frame */}
              <div className="relative">
                {/* Decorative frame */}
                <div
                  className="absolute -inset-2 rounded-xl opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${cyberTheme.colors.primary}30 0%, transparent 50%, ${cyberTheme.colors.secondary}30 100%)`,
                  }}
                />

                {/* Corner accents */}
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />
                <div
                  className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2"
                  style={{ borderColor: cyberTheme.colors.primary }}
                />

                {/* Game HUD with canvas */}
                <GameHUD>
                  <GameCanvas ref={gameCanvasRef} getBodies={getBodies} />
                </GameHUD>
              </div>
            </div>
          </div>
        );

      default:
        return <GameModeSelectorScreen />;
    }
  };

  return renderPageContent();
}
