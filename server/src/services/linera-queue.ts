/**
 * Linera Retry Queue
 *
 * Handles retrying failed game result submissions with exponential backoff.
 * Results are stored in memory and retried periodically.
 */

import lineraService from './linera';

interface PendingResult {
  gameId: string;
  player1Score: number;
  player2Score: number;
  attempts: number;
  lastAttempt: number;
  createdAt: number;
}

class LineraQueue {
  private pendingResults: Map<string, PendingResult> = new Map();
  private retryInterval: NodeJS.Timeout | null = null;
  private maxAttempts = 10;
  private baseDelayMs = 5000; // 5 seconds
  private maxDelayMs = 300000; // 5 minutes
  private maxAgeMs = 3600000; // 1 hour - give up after this

  /**
   * Start the retry processor
   */
  start(): void {
    if (this.retryInterval) {
      return;
    }

    console.log('[LineraQueue] Starting retry processor');

    // Process queue every 10 seconds
    this.retryInterval = setInterval(() => {
      this.processQueue();
    }, 10000);
  }

  /**
   * Stop the retry processor
   */
  stop(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    console.log('[LineraQueue] Stopped retry processor');
  }

  /**
   * Submit a game result - tries immediately, queues on failure
   */
  async submitResult(
    gameId: string,
    player1Score: number,
    player2Score: number
  ): Promise<boolean> {
    try {
      await lineraService.submitResult(gameId, player1Score, player2Score);
      console.log(`[LineraQueue] Successfully submitted result for game ${gameId}`);

      // Remove from pending if it was there
      this.pendingResults.delete(gameId);
      return true;
    } catch (error) {
      console.error(`[LineraQueue] Failed to submit result for game ${gameId}:`, error);

      // Queue for retry
      this.queueResult(gameId, player1Score, player2Score);
      return false;
    }
  }

  /**
   * Queue a result for retry
   */
  private queueResult(gameId: string, player1Score: number, player2Score: number): void {
    const existing = this.pendingResults.get(gameId);

    if (existing) {
      // Update existing entry
      existing.attempts++;
      existing.lastAttempt = Date.now();
      existing.player1Score = player1Score;
      existing.player2Score = player2Score;
    } else {
      // Create new entry
      this.pendingResults.set(gameId, {
        gameId,
        player1Score,
        player2Score,
        attempts: 1,
        lastAttempt: Date.now(),
        createdAt: Date.now(),
      });
    }

    console.log(`[LineraQueue] Queued game ${gameId} for retry (${this.pendingResults.size} pending)`);
  }

  /**
   * Process the retry queue
   */
  private async processQueue(): Promise<void> {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [gameId, result] of this.pendingResults) {
      // Check if too old
      if (now - result.createdAt > this.maxAgeMs) {
        console.error(`[LineraQueue] Giving up on game ${gameId} after ${result.attempts} attempts (too old)`);
        toRemove.push(gameId);
        continue;
      }

      // Check if max attempts reached
      if (result.attempts >= this.maxAttempts) {
        console.error(`[LineraQueue] Giving up on game ${gameId} after ${result.attempts} attempts (max reached)`);
        toRemove.push(gameId);
        continue;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        this.baseDelayMs * Math.pow(2, result.attempts - 1),
        this.maxDelayMs
      );

      // Check if enough time has passed since last attempt
      if (now - result.lastAttempt < delay) {
        continue;
      }

      // Try to submit
      console.log(`[LineraQueue] Retrying game ${gameId} (attempt ${result.attempts + 1})`);

      try {
        await lineraService.submitResult(
          result.gameId,
          result.player1Score,
          result.player2Score
        );
        console.log(`[LineraQueue] Successfully submitted result for game ${gameId} on retry`);
        toRemove.push(gameId);
      } catch (error) {
        result.attempts++;
        result.lastAttempt = now;
        console.error(`[LineraQueue] Retry failed for game ${gameId}:`, error);
      }
    }

    // Remove completed/failed entries
    for (const gameId of toRemove) {
      this.pendingResults.delete(gameId);
    }
  }

  /**
   * Get queue status for monitoring
   */
  getStatus(): { pending: number; results: PendingResult[] } {
    return {
      pending: this.pendingResults.size,
      results: Array.from(this.pendingResults.values()),
    };
  }
}

export const lineraQueue = new LineraQueue();
export default lineraQueue;
