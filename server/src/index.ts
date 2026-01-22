// Load environment variables FIRST, before any other imports that depend on them
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import lineraService from './services/linera';
import lineraQueue from './services/linera-queue';
import { setupWebSocketServer } from './websocket/server';
import { gameServer } from './services/game-server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const LINERA_SERVICE_PORT = process.env.LINERA_SERVICE_PORT
  ? parseInt(process.env.LINERA_SERVICE_PORT)
  : 8081;

// Initialize Express
const app = express()

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  })
);

// ============================================
// Health Check
// ============================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// Linera Service Status
// ============================================

app.get('/api/linera/status', (_req: Request, res: Response) => {
  const status = lineraService.getStatus();
  res.json(status);
});

app.get('/api/linera/queue', (_req: Request, res: Response) => {
  const status = lineraQueue.getStatus();
  res.json(status);
});

// ============================================
// Game Operations
// ============================================

// Create a new game
app.post('/api/games', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stake, roomCode } = req.body;

    if (stake === undefined || !roomCode) {
      res.status(400).json({ error: 'Missing required fields: stake, roomCode' });
      return;
    }

    const gameId = await lineraService.createGame(String(stake), roomCode);
    res.status(201).json({ gameId });
  } catch (error) {
    next(error);
  }
});

// List open games
app.get('/api/games', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await lineraService.getOpenGames();
    res.json(games);
  } catch (error) {
    next(error);
  }
});

// Get game by ID
app.get('/api/games/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    const game = await lineraService.getGame(gameId);

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
});

// Join a game (accepts gameId or roomCode)
app.post('/api/games/:id/join', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameIdOrRoomCode = req.params.id;

    const result = await lineraService.joinGame(gameIdOrRoomCode);
    res.json({ success: true, gameId: result.gameId, game: result.game });
  } catch (error) {
    next(error);
  }
});

// Submit game result
app.post('/api/games/:id/result', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;
    const { player1Score, player2Score } = req.body;

    if (typeof player1Score !== 'number' || typeof player2Score !== 'number') {
      res.status(400).json({ error: 'Missing required fields: player1Score, player2Score' });
      return;
    }

    await lineraService.submitResult(gameId, player1Score, player2Score);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Cancel a game
app.post('/api/games/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gameId = req.params.id;

    await lineraService.cancelGame(gameId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// Balance
// ============================================

app.get('/api/balance/:chainId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chainId } = req.params;

    if (!chainId) {
      res.status(400).json({ error: 'Chain ID is required' });
      return;
    }

    const balance = await lineraService.getBalance(chainId);
    res.json(balance);
  } catch (error) {
    next(error);
  }
});

// ============================================
// Error Handling Middleware
// ============================================

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[Server] Error: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

// ============================================
// Server Startup
// ============================================

async function startServer(): Promise<void> {
  console.log('[Server] Air Hockey API running on port ' + PORT);
  console.log('[Server] Linera service starting...');

  try {
    await lineraService.start();
    console.log('[Server] Linera service ready on port ' + LINERA_SERVICE_PORT);
  } catch (error) {
    console.error('[Server] Failed to start Linera service:', error);
    process.exit(1);
  }

  // Start the Linera queue processor for retry mechanism
  lineraQueue.start();
  console.log('[Server] Linera queue processor started');

  // Create HTTP server from Express app
  const httpServer = createServer(app);

  // Setup WebSocket server on /ws path
  const wss = setupWebSocketServer(httpServer, gameServer);
  console.log('[Server] WebSocket server ready on /ws');

  httpServer.listen(PORT, () => {
    console.log(`[Server] Express + WebSocket server listening on port ${PORT}`);
  });
}

// ============================================
// Graceful Shutdown
// ============================================

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

  // Stop the Linera queue processor
  lineraQueue.stop();
  console.log('[Server] Linera queue processor stopped');

  try {
    await lineraService.stop();
    console.log('[Server] Linera service stopped');
  } catch (error) {
    console.error('[Server] Error stopping Linera service:', error);
  }

  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
startServer();
