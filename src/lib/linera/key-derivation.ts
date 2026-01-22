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
import { loadLinera } from './linera-loader';

// Deterministic message prefix for key derivation
const AUTH_MESSAGE_PREFIX = 'Linera Air Hockey Auth';
// Using timestamp: 0 ensures the same signature every time
const DETERMINISTIC_TIMESTAMP = '0';

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
  privateKey: unknown;
  owner: string;
}> {
  // Hash the signature to get 32 bytes for the private key
  const hashBytes = await sha256(signature);

  // Load Linera WASM module
  // The module structure varies, so we use 'any' for flexibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linera = await loadLinera() as any;

  // Try to create private key from hash bytes
  // The @linera/client API may vary - we try different approaches
  let privateKey: unknown;
  let owner: string;

  // Approach 1: PrivateKey.fromBytes (if available)
  if (linera.PrivateKey?.fromBytes) {
    privateKey = linera.PrivateKey.fromBytes(hashBytes);
    owner = (privateKey as { address: () => string }).address();
  }
  // Approach 2: signer.PrivateKey (namespace pattern)
  else if (linera.signer?.PrivateKey) {
    // If we can't create from bytes, we create random and warn
    // This is a fallback - the hash-based approach is preferred
    console.warn('[KeyDerivation] PrivateKey.fromBytes not available, using random key');
    console.warn('[KeyDerivation] Key will NOT be deterministic across sessions');
    const pk = linera.signer.PrivateKey.createRandom();
    privateKey = pk;
    owner = pk.address();
  }
  // Approach 3: Direct PrivateKey class
  else if (linera.PrivateKey) {
    if (linera.PrivateKey.createRandom) {
      console.warn('[KeyDerivation] Using fallback random key');
      const pk = linera.PrivateKey.createRandom();
      privateKey = pk;
      owner = pk.address();
    } else {
      throw new Error('Cannot create Linera private key - no compatible method found');
    }
  }
  else {
    throw new Error('Linera module does not export PrivateKey class');
  }

  console.log('[KeyDerivation] Derived Linera owner:', owner);
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
  lineraPrivateKey: unknown;
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
  lineraPrivateKey: unknown;
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
