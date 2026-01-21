'use client';

/**
 * WalletManager - Wallet connection UI without Dynamic Labs
 *
 * Provides a complete wallet management interface:
 * - Create new wallet
 * - Import wallet from JSON
 * - Export wallet for backup
 * - Display connection status, address, balance
 *
 * Uses the cyber/esports theme for consistent styling.
 */

import React, { useState, useCallback } from 'react';
import { cyberTheme } from '@/lib/cyber/theme';
import { CyberButton } from './CyberButton';
import { Modal } from './Modal';
import { useLinera } from '@/providers/LineraDirectProvider';

interface WalletManagerProps {
  variant?: 'full' | 'compact';
  className?: string;
}

// Helper to shorten addresses
function shortenAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper to shorten chain ID
function shortenChainId(chainId: string): string {
  if (chainId.length <= 16) return chainId;
  return `${chainId.slice(0, 8)}...${chainId.slice(-4)}`;
}

// Loading spinner component
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = { sm: 16, md: 24, lg: 32 };
  const pixels = sizeMap[size];

  return (
    <svg
      width={pixels}
      height={pixels}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={cyberTheme.colors.primary}
        strokeWidth="3"
        strokeOpacity="0.3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={cyberTheme.colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

// Copy button with feedback
function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all duration-200"
      style={{
        backgroundColor: copied ? `${cyberTheme.colors.success}20` : `${cyberTheme.colors.primary}20`,
        color: copied ? cyberTheme.colors.success : cyberTheme.colors.primary,
        border: `1px solid ${copied ? cyberTheme.colors.success : cyberTheme.colors.primary}40`,
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export function WalletManager({
  variant = 'full',
  className = '',
}: WalletManagerProps) {
  // Use the Linera context
  const {
    isInitialized,
    isConnected,
    isConnecting,
    walletAddress,
    chainId,
    balanceFormatted,
    createWallet,
    loadWallet,
    disconnect,
    exportWallet,
    error,
    clearError,
  } = useLinera();

  // Get formatted balance string
  const balance = balanceFormatted?.value || null;

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Handlers
  const handleCreateWallet = useCallback(async () => {
    setIsCreating(true);
    try {
      await createWallet();
    } catch (err) {
      console.error('Failed to create wallet:', err);
    } finally {
      setIsCreating(false);
    }
  }, [createWallet]);

  const handleImportWallet = useCallback(async () => {
    if (!importJson.trim()) {
      setImportError('Please paste your wallet JSON');
      return;
    }

    // Validate JSON
    try {
      JSON.parse(importJson);
    } catch {
      setImportError('Invalid JSON format');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    try {
      await loadWallet(importJson);
      setShowImportModal(false);
      setImportJson('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsImporting(false);
    }
  }, [importJson, loadWallet]);

  const handleOpenExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  const exportedWallet = exportWallet();

  // --- State: Not Initialized (WASM loading) ---
  if (!isInitialized) {
    return (
      <div
        className={`flex items-center justify-center gap-3 p-4 rounded-lg ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        <LoadingSpinner size="md" />
        <span
          style={{
            color: cyberTheme.colors.text.secondary,
            fontFamily: cyberTheme.fonts.body,
          }}
        >
          Initializing...
        </span>
      </div>
    );
  }

  // --- State: Connecting ---
  if (isConnecting) {
    const loadingText = isCreating ? 'Creating wallet...' : 'Loading wallet...';
    return (
      <div
        className={`flex items-center justify-center gap-3 p-4 rounded-lg ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${cyberTheme.colors.primary}`,
          boxShadow: `0 0 20px ${cyberTheme.colors.primary}30`,
        }}
      >
        <LoadingSpinner size="md" />
        <span
          style={{
            color: cyberTheme.colors.text.primary,
            fontFamily: cyberTheme.fonts.body,
          }}
        >
          {loadingText}
        </span>
      </div>
    );
  }

  // --- State: Disconnected (no wallet) ---
  if (!isConnected) {
    // Compact variant for navbar
    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <CyberButton
            variant="primary"
            size="sm"
            glow
            onClick={handleCreateWallet}
            loading={isCreating}
          >
            Create Wallet
          </CyberButton>
          <CyberButton
            variant="secondary"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            Import
          </CyberButton>

          {/* Import Modal */}
          <ImportWalletModal
            isOpen={showImportModal}
            onClose={() => {
              setShowImportModal(false);
              setImportJson('');
              setImportError(null);
            }}
            importJson={importJson}
            setImportJson={setImportJson}
            importError={importError}
            isImporting={isImporting}
            onImport={handleImportWallet}
          />
        </div>
      );
    }

    // Full variant for settings page
    return (
      <div
        className={`p-6 rounded-lg ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.secondary,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        {/* Error display */}
        {error && (
          <div
            className="flex items-center justify-between mb-4 p-3 rounded-lg"
            style={{
              backgroundColor: `${cyberTheme.colors.error}15`,
              border: `1px solid ${cyberTheme.colors.error}40`,
            }}
          >
            <span style={{ color: cyberTheme.colors.error }}>{error?.message || String(error)}</span>
            <button
              onClick={clearError}
              className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: cyberTheme.colors.error }}
            >
              ✕
            </button>
          </div>
        )}

        <div className="text-center">
          <h3
            className="text-lg font-bold mb-2"
            style={{
              color: cyberTheme.colors.text.primary,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Connect Your Wallet
          </h3>
          <p
            className="mb-6 text-sm"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Create a wallet to start playing and earning LINERA tokens
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <CyberButton
              variant="primary"
              size="lg"
              glow
              onClick={handleCreateWallet}
              loading={isCreating}
            >
              Create Wallet
            </CyberButton>
            <CyberButton
              variant="secondary"
              size="md"
              onClick={() => setShowImportModal(true)}
            >
              Import Existing Wallet
            </CyberButton>
          </div>
        </div>

        {/* Import Modal */}
        <ImportWalletModal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportJson('');
            setImportError(null);
          }}
          importJson={importJson}
          setImportJson={setImportJson}
          importError={importError}
          isImporting={isImporting}
          onImport={handleImportWallet}
        />
      </div>
    );
  }

  // --- State: Connected ---
  const shortAddress = walletAddress ? shortenAddress(walletAddress) : '';
  const shortChainId = chainId ? shortenChainId(chainId) : '';

  // Compact variant for navbar
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${className}`}
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${cyberTheme.colors.border.default}`,
        }}
      >
        {/* Connected indicator */}
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: cyberTheme.colors.success }}
        />

        {/* Address */}
        <span
          className="font-mono text-sm"
          style={{ color: cyberTheme.colors.success }}
        >
          {shortAddress}
        </span>

        {/* Balance */}
        {balance && (
          <span
            className="text-sm font-bold"
            style={{ color: cyberTheme.colors.warning }}
          >
            {balance} LINERA
          </span>
        )}

        {/* Actions dropdown - simplified to just disconnect for compact */}
        <button
          onClick={disconnect}
          className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: cyberTheme.colors.text.muted }}
          title="Disconnect"
        >
          ✕
        </button>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`p-6 rounded-lg ${className}`}
      style={{
        backgroundColor: cyberTheme.colors.bg.secondary,
        border: `1px solid ${cyberTheme.colors.border.default}`,
      }}
    >
      {/* Error display */}
      {error && (
        <div
          className="flex items-center justify-between mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: `${cyberTheme.colors.error}15`,
            border: `1px solid ${cyberTheme.colors.error}40`,
          }}
        >
          <span style={{ color: cyberTheme.colors.error }}>{error?.message || String(error)}</span>
          <button
            onClick={clearError}
            className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: cyberTheme.colors.error }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with connected status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: cyberTheme.colors.success,
              boxShadow: `0 0 10px ${cyberTheme.colors.success}`,
            }}
          />
          <span
            className="text-sm font-medium uppercase tracking-wider"
            style={{
              color: cyberTheme.colors.success,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            Connected
          </span>
        </div>
        <CyberButton variant="ghost" size="sm" onClick={disconnect}>
          Disconnect
        </CyberButton>
      </div>

      {/* Wallet info grid */}
      <div
        className="p-4 rounded-lg mb-4"
        style={{
          backgroundColor: cyberTheme.colors.bg.tertiary,
          border: `1px solid ${cyberTheme.colors.border.subtle}`,
        }}
      >
        {/* Address */}
        <div className="mb-4">
          <label
            className="block text-xs uppercase tracking-wider mb-1"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Wallet Address
          </label>
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-sm"
              style={{ color: cyberTheme.colors.text.primary }}
              title={walletAddress || ''}
            >
              {shortAddress}
            </span>
            {walletAddress && <CopyButton text={walletAddress} label="Copy" />}
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <label
            className="block text-xs uppercase tracking-wider mb-1"
            style={{ color: cyberTheme.colors.text.muted }}
          >
            Balance
          </label>
          <div className="flex items-center gap-2">
            <span
              className="text-xl font-bold"
              style={{
                color: cyberTheme.colors.warning,
                fontFamily: cyberTheme.fonts.heading,
                textShadow: `0 0 10px ${cyberTheme.colors.warning}40`,
              }}
            >
              {balance || '0'}
            </span>
            <span
              className="text-sm"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              LINERA
            </span>
          </div>
        </div>

        {/* Chain ID */}
        {chainId && (
          <div>
            <label
              className="block text-xs uppercase tracking-wider mb-1"
              style={{ color: cyberTheme.colors.text.muted }}
            >
              Chain ID
            </label>
            <span
              className="font-mono text-xs"
              style={{ color: cyberTheme.colors.text.secondary }}
              title={chainId}
            >
              {shortChainId}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <CyberButton
          variant="secondary"
          size="sm"
          onClick={handleOpenExport}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
        >
          Export Wallet
        </CyberButton>
      </div>

      {/* Export Modal */}
      <ExportWalletModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        walletJson={exportedWallet}
      />
    </div>
  );
}

// Import Wallet Modal Component
interface ImportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  importJson: string;
  setImportJson: (json: string) => void;
  importError: string | null;
  isImporting: boolean;
  onImport: () => void;
}

function ImportWalletModal({
  isOpen,
  onClose,
  importJson,
  setImportJson,
  importError,
  isImporting,
  onImport,
}: ImportWalletModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Wallet" size="md">
      <div className="space-y-4">
        <p style={{ color: cyberTheme.colors.text.secondary }} className="text-sm">
          Paste your wallet JSON to restore your wallet. This should be the file you
          exported previously.
        </p>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: cyberTheme.colors.text.secondary }}
          >
            Wallet JSON
          </label>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='{"address": "...", "privateKey": "..."}'
            rows={6}
            className="w-full rounded-md outline-none transition-all duration-200 p-3 font-mono text-sm resize-none"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `1px solid ${importError ? cyberTheme.colors.error : cyberTheme.colors.border.default}`,
              color: cyberTheme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = importError
                ? cyberTheme.colors.error
                : cyberTheme.colors.primary;
              e.target.style.boxShadow = `0 0 0 2px ${
                importError ? cyberTheme.colors.error : cyberTheme.colors.primary
              }20`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = importError
                ? cyberTheme.colors.error
                : cyberTheme.colors.border.default;
              e.target.style.boxShadow = 'none';
            }}
          />
          {importError && (
            <p className="mt-1 text-xs" style={{ color: cyberTheme.colors.error }}>
              {importError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <CyberButton variant="ghost" size="md" onClick={onClose}>
            Cancel
          </CyberButton>
          <CyberButton
            variant="primary"
            size="md"
            onClick={onImport}
            loading={isImporting}
            disabled={!importJson.trim()}
          >
            Import
          </CyberButton>
        </div>
      </div>
    </Modal>
  );
}

// Export Wallet Modal Component
interface ExportWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletJson: string | null;
}

