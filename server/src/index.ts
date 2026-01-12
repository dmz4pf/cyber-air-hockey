import { createServer, IncomingMessage, ServerResponse } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuid } from 'uuid';
import { ClientMessage, ServerMessage, RATE_LIMIT, GAME_CONFIG } from './types';
import { roomManager } from './roomManager';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration - update with your Vercel domain after deployment
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add your Vercel domains here after deployment
  // 'https://your-app.vercel.app',
  // 'https://your-custom-domain.com',
];

// In production, you can also set this via environment variable
const EXTRA_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [];
const ALL_ALLOWED_ORIGINS = [...ALLOWED_ORIGINS, ...EXTRA_ORIGINS].filter(Boolean);

// Create HTTP server for health checks and WebSocket upgrade
const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  // CORS headers for HTTP requests
  const origin = req.headers.origin;
  if (origin && (ALL_ALLOWED_ORIGINS.includes(origin) || NODE_ENV === 'development')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint (required for Railway/render)
  if (req.url === '/health' || req.url === '/') {
    const stats = roomManager.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      stats: {
        activeRooms: stats.rooms,
        activePlayers: stats.players,
        gamesInProgress: stats.playing,
      },
    }));
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({
  server,
  maxPayload: 1024, // Limit message size to 1KB
  verifyClient: ({ origin, req }, callback) => {
    // In development, allow all origins
    if (NODE_ENV === 'development') {
      callback(true);
      return;
    }

    // In production, verify origin
    if (!origin || ALL_ALLOWED_ORIGINS.includes(origin)) {
      callback(true);
    } else {
      console.warn(`Rejected connection from origin: ${origin}`);
      callback(false, 403, 'Origin not allowed');
    }
  },
});

// Track player connections and rate limiting
interface PlayerConnection {
  id: string;
  ws: WebSocket;
  messageCount: number;
  lastMessageReset: number;
}

const connections = new Map<WebSocket, PlayerConnection>();

