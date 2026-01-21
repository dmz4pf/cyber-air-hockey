# Dynamic + Linera Integration Plan

## Overview

Integrate Dynamic wallet authentication with Linera blockchain for the Air Hockey game.

**Environment ID:** `dd8f792e-622c-4bb2-8525-3db710816d51`
**Linera Faucet:** `https://faucet.testnet-conway.linera.net`
**Application ID:** `e6f43e6eae36f9d1b546024e415036f251fd8161e606f3b92be0f8f7f7e78e0f`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────┐    │
│  │  Dynamic SDK    │    │  Cross-Origin Isolation Shim    │    │
│  │  (Auth + Wallet)│    │  (Enables WASM + Dynamic iframes)│    │
│  └────────┬────────┘    └─────────────────────────────────┘    │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              DynamicLineraProvider                       │   │
│  │  - Manages Dynamic authentication state                  │   │
│  │  - Initializes Linera client when wallet connects        │   │
│  │  - Provides React context for game components            │   │
│  └────────┬────────────────────────────────┬───────────────┘   │
│           │                                │                    │
│           ▼                                ▼                    │
│  ┌─────────────────┐              ┌─────────────────┐          │
│  │  Linera Adapter │              │  Dynamic Signer │          │
│  │  - WASM init    │              │  - Implements   │          │
│  │  - Faucet conn  │◄────────────►│    Signer iface │          │
│  │  - Chain claim  │              │  - personal_sign│          │
│  │  - App connect  │              │    via Dynamic  │          │
│  └────────┬────────┘              └─────────────────┘          │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              @linera/client (WASM)                       │   │
│  │  - Wallet management                                     │   │
│  │  - Chain operations                                      │   │
│  │  - GraphQL queries/mutations                             │   │
│  └────────┬────────────────────────────────────────────────┘   │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Linera Conway Testnet                              │
│  - Validators                                                   │
│  - Microchains                                                  │
│  - Air Hockey Application                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation Setup

### Task 1.1: Cross-Origin Isolation Shim
**File:** `/public/scripts/dynamic-coi-shim.js`

Purpose: Allow Dynamic's auth iframes to work within Linera's cross-origin isolated environment.

```javascript
// Intercepts iframe creation and marks Dynamic auth iframes as credentialless
// Must load BEFORE any other scripts in index.html
```

### Task 1.2: Update Next.js Config
**File:** `/next.config.ts`

Add/verify headers:
- Cross-Origin-Embedder-Policy: credentialless
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: cross-origin

---

## Phase 2: Core Integration Components

### Task 2.1: Dynamic Signer
**File:** `/src/lib/linera/dynamic-signer.ts`

```typescript
interface Signer {
  sign(owner: string, value: Uint8Array): Promise<string>;
  containsKey(owner: string): Promise<boolean>;
}

class DynamicSigner implements Signer {
  constructor(dynamicWallet: Wallet);
  async sign(owner: string, value: Uint8Array): Promise<string>;
  async containsKey(owner: string): Promise<boolean>;
  async address(): Promise<string>;
}
```

### Task 2.2: Linera Adapter
**File:** `/src/lib/linera/linera-adapter.ts`

```typescript
interface LineraProvider {
  client: Client;
  wallet: Wallet;
  faucet: Faucet;
  address: string;
  chainId: string;
}

class LineraAdapter {
  static getInstance(): LineraAdapter;
  async connect(dynamicWallet: Wallet, faucetUrl: string): Promise<LineraProvider>;
  async setApplication(appId: string): Promise<void>;
  async queryApplication<T>(query: object): Promise<T>;
  getProvider(): LineraProvider;
  isChainConnected(): boolean;
  isApplicationSet(): boolean;
  reset(): void;
}
```

---

## Phase 3: React Integration

### Task 3.1: DynamicLineraProvider
**File:** `/src/providers/DynamicLineraProvider.tsx`

