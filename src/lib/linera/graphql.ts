/**
 * GraphQL Operations for Linera Air Hockey Contract
 *
 * Defines all queries and mutations for interacting with the
 * Air Hockey smart contract on Linera.
 */

// ============================================
// QUERIES
// ============================================

/**
 * Get a single game by ID
 */
export const GET_GAME = `
  query GetGame($id: Int!) {
    game(id: $id) {
      id
      creator
      opponent
      stake
      status
      roomCode
      winner
      player1Score
      player2Score
      createdAt
    }
  }
`;

/**
 * Get all games waiting for opponents
 */
export const GET_OPEN_GAMES = `
  query GetOpenGames {
    openGames {
      games {
        id
        creator
        opponent
        stake
        status
        roomCode
        winner
        player1Score
        player2Score
        createdAt
      }
      total
    }
  }
`;

/**
 * Get games for a specific player
 */
export const GET_PLAYER_GAMES = `
  query GetPlayerGames($address: String!) {
    playerGames(address: $address) {
      games {
        id
        creator
        opponent
        stake
        status
        roomCode
        winner
        player1Score
        player2Score
        createdAt
      }
      total
    }
  }
`;

/**
 * Get player statistics
 */
export const GET_PLAYER_STATS = `
  query GetPlayerStats($address: String!) {
    playerStats(address: $address) {
      gamesPlayed
      wins
      losses
      tokensWon
      tokensLost
    }
  }
`;

/**
 * Get active games (both waiting and in-progress)
 */
export const GET_ACTIVE_GAMES = `
  query GetActiveGames {
    activeGames {
      games {
        id
        creator
        opponent
        stake
        status
        roomCode
        createdAt
      }
      total
    }
  }
`;

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new staked game
 * Returns the game ID
 */
export const CREATE_GAME = `
  mutation CreateGame($stake: String!, $roomCode: String!) {
    createGame(stake: $stake, roomCode: $roomCode)
  }
`;

/**
 * Join an existing game
 */
export const JOIN_GAME = `
  mutation JoinGame($gameId: Int!) {
    joinGame(gameId: $gameId)
  }
`;

/**
 * Submit game result (called by game host)
 */
export const SUBMIT_RESULT = `
  mutation SubmitResult($gameId: Int!, $player1Score: Int!, $player2Score: Int!) {
    submitResult(gameId: $gameId, player1Score: $player1Score, player2Score: $player2Score)
  }
`;

/**
 * Cancel a waiting game (creator only)
 */
export const CANCEL_GAME = `
  mutation CancelGame($gameId: Int!) {
    cancelGame(gameId: $gameId)
  }
`;

// ============================================
// RESPONSE TYPES
// ============================================

export interface GraphQLGame {
  id: number;
  creator: string;
  opponent: string | null;
  stake: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  roomCode: string;
  winner: string | null;
  player1Score: number;
  player2Score: number;
  createdAt: number;
}

export interface GraphQLGameList {
  games: GraphQLGame[];
  total: number;
}

export interface GraphQLPlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  tokensWon: string;
  tokensLost: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build a GraphQL request body
 */
export function buildGraphQLRequest(
  query: string,
  variables?: Record<string, unknown>
): string {
  return JSON.stringify({
    query,
    variables: variables || {},
  });
}

/**
 * Parse GraphQL response and handle errors
 */
export function parseGraphQLResponse<T>(response: string): T {
  const parsed: GraphQLResponse<T> = JSON.parse(response);

  if (parsed.errors && parsed.errors.length > 0) {
    const errorMessages = parsed.errors.map((e) => e.message).join('; ');
    throw new Error(`GraphQL Error: ${errorMessages}`);
  }

  if (!parsed.data) {
    throw new Error('No data in GraphQL response');
  }

  return parsed.data;
}

/**
 * Convert GraphQL game status to internal status
 */
export function mapGameStatus(
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
): 'waiting' | 'active' | 'completed' | 'cancelled' {
  const statusMap: Record<string, 'waiting' | 'active' | 'completed' | 'cancelled'> = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return statusMap[status] || 'waiting';
}

/**
 * Convert GraphQL game to internal ChainGame format
 */
export function mapGraphQLGameToChainGame(game: GraphQLGame): {
  id: number;
  creator: string;
  opponent: string | null;
  stake: bigint;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner: string | null;
  createdAt: number;
  startedAt: number | null;
  endedAt: number | null;
  player1Score: number;
  player2Score: number;
  roomCode: string;
} {
  return {
    id: game.id,
    creator: game.creator,
    opponent: game.opponent,
    stake: BigInt(game.stake),
    status: mapGameStatus(game.status),
    winner: game.winner,
    createdAt: game.createdAt,
    startedAt: game.status !== 'WAITING' ? game.createdAt : null, // Approximate
    endedAt: game.status === 'COMPLETED' || game.status === 'CANCELLED' ? Date.now() : null,
    player1Score: game.player1Score,
    player2Score: game.player2Score,
    roomCode: game.roomCode,
  };
}