// Send message to a WebSocket
function send(ws: WebSocket, message: ServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

// Rate limiting check
function checkRateLimit(connection: PlayerConnection): boolean {
  const now = Date.now();

  // Reset counter every second
  if (now - connection.lastMessageReset > 1000) {
    connection.messageCount = 0;
    connection.lastMessageReset = now;
  }

  connection.messageCount++;
  return connection.messageCount <= RATE_LIMIT.maxMessagesPerSecond;
}

// Validate message structure
function validateMessage(data: unknown): ClientMessage | null {
  if (!data || typeof data !== 'object') return null;

  const msg = data as Record<string, unknown>;
  if (typeof msg.type !== 'string') return null;

  // Validate specific message types
  switch (msg.type) {
    case 'create-room':
      return {
        type: 'create-room',
        roomId: typeof msg.roomId === 'string' && msg.roomId.length <= 10 ? msg.roomId : undefined,
        scoreToWin: typeof msg.scoreToWin === 'number' ? msg.scoreToWin : undefined,
      };

    case 'join-room':
      if (typeof msg.roomId !== 'string' || msg.roomId.length > 10) return null;
      return { type: 'join-room', roomId: msg.roomId };

    case 'leave-room':
    case 'ready':
    case 'ping':
      return { type: msg.type };

    case 'paddle-move':
      if (typeof msg.x !== 'number' || typeof msg.y !== 'number') return null;
      // Validate coordinates are reasonable (not NaN or Infinity)
      if (!isFinite(msg.x) || !isFinite(msg.y)) return null;
      return { type: 'paddle-move', x: msg.x, y: msg.y };

    case 'puck-state':
      if (
        typeof msg.x !== 'number' || typeof msg.y !== 'number' ||
        typeof msg.vx !== 'number' || typeof msg.vy !== 'number' ||
        typeof msg.seq !== 'number'
      ) return null;
      if (!isFinite(msg.x) || !isFinite(msg.y) || !isFinite(msg.vx) || !isFinite(msg.vy)) return null;
      return { type: 'puck-state', x: msg.x, y: msg.y, vx: msg.vx, vy: msg.vy, seq: msg.seq };

    case 'goal-scored':
      if (msg.scorer !== 'player1' && msg.scorer !== 'player2') return null;
      return { type: 'goal-scored', scorer: msg.scorer };

    default:
      return null;
  }
}

// Handle incoming messages
function handleMessage(connection: PlayerConnection, message: ClientMessage): void {
  const { id: playerId, ws } = connection;

  switch (message.type) {
    case 'create-room': {
      // Check if already in a room
      const existingRoom = roomManager.getPlayerRoom(playerId);
      if (existingRoom) {
        send(ws, { type: 'error', message: 'Already in a room', code: 'ALREADY_IN_ROOM' });
        return;
      }

      const room = roomManager.createRoom(message.roomId, message.scoreToWin);
      const result = roomManager.joinRoom(room.id, playerId, ws);

      if (result.success) {
        send(ws, { type: 'room-created', roomId: room.id });
        send(ws, { type: 'room-joined', roomId: room.id, playerNumber: result.playerNumber! });
      } else {
        send(ws, { type: 'error', message: result.error || 'Failed to create room', code: 'CREATE_FAILED' });
      }
      break;
    }

    case 'join-room': {
      const result = roomManager.joinRoom(message.roomId, playerId, ws);

      if (result.success) {
        send(ws, { type: 'room-joined', roomId: message.roomId.toUpperCase(), playerNumber: result.playerNumber! });

        // Notify opponent
        const opponent = roomManager.getOpponent(playerId);
        if (opponent) {
          send(opponent.ws, { type: 'opponent-joined', opponentId: playerId });
        }
      } else {
        send(ws, { type: 'error', message: result.error || 'Failed to join room', code: 'JOIN_FAILED' });
      }
      break;
    }

    case 'leave-room': {
      handleDisconnect(connection, false);
      break;
    }

    case 'ready': {
      const { bothReady, room } = roomManager.setPlayerReady(playerId);
      const opponent = roomManager.getOpponent(playerId);

      if (opponent) {
        send(opponent.ws, { type: 'opponent-ready' });
      }

      if (bothReady && room?.player1 && room?.player2) {
        send(room.player1.ws, { type: 'game-start', yourNumber: 1 });
        send(room.player2.ws, { type: 'game-start', yourNumber: 2 });
      }
      break;
    }

    case 'paddle-move': {
      const opponent = roomManager.getOpponent(playerId);
      if (opponent) {
        send(opponent.ws, { type: 'opponent-paddle', x: message.x, y: message.y });
      }
      break;
    }

    case 'puck-state': {
      // Only player 1 (host) can send authoritative puck state
      const player = roomManager.getPlayer(playerId);
      if (player?.playerNumber !== 1) break;

      const opponent = roomManager.getOpponent(playerId);
      if (opponent) {
        send(opponent.ws, {
          type: 'puck-update',
          x: message.x,
          y: message.y,
          vx: message.vx,
          vy: message.vy,
          seq: message.seq,
        });
      }
      break;
    }

    case 'goal-scored': {
      // Server validates and tracks score
      const result = roomManager.scoreGoal(playerId, message.scorer);

      if (result.success) {
        const room = roomManager.getPlayerRoom(playerId);
        if (room?.player1 && room?.player2) {
          const goalMsg: ServerMessage = {
            type: 'goal-confirmed',
            scorer: message.scorer,
            scores: result.scores,
          };
          send(room.player1.ws, goalMsg);
          send(room.player2.ws, goalMsg);

          // Send game over if applicable
          if (result.gameOver && result.winner) {
            const gameOverMsg: ServerMessage = {
              type: 'game-over',
              winner: result.winner,
              scores: result.scores,
            };
            send(room.player1.ws, gameOverMsg);
            send(room.player2.ws, gameOverMsg);
          }
        }
      }
      break;
    }

    case 'ping': {
      roomManager.updatePing(playerId);
      send(ws, { type: 'pong', timestamp: Date.now() });
      break;
    }
  }
}

// Handle player disconnect
function handleDisconnect(connection: PlayerConnection, isClose: boolean): void {
  const { id: playerId } = connection;

  const result = roomManager.leaveRoom(playerId);
  if (result?.opponent) {
    send(result.opponent.ws, { type: 'opponent-left' });
  }

  if (isClose) {
    connections.delete(connection.ws);
    console.log(`[${new Date().toISOString()}] Player disconnected: ${playerId}`);
  }
}

// WebSocket server event handlers
wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  const playerId = uuid();
  const connection: PlayerConnection = {
    id: playerId,
    ws,
    messageCount: 0,
    lastMessageReset: Date.now(),
  };

  connections.set(ws, connection);
  console.log(`[${new Date().toISOString()}] Player connected: ${playerId} from ${req.headers.origin || 'unknown'}`);

  // Send connection confirmation with player ID
  send(ws, { type: 'connected', playerId });

  ws.on('message', (data: Buffer) => {
    // Rate limiting
    if (!checkRateLimit(connection)) {
      send(ws, { type: 'error', message: 'Rate limit exceeded', code: 'RATE_LIMITED' });
      return;
    }

    try {
      const parsed = JSON.parse(data.toString());
      const message = validateMessage(parsed);

      if (!message) {
        send(ws, { type: 'error', message: 'Invalid message format', code: 'INVALID_MESSAGE' });
        return;
      }

      handleMessage(connection, message);
    } catch (e) {
      send(ws, { type: 'error', message: 'Failed to parse message', code: 'PARSE_ERROR' });
    }
  });

  ws.on('close', () => {
    handleDisconnect(connection, true);
  });

  ws.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] WebSocket error for ${playerId}:`, err.message);
  });
});

wss.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] WebSocket server error:`, err);
});

