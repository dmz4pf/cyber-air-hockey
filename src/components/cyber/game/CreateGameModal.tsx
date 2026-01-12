'use client';

/**
 * CreateGameModal - Create a new multiplayer game
 *
 * Displays wallet info and signs blockchain transaction to create game.
 * On success, generates unique game ID and transitions to waiting state.
 */

import React, { useState } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { useWalletAuth } from '@/providers/WalletAuthProvider';
import { useGameStore } from '@/stores/gameStore';
import { generateGameId } from '@/lib/cyber/gameId';
import { Modal } from '../ui/Modal';
import { CyberButton } from '../ui/CyberButton';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CreateState = 'idle' | 'signing' | 'creating' | 'success' | 'error';

export function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const [state, setState] = useState<CreateState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  const { address, shortAddress, signMessage } = useWalletAuth();
  const createMultiplayerGame = useGameStore((s) => s.createMultiplayerGame);

  const handleCreateGame = async () => {
    if (!address) return;

    setState('signing');
    setError(null);

    try {
      // Generate unique game ID
      const newGameId = generateGameId();
      setGameId(newGameId);

      // Create message to sign for blockchain transaction
      const timestamp = Date.now();
      const message = `Create Air Hockey Game\n\nGame ID: ${newGameId}\nCreator: ${address}\nTimestamp: ${timestamp}\n\nSign to create this game on the blockchain.`;

      // Request wallet signature
      await signMessage(message);

      setState('creating');

      // Simulate blockchain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update store with new game
      createMultiplayerGame(newGameId, address);

      setState('success');

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        resetState();
      }, 500);
    } catch (err) {
      console.error('[CreateGameModal] Error:', err);
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to create game');
    }
  };

  const resetState = () => {
    setState('idle');
    setError(null);
    setGameId(null);
  };

  const handleClose = () => {
    if (state === 'signing' || state === 'creating') return; // Don't close while processing
    resetState();
    onClose();
  };

  const isProcessing = state === 'signing' || state === 'creating';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Game"
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

        {/* Description */}
        <div className="text-center">
          <p
            className="text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Creating a game will sign a blockchain transaction. You&apos;ll receive
            a unique Game ID to share with your opponent.
          </p>
        </div>

        {/* Game ID Preview (when signing/creating) */}
        {gameId && (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}10`,
              border: `1px solid ${cyberTheme.colors.primary}30`,
            }}
          >
            <span
              className="text-xs uppercase tracking-wider block mb-2"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Game ID
            </span>
            <span
              className="font-mono text-2xl font-bold"
              style={{
                color: cyberTheme.colors.primary,
                letterSpacing: '0.1em',
              }}
            >
              {gameId}
            </span>
          </div>
        )}

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
        {state === 'signing' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.warning }}
          >
            Please sign the transaction in your wallet...
          </div>
        )}

        {state === 'creating' && (
          <div
            className="text-center text-sm animate-pulse"
            style={{ color: cyberTheme.colors.info }}
          >
            Creating game on blockchain...
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
            variant="primary"
            className="flex-1"
            onClick={handleCreateGame}
            disabled={isProcessing || state === 'success'}
          >
            {state === 'idle' && 'Create & Sign'}
            {state === 'signing' && 'Signing...'}
            {state === 'creating' && 'Creating...'}
            {state === 'success' && 'Success!'}
            {state === 'error' && 'Try Again'}
          </CyberButton>
        </div>

        {/* Info */}
        <div
          className="text-xs text-center"
          style={{ color: cyberTheme.colors.text.muted }}
        >
          This transaction is free and does not cost any gas fees.
        </div>
      </div>
    </Modal>
  );
}

export default CreateGameModal;
