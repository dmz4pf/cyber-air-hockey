import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// ============================================================================
// Types
// ============================================================================

export interface Game {
  id: string;
  creator: string;
  opponent: string | null;
  stake: string;
  roomCode: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  winner: string | null;
  player1Score: number;
  player2Score: number;
  createdAt: Date;
}

export interface Balance {
  available: string;
  locked: string;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

interface LineraServiceConfig {
  port: number;
  applicationId: string;
  chainId: string;
  restartDelayMs: number;
  maxRestartAttempts: number;
  healthCheckIntervalMs: number;
}

// ============================================================================
// Logger
// ============================================================================

const log = {
  info: (msg: string, ...args: unknown[]) => console.log(`[LineraService] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) => console.error(`[LineraService] ERROR: ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) => console.warn(`[LineraService] WARN: ${msg}`, ...args),
  debug: (msg: string, ...args: unknown[]) => {
    if (process.env.DEBUG) console.log(`[LineraService] DEBUG: ${msg}`, ...args);
  },
};

// ============================================================================
// LineraService Class
// ============================================================================

export class LineraService extends EventEmitter {
  private serviceProcess: ChildProcess | null = null;
  private config: LineraServiceConfig;
  private graphqlEndpoint: string;
  private isShuttingDown = false;
  private restartAttempts = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private startPromise: Promise<void> | null = null;

  // Mock mode storage (used when LINERA_APPLICATION_ID is not configured)
  private mockMode = false;
  private mockGames: Map<string, Game> = new Map();

  constructor(config?: Partial<LineraServiceConfig>) {
    super();

    this.config = {
      port: parseInt(process.env.LINERA_SERVICE_PORT || '8081', 10),
      applicationId: process.env.LINERA_APPLICATION_ID || '',
      chainId: process.env.LINERA_CHAIN_ID || '',
      restartDelayMs: 3000,
      maxRestartAttempts: 5,
      healthCheckIntervalMs: 30000,
      ...config,
    };

    this.graphqlEndpoint = `http://localhost:${this.config.port}`;

    // Enable mock mode if application ID is not configured
    this.mockMode = !this.config.applicationId;
    if (this.mockMode) {
      log.warn('Running in MOCK MODE - game data will be stored in memory only');
    }
  }

  // ==========================================================================
  // Lifecycle Methods
  // ==========================================================================