// Cleanup interval - run every minute
const cleanupInterval = setInterval(() => {
  const result = roomManager.cleanup();
  if (result.roomsCleaned > 0 || result.playersDisconnected.length > 0) {
    console.log(`[${new Date().toISOString()}] Cleanup: ${result.roomsCleaned} rooms, ${result.playersDisconnected.length} players`);
  }
}, 60000);

// Stats logging interval - every 5 minutes
const statsInterval = setInterval(() => {
  const stats = roomManager.getStats();
  console.log(`[${new Date().toISOString()}] Stats: ${stats.rooms} rooms, ${stats.players} players, ${stats.playing} games`);
}, 300000);

// Graceful shutdown handler
function shutdown(signal: string) {
  console.log(`\n[${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);

  clearInterval(cleanupInterval);
  clearInterval(statsInterval);

  // Close all WebSocket connections
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server shutting down');
    }
  });

  // Close WebSocket server
  wss.close(() => {
    console.log(`[${new Date().toISOString()}] WebSocket server closed`);

    // Close HTTP server
    server.close(() => {
      console.log(`[${new Date().toISOString()}] HTTP server closed`);
      process.exit(0);
    });
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error(`[${new Date().toISOString()}] Forced shutdown after timeout`);
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Air Hockey WebSocket server running`);
  console.log(`  - Environment: ${NODE_ENV}`);
  console.log(`  - Port: ${PORT}`);
  console.log(`  - Health check: http://localhost:${PORT}/health`);
  console.log(`  - WebSocket: ws://localhost:${PORT}`);
  console.log(`  - Rate limit: ${RATE_LIMIT.maxMessagesPerSecond} msg/sec`);
  if (NODE_ENV === 'production') {
    console.log(`  - Allowed origins: ${ALL_ALLOWED_ORIGINS.join(', ') || 'all (via env)'}`);
  }
});
