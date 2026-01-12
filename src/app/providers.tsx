'use client';

import { ReactNode, useEffect } from 'react';
import { DesignProvider } from '@/designs';
import { WalletAuthProvider, useWalletAuth } from '@/providers/WalletAuthProvider';
import { LineraProvider } from '@/providers/LineraProvider';
import { usePlayerStore } from '@/stores/playerStore';
import { useAchievementStore } from '@/stores/achievementStore';
import { runMigrations } from '@/lib/cyber/storage';

/**
 * Store initializer - only runs when wallet is connected
 */
function StoreInitializer() {
  const initializePlayer = usePlayerStore((state) => state.initializePlayer);
  const initializeProgress = useAchievementStore((state) => state.initializeProgress);
  const { isConnected, address } = useWalletAuth();

  useEffect(() => {
    if (isConnected && address) {
      // Run storage migrations
      runMigrations();
      // Initialize stores (will use wallet-specific keys)
      initializePlayer();
      initializeProgress();
    }
  }, [isConnected, address, initializePlayer, initializeProgress]);

  return null;
}

/**
 * Main providers wrapper
 *
 * No wallet gate - users can browse freely without connecting.
 * Wallet connection is available via the navbar button.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <DesignProvider>
      <WalletAuthProvider>
        <LineraProvider>
          <StoreInitializer />
          {children}
        </LineraProvider>
      </WalletAuthProvider>
    </DesignProvider>
  );
}
