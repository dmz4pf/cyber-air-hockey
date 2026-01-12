'use client';

/**
 * GameReadyScreen - Both players connected, ready to start
 *
 * Shows both players' wallet addresses and ready status.
 * Uses WebSocket for ready-up synchronization.
 * When both are ready, starts the countdown.
 */

import React, { useState, useEffect } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { useWalletAuth } from '@/providers/WalletAuthProvider';
import { useWebSocket } from '@/hooks/useWebSocket';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface GameReadyScreenProps {
  className?: string;
}

export function GameReadyScreen({ className = '' }: GameReadyScreenProps) {
  const [isReadyLocal, setIsReadyLocal] = useState(false);

  const { shortAddress } = useWalletAuth();
  const multiplayerGameInfo = useGameStore((s) => s.multiplayerGameInfo);
  const storeOpponentReady = useGameStore((s) => s.opponentReady);
  const setIsReady = useGameStore((s) => s.setIsReady);
  const setOpponentReady = useGameStore((s) => s.setOpponentReady);
  const startMultiplayerMatch = useGameStore((s) => s.startMultiplayerMatch);
  const goToMultiplayerLobby = useGameStore((s) => s.goToMultiplayerLobby);
  const resetMultiplayer = useGameStore((s) => s.resetMultiplayer);

  const gameId = multiplayerGameInfo?.gameId || 'XXXX-XXXX';
  const isCreator = multiplayerGameInfo?.isCreator || false;

  // WebSocket connection (should already be connected from previous screen)
  const {
    isConnected: wsConnected,
    opponentReady: wsOpponentReady,
    playerNumber,
    setReady,
    leaveRoom,
  } = useWebSocket({
    autoConnect: true,
    onGameStart: (playerNum) => {
      console.log('[GameReadyScreen] Game starting! Player number:', playerNum);
      startMultiplayerMatch();
    },
  });

  // Sync opponent ready state from WebSocket
  useEffect(() => {
    if (wsOpponentReady && !storeOpponentReady) {
      console.log('[GameReadyScreen] Opponent is ready!');
      setOpponentReady(true);
    }
  }, [wsOpponentReady, storeOpponentReady, setOpponentReady]);

  // Get opponent wallet display
  const getOpponentDisplay = () => {
    if (isCreator) {
      // Creator sees opponent wallet
      const opponentWallet = multiplayerGameInfo?.opponentWallet;
      if (opponentWallet) {
        return `${opponentWallet.slice(0, 6)}...${opponentWallet.slice(-4)}`;
      }
      return 'Connecting...';
    } else {
      // Joiner sees creator wallet
      const creatorWallet = multiplayerGameInfo?.creatorWallet;
      if (creatorWallet) {
        return `${creatorWallet.slice(0, 6)}...${creatorWallet.slice(-4)}`;
      }
      return 'Connecting...';
    }
  };

  const handleReady = () => {
    setIsReadyLocal(true);
    setIsReady(true);

    // Send ready signal via WebSocket
    if (wsConnected) {
      console.log('[GameReadyScreen] Sending ready signal');
      setReady();
    }
  };

  const handleCancel = () => {
    leaveRoom();
    resetMultiplayer();
    goToMultiplayerLobby();
  };

  // Determine if opponent is ready (from WebSocket or store)
  const opponentIsReady = wsOpponentReady || storeOpponentReady;

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.primary,
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, ${cyberTheme.colors.primary}15 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${cyberTheme.colors.secondary}10 0%, transparent 40%)
        `,
      }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(${cyberTheme.colors.border.subtle} 1px, transparent 1px),
            linear-gradient(90deg, ${cyberTheme.colors.border.subtle} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <HUDPanel className="relative z-10 w-full max-w-lg" variant="glow" padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚔️</div>
          <h1
            className="text-2xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            MATCH READY
          </h1>
          <div
            className="font-mono text-sm"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Game ID: <span style={{ color: cyberTheme.colors.primary }}>{gameId}</span>
          </div>
        </div>

        {/* Connection Status */}
        {!wsConnected && (
          <div
            className="p-3 rounded-lg text-center mb-6"
            style={{
              backgroundColor: `${cyberTheme.colors.warning}10`,
              border: `1px solid ${cyberTheme.colors.warning}30`,
            }}
          >
            <span className="text-sm" style={{ color: cyberTheme.colors.warning }}>
              Reconnecting to game server...
            </span>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Player 1 (You) */}
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${isReadyLocal ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              boxShadow: isReadyLocal ? cyberTheme.shadows.glow(cyberTheme.colors.success) : 'none',
            }}
          >
            <div
              className="text-4xl mb-3"
              style={{ filter: isReadyLocal ? 'none' : 'grayscale(1) opacity(0.5)' }}
            >
              {isCreator ? '👑' : '🎮'}
            </div>
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {isCreator ? 'Host (You)' : 'You'}
            </div>
            <div
              className="font-mono text-sm mb-3"
              style={{ color: cyberTheme.colors.player.you }}
            >
              {shortAddress}
            </div>
            <div
              className="text-xs uppercase tracking-wider py-1 px-3 rounded-full inline-block"
              style={{
                backgroundColor: isReadyLocal
                  ? `${cyberTheme.colors.success}20`
                  : `${cyberTheme.colors.warning}20`,
                color: isReadyLocal
                  ? cyberTheme.colors.success
                  : cyberTheme.colors.warning,
              }}
            >
              {isReadyLocal ? 'READY' : 'NOT READY'}
            </div>
          </div>

          {/* Player 2 (Opponent) */}
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${opponentIsReady ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              boxShadow: opponentIsReady ? cyberTheme.shadows.glow(cyberTheme.colors.success) : 'none',
            }}
          >
            <div
              className="text-4xl mb-3"
              style={{ filter: opponentIsReady ? 'none' : 'grayscale(1) opacity(0.5)' }}
            >
              {isCreator ? '🎮' : '👑'}
            </div>
            <div
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              {isCreator ? 'Opponent' : 'Host'}
            </div>
            <div
              className="font-mono text-sm mb-3"
              style={{ color: cyberTheme.colors.player.opponent }}
            >
              {getOpponentDisplay()}
            </div>
            <div
              className="text-xs uppercase tracking-wider py-1 px-3 rounded-full inline-block"
              style={{
                backgroundColor: opponentIsReady
                  ? `${cyberTheme.colors.success}20`
                  : `${cyberTheme.colors.warning}20`,
                color: opponentIsReady
                  ? cyberTheme.colors.success
                  : cyberTheme.colors.warning,
              }}
            >
              {opponentIsReady ? 'READY' : 'NOT READY'}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div
          className="text-center text-4xl font-black mb-8"
          style={{
            color: cyberTheme.colors.text.muted,
            fontFamily: cyberTheme.fonts.heading,
          }}
        >
          VS
        </div>

        {/* Ready Button or Status */}
        {!isReadyLocal ? (
          <div className="text-center space-y-4">
            <CyberButton
              variant="success"
              size="lg"
              onClick={handleReady}
              className="w-full"
              disabled={!wsConnected}
            >
              Ready Up
            </CyberButton>
            <p
              className="text-sm"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Press ready when you&apos;re prepared to start
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            {isReadyLocal && opponentIsReady ? (
              <div
                className="text-xl font-bold uppercase animate-pulse"
                style={{ color: cyberTheme.colors.success }}
              >
                Starting match...
              </div>
            ) : (
              <div
                className="text-lg"
                style={{ color: cyberTheme.colors.warning }}
              >
                Waiting for opponent to ready up...
              </div>
            )}
          </div>
        )}

        {/* Cancel button */}
        <div className="mt-6 text-center">
          <CyberButton
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isReadyLocal && opponentIsReady}
          >
            Leave Match
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default GameReadyScreen;
