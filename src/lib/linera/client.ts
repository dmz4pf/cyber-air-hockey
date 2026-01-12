/**
 * Linera Client for Air Hockey
 *
 * This is a mock implementation that simulates Linera blockchain interactions.
 * Replace with actual Linera SDK when available.
 *
 * The client follows the LineraClient interface from ./types.ts
 */

import {
  LineraClient,
  WalletState,
  WalletStatus,
  BalanceResponse,
  ChainGame,
  ChainGameStatus,
  CreateGameParams,
  JoinGameParams,
  SubmitResultParams,
  ClaimWinningsParams,
  TxReceipt,
  GameListResponse,
  GameCreatedEvent,
  GameJoinedEvent,
  GameCompletedEvent,
  GameCancelledEvent,
} from './types';

// Mock storage for games (would be on-chain in production)
let mockGames: ChainGame[] = [];
let nextGameId = 1;

// Event listeners
const eventListeners = {
  gameCreated: new Set<(event: GameCreatedEvent) => void>(),
  gameJoined: new Set<(event: GameJoinedEvent) => void>(),
  gameCompleted: new Set<(event: GameCompletedEvent) => void>(),
  gameCancelled: new Set<(event: GameCancelledEvent) => void>(),
};

// Current wallet state
let walletState: WalletState = {
  status: 'disconnected',
  address: null,
  chainId: null,
  balance: BigInt(0),
  error: null,
};

// Wallet state listeners
const walletListeners = new Set<(state: WalletState) => void>();

function notifyWalletChange() {
  walletListeners.forEach((cb) => cb(walletState));
}

