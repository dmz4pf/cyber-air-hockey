'use client';

/**
 * WaitingForOpponentScreen - Waiting for opponent to join
 *
 * Shows the game ID for sharing and waits for opponent to connect.
 * Manages WebSocket connection and room creation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { useDynamicWallet } from '@/hooks/useDynamicWallet';
import { useWebSocket } from '@/hooks/useWebSocket';
import { HUDPanel } from '../ui/HUDPanel';
import { CyberButton } from '../ui/CyberButton';

interface WaitingForOpponentScreenProps {
  className?: string;
}

export function WaitingForOpponentScreen({ className = '' }: WaitingForOpponentScreenProps) {
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState('');
  const [wsError, setWsError] = useState<string | null>(null);

  const { shortAddress } = useDynamicWallet();
  const multiplayerGameInfo = useGameStore((s) => s.multiplayerGameInfo);
  const setPageState = useGameStore((s) => s.setPageState);
  const setOpponentConnected = useGameStore((s) => s.setOpponentConnected);
  const goToMultiplayerLobby = useGameStore((s) => s.goToMultiplayerLobby);
  const resetMultiplayer = useGameStore((s) => s.resetMultiplayer);

  const gameId = multiplayerGameInfo?.gameId || 'XXXX-XXXX';

  // WebSocket connection
  const {
    isConnected: wsConnected,
    connectionStatus,
    roomId,
    opponentConnected,
    error: wsHookError,
    connect,
    createRoom,
    leaveRoom,
  } = useWebSocket({
    autoConnect: true,
  });

  // Animated dots for "Waiting..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Create room when WebSocket connects
  useEffect(() => {
    if (wsConnected && !roomId && gameId) {
      console.log('[WaitingScreen] Creating room with ID:', gameId);
      createRoom(gameId); // Pass the game ID to the server
    }
  }, [wsConnected, roomId, gameId, createRoom]);

  // Handle opponent joining
  useEffect(() => {
    if (opponentConnected) {
      console.log('[WaitingScreen] Opponent connected!');
      setOpponentConnected(true);
      // Transition to ready screen
      setPageState('ready');
    }
  }, [opponentConnected, setOpponentConnected, setPageState]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsHookError) {
      setWsError(wsHookError);
    }
  }, [wsHookError]);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCancel = () => {
    // Leave WebSocket room and reset multiplayer state
    leaveRoom();
    resetMultiplayer();
    goToMultiplayerLobby();
  };

  const handleRetryConnection = () => {
    setWsError(null);
    connect();
  };

  // Show connection status
  const getConnectionStatus = () => {
    if (wsError) return 'error';
    if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') return 'connecting';
    if (!wsConnected) return 'disconnected';
    if (!roomId) return 'creating-room';
    return 'ready';
  };

  const status = getConnectionStatus();

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

      <HUDPanel className="relative z-10 w-full max-w-md" variant="glow" padding="lg">
        {/* Wallet Info */}
        <div
          className="flex items-center justify-between p-3 rounded-lg mb-6"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.border.default}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cyberTheme.colors.success }}
            />
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Host
            </span>
          </div>
          <span
            className="font-mono text-sm"
            style={{ color: cyberTheme.colors.success }}
          >
            {shortAddress}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">
            <span className="animate-pulse">🎮</span>
          </div>
          <h1
            className="text-2xl font-black uppercase tracking-wider mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            GAME CREATED
          </h1>
          <p
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Share this Game ID with your opponent
          </p>
        </div>

        {/* Game ID Display */}
        <div
          className="p-6 rounded-lg text-center mb-6"
          style={{
            backgroundColor: `${cyberTheme.colors.primary}10`,
            border: `2px solid ${cyberTheme.colors.primary}40`,
            boxShadow: cyberTheme.shadows.glow(cyberTheme.colors.primary),
          }}
        >
          <span
            className="text-xs uppercase tracking-wider block mb-3"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Game ID
          </span>
          <div
            className="font-mono text-4xl font-bold tracking-[0.2em] mb-4"
            style={{
              color: cyberTheme.colors.primary,
              textShadow: cyberTheme.shadows.glowText(cyberTheme.colors.primary),
            }}
          >
            {gameId}
          </div>
          <CyberButton
            variant="secondary"
            size="sm"
            onClick={handleCopyId}
          >
            {copied ? '✓ Copied!' : 'Copy ID'}
          </CyberButton>
        </div>

        {/* Connection/Waiting Status */}
        <div
          className="p-4 rounded-lg text-center mb-6"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.border.default}`,
          }}
        >
          {status === 'connecting' && (
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: cyberTheme.colors.info }}
              />
              <span
                className="text-sm uppercase tracking-wider"
                style={{ color: cyberTheme.colors.info }}
              >
                Connecting to server{dots}
              </span>
            </div>
          )}

          {status === 'creating-room' && (
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: cyberTheme.colors.info }}
              />
              <span
                className="text-sm uppercase tracking-wider"
                style={{ color: cyberTheme.colors.info }}
              >
                Setting up game room{dots}
              </span>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex items-center justify-center gap-3">
              <div
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: cyberTheme.colors.warning }}
              />
              <span
                className="text-sm uppercase tracking-wider"
                style={{ color: cyberTheme.colors.warning }}
              >
                Waiting for opponent{dots}
              </span>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cyberTheme.colors.error }}
                />
                <span
                  className="text-sm uppercase tracking-wider"
                  style={{ color: cyberTheme.colors.error }}
                >
                  Connection Error
                </span>
              </div>
              <p className="text-xs" style={{ color: cyberTheme.colors.text.muted }}>
                {wsError}
              </p>
              <CyberButton variant="secondary" size="sm" onClick={handleRetryConnection}>
                Retry Connection
              </CyberButton>
            </div>
          )}

          {status === 'disconnected' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cyberTheme.colors.error }}
                />
                <span
                  className="text-sm uppercase tracking-wider"
                  style={{ color: cyberTheme.colors.error }}
                >
                  Disconnected
                </span>
              </div>
              <CyberButton variant="secondary" size="sm" onClick={handleRetryConnection}>
                Reconnect
              </CyberButton>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div
          className="p-4 rounded-lg text-sm mb-6"
          style={{
            backgroundColor: `${cyberTheme.colors.info}10`,
            border: `1px solid ${cyberTheme.colors.info}30`,
          }}
        >
          <p style={{ color: cyberTheme.colors.text.secondary }}>
            <span style={{ color: cyberTheme.colors.info }}>How to play:</span> Send
            the Game ID above to your friend. Once they join and sign the
            transaction, the match will begin automatically.
          </p>
        </div>

        {/* Cancel button */}
        <div className="text-center">
          <CyberButton variant="ghost" size="sm" onClick={handleCancel}>
            Cancel Game
          </CyberButton>
        </div>
      </HUDPanel>
    </div>
  );
}

export default WaitingForOpponentScreen;
