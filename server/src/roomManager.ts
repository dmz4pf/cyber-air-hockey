import type { WebSocket } from 'ws';
import { v4 as uuid } from 'uuid';
import { Room, Player, GAME_CONFIG } from './types';

class RoomManager {
  private rooms = new Map<string, Room>();
  private playerRooms = new Map<string, string>(); // playerId -> roomId

  private generateRoomCode(): string {
    // Generate a short, easy-to-type room code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, I, 1)
    let code = '';
    for (let i = 0; i < GAME_CONFIG.roomCodeLength; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  createRoom(customRoomId?: string, scoreToWin?: number): Room {
    // Use custom room ID if provided and valid, otherwise generate one
    let roomId: string;
    if (customRoomId) {
      const normalizedId = customRoomId.toUpperCase().trim();
      // Check if room already exists
      if (this.rooms.has(normalizedId)) {
        // Generate a new one to avoid conflicts
        roomId = this.generateRoomCode();
      } else {
        roomId = normalizedId;
      }
    } else {
      roomId = this.generateRoomCode();
    }

    const room: Room = {
      id: roomId,
      player1: null,
      player2: null,
      status: 'waiting',
      createdAt: Date.now(),
      scores: { player1: 0, player2: 0 },
      scoreToWin: Math.min(scoreToWin || GAME_CONFIG.defaultScoreToWin, GAME_CONFIG.maxScoreToWin),
    };
    this.rooms.set(room.id, room);
    console.log(`Room created: ${room.id}`);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  joinRoom(
    roomId: string,
    playerId: string,
    ws: WebSocket
  ): { success: boolean; playerNumber?: 1 | 2; error?: string } {
    const normalizedId = roomId.toUpperCase();
    const room = this.rooms.get(normalizedId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.status === 'playing') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.status === 'ended') {
      return { success: false, error: 'Game has ended' };
    }

    if (room.player1 && room.player2) {
      return { success: false, error: 'Room is full' };
    }

    // Check if player is already in a room
    const existingRoom = this.playerRooms.get(playerId);
    if (existingRoom && existingRoom !== normalizedId) {
      return { success: false, error: 'Already in another room' };
    }

    // Create player object
    const player: Player = {
      id: playerId,
      ws,
      playerNumber: room.player1 ? 2 : 1,
      ready: false,
      lastPing: Date.now(),
    };

    // Assign to room slot - NO spreading, direct assignment
    if (!room.player1) {
      room.player1 = player;
    } else {
      room.player2 = player;
    }

    this.playerRooms.set(playerId, normalizedId);
    console.log(`Player ${playerId} joined room ${normalizedId} as player ${player.playerNumber}`);

    return { success: true, playerNumber: player.playerNumber };
  }

  leaveRoom(playerId: string): { room: Room; opponent: Player | null } | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    let opponent: Player | null = null;

    if (room.player1?.id === playerId) {
      opponent = room.player2;
      room.player1 = null;
    } else if (room.player2?.id === playerId) {
      opponent = room.player1;
      room.player2 = null;
    }

    this.playerRooms.delete(playerId);
    console.log(`Player ${playerId} left room ${roomId}`);

    // Delete empty rooms or end game if was playing
    if (!room.player1 && !room.player2) {
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    } else if (room.status === 'playing') {
      room.status = 'ended';
    }

    return { room, opponent };
  }

  getOpponent(playerId: string): Player | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.player1?.id === playerId) return room.player2;
    if (room.player2?.id === playerId) return room.player1;
    return null;
  }

  getPlayer(playerId: string): Player | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.player1?.id === playerId) return room.player1;
    if (room.player2?.id === playerId) return room.player2;
    return null;
  }

  getPlayerRoom(playerId: string): Room | null {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) || null : null;
  }

  setPlayerReady(playerId: string): { bothReady: boolean; room: Room | null } {
    const room = this.getPlayerRoom(playerId);
    if (!room) return { bothReady: false, room: null };

    if (room.player1?.id === playerId) room.player1.ready = true;
    if (room.player2?.id === playerId) room.player2.ready = true;

    // Check if both ready
    const bothReady = !!(room.player1?.ready && room.player2?.ready);
    if (bothReady) {
      room.status = 'playing';
      console.log(`Room ${room.id} game started`);
    }

    return { bothReady, room };
  }

  // Server-authoritative score tracking
  scoreGoal(playerId: string, scorer: 'player1' | 'player2'): {
    success: boolean;
    scores: { player1: number; player2: number };
    gameOver: boolean;
    winner?: 'player1' | 'player2';
  } {
    const room = this.getPlayerRoom(playerId);
    if (!room || room.status !== 'playing') {
      return { success: false, scores: { player1: 0, player2: 0 }, gameOver: false };
    }

    // Only player 1 (host) can report goals
    if (room.player1?.id !== playerId) {
      return { success: false, scores: room.scores, gameOver: false };
    }

    // Update score
    room.scores[scorer]++;
    console.log(`Goal in room ${room.id}: ${scorer} scores. Score: ${room.scores.player1}-${room.scores.player2}`);

    // Check for game over
    const gameOver = room.scores[scorer] >= room.scoreToWin;
    if (gameOver) {
      room.status = 'ended';
      console.log(`Game over in room ${room.id}: ${scorer} wins!`);
    }

    return {
      success: true,
      scores: { ...room.scores },
      gameOver,
      winner: gameOver ? scorer : undefined,
    };
  }

  updatePing(playerId: string): void {
    const player = this.getPlayer(playerId);
    if (player) {
      player.lastPing = Date.now();
    }
  }

  // Cleanup old/stale rooms
  cleanup(): { roomsCleaned: number; playersDisconnected: string[] } {
    const now = Date.now();
    let roomsCleaned = 0;
    const playersDisconnected: string[] = [];

    for (const [id, room] of this.rooms) {
      // Remove old waiting/ended rooms
      if (
        (room.status === 'waiting' || room.status === 'ended') &&
        now - room.createdAt > GAME_CONFIG.maxRoomAgeMs
      ) {
        // Clean up player mappings
        if (room.player1) {
          this.playerRooms.delete(room.player1.id);
          playersDisconnected.push(room.player1.id);
        }
        if (room.player2) {
          this.playerRooms.delete(room.player2.id);
          playersDisconnected.push(room.player2.id);
        }
        this.rooms.delete(id);
        roomsCleaned++;
      }

      // Check for stale players (no ping response)
      if (room.status === 'playing') {
        const checkPlayer = (player: Player | null, otherPlayer: Player | null) => {
          if (player && now - player.lastPing > GAME_CONFIG.pingTimeoutMs) {
            console.log(`Player ${player.id} timed out in room ${id}`);
            playersDisconnected.push(player.id);
            return true;
          }
          return false;
        };

        if (checkPlayer(room.player1, room.player2)) {
          room.player1 = null;
          room.status = 'ended';
        }
        if (checkPlayer(room.player2, room.player1)) {
          room.player2 = null;
          room.status = 'ended';
        }
      }
    }

    if (roomsCleaned > 0) {
      console.log(`Cleanup: ${roomsCleaned} rooms removed`);
    }

    return { roomsCleaned, playersDisconnected };
  }

  // Get stats for monitoring
  getStats(): { rooms: number; players: number; playing: number } {
    let playing = 0;
    for (const room of this.rooms.values()) {
      if (room.status === 'playing') playing++;
    }
    return {
      rooms: this.rooms.size,
      players: this.playerRooms.size,
      playing,
    };
  }
}

export const roomManager = new RoomManager();