  /**
   * Start the linera service process
   */
  async start(): Promise<void> {
    if (this.serviceProcess && this.isRunning()) {
      log.info('Service is already running');
      return;
    }

    // If already starting, return the existing promise
    if (this.startPromise) {
      return this.startPromise;
    }

    this.isShuttingDown = false;
    this.startPromise = this.doStart();

    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  private async doStart(): Promise<void> {
    return new Promise((resolve, reject) => {
      log.info(`Starting linera service on port ${this.config.port}...`);

      try {
        this.serviceProcess = spawn('linera', ['service', '--port', String(this.config.port)], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env },
        });

        let startupOutput = '';
        let stderrOutput = '';
        let hasStarted = false;

        const onStdout = (data: Buffer) => {
          const output = data.toString();
          startupOutput += output;
          log.info('stdout:', output.trim());

          // Check for successful startup indicators
          if (output.includes('GraphQL') || output.includes('listening') || output.includes('Ready')) {
            if (!hasStarted) {
              hasStarted = true;
              this.restartAttempts = 0;
              this.startHealthCheck();
              this.emit('started');
              log.info('Service started successfully');
              resolve();
            }
          }
        };

        const onStderr = (data: Buffer) => {
          const output = data.toString();
          stderrOutput += output;
          log.info('stderr:', output.trim());

          // Some services output ready message to stderr
          if (output.includes('GraphQL') || output.includes('listening') || output.includes('Ready')) {
            if (!hasStarted) {
              hasStarted = true;
              this.restartAttempts = 0;
              this.startHealthCheck();
              this.emit('started');
              log.info('Service started successfully');
              resolve();
            }
          }
        };

        this.serviceProcess.stdout?.on('data', onStdout);
        this.serviceProcess.stderr?.on('data', onStderr);

        this.serviceProcess.on('error', (error) => {
          log.error('Failed to start service:', error.message);
          if (!hasStarted) {
            reject(new Error(`Failed to start linera service: ${error.message}`));
          }
        });

        this.serviceProcess.on('exit', (code, signal) => {
          log.warn(`Service exited with code ${code}, signal ${signal}`);
          this.stopHealthCheck();

          if (!hasStarted) {
            reject(new Error(`Service exited before starting. stdout: ${startupOutput}, stderr: ${stderrOutput}`));
            return;
          }

          this.emit('stopped', { code, signal });

          if (!this.isShuttingDown) {
            this.handleUnexpectedExit();
          }
        });

        // Timeout for startup
        setTimeout(() => {
          if (!hasStarted) {
            // Assume it started if process is still running after timeout
            if (this.serviceProcess && !this.serviceProcess.killed) {
              hasStarted = true;
              this.restartAttempts = 0;
              this.startHealthCheck();
              this.emit('started');
              log.info('Service assumed started (timeout reached, process still running)');
              resolve();
            } else {
              reject(new Error('Service startup timeout'));
            }
          }
        }, 10000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the linera service process
   */
  async stop(): Promise<void> {
    this.isShuttingDown = true;
    this.stopHealthCheck();

    const proc = this.serviceProcess;
    if (!proc) {
      log.info('Service is not running');
      return;
    }

    return new Promise((resolve) => {
      log.info('Stopping service...');

      const forceKillTimeout = setTimeout(() => {
        if (!proc.killed) {
          log.warn('Force killing service (SIGKILL)');
          proc.kill('SIGKILL');
        }
      }, 5000);

      proc.once('exit', () => {
        clearTimeout(forceKillTimeout);
        this.serviceProcess = null;
        log.info('Service stopped');
        resolve();
      });

      proc.kill('SIGTERM');
    });
  }

  /**
   * Check if the service process is running
   */
  isRunning(): boolean {
    return this.serviceProcess !== null && !this.serviceProcess.killed;
  }

  /**
   * Get status information about the service
   */
  getStatus(): { running: boolean; port: number; applicationId: string; chainId: string } {
    return {
      running: this.isRunning(),
      port: this.config.port,
      applicationId: this.config.applicationId,
      chainId: this.config.chainId,
    };
  }

  /**
   * Restart the service
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  // ==========================================================================
  // Health Check
  // ==========================================================================

  private startHealthCheck(): void {
    this.stopHealthCheck();

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        log.warn('Health check failed:', (error as Error).message);
        this.emit('unhealthy', error);
      }
    }, this.config.healthCheckIntervalMs);
  }

  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async healthCheck(): Promise<void> {
    // Simple introspection query to check if GraphQL is responsive
    await this.query(`{ __typename }`);
  }

  // ==========================================================================
  // Restart Handling
  // ==========================================================================

  private async handleUnexpectedExit(): Promise<void> {
    this.serviceProcess = null;

    if (this.restartAttempts >= this.config.maxRestartAttempts) {
      log.error(`Max restart attempts (${this.config.maxRestartAttempts}) reached. Giving up.`);
      this.emit('maxRestartsReached');
      return;
    }

    this.restartAttempts++;
    const delay = this.config.restartDelayMs * this.restartAttempts; // Exponential backoff

    log.info(`Restarting service in ${delay}ms (attempt ${this.restartAttempts}/${this.config.maxRestartAttempts})...`);

    setTimeout(async () => {
      try {
        await this.start();
        this.emit('restarted', { attempt: this.restartAttempts });
      } catch (error) {
        log.error('Restart failed:', (error as Error).message);
        this.handleUnexpectedExit();
      }
    }, delay);
  }

  // ==========================================================================
  // GraphQL Helper
  // ==========================================================================

  /**
   * Execute a GraphQL query or mutation
   */
  private async query<T = unknown>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    if (!this.isRunning()) {
      throw new Error('Linera service is not running');
    }

    const endpoint = this.config.applicationId
      ? `${this.graphqlEndpoint}/chains/${this.config.chainId}/applications/${this.config.applicationId}`
      : this.graphqlEndpoint;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e) => e.message).join(', ');
        throw new Error(`GraphQL error: ${errorMessages}`);
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof Error) {
        log.error('GraphQL query failed:', error.message);
        throw error;
      }
      throw new Error('Unknown error during GraphQL query');
    }
  }

  // ==========================================================================
  // Wallet Operations
  // ==========================================================================

