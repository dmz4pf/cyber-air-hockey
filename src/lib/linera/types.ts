/**
 * Linera Blockchain Types for Air Hockey
 *
 * These types define the on-chain game state and interactions
 * for staked multiplayer matches.
 */

// Game states on the blockchain
export type ChainGameStatus =
  | 'waiting'     // Game created, waiting for player 2
  | 'active'      // Both players joined, game in progress
  | 'completed'   // Game finished, winner determined
  | 'cancelled'   // Game cancelled (timeout or player left before start)
  | 'disputed';   // Result disputed (requires resolution)

// On-chain game record
export interface ChainGame {
  id: number;
  creator: string;           // Wallet address of game creator
  opponent: string | null;   // Wallet address of opponent (null until joined)
  stake: bigint;             // Stake amount in smallest unit
  status: ChainGameStatus;
  winner: string | null;     // Winner's wallet address
  createdAt: number;         // Block timestamp
  startedAt: number | null;  // When opponent joined
  endedAt: number | null;    // When game completed
  player1Score: number;
  player2Score: number;
  roomCode: string;          // WebSocket room code for real-time play
}

// Game creation parameters
export interface CreateGameParams {
  stake: bigint;
  roomCode: string;
}

// Join game parameters
export interface JoinGameParams {
  gameId: number;
}

// Submit result parameters
export interface SubmitResultParams {
  gameId: number;
  player1Score: number;
  player2Score: number;
  signature: string;  // Signed by both players or server attestation
}

// Claim winnings parameters
export interface ClaimWinningsParams {
  gameId: number;
}

// Contract query responses
export interface GameListResponse {
  games: ChainGame[];
  total: number;
}

export interface BalanceResponse {
  available: bigint;
  locked: bigint;  // Stake in active games
}

// Wallet connection state
export type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  chainId: string | null;
  balance: bigint;
  error: string | null;
}

// Transaction receipt
export interface TxReceipt {
  hash: string;
  blockNumber: number;
  status: 'success' | 'failed';
  gasUsed: bigint;
}

// Events emitted by the contract
export interface GameCreatedEvent {
  gameId: number;
  creator: string;
  stake: bigint;
  roomCode: string;
}

export interface GameJoinedEvent {
  gameId: number;
  opponent: string;
}

export interface GameCompletedEvent {
  gameId: number;
  winner: string;
  player1Score: number;
  player2Score: number;
  payout: bigint;
}

export interface GameCancelledEvent {
  gameId: number;
  reason: 'timeout' | 'creator_cancelled' | 'opponent_left';
}

// Client interface for Linera interactions
export interface LineraClient {
  // Wallet management
  connect(): Promise<string>;  // Returns wallet address
  disconnect(): void;
  getWalletState(): WalletState;

  // Balance operations
  getBalance(address: string): Promise<BalanceResponse>;

  // Game operations
  createGame(params: CreateGameParams): Promise<TxReceipt & { gameId: number }>;
  joinGame(params: JoinGameParams): Promise<TxReceipt>;
  submitResult(params: SubmitResultParams): Promise<TxReceipt>;
  claimWinnings(params: ClaimWinningsParams): Promise<TxReceipt>;
  cancelGame(gameId: number): Promise<TxReceipt>;

  // Queries
  getGame(gameId: number): Promise<ChainGame | null>;
  getActiveGames(): Promise<GameListResponse>;
  getMyGames(address: string): Promise<GameListResponse>;
  getOpenGames(minStake?: bigint, maxStake?: bigint): Promise<GameListResponse>;

  // Event subscriptions
  onGameCreated(callback: (event: GameCreatedEvent) => void): () => void;
  onGameJoined(callback: (event: GameJoinedEvent) => void): () => void;
  onGameCompleted(callback: (event: GameCompletedEvent) => void): () => void;
  onGameCancelled(callback: (event: GameCancelledEvent) => void): () => void;
}

// Helper type for stake amounts (human readable)
export interface StakeAmount {
  value: string;       // Display value (e.g., "100")
  bigint: bigint;      // On-chain value
  formatted: string;   // Formatted with symbol (e.g., "100 LINERA")
}

// Game lobby item for display
export interface GameLobbyItem {
  id: number;
  creatorAddress: string;
  creatorShort: string;  // Shortened address for display
  stake: StakeAmount;
  createdAt: Date;
  status: ChainGameStatus;
  roomCode: string;
  isOwn: boolean;  // True if current user created this game
}