function ExportWalletModal({ isOpen, onClose, walletJson }: ExportWalletModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Wallet" size="md">
      <div className="space-y-4">
        {/* Warning */}
        <div
          className="flex items-start gap-3 p-3 rounded-lg"
          style={{
            backgroundColor: `${cyberTheme.colors.warning}15`,
            border: `1px solid ${cyberTheme.colors.warning}40`,
          }}
        >
          <span style={{ color: cyberTheme.colors.warning, fontSize: '20px' }}>
            ⚠️
          </span>
          <div>
            <p
              className="font-semibold text-sm"
              style={{ color: cyberTheme.colors.warning }}
            >
              Save this securely!
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Anyone with this data can access your funds. Store it in a safe place
              and never share it with anyone.
            </p>
          </div>
        </div>

        {/* Wallet JSON display */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="block text-sm font-medium"
              style={{ color: cyberTheme.colors.text.secondary }}
            >
              Wallet Data
            </label>
            {walletJson && <CopyButton text={walletJson} label="Copy All" />}
          </div>
          <div
            className="w-full rounded-md p-3 font-mono text-xs overflow-auto max-h-48"
            style={{
              backgroundColor: cyberTheme.colors.bg.tertiary,
              border: `1px solid ${cyberTheme.colors.border.default}`,
              color: cyberTheme.colors.text.primary,
              wordBreak: 'break-all',
            }}
          >
            {walletJson ? (
              <pre className="whitespace-pre-wrap">{walletJson}</pre>
            ) : (
              <span style={{ color: cyberTheme.colors.text.muted }}>
                Unable to export wallet data
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <CyberButton variant="primary" size="md" onClick={onClose}>
            Close
          </CyberButton>
        </div>
      </div>
    </Modal>
  );
}

export default WalletManager;
