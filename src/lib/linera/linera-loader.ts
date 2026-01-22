/**
 * Dynamic WASM Loader for @linera/client
 *
 * Loads the Linera WASM module dynamically from /public/linera/
 * to avoid webpack bundling issues with WASM modules.
 *
 * Uses webpackIgnore comment to prevent Next.js from trying to
 * bundle the WASM files.
 */

// Cache the loaded module
let cachedLinera: typeof import('@linera/client') | null = null;
let loadPromise: Promise<typeof import('@linera/client')> | null = null;

/**
 * Dynamically load the Linera WASM module
 *
 * This function:
 * 1. Checks if module is already cached
 * 2. Loads the JS wrapper from /public/linera/
 * 3. Initializes the WASM binary
 * 4. Caches and returns the module
 */
export async function loadLinera(): Promise<typeof import('@linera/client')> {
  // Return cached module if available
  if (cachedLinera) {
    return cachedLinera;
  }

  // Return existing load promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Ensure we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Linera WASM can only be loaded in browser environment');
  }

  loadPromise = (async () => {
    try {
      console.log('[LineraLoader] Loading WASM module...');

      // Dynamic import with webpack ignore to prevent bundling
      // The module is served from /public/linera/
      // We use a variable path to bypass TypeScript module resolution
      const wasmJsPath = '/linera/linera_web.js';
      const wasmBinaryPath = '/linera/linera_web_bg.wasm';

      // Dynamic import - the path must be a string literal for webpack, but
      // we need to bypass TS module checking for runtime paths
      const importFn = new Function('path', 'return import(/* webpackIgnore: true */ path)') as (path: string) => Promise<unknown>;
      const module = await importFn(wasmJsPath) as typeof import('@linera/client') & { default: (wasmPath: string) => Promise<void> };

      // Initialize the WASM binary
      // The default export is the init function that loads the .wasm file
      if (typeof module.default === 'function') {
        await module.default(wasmBinaryPath);
        console.log('[LineraLoader] WASM initialized successfully');
      } else {
        console.warn('[LineraLoader] No init function found, WASM may already be initialized');
      }

      cachedLinera = module;
      return module;
    } catch (error) {
      // Clear the promise so we can retry
      loadPromise = null;
      console.error('[LineraLoader] Failed to load WASM:', error);
      throw error;
    }
  })();

  return loadPromise;
}

/**
 * Check if the Linera module is already loaded
 */
export function isLineraLoaded(): boolean {
  return cachedLinera !== null;
}

/**
 * Get the cached Linera module (throws if not loaded)
 */
export function getLinera(): typeof import('@linera/client') {
  if (!cachedLinera) {
    throw new Error('Linera module not loaded. Call loadLinera() first.');
  }
  return cachedLinera;
}

/**
 * Check if cross-origin isolation is enabled
 *
 * WASM modules using SharedArrayBuffer require:
 * - Cross-Origin-Opener-Policy: same-origin
 * - Cross-Origin-Embedder-Policy: credentialless (or require-corp)
 */
export function checkCrossOriginIsolation(): boolean {
  if (typeof self === 'undefined') {
    return false;
  }
  return self.crossOriginIsolated === true;
}

/**
 * Reset the cached module (for testing)
 */
export function resetLineraLoader(): void {
  cachedLinera = null;
  loadPromise = null;
}
