'use client';

/**
 * JoinGameModal - Join an existing multiplayer game
 *
 * User enters a Game ID and signs blockchain transaction to join.
 * Connects to WebSocket room and transitions to ready state.
 */

import React, { useState, useRef, useEffect } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useWalletAuth } from '@/providers/WalletAuthProvider';
import { useGameStore } from '@/stores/gameStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { isValidGameId, normalizeGameId } from '@/lib/cyber/gameId';
import { Modal } from '../ui/Modal';
import { CyberButton } from '../ui/CyberButton';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type JoinState = 'idle' | 'validating' | 'signing' | 'connecting' | 'joining' | 'success' | 'error';

export function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const [gameIdInput, setGameIdInput] = useState('');
  const [state, setState] = useState<JoinState>('idle');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { address, shortAddress, signMessage } = useWalletAuth();
  const joinMultiplayerGame = useGameStore((s) => s.joinMultiplayerGame);
  const setRoomId = useGameStore((s) => s.setRoomId);

  // WebSocket connection
  const {
    isConnected: wsConnected,
    connectionStatus,
    roomId,
    error: wsError,
    connect,
    joinRoom,
    disconnect,
  } = useWebSocket({
    autoConnect: false, // We'll connect manually when needed
  });

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle WebSocket connection success - join room
  useEffect(() => {
    if (state === 'connecting' && wsConnected && gameIdInput) {
      const normalizedId = normalizeGameId(gameIdInput);
      console.log('[JoinGameModal] WebSocket connected, joining room:', normalizedId);
      setState('joining');
      joinRoom(normalizedId);
    }
  }, [state, wsConnected, gameIdInput, joinRoom]);

  // Handle room joined success
  useEffect(() => {
    if (state === 'joining' && roomId) {
      console.log('[JoinGameModal] Successfully joined room:', roomId);

      // For now, simulate getting creator wallet from "blockchain"
      // In real implementation, this would be fetched from the blockchain
      const mockCreatorWallet = '0x' + '1'.repeat(40);
      const normalizedId = normalizeGameId(gameIdInput);

      // Update store with joined game
      joinMultiplayerGame(normalizedId, mockCreatorWallet, address!);
      setRoomId(normalizedId);

      setState('success');

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        resetState();
      }, 500);
    }
  }, [state, roomId, gameIdInput, address, joinMultiplayerGame, setRoomId, onClose]);

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError && (state === 'connecting' || state === 'joining')) {
      setState('error');
      setError(wsError);
    }
  }, [wsError, state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format as user types
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Add dash after 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }

    setGameIdInput(value);
    setError(null);
  };

  const handleJoinGame = async () => {
    if (!address) return;

    setState('validating');
    setError(null);

    // Validate Game ID
    const normalizedId = normalizeGameId(gameIdInput);
    if (!isValidGameId(normalizedId)) {
      setState('error');
      setError('Invalid Game ID format. Please enter a valid ID (e.g., A3B7-K9M2)');
      return;
    }

    setState('signing');

    try {
      // Create message to sign for blockchain transaction
      const timestamp = Date.now();
      const message = `Join Air Hockey Game\n\nGame ID: ${normalizedId}\nPlayer: ${address}\nTimestamp: ${timestamp}\n\nSign to join this game on the blockchain.`;

      // Request wallet signature
      await signMessage(message);

      // Connect to WebSocket
      setState('connecting');
      connect();

    } catch (err) {
      console.error('[JoinGameModal] Error:', err);
      setState('error');

      if (err instanceof Error) {
        if (err.message.includes('rejected')) {
          setError('Transaction rejected. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to join game. Please check the Game ID and try again.');
      }
    }
  };

  const resetState = () => {
    setState('idle');
    setError(null);
    setGameIdInput('');
  };

  const handleClose = () => {
    if (state === 'signing' || state === 'connecting' || state === 'joining') return;

    // Disconnect WebSocket if we started connecting
    if (wsConnected) {
      disconnect();
    }

    resetState();
    onClose();
  };

  const isProcessing = state === 'validating' || state === 'signing' || state === 'connecting' || state === 'joining';
  const canJoin = gameIdInput.length >= 9 && !isProcessing; // XXXX-XXXX = 9 chars

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Join Game"
      size="sm"
      closeOnOverlay={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      <div className="space-y-6">
        {/* Wallet Info */}
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: cyberTheme.colors.bg.tertiary,
            border: `1px solid ${cyberTheme.colors.border.default}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Your Wallet
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cyberTheme.colors.success }}
              />
              <span
                className="font-mono text-sm"
                style={{ color: cyberTheme.colors.success }}
              >
                {shortAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Game ID Input */}
        <div>
          <label
            className="block text-xs uppercase tracking-wider mb-2"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Enter Game ID
          </label>
          <input
            ref={inputRef}
            type="text"
            value={gameIdInput}
            onChange={handleInputChange}
            placeholder="XXXX-XXXX"
            maxLength={9}
            disabled={isProcessing}
            className="w-full p-4 rounded-lg font-mono text-2xl text-center tracking-[0.15em] placeholder:tracking-[0.15em] outline-none transition-all"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `2px solid ${error ? cyberTheme.colors.error : gameIdInput.length === 9 ? cyberTheme.colors.success : cyberTheme.colors.border.default}`,
              color: cyberTheme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = cyberTheme.colors.primary;
              e.target.style.boxShadow = cyberTheme.shadows.glow(cyberTheme.colors.primary);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? cyberTheme.colors.error : gameIdInput.length === 9 ? cyberTheme.colors.success : cyberTheme.colors.border.default;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: `${cyberTheme.colors.error}10`,
              border: `1px solid ${cyberTheme.colors.error}30`,
              color: cyberTheme.colors.error,
            }}
          >
            {error}
          </div>
        )}

        {/* Status Messages */}
        {state === 'validating' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Validating game ID...
          </div>
        )}

        {state === 'signing' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.warning }}
          >
            Please sign the transaction in your wallet...
          </div>
        )}

        {state === 'connecting' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Connecting to game server...
          </div>
        )}

        {state === 'joining' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Joining game room...
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <CyberButton
            variant="ghost"
            className="flex-1"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </CyberButton>
          <CyberButton
            variant="success"
            className="flex-1"
            onClick={handleJoinGame}
            disabled={!canJoin || state === 'success'}
          >
            {state === 'idle' && 'Join & Sign'}
            {state === 'validating' && 'Checking...'}
            {state === 'signing' && 'Signing...'}
            {state === 'connecting' && 'Connecting...'}
            {state === 'joining' && 'Joining...'}
            {state === 'success' && 'Success!'}
            {state === 'error' && 'Try Again'}
          </CyberButton>
        </div>

        {/* Info */}
        <div
          className="text-xs text-center"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          Ask your opponent for the Game ID they received when creating the game.
        </div>
      </div>
    </Modal>
  );
}

export default JoinGameModal;
