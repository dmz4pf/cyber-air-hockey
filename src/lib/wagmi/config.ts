/**
 * Wagmi + RainbowKit Configuration
 *
 * Configures wallet connection with support for:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - And other popular wallets via RainbowKit
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygonMumbai, arbitrumSepolia } from 'wagmi/chains';

// WalletConnect Project ID - Get one at https://cloud.walletconnect.com/
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

// Create wagmi config with RainbowKit defaults
export const config = getDefaultConfig({
  appName: 'Cyber Air Hockey',
  projectId,
  chains: [mainnet, sepolia, polygonMumbai, arbitrumSepolia],
  ssr: true, // Enable server-side rendering support
});

export { projectId };
