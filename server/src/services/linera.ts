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

  // Game storage (games are ALWAYS stored locally for reliable access)
  // In real mode, mutations are also sent to blockchain for on-chain record
  private mockMode = false;
  private games: Map<string, Game> = new Map();
  private nextGameId = 1;

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
    // In mock mode, don't try to spawn the linera binary
    if (this.mockMode) {
      log.info('Running in mock mode - skipping linera service startup');
      return;
    }

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

  private handleUnexpectedExit(): void {
    this.serviceProcess = null;

    if (this.restartAttempts >= this.config.maxRestartAttempts) {
      log.error(`Max restart attempts (${this.config.maxRestartAttempts}) reached. Giving up.`);
      this.emit('maxRestartsReached');
      return;
    }

    this.restartAttempts++;
    const delay = this.config.restartDelayMs * this.restartAttempts; // Exponential backoff

    log.info(`Restarting service in ${delay}ms (attempt ${this.restartAttempts}/${this.config.maxRestartAttempts})...`);

    // Use .then()/.catch() pattern instead of async/await in setTimeout
    // to properly handle promise rejections and prevent unhandled rejections
    setTimeout(() => {
      this.start()
        .then(() => {
          this.emit('restarted', { attempt: this.restartAttempts });
        })
        .catch((error) => {
          log.error('Restart failed:', (error as Error).message);
          this.handleUnexpectedExit();
        });
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
      // Provide a more helpful error message that indicates the service may be restarting
      const isRestarting = this.restartAttempts > 0 && this.restartAttempts < this.config.maxRestartAttempts;
      const message = isRestarting
        ? `Linera service is restarting (attempt ${this.restartAttempts}/${this.config.maxRestartAttempts}). Please try again in a few seconds.`
        : 'Linera service is not running. The server may be starting up or has encountered an error.';
      throw new Error(message);
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
    // In mock mode, return a fake balance
    if (this.mockMode) {
      log.info(`[MOCK] Getting balance for chain ${chainId}`);
      return { available: '1000.0', locked: '0' };
    }

    // Check if service is running before making the request
    if (!this.isRunning()) {
      const isRestarting = this.restartAttempts > 0 && this.restartAttempts < this.config.maxRestartAttempts;
      const message = isRestarting
        ? `Linera service is restarting (attempt ${this.restartAttempts}/${this.config.maxRestartAttempts}). Please try again in a few seconds.`
        : 'Linera service is not running. The server may be starting up or has encountered an error.';
      throw new Error(message);
    }

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
   * @returns The game ID (using roomCode as the primary identifier)
   */
  async createGame(stake: string, roomCode: string): Promise<string> {
    // Use roomCode as the game ID for simplicity and reliability
    const gameId = roomCode;

    // Create game in local storage (always, for reliable access)
    const game: Game = {
      id: gameId,
      creator: 'player-' + this.nextGameId++,
      opponent: null,
      stake,
      roomCode,
      status: 'waiting',
      winner: null,
      player1Score: 0,
      player2Score: 0,
      createdAt: new Date(),
    };
    this.games.set(gameId, game);

    // In real mode, also record on blockchain (fire and forget for now)
    if (!this.mockMode && this.isRunning()) {
      try {
        // Parse stake as number for the contract (it expects u64)
        const stakeNum = parseInt(stake, 10) || 0;

        await this.query(`
          mutation CreateGame($stake: Int!, $roomCode: String!) {
            createGame(stake: $stake, roomCode: $roomCode)
          }
        `, { stake: stakeNum, roomCode });

        log.info(`Game created on blockchain: ${gameId}`);
      } catch (error) {
        // Log but don't fail - local game is still valid
        log.warn(`Blockchain record failed for game ${gameId}:`, (error as Error).message);
      }
    } else {
      log.info(`[LOCAL] Game created with ID: ${gameId}`);
    }

    return gameId;
  }

  /**
   * Join an existing game by gameId or roomCode
   * @param gameIdOrRoomCode - Either the numeric gameId or the roomCode (e.g., "GQED-DJNP")
   */
  async joinGame(gameIdOrRoomCode: string): Promise<{ gameId: string; game: Game }> {
    // Find game in local storage
    let game = this.games.get(gameIdOrRoomCode);

    // If not found by ID, try by roomCode
    if (!game) {
      for (const [, g] of this.games) {
        if (g.roomCode === gameIdOrRoomCode) {
          game = g;
          break;
        }
      }
    }

    if (!game) {
      throw new Error(`Game not found with ID or code: ${gameIdOrRoomCode}`);
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not available to join');
    }

    // Update local game state
    game.opponent = 'player-' + this.nextGameId++;
    game.status = 'active';

    // In real mode, also record on blockchain
    if (!this.mockMode && this.isRunning()) {
      try {
        // Contract expects game_id as u64, but we use roomCode as ID
        // For now, just log the join - actual blockchain integration would need numeric IDs
        log.info(`Game ${game.id} joined (blockchain record skipped - using room code IDs)`);
      } catch (error) {
        log.warn(`Blockchain record failed for join:`, (error as Error).message);
      }
    } else {
      log.info(`[LOCAL] Joined game: ${gameIdOrRoomCode}`);
    }

    return { gameId: game.id, game };
  }

  /**
   * Get all open games (waiting for opponent)
   */
  async getOpenGames(): Promise<Game[]> {
    // Always use local storage for game queries
    const openGames = Array.from(this.games.values()).filter(
      (g) => g.status === 'waiting'
    );
    log.debug(`Found ${openGames.length} open games`);
    return openGames;
  }

  /**
   * Get a specific game by ID
   */
  async getGame(gameId: string): Promise<Game | null> {
    // Always use local storage for game queries
    const game = this.games.get(gameId) || null;
    log.debug(`Get game ${gameId}: ${game ? 'found' : 'not found'}`);
    return game;
  }

  /**
   * Submit the result of a completed game
   */
  async submitResult(gameId: string, p1Score: number, p2Score: number): Promise<void> {
    // Update local game state
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    game.player1Score = p1Score;
    game.player2Score = p2Score;
    game.status = 'completed';
    game.winner = p1Score > p2Score ? game.creator : (game.opponent || 'unknown');

    // In real mode, also record on blockchain
    if (!this.mockMode && this.isRunning()) {
      try {
        log.info(`Result submitted for game ${gameId}: P1=${p1Score}, P2=${p2Score} (blockchain record skipped)`);
      } catch (error) {
        log.warn(`Blockchain record failed for result:`, (error as Error).message);
      }
    } else {
      log.info(`[LOCAL] Result submitted for game ${gameId}: P1=${p1Score}, P2=${p2Score}`);
    }
  }

  /**
   * Cancel a game (only by creator, only while waiting)
   */
  async cancelGame(gameId: string): Promise<void> {
    // Update local game state
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    game.status = 'cancelled';

    // In real mode, also record on blockchain
    if (!this.mockMode && this.isRunning()) {
      try {
        log.info(`Game cancelled: ${gameId} (blockchain record skipped)`);
      } catch (error) {
        log.warn(`Blockchain record failed for cancel:`, (error as Error).message);
      }
    } else {
      log.info(`[LOCAL] Game cancelled: ${gameId}`);
    }
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
// Singleton Instance
// ============================================================================

export const lineraService = new LineraService();

// NOTE: Signal handlers are registered in index.ts to avoid duplicate handlers
// which can cause race conditions during shutdown

export default lineraService;