```typescript
// Wraps entire app
// Manages:
// - Dynamic SDK initialization
// - Linera client lifecycle
// - Connection state
// - Error handling

interface DynamicLineraContextValue {
  // Dynamic state
  isAuthenticated: boolean;
  walletAddress: string | null;

  // Linera state
  isLineraConnected: boolean;
  lineraChainId: string | null;
  isApplicationReady: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;

  // Game operations
  createGame: (stake: string, roomCode: string) => Promise<string>;
  joinGame: (gameId: string) => Promise<void>;
  getOpenGames: () => Promise<Game[]>;
}
```

### Task 3.2: useLineraGame Hook
**File:** `/src/hooks/useLineraGame.ts`

```typescript
// Simplified hook for game components
function useLineraGame() {
  return {
    isReady: boolean;
    createGame: (stake: string, roomCode: string) => Promise<string>;
    joinGame: (gameId: string) => Promise<void>;
    submitResult: (gameId: string, winner: string) => Promise<void>;
  };
}
```

---

## Phase 4: UI Updates

### Task 4.1: Update providers.tsx
Replace current providers with DynamicLineraProvider

### Task 4.2: Update CreateGameModal
- Remove old useWalletAuth
- Use useLineraGame hook
- Update UI messaging

### Task 4.3: Update JoinGameModal
- Remove old useWalletAuth
- Use useLineraGame hook
- Update UI messaging

### Task 4.4: Update TopNavBar
- Show Dynamic wallet connection button
- Display Linera chain status

---

## Phase 5: Testing & Validation

### Test Cases:
1. [ ] Dynamic wallet connects successfully
2. [ ] Linera WASM initializes without errors
3. [ ] Chain claimed from faucet
4. [ ] Application connected
5. [ ] Create game mutation works
6. [ ] Join game mutation works
7. [ ] No "Ethereum" shown in wallet UI
8. [ ] Error handling works properly

---

## Dependencies to Install

```bash
npm install @dynamic-labs/sdk-react-core @dynamic-labs/ethereum
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `/public/scripts/dynamic-coi-shim.js` | CREATE | Cross-origin isolation shim |
| `/src/app/layout.tsx` | MODIFY | Add shim script |
| `/next.config.ts` | MODIFY | Verify COOP/COEP headers |
| `/src/lib/linera/dynamic-signer.ts` | CREATE | Dynamic wallet signer |
| `/src/lib/linera/linera-adapter.ts` | CREATE | Linera connection adapter |
| `/src/providers/DynamicLineraProvider.tsx` | CREATE | Main provider |
| `/src/hooks/useLineraGame.ts` | CREATE | Game operations hook |
| `/src/app/providers.tsx` | MODIFY | Use new provider |
| `/src/components/cyber/game/CreateGameModal.tsx` | MODIFY | Use new hook |
| `/src/components/cyber/game/JoinGameModal.tsx` | MODIFY | Use new hook |
| `/src/components/cyber/layout/TopNavBar.tsx` | MODIFY | Update wallet UI |

---

## Configuration

```typescript
// /src/lib/linera/config.ts
export const DYNAMIC_CONFIG = {
  environmentId: 'dd8f792e-622c-4bb2-8525-3db710816d51',
};

export const LINERA_CONFIG = {
  faucetUrl: 'https://faucet.testnet-conway.linera.net',
  applicationId: 'e6f43e6eae36f9d1b546024e415036f251fd8161e606f3b92be0f8f7f7e78e0f',
  chainId: '4033b24a17f9a16a66d80b99c144b319b6dfdc1aab11bcce667c0635a3655a06',
};
```

---

## Success Criteria

1. User can connect wallet via Dynamic (Google, Email, or external wallet)
2. Linera chain is automatically claimed from faucet
3. User can create/join games with real Linera transactions
4. No "Ethereum" confusion in UI
5. Clean error handling for all failure modes
6. TypeScript strict mode passes
