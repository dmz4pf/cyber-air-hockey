'use client';

/**
 * GameHUD - Full game HUD wrapper component
 * Note: ScoreOverlay is now rendered outside this component in the game page
 */

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { CountdownOverlay } from './CountdownOverlay';
import { PauseMenu } from './PauseMenu';
import { PreMatchScreen } from './PreMatchScreen';
import { PostMatchScreen } from './PostMatchScreen';
import { CyberButton } from '../ui/CyberButton';

interface GameHUDProps {
  children?: React.ReactNode;
  className?: string;
}

export function GameHUD({ children, className = '' }: GameHUDProps) {
  const status = useGameStore((state) => state.status);
  const pauseGame = useGameStore((state) => state.pauseGame);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Game canvas container */}
      <div className="relative w-full h-full">{children}</div>

      {/* Pause button - only show during gameplay */}
      {status === 'playing' && (
        <div className="absolute bottom-4 right-4 z-20">
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={pauseGame}
            className="opacity-60 hover:opacity-100"
          >
            PAUSE
          </CyberButton>
        </div>
      )}

      {/* Game state overlays */}
      <PreMatchScreen />
      <CountdownOverlay />
      <PauseMenu />
      <PostMatchScreen />
    </div>
  );
}

export default GameHUD;
