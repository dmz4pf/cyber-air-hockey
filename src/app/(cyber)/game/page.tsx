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
 *
 * Architecture:
 * - AI Mode: Uses local physics engine (useGameEngine)
 * - Multiplayer Mode: Uses server-authoritative model (useMultiplayerGameEngine)
 *   - Server runs physics and broadcasts state at 30Hz
 *   - Client only renders server state and sends paddle inputs
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore, GamePageState } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useMultiplayerGameEngine } from '@/hooks/useMultiplayerGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useAudioOptional } from '@/contexts/AudioContext';
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
import { MultiplayerPauseOverlay } from '@/components/cyber/game/MultiplayerPauseOverlay';
import { OpponentQuitModal } from '@/components/cyber/game/OpponentQuitModal';
import { MultiplayerGameOverModal } from '@/components/cyber/game/MultiplayerGameOverModal';
import { RematchRequestModal } from '@/components/cyber/game/RematchRequestModal';

export default function CyberGamePage() {
  const gameCanvasRef = useRef<GameCanvasRef>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const router = useRouter();

  // Wallet connection
  useDynamicWallet();

  const pageState = useGameStore((state) => state.pageState);
  const status = useGameStore((state) => state.status);
  const countdown = useGameStore((state) => state.countdown);
  const maxScore = useGameStore((state) => state.maxScore);
  const difficulty = useGameStore((state) => state.difficulty);
  const mode = useGameStore((state) => state.mode);
  const playerNumber = useGameStore((state) => state.playerNumber);
  const multiplayerGameInfo = useGameStore((state) => state.multiplayerGameInfo);
  const setCountdown = useGameStore((state) => state.setCountdown);
  const setMaxScore = useGameStore((state) => state.setMaxScore);
  const resetGame = useGameStore((state) => state.resetGame);

  const settings = useSettingsStore((state) => state.settings);

  // Audio context for music and sound effects
  const audio = useAudioOptional();

  // Is this a multiplayer game in active play?
  const isMultiplayerGame = mode === 'multiplayer' && multiplayerGameInfo?.gameId;
  const isInMultiplayerGameplay = isMultiplayerGame && ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);

  // Debug: Log multiplayer state
  console.log('[GamePage] State:', { mode, pageState, isMultiplayerGame, isInMultiplayerGameplay, gameId: multiplayerGameInfo?.gameId });

  // Use the playerId stored in the game store (set when game was created/joined)
  const playerId = multiplayerGameInfo?.playerId || '';

  // Sync maxScore with settings
  useEffect(() => {
    if (maxScore !== settings.game.scoreToWin) {
      setMaxScore(settings.game.scoreToWin);
    }
  }, [settings.game.scoreToWin, maxScore, setMaxScore]);

  // ============================================================================
  // Audio: Music state management
  // ============================================================================
  useEffect(() => {
    if (!audio) return;

    // Play menu music during setup screens
    if (['mode-selection', 'ai-setup', 'multiplayer-lobby', 'waiting', 'ready'].includes(pageState)) {
      audio.playMenuMusic();
    }
    // Play gameplay music during active game
    else if (['countdown', 'playing', 'paused', 'goal'].includes(pageState)) {
      audio.playGameMusic();
    }
    // Stop music at game over (fanfares will play instead)
    else if (pageState === 'gameover') {
      audio.stopMusic();
    }
  }, [pageState, audio]);

  // Audio: Countdown beeps
  useEffect(() => {
    if (!audio) return;

    if (status === 'countdown' && countdown > 0) {
      audio.playCountdownBeep();
    } else if (status === 'countdown' && countdown === 0) {
      audio.playCountdownGo();
    }
  }, [status, countdown, audio]);

  // Audio: Victory/Defeat at game over (AI mode only - multiplayer handles its own)
  const scores = useGameStore((state) => state.scores);
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (!audio || isInMultiplayerGameplay) return;

    // Only trigger on transition TO gameover
    if (status === 'gameover' && prevStatusRef.current !== 'gameover') {
      const playerWon = scores.player1 >= maxScore;
      if (playerWon) {
        audio.playVictory();
      } else {
        audio.playDefeat();
      }
    }
    prevStatusRef.current = status;
  }, [status, scores, maxScore, audio, isInMultiplayerGameplay]);

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

  // ============================================================================
  // AI Mode: Local Physics Engine
  // ============================================================================
  const aiEngine = useGameEngine();

  // ============================================================================
  // Multiplayer Mode: Server-Authoritative Engine
  // ============================================================================
  // IMPORTANT: Only connect when in active gameplay states, NOT during 'waiting' or 'ready'
  // because WaitingForOpponentScreen and GameReadyScreen have their own useMultiplayerGame hooks.
  // This prevents duplicate WebSocket connections with the same playerId causing "Player already in room" errors.
  const shouldConnectMultiplayer = isMultiplayerGame && ['countdown', 'playing', 'paused', 'goal', 'gameover'].includes(pageState);
  const multiplayerEngine = useMultiplayerGameEngine({
    gameId: shouldConnectMultiplayer ? (multiplayerGameInfo?.gameId || '') : '',
    playerId: shouldConnectMultiplayer ? playerId : '',
  });

  // ============================================================================
  // Unified Interface - Select the appropriate engine
  // ============================================================================
  const getBodies = isInMultiplayerGameplay
    ? multiplayerEngine.getBodies
    : aiEngine.getBodies;

  const movePaddle = isInMultiplayerGameplay
    ? multiplayerEngine.movePaddle
    : aiEngine.movePaddle;

  // Get puck for AI
  const getPuck = useCallback(() => {
    const bodies = aiEngine.getBodies();
    return bodies?.puck ?? null;
  }, [aiEngine]);

  // Handle player movement
  const handlePlayerMove = useCallback(
    (x: number, y: number) => {
      // Always use 'player1' as paddleOwner because:
      // - In AI mode: player controls paddle1
      // - In Multiplayer: each player sees their own paddle as paddle1 (bottom of screen)
      //   The coordinate transformation in useMultiplayerGameEngine handles the rest
      movePaddle('player1', x, y);
    },
    [movePaddle]
  );

  // Handle AI movement (only for AI mode)
  const handleAIMove = useCallback(
    (x: number, y: number) => {
      aiEngine.movePaddle('player2', x, y);
    },
    [aiEngine]
  );

  // Handle player input with stable canvas ref
  usePlayerInput({
    canvasRef: canvasElementRef,
    onMove: handlePlayerMove,
    enabled: status === 'playing',
  });

  // Handle AI opponent (only for AI mode, not multiplayer)
  useAIOpponent({
    enabled: status === 'playing' && mode === 'ai' && !isInMultiplayerGameplay,
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Countdown timer (only for AI mode - multiplayer gets countdown from server)
  useEffect(() => {
    if (isInMultiplayerGameplay) {
      // Server handles countdown in multiplayer
      return;
    }

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
  }, [status, countdown, setCountdown, isInMultiplayerGameplay]);

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

                  {/* Multiplayer pause overlay */}
                  {isInMultiplayerGameplay && (
                    <MultiplayerPauseOverlay
                      pauseState={multiplayerEngine.pauseState}
                      playerNumber={playerNumber}
                      onResume={multiplayerEngine.sendResumeRequest}
                      onQuit={multiplayerEngine.sendQuitGame}
                    />
                  )}

                  {/* Opponent quit modal (mid-game quit) */}
                  {isInMultiplayerGameplay && (
                    <OpponentQuitModal
                      opponentQuit={multiplayerEngine.opponentQuit}
                      playerNumber={playerNumber}
                      onContinue={resetGame}
                    />
                  )}

                  {/* Multiplayer game over modal (normal end) */}
                  {isInMultiplayerGameplay && multiplayerEngine.gameStatus === 'ended' && !multiplayerEngine.opponentQuit.hasQuit && (
                    <MultiplayerGameOverModal
                      isVisible={true}
                      winner={multiplayerEngine.winner}
                      playerNumber={playerNumber}
                      finalScore={multiplayerEngine.gameState?.score || null}
                      rematchState={multiplayerEngine.rematchState}
                      opponentExited={multiplayerEngine.opponentExited}
                      onPlayAgain={multiplayerEngine.sendRematchRequest}
                      onExit={multiplayerEngine.sendPlayerExit}
                      onResetGame={resetGame}
                    />
                  )}

                  {/* Rematch request modal (when opponent wants rematch) */}
                  {isInMultiplayerGameplay && multiplayerEngine.rematchState.opponentRequested && (
                    <RematchRequestModal
                      isVisible={true}
                      onAccept={() => multiplayerEngine.sendRematchResponse(true)}
                      onDecline={() => multiplayerEngine.sendRematchResponse(false)}
                      onResetGame={resetGame}
                    />
                  )}
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
