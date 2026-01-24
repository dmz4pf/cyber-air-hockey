/**
 * MetaMask to Linera Key Derivation
 *
 * Derives a deterministic Linera private key from a MetaMask signature.
 * This ensures:
 * - Same MetaMask account = Same Linera wallet on any device
 * - User doesn't need to manage separate Linera keys
 * - Secure key derivation using SHA-256 of signature
 */

import { connectMetaMask, signMessage } from './metamask';

// Deterministic message prefix for key derivation
const AUTH_MESSAGE_PREFIX = 'Linera Air Hockey Auth';
// Using timestamp: 0 ensures the same signature every time
const DETERMINISTIC_TIMESTAMP = '0';

/**
 * Linera-compatible Signer implementation
 *
 * This matches the interface expected by Linera's Client class.
 * Uses ethers.js for signing, which is the same as @linera/client's PrivateKey.
 */
export interface LineraSignerInterface {
  address(): string;
  sign(owner: string, value: Uint8Array): Promise<string>;
  getPublicKey(owner: string): Promise<string>;
  containsKey(owner: string): Promise<boolean>;
}

/**
 * Create a Linera-compatible signer from a private key hex string
 */
async function createLineraPrivateKey(privateKeyHex: string): Promise<LineraSignerInterface> {
  // Dynamically import ethers to avoid SSR issues
  const { Wallet, isAddress } = await import('ethers');

  const wallet = new Wallet(privateKeyHex);

  return {
    address(): string {
      return wallet.address;
    },

    async sign(owner: string, value: Uint8Array): Promise<string> {
      if (typeof owner !== 'string' ||
          !isAddress(owner) ||
          wallet.address.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('Invalid owner address');
      }
      return await wallet.signMessage(value);
    },

    async getPublicKey(owner: string): Promise<string> {
      if (typeof owner !== 'string' ||
          !isAddress(owner) ||
          wallet.address.toLowerCase() !== owner.toLowerCase()) {
        throw new Error('Invalid owner address');
      }
      return wallet.signingKey.publicKey;
    },

    async containsKey(owner: string): Promise<boolean> {
      if (typeof owner !== 'string' || !isAddress(owner)) {
        return false;
      }
      return wallet.address.toLowerCase() === owner.toLowerCase();
    }
  };
}

/**
 * Generate the deterministic authentication message
 *
 * The message format is:
 * Linera Air Hockey Auth
 * Address: 0x...
 * Timestamp: 0
 *
 * Using a fixed timestamp ensures the same signature
 * is produced every time for the same MetaMask account.
 */
export function generateAuthMessage(metaMaskAddress: string): string {
  return `${AUTH_MESSAGE_PREFIX}\nAddress: ${metaMaskAddress}\nTimestamp: ${DETERMINISTIC_TIMESTAMP}`;
}

/**
 * Hash data using SHA-256
 */
async function sha256(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return new Uint8Array(hashBuffer);
}

/**
 * Derive Linera credentials from MetaMask signature
 *
 * Takes a MetaMask signature and derives:
 * - Linera private key (from SHA-256 hash of signature)
 * - Linera owner address
 */
export async function deriveLineraCredentials(
  metaMaskAddress: string,
  signature: string
): Promise<{
  privateKey: LineraSignerInterface;
  owner: string;
}> {
  // Hash the signature to get 32 bytes for the private key
  const hashBytes = await sha256(signature);

  // Convert hash bytes to hex string for ethers.Wallet
  const privateKeyHex = '0x' + Array.from(hashBytes).map(b => b.toString(16).padStart(2, '0')).join('');

  // Create a Linera-compatible signer using ethers
  // This matches the @linera/client signer interface exactly
  const privateKey = await createLineraPrivateKey(privateKeyHex);
  const owner = privateKey.address();

  console.log('[KeyDerivation] Derived Linera owner:', owner);
  console.log('[KeyDerivation] MetaMask address:', metaMaskAddress);

  return { privateKey, owner };
}

/**
 * Complete flow: Connect MetaMask and derive Linera key
 *
 * This function:
 * 1. Connects to MetaMask (prompts user)
 * 2. Requests signature of deterministic message
 * 3. Derives Linera key from signature hash
 *
 * Returns the same Linera wallet for the same MetaMask account
 * across all devices and browsers.
 */
export async function connectAndDeriveLineraKey(): Promise<{
  metaMaskAddress: string;
  lineraPrivateKey: LineraSignerInterface;
  lineraOwner: string;
  signature: string;
}> {
  console.log('[KeyDerivation] Starting MetaMask connection...');

  // 1. Connect to MetaMask
  const metaMaskAddress = await connectMetaMask();
  console.log('[KeyDerivation] MetaMask connected:', metaMaskAddress);

  // 2. Generate and sign the deterministic message
  const message = generateAuthMessage(metaMaskAddress);
  console.log('[KeyDerivation] Requesting signature...');
  const signature = await signMessage(message, metaMaskAddress);
  console.log('[KeyDerivation] Signature obtained');

  // 3. Derive Linera credentials from signature
  const { privateKey, owner } = await deriveLineraCredentials(metaMaskAddress, signature);

  return {
    metaMaskAddress,
    lineraPrivateKey: privateKey,
    lineraOwner: owner,
    signature,
  };
}

/**
 * Derive key from existing MetaMask connection
 *
 * Use this when MetaMask is already connected and you have the address.
 * Useful for reconnecting without re-prompting for connection.
 */
export async function deriveLineraKeyFromAddress(
  metaMaskAddress: string
): Promise<{
  lineraPrivateKey: LineraSignerInterface;
  lineraOwner: string;
  signature: string;
}> {
  // Generate and sign the deterministic message
  const message = generateAuthMessage(metaMaskAddress);
  const signature = await signMessage(message, metaMaskAddress);

  // Derive Linera credentials from signature
  const { privateKey, owner } = await deriveLineraCredentials(metaMaskAddress, signature);

  return {
    lineraPrivateKey: privateKey,
    lineraOwner: owner,
    signature,
  };
}
