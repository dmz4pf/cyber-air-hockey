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
  const profile = usePlayerStore((state) => state.profile);

  const playerName = profile?.username || 'You';
  const opponentName =
    difficulty === 'easy'
      ? 'Easy AI'
      : difficulty === 'medium'
      ? 'Medium AI'
      : 'Hard AI';

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
              backgroundColor: `${cyberTheme.colors.player.you}15`,
              border: `2px solid ${cyberTheme.colors.player.you}`,
              boxShadow: `0 0 15px ${cyberTheme.colors.player.you}40`,
            }}
          >
            <div
              className="text-4xl font-black tabular-nums"
              style={{
                color: cyberTheme.colors.player.you,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${cyberTheme.colors.player.you}`,
              }}
            >
              {scores.player1}
            </div>
          </div>
          <div>
            <div
              className="text-sm font-bold uppercase tracking-wider"
              style={{
                color: cyberTheme.colors.player.you,
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
                color: cyberTheme.colors.player.opponent,
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
              backgroundColor: `${cyberTheme.colors.player.opponent}15`,
              border: `2px solid ${cyberTheme.colors.player.opponent}`,
              boxShadow: `0 0 15px ${cyberTheme.colors.player.opponent}40`,
            }}
          >
            <div
              className="text-4xl font-black tabular-nums"
              style={{
                color: cyberTheme.colors.player.opponent,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 15px ${cyberTheme.colors.player.opponent}`,
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