// Simulated delay for blockchain operations
const CHAIN_DELAY = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateTxHash(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function generateMockAddress(): string {
  return '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Mock Linera Client Implementation
 *
 * This simulates blockchain interactions for development.
 * Replace the implementation with real Linera SDK calls in production.
 */
export class MockLineraClient implements LineraClient {
  // Wallet Management

  async connect(): Promise<string> {
    walletState = {
      ...walletState,
      status: 'connecting',
      error: null,
    };
    notifyWalletChange();

    await delay(CHAIN_DELAY);

    // Simulate successful connection
    const address = generateMockAddress();
    walletState = {
      status: 'connected',
      address,
      chainId: 'linera-testnet',
      balance: BigInt(10000) * BigInt(10 ** 18), // 10000 tokens
      error: null,
    };
    notifyWalletChange();

    return address;
  }

  disconnect(): void {
    walletState = {
      status: 'disconnected',
      address: null,
      chainId: null,
      balance: BigInt(0),
      error: null,
    };
    notifyWalletChange();
  }

  getWalletState(): WalletState {
    return { ...walletState };
  }

  onWalletStateChange(callback: (state: WalletState) => void): () => void {
    walletListeners.add(callback);
    return () => walletListeners.delete(callback);
  }

  // Balance Operations

  async getBalance(address: string): Promise<BalanceResponse> {
    await delay(500);

    // Calculate locked balance from active games
    const locked = mockGames
      .filter(
        (g) =>
          (g.creator === address || g.opponent === address) &&
          (g.status === 'waiting' || g.status === 'active')
      )
      .reduce((sum, g) => sum + g.stake, BigInt(0));

    return {
      available: walletState.balance - locked,
      locked,
    };
  }

  // Game Operations

  async createGame(params: CreateGameParams): Promise<TxReceipt & { gameId: number }> {
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    if (params.stake > walletState.balance) {
      throw new Error('Insufficient balance');
    }

    await delay(CHAIN_DELAY);

    const gameId = nextGameId++;
    const game: ChainGame = {
      id: gameId,
      creator: walletState.address,
      opponent: null,
      stake: params.stake,
      status: 'waiting',
      winner: null,
      createdAt: Date.now(),
      startedAt: null,
      endedAt: null,
      player1Score: 0,
      player2Score: 0,
      roomCode: params.roomCode,
    };

    mockGames.push(game);

    // Emit event
    const event: GameCreatedEvent = {
      gameId,
      creator: walletState.address,
      stake: params.stake,
      roomCode: params.roomCode,
    };
    eventListeners.gameCreated.forEach((cb) => cb(event));

    return {
      hash: generateTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      status: 'success',
      gasUsed: BigInt(21000),
      gameId,
    };
  }

  async joinGame(params: JoinGameParams): Promise<TxReceipt> {
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    const game = mockGames.find((g) => g.id === params.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not available to join');
    }

    if (game.creator === walletState.address) {
      throw new Error('Cannot join your own game');
    }

    if (game.stake > walletState.balance) {
      throw new Error('Insufficient balance');
    }

    await delay(CHAIN_DELAY);

    game.opponent = walletState.address;
    game.status = 'active';
    game.startedAt = Date.now();

    // Emit event
    const event: GameJoinedEvent = {
      gameId: game.id,
      opponent: walletState.address,
    };
    eventListeners.gameJoined.forEach((cb) => cb(event));

    return {
      hash: generateTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      status: 'success',
      gasUsed: BigInt(21000),
    };
  }

  async submitResult(params: SubmitResultParams): Promise<TxReceipt> {
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    const game = mockGames.find((g) => g.id === params.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    if (game.creator !== walletState.address && game.opponent !== walletState.address) {
      throw new Error('Not a participant in this game');
    }

    await delay(CHAIN_DELAY);

    game.player1Score = params.player1Score;
    game.player2Score = params.player2Score;
    game.status = 'completed';
    game.endedAt = Date.now();

    // Determine winner
    if (params.player1Score > params.player2Score) {
      game.winner = game.creator;
    } else if (params.player2Score > params.player1Score) {
      game.winner = game.opponent;
    } else {
      // Draw - refund both (in practice, we might not allow draws)
      game.winner = null;
    }

    // Emit event
    const event: GameCompletedEvent = {
      gameId: game.id,
      winner: game.winner || '',
      player1Score: params.player1Score,
      player2Score: params.player2Score,
      payout: game.stake * BigInt(2),
    };
    eventListeners.gameCompleted.forEach((cb) => cb(event));

    return {
      hash: generateTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      status: 'success',
      gasUsed: BigInt(42000),
    };
  }

  async claimWinnings(params: ClaimWinningsParams): Promise<TxReceipt> {
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    const game = mockGames.find((g) => g.id === params.gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'completed') {
      throw new Error('Game is not completed');
    }

    if (game.winner !== walletState.address) {
      throw new Error('You are not the winner');
    }

    await delay(CHAIN_DELAY);

    // Add winnings to balance
    walletState.balance += game.stake * BigInt(2);
    notifyWalletChange();

    return {
      hash: generateTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      status: 'success',
      gasUsed: BigInt(21000),
    };
  }

  async cancelGame(gameId: number): Promise<TxReceipt> {
    if (!walletState.address) {
      throw new Error('Wallet not connected');
    }

    const game = mockGames.find((g) => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.creator !== walletState.address) {
      throw new Error('Only creator can cancel');
    }

    if (game.status !== 'waiting') {
      throw new Error('Can only cancel waiting games');
    }

    await delay(CHAIN_DELAY);

    game.status = 'cancelled';
    game.endedAt = Date.now();

    // Emit event
    const event: GameCancelledEvent = {
      gameId,
      reason: 'creator_cancelled',
    };
    eventListeners.gameCancelled.forEach((cb) => cb(event));

    return {
      hash: generateTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      status: 'success',
      gasUsed: BigInt(21000),
    };
  }

  // Queries

  async getGame(gameId: number): Promise<ChainGame | null> {
    await delay(300);
    return mockGames.find((g) => g.id === gameId) || null;
  }

  async getActiveGames(): Promise<GameListResponse> {
    await delay(300);
    const games = mockGames.filter(
      (g) => g.status === 'waiting' || g.status === 'active'
    );
    return { games, total: games.length };
  }

  async getMyGames(address: string): Promise<GameListResponse> {
    await delay(300);
    const games = mockGames.filter(
      (g) => g.creator === address || g.opponent === address
    );
    return { games, total: games.length };
  }

  async getOpenGames(minStake?: bigint, maxStake?: bigint): Promise<GameListResponse> {
    await delay(300);
    let games = mockGames.filter((g) => g.status === 'waiting');

    if (minStake !== undefined) {
      games = games.filter((g) => g.stake >= minStake);
    }
    if (maxStake !== undefined) {
      games = games.filter((g) => g.stake <= maxStake);
    }

    // Don't show your own games in open games list
    if (walletState.address) {
      games = games.filter((g) => g.creator !== walletState.address);
    }

    return { games, total: games.length };
  }

  // Event Subscriptions

  onGameCreated(callback: (event: GameCreatedEvent) => void): () => void {
    eventListeners.gameCreated.add(callback);
    return () => eventListeners.gameCreated.delete(callback);
  }

  onGameJoined(callback: (event: GameJoinedEvent) => void): () => void {
    eventListeners.gameJoined.add(callback);
    return () => eventListeners.gameJoined.delete(callback);
  }

  onGameCompleted(callback: (event: GameCompletedEvent) => void): () => void {
    eventListeners.gameCompleted.add(callback);
    return () => eventListeners.gameCompleted.delete(callback);
  }

  onGameCancelled(callback: (event: GameCancelledEvent) => void): () => void {
    eventListeners.gameCancelled.add(callback);
    return () => eventListeners.gameCancelled.delete(callback);
  }
}

// Singleton instance
let clientInstance: MockLineraClient | null = null;

export function getLineraClient(): MockLineraClient {
  if (!clientInstance) {
    clientInstance = new MockLineraClient();
  }
  return clientInstance;
}

// Utility functions
export function formatStake(value: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = value / divisor;
  const fraction = value % divisor;

  if (fraction === BigInt(0)) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.replace(/0+$/, '');
  return `${whole}.${trimmed}`;
}

export function parseStake(value: string, decimals: number = 18): bigint {
  const [whole, fraction = ''] = value.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}

export { shortenAddress };
