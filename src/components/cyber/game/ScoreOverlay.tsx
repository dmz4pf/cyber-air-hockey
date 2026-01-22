'use client';

/**
 * ScoreOverlay - Score display bar (positioned above the game canvas)
 */

import React from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { ComboCounter } from '../ui/ComboCounter';

interface ScoreOverlayProps {
  className?: string;
}

export function ScoreOverlay({ className = '' }: ScoreOverlayProps) {
  const scores = useGameStore((state) => state.scores);
  const combo = useGameStore((state) => state.combo);
  const difficulty = useGameStore((state) => state.difficulty);
  const mode = useGameStore((state) => state.mode);
  const profile = usePlayerStore((state) => state.profile);

  const playerName = profile?.username || 'You';
  // In multiplayer, show "Opponent" instead of AI difficulty
  const opponentName = mode === 'multiplayer'
    ? 'Opponent'
    : difficulty === 'easy'
      ? 'Easy AI'
      : difficulty === 'medium'
      ? 'Medium AI'
      : 'Hard AI';

  // Dynamic colors based on who's winning
  const player1Winning = scores.player1 > scores.player2;
  const player2Winning = scores.player2 > scores.player1;
  const isTied = scores.player1 === scores.player2;

  // Player 1 color: green if winning, red if losing, neutral (primary blue) if tied
  const player1Color = isTied
    ? cyberTheme.colors.primary
    : player1Winning
      ? cyberTheme.colors.success
      : cyberTheme.colors.error;

  // Player 2 color: green if winning, red if losing, neutral (primary blue) if tied
  const player2Color = isTied
    ? cyberTheme.colors.primary
    : player2Winning
      ? cyberTheme.colors.success
      : cyberTheme.colors.error;

  return (
    <div className={`w-full ${className}`}>
      {/* Score bar */}
      <div
        className="flex items-center justify-between gap-4 p-4 rounded-lg"
        style={{
          backgroundColor: cyberTheme.colors.bg.panel,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        {/* Player 1 (You) - Left side */}
        <div className="flex items-center gap-4 flex-1">
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: `${player1Color}15`,
              border: `2px solid ${player1Color}`,
              boxShadow: `0 0 15px ${player1Color}40`,
            }}
          >
            <div
              className="text-4xl font-black tabular-nums"
              style={{
                color: player1Color,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${player1Color}`,
              }}
            >
              {scores.player1}
            </div>
          </div>
          <div>
            <div
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: player1Color,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {playerName}
            </div>
            <div
              className="text-xs uppercase"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Player 1
            </div>
          </div>
        </div>

        {/* Center - VS and Combo */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="text-2xl font-bold"
            style={{
              color: cyberTheme.colors.text.muted,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            VS
          </div>
          {/* Combo counter */}
          {combo.current >= 2 && <ComboCounter combo={combo.current} size="sm" />}
        </div>

        {/* Player 2 (Opponent) - Right side */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="text-right">
            <div
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: player2Color,
                fontFamily: cyberTheme.fonts.heading,
              }}
            >
              {opponentName}
            </div>
            <div
              className="text-xs uppercase"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Player 2
            </div>
          </div>
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: `${player2Color}15`,
              border: `2px solid ${player2Color}`,
              boxShadow: `0 0 15px ${player2Color}40`,
            }}
          >
            <div
              className="text-4xl font-black tabular-nums"
              style={{
                color: player2Color,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${player2Color}`,
              }}
            >
              {scores.player2}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreOverlay;
