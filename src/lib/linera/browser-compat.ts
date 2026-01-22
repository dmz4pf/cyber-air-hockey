/**
 * Browser Compatibility Check for Linera WASM
 *
 * Checks if the current browser supports the features required
 * for running the Linera WASM client:
 * - Cross-origin isolation (SharedArrayBuffer)
 * - WebAssembly
 * - Not Safari (which doesn't support credentialless COEP)
 */

export interface BrowserCompatibility {
  /** Whether cross-origin isolation is enabled */
  crossOriginIsolated: boolean;
  /** Whether SharedArrayBuffer is available */
  sharedArrayBuffer: boolean;
  /** Whether WebAssembly is supported */
  wasmSupported: boolean;
  /** Whether this is Safari browser */
  isSafari: boolean;
  /** Whether WASM client can be used */
  canUseWasm: boolean;
  /** Reason if WASM cannot be used */
  reason?: string;
}

/**
 * Check browser compatibility for Linera WASM client
 *
 * Returns detailed information about what features are
 * supported and whether the WASM client can be used.
 */
export function checkBrowserCompatibility(): BrowserCompatibility {
  // Server-side check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      crossOriginIsolated: false,
      sharedArrayBuffer: false,
      wasmSupported: false,
      isSafari: false,
      canUseWasm: false,
      reason: 'Running on server (SSR)',
    };
  }

  // Detect Safari (doesn't support credentialless COEP)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Check cross-origin isolation
  const crossOriginIsolated = self.crossOriginIsolated === true;

  // Check SharedArrayBuffer availability
  const sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';

  // Check WebAssembly support
  const wasmSupported = typeof WebAssembly !== 'undefined' &&
    typeof WebAssembly.instantiate === 'function';

  // Determine if WASM can be used
  let canUseWasm = true;
  let reason: string | undefined;

  if (isSafari) {
    canUseWasm = false;
    reason = 'Safari does not support credentialless COEP header';
  } else if (!crossOriginIsolated) {
    canUseWasm = false;
    reason = 'Cross-origin isolation not enabled (check COOP/COEP headers)';
  } else if (!sharedArrayBuffer) {
    canUseWasm = false;
    reason = 'SharedArrayBuffer not available';
  } else if (!wasmSupported) {
    canUseWasm = false;
    reason = 'WebAssembly not supported';
  }

  return {
    crossOriginIsolated,
    sharedArrayBuffer,
    wasmSupported,
    isSafari,
    canUseWasm,
    reason,
  };
}

/**
 * Quick check if WASM client can be used
 */
export function canUseWasmClient(): boolean {
  return checkBrowserCompatibility().canUseWasm;
}

/**
 * Get human-readable compatibility status
 */
export function getCompatibilityStatus(): string {
  const compat = checkBrowserCompatibility();

  if (compat.canUseWasm) {
    return 'WASM client available';
  }

  return `WASM client unavailable: ${compat.reason}`;
}

/**
 * Log compatibility info to console (for debugging)
 */
export function logCompatibility(): void {
  const compat = checkBrowserCompatibility();

  console.group('[Linera] Browser Compatibility');
  console.log('Cross-Origin Isolated:', compat.crossOriginIsolated);
  console.log('SharedArrayBuffer:', compat.sharedArrayBuffer);
  console.log('WebAssembly:', compat.wasmSupported);
  console.log('Safari:', compat.isSafari);
  console.log('Can use WASM:', compat.canUseWasm);
  if (compat.reason) {
    console.log('Reason:', compat.reason);
  }
  console.groupEnd();
}
