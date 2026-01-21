import { WebSocket } from 'ws';
import { roomManager } from '../websocket/room-manager';
import { PhysicsEngine } from '../physics/engine';
import { PHYSICS_CONFIG } from '../physics/config';
import lineraQueue from './linera-queue';

export class GameServer {
  // State locks to prevent race conditions
  private startingGames: Set<string> = new Set();
  private endingGames: Set<string> = new Set();
  private countdownIntervals: Map<string, NodeJS.Timeout> = new Map();

  async handleJoinRoom(ws: WebSocket, gameId: string, playerId: string): Promise<void> {
    // 1. Check if room exists, if not create it
    let room = roomManager.getRoom(gameId);
    if (!room) {
      room = roomManager.createRoom(gameId);
    }

    // 2. Join the room
    const result = roomManager.joinRoom(gameId, playerId, ws);
    if (!result.success) {
      try {
        ws.send(JSON.stringify({ type: 'error', code: 'JOIN_FAILED', message: result.error }));
      } catch (error) {
        console.error('[GameServer] Failed to send join error:', error);
      }
      return;
    }

    // 3. Send room-joined to this player
    try {
      ws.send(JSON.stringify({ type: 'room-joined', gameId, playerNumber: result.playerNumber }));
    } catch (error) {
      console.error('[GameServer] Failed to send room-joined:', error);
    }

    // 4. If 2 players now, notify both and start countdown
    // Use startingGames lock to prevent race condition with simultaneous joins
    if (room.players.size === 2 && !this.startingGames.has(gameId)) {
      this.startingGames.add(gameId);
      roomManager.broadcast(gameId, { type: 'opponent-joined', opponentId: 'opponent' });
      this.startCountdown(gameId);
    }
  }

  handlePaddleMove(ws: WebSocket, x: number, y: number): void {
    const roomInfo = roomManager.getRoomByWebSocket(ws);
    if (!roomInfo) return;

    const room = roomManager.getRoom(roomInfo.gameId);
    if (!room || !room.physicsEngine) return;

    const player = room.players.get(roomInfo.playerId);
    if (!player) return;

    room.physicsEngine.setPaddleTarget(player.playerNumber, x, y);
  }

  handlePlayerReady(ws: WebSocket, gameId: string): void {
    // Could track ready state if needed
  }

  handleDisconnect(gameId: string, playerId: string): void {
    const room = roomManager.getRoom(gameId);

    if (room) {
      if (room.state === 'playing') {
        // Forfeit - other player wins
        const otherPlayer = Array.from(room.players.entries()).find(([id]) => id !== playerId);
        if (otherPlayer) {
          const winner = otherPlayer[1].playerNumber;
          const state = room.physicsEngine?.getState();
          this.endGame(gameId, winner, state?.score || { player1: 0, player2: 0 });
        }
      } else if (room.state === 'countdown') {
        // Cancel countdown and notify remaining player
        const interval = this.countdownIntervals.get(gameId);
        if (interval) {
          clearInterval(interval);
          this.countdownIntervals.delete(gameId);
        }
        roomManager.setRoomState(gameId, 'waiting');
        this.startingGames.delete(gameId);

        // Notify remaining player that opponent disconnected
        roomManager.broadcast(gameId, {
          type: 'opponent-disconnected'
        });
      }
    }

    roomManager.leaveRoom(gameId, playerId);
  }

  private startCountdown(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    roomManager.setRoomState(gameId, 'countdown');
    let seconds = PHYSICS_CONFIG.game.countdownSeconds;

    // Store interval for cleanup on disconnect
    const countdownInterval = setInterval(() => {
      const currentRoom = roomManager.getRoom(gameId);
      if (!currentRoom || currentRoom.state !== 'countdown') {
        clearInterval(countdownInterval);
        this.countdownIntervals.delete(gameId);
        return;
      }

      roomManager.broadcast(gameId, { type: 'countdown', seconds });
      seconds--;

      if (seconds < 0) {
        clearInterval(countdownInterval);
        this.countdownIntervals.delete(gameId);
        this.startGame(gameId);
      }
    }, 1000);

    this.countdownIntervals.set(gameId, countdownInterval);
  }

  private startGame(gameId: string): void {
    const room = roomManager.getRoom(gameId);
    if (!room) return;

    // Create physics engine
    const physics = new PhysicsEngine();
    room.physicsEngine = physics;

    // Register goal callback
    physics.onGoal((scorer) => {
      const state = physics.getState();
      roomManager.broadcast(gameId, { type: 'goal', scorer, newScore: state.score });

      // Check for game over
      if (state.score.player1 >= PHYSICS_CONFIG.game.maxScore) {
        this.endGame(gameId, 1, state.score);
      } else if (state.score.player2 >= PHYSICS_CONFIG.game.maxScore) {
        this.endGame(gameId, 2, state.score);
      }
    });

    // Start physics
    physics.start();
    roomManager.setRoomState(gameId, 'playing');

    // Start broadcast loop (30Hz)
    const broadcastMs = 1000 / PHYSICS_CONFIG.game.broadcastRate;
    room.broadcastInterval = setInterval(() => {
      const state = physics.getState();
      roomManager.broadcast(gameId, { type: 'state-update', ...state });
    }, broadcastMs);
  }

  private async endGame(gameId: string, winner: 1 | 2, score: { player1: number; player2: number }): Promise<void> {
    // Idempotency check - prevent double execution
    if (this.endingGames.has(gameId)) {
      return;
    }
    this.endingGames.add(gameId);

    const room = roomManager.getRoom(gameId);
    if (!room || room.state === 'ended') {
      this.endingGames.delete(gameId);
      return;
    }

    // Stop physics and broadcast interval
    room.physicsEngine?.stop();
    if (room.broadcastInterval) {
      clearInterval(room.broadcastInterval);
      room.broadcastInterval = null;
    }

    // Clear any countdown interval (safety check)
    const countdownInterval = this.countdownIntervals.get(gameId);
    if (countdownInterval) {
      clearInterval(countdownInterval);
      this.countdownIntervals.delete(gameId);
    }

    roomManager.setRoomState(gameId, 'ended');
    roomManager.broadcast(gameId, { type: 'game-over', winner, finalScore: score });

    // Submit result to Linera (with automatic retry on failure)
    const submitted = await lineraQueue.submitResult(gameId, score.player1, score.player2);
    if (!submitted) {
      console.log(`[GameServer] Result for game ${gameId} queued for retry`);
    }

    // Clean up state locks
    this.endingGames.delete(gameId);
    this.startingGames.delete(gameId);
  }
}

export const gameServer = new GameServer();