  /**
   * Get the balance for a chain
   */
  async getBalance(chainId: string): Promise<Balance> {
    // Query the chain's balance via the service's system API
    const systemEndpoint = `${this.graphqlEndpoint}/chains/${chainId}`;

    try {
      const response = await fetch(systemEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query {
              chain {
                balance
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as GraphQLResponse<{ chain: { balance: string } }>;

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join(', ')}`);
      }

      const balance = result.data?.chain?.balance || '0';

      return {
        available: balance,
        locked: '0', // Linera doesn't have a locked balance concept by default
      };
    } catch (error) {
      log.error('Failed to get balance:', (error as Error).message);
      throw error;
    }
  }

  // ==========================================================================
  // Game Operations
  // ==========================================================================

  /**
   * Create a new game with a stake and room code
   * @returns The game ID
   */
  async createGame(stake: string, roomCode: string): Promise<string> {
    // Mock mode - store in memory
    if (this.mockMode) {
      const gameId = roomCode; // Use roomCode as ID in mock mode
      const game: Game = {
        id: gameId,
        creator: 'mock-player',
        opponent: null,
        stake,
        roomCode,
        status: 'waiting',
        winner: null,
        player1Score: 0,
        player2Score: 0,
        createdAt: new Date(),
      };
      this.mockGames.set(gameId, game);
      log.info(`[MOCK] Game created with ID: ${gameId}`);
      return gameId;
    }

    this.validateConfig();

    // Get the next game ID before creating (this will be our new game's ID)
    const nextIdData = await this.query<{ nextGameId: string }>(`
      query { nextGameId }
    `);
    const gameId = nextIdData.nextGameId;

    // Schedule the create game operation
    await this.query(`
      mutation CreateGame($stake: String!, $roomCode: String!) {
        createGame(stake: $stake, roomCode: $roomCode)
      }
    `, { stake, roomCode });

    log.info(`Game created with ID: ${gameId}`);
    return gameId;
  }

  /**
   * Join an existing game by gameId or roomCode
   * @param gameIdOrRoomCode - Either the numeric gameId or the roomCode (e.g., "GQED-DJNP")
   */
  async joinGame(gameIdOrRoomCode: string): Promise<{ gameId: string; game: Game }> {
    // Mock mode
    if (this.mockMode) {
      const game = this.mockGames.get(gameIdOrRoomCode);
      if (!game) {
        throw new Error('Game not found');
      }
      if (game.status !== 'waiting') {
        throw new Error('Game is not available to join');
      }
      game.opponent = 'mock-opponent';
      game.status = 'active';
      log.info(`[MOCK] Joined game: ${gameIdOrRoomCode}`);
      return { gameId: game.id, game };
    }

    this.validateConfig();

    // First, find the game by roomCode in open games
    const openGames = await this.getOpenGames();
    let actualGameId = gameIdOrRoomCode;
    let foundGame = openGames.find(g => g.id === gameIdOrRoomCode);

    // If not found by ID, try by roomCode
    if (!foundGame) {
      foundGame = openGames.find(g => g.roomCode === gameIdOrRoomCode);
      if (foundGame) {
        actualGameId = foundGame.id;
        log.info(`Found game by roomCode ${gameIdOrRoomCode} -> gameId ${actualGameId}`);
      }
    }

    if (!foundGame) {
      throw new Error(`Game not found with ID or code: ${gameIdOrRoomCode}`);
    }

    await this.query(`
      mutation JoinGame($gameId: String!) {
        joinGame(gameId: $gameId)
      }
    `, { gameId: actualGameId });

    log.info(`Joined game: ${actualGameId}`);

    // Return the actual gameId and game info
    return { gameId: actualGameId, game: foundGame };
  }

  /**
   * Get all open games (waiting for opponent)
   */
  async getOpenGames(): Promise<Game[]> {
    // Mock mode
    if (this.mockMode) {
      const openGames = Array.from(this.mockGames.values()).filter(
        (g) => g.status === 'waiting'
      );
      log.info(`[MOCK] Found ${openGames.length} open games`);
      return openGames;
    }

    this.validateConfig();

    const data = await this.query<{ openGames: RawGame[] }>(`
      query GetOpenGames {
        openGames {
          id
          creator
          opponent
          stake
          roomCode
          status
          winner
          player1Score
          player2Score
          createdAt
        }
      }
    `);

    return (data.openGames || []).map(this.mapRawGameToGame);
  }

  /**
   * Get a specific game by ID
   */
  async getGame(gameId: string): Promise<Game | null> {
    // Mock mode
    if (this.mockMode) {
      const game = this.mockGames.get(gameId) || null;
      log.info(`[MOCK] Get game ${gameId}: ${game ? 'found' : 'not found'}`);
      return game;
    }

    this.validateConfig();

    const data = await this.query<{ game: RawGame | null }>(`
      query GetGame($gameId: String!) {
        game(id: $gameId) {
          id
          creator
          opponent
          stake
          roomCode
          status
          winner
          player1Score
          player2Score
          createdAt
        }
      }
    `, { gameId });

    if (!data.game) {
      return null;
    }

    return this.mapRawGameToGame(data.game);
  }

  /**
   * Submit the result of a completed game
   */
  async submitResult(gameId: string, p1Score: number, p2Score: number): Promise<void> {
    // Mock mode
    if (this.mockMode) {
      const game = this.mockGames.get(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      game.player1Score = p1Score;
      game.player2Score = p2Score;
      game.status = 'completed';
      game.winner = p1Score > p2Score ? game.creator : (game.opponent || 'unknown');
      log.info(`[MOCK] Result submitted for game ${gameId}: P1=${p1Score}, P2=${p2Score}`);
      return;
    }

    this.validateConfig();

    await this.query(`
      mutation SubmitResult($gameId: String!, $p1Score: Int!, $p2Score: Int!) {
        submitResult(gameId: $gameId, player1Score: $p1Score, player2Score: $p2Score)
      }
    `, { gameId, p1Score, p2Score });

    log.info(`Result submitted for game ${gameId}: P1=${p1Score}, P2=${p2Score}`);
  }

  /**
   * Cancel a game (only by creator, only while waiting)
   */
  async cancelGame(gameId: string): Promise<void> {
    // Mock mode
    if (this.mockMode) {
      const game = this.mockGames.get(gameId);
      if (!game) {
        throw new Error('Game not found');
      }
      game.status = 'cancelled';
      log.info(`[MOCK] Game cancelled: ${gameId}`);
      return;
    }

    this.validateConfig();

    await this.query(`
      mutation CancelGame($gameId: String!) {
        cancelGame(gameId: $gameId)
      }
    `, { gameId });

    log.info(`Game cancelled: ${gameId}`);
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private validateConfig(): void {
    if (!this.config.applicationId) {
      throw new Error('LINERA_APPLICATION_ID is required for game operations');
    }
    if (!this.config.chainId) {
      throw new Error('LINERA_CHAIN_ID is required for game operations');
    }
  }

  private mapRawGameToGame(raw: RawGame): Game {
    return {
      id: raw.id,
      creator: raw.creator,
      opponent: raw.opponent || null,
      stake: raw.stake,
      roomCode: raw.roomCode,
      status: raw.status as Game['status'],
      winner: raw.winner || null,
      player1Score: raw.player1Score ?? 0,
      player2Score: raw.player2Score ?? 0,
      createdAt: new Date(raw.createdAt),
    };
  }

  /**
   * Get the GraphQL endpoint URL
   */
  getEndpoint(): string {
    return this.graphqlEndpoint;
  }

  /**
   * Get the application-specific GraphQL endpoint URL
   */
  getApplicationEndpoint(): string {
    if (!this.config.applicationId || !this.config.chainId) {
      return this.graphqlEndpoint;
    }
    return `${this.graphqlEndpoint}/chains/${this.config.chainId}/applications/${this.config.applicationId}`;
  }
}

// ============================================================================
// Helper Types for GraphQL Response Mapping
// ============================================================================

interface RawGame {
  id: string;
  creator: string;
  opponent?: string | null;
  stake: string;
  roomCode: string;
  status: string;
  winner?: string | null;
  player1Score?: number;
  player2Score?: number;
  createdAt: string;
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const lineraService = new LineraService();

// Handle process termination
process.on('SIGTERM', async () => {
  log.info('Received SIGTERM, stopping linera service...');
  await lineraService.stop();
});

process.on('SIGINT', async () => {
  log.info('Received SIGINT, stopping linera service...');
  await lineraService.stop();
});

export default lineraService;
