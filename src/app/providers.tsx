'use client';

import { ReactNode } from 'react';
import { DesignProvider } from '@/designs';
import { LineraDirectProvider } from '@/providers/LineraDirectProvider';

/**
 * Root Providers
 *
 * Uses LineraDirectProvider for direct Linera integration:
 * - No Dynamic Labs SDK dependency
 * - Direct wallet connection via window.ethereum (MetaMask, etc.)
 * - Lightweight and fast initialization
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <DesignProvider>
      <LineraDirectProvider>
        {children}
      </LineraDirectProvider>
    </DesignProvider>
  );
}
