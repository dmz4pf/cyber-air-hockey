'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * RETRO PIXEL DESIGN
 * - Game Boy / NES inspired layout
 * - Chunky pixel art everything
 * - Lives system with heart icons
 * - Animated pixel explosions
 * - CRT TV frame with knobs
 * - High score tracking
 * - Blinking "INSERT COIN" text
 * - Sound bar visualizer
 */

export default function RetroPixelPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [blinkState, setBlinkState] = useState(true);
  const [explosions, setExplosions] = useState<{ x: number; y: number; frame: number }[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [soundBars, setSoundBars] = useState([3, 5, 2, 7, 4, 6, 3, 5]);

  const status = useGameStore((state) => state.status);
  const mode = useGameStore((state) => state.mode);
  const scores = useGameStore((state) => state.scores);
  const countdown = useGameStore((state) => state.countdown);
  const winner = useGameStore((state) => state.winner);
  const difficulty = useGameStore((state) => state.difficulty);
  const setMode = useGameStore((state) => state.setMode);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const startGame = useGameStore((state) => state.startGame);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const setCountdown = useGameStore((state) => state.setCountdown);

  const { movePaddle, getBodies } = useGameEngine();

  // Blink animation for text
  useEffect(() => {
    const interval = setInterval(() => setBlinkState((b) => !b), 500);
    return () => clearInterval(interval);
  }, []);

  // Sound bar animation
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setSoundBars(bars => bars.map(() => Math.floor(Math.random() * 8) + 1));
    }, 100);
    return () => clearInterval(interval);
  }, [status]);

  // Update high score
  useEffect(() => {
    const max = Math.max(scores.player1, scores.player2);
    if (max > highScore) setHighScore(max);
  }, [scores, highScore]);

  // Countdown timer
  useEffect(() => {
    if (status !== 'countdown') return;
    const timer = setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [status, countdown, setCountdown]);

  // Player input
  const handlePlayer1Move = useCallback(
    (x: number, y: number) => movePaddle('player1', x, y),
    [movePaddle]
  );

  usePlayerInput({
    canvasRef: { current: canvasRef.current },
    onMove: handlePlayer1Move,
    enabled: status === 'playing',
  });

  // AI opponent
  const handleAIMove = useCallback(
    (x: number, y: number) => movePaddle('player2', x, y),
    [movePaddle]
  );

  const getPuck = useCallback(() => getBodies()?.puck ?? null, [getBodies]);

  useAIOpponent({
    enabled: mode === 'ai' && status === 'playing',
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Pixel-perfect canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Disable smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

    // Dark green CRT background
    ctx.fillStyle = '#0f380f';
    ctx.fillRect(0, 0, table.width, table.height);

    // Grid pattern
    ctx.strokeStyle = '#1a4a1a';
    ctx.lineWidth = 2;
    for (let x = 0; x < table.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, table.height);
      ctx.stroke();
    }
    for (let y = 0; y < table.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(table.width, y);
      ctx.stroke();
    }

    // Goal zones - pixelated rectangles
    const goalWidth = table.goalWidth;
    const goalX = (table.width - goalWidth) / 2;

    // Top goal (red)
    ctx.fillStyle = '#9b2335';
    ctx.fillRect(goalX, 0, goalWidth, 24);
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 4;
    ctx.strokeRect(goalX, 0, goalWidth, 24);

    // Bottom goal (green)
    ctx.fillStyle = '#306230';
    ctx.fillRect(goalX, table.height - 24, goalWidth, 24);
    ctx.strokeStyle = '#00ff00';
    ctx.strokeRect(goalX, table.height - 24, goalWidth, 24);

    // Center line - chunky dashes
    ctx.fillStyle = '#8bac0f';
    for (let x = 20; x < table.width - 20; x += 24) {
      ctx.fillRect(x, table.height / 2 - 2, 16, 4);
    }

    // Center circle - pixelated
    ctx.strokeStyle = '#8bac0f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Border - thick pixelated
    ctx.strokeStyle = '#9bbc0f';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, table.width - 6, table.height - 6);

    const bodies = getBodies();
    if (!bodies) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const { puck, paddle1, paddle2 } = bodies;

    // Puck - yellow square (pixel style)
    ctx.fillStyle = '#ffd700';
    const puckSize = puckConfig.radius * 1.6;
    ctx.fillRect(
      puck.position.x - puckSize / 2,
      puck.position.y - puckSize / 2,
      puckSize,
      puckSize
    );
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      puck.position.x - puckSize / 2,
      puck.position.y - puckSize / 2,
      puckSize,
      puckSize
    );

    // Paddle 2 - red square
    ctx.fillStyle = '#ff0000';
    const paddleSize = paddle.radius * 1.8;
    ctx.fillRect(
      paddle2.position.x - paddleSize / 2,
      paddle2.position.y - paddleSize / 2,
      paddleSize,
      paddleSize
    );
    ctx.fillStyle = '#880000';
    ctx.fillRect(
      paddle2.position.x - paddleSize / 4,
      paddle2.position.y - paddleSize / 4,
      paddleSize / 2,
      paddleSize / 2
    );

    // Paddle 1 - green square
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(
      paddle1.position.x - paddleSize / 2,
      paddle1.position.y - paddleSize / 2,
      paddleSize,
      paddleSize
    );
    ctx.fillStyle = '#008800';
    ctx.fillRect(
      paddle1.position.x - paddleSize / 4,
      paddle1.position.y - paddleSize / 4,
      paddleSize / 2,
      paddleSize / 2
    );

    // Draw explosions
    explosions.forEach((exp) => {
      const size = (8 - exp.frame) * 8;
      ctx.fillStyle = exp.frame % 2 === 0 ? '#ffff00' : '#ff0000';
      ctx.fillRect(exp.x - size / 2, exp.y - size / 2, size, size);
    });

    // Scanlines overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let y = 0; y < table.height; y += 4) {
      ctx.fillRect(0, y, table.width, 2);
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [getBodies, explosions]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // Pixel Text Component
  const PixelText = ({ children, size = 'md', color = '#9bbc0f' }: { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; color?: string }) => {
    const sizes = { sm: '0.5rem', md: '0.75rem', lg: '1rem', xl: '1.5rem' };
    return (
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: sizes[size],
          color,
          textShadow: `2px 2px 0 #0f380f`,
          letterSpacing: '2px',
        }}
      >
        {children}
      </span>
    );
  };

  // Lives display (hearts)
  const Lives = ({ count, max = 7 }: { count: number; max?: number }) => (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '1rem',
            opacity: i < (max - count) ? 0.3 : 1,
            filter: i < (max - count) ? 'grayscale(1)' : 'none',
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );

  // Pixel Button
  const PixelButton = ({ children, onClick, color = '#9bbc0f' }: { children: React.ReactNode; onClick: () => void; color?: string }) => (
    <button
      onClick={onClick}
      className="px-6 py-3 transition-transform active:translate-y-1"
      style={{
        background: color,
        border: `4px solid #0f380f`,
        boxShadow: `4px 4px 0 #0f380f`,
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '0.6rem',
        color: '#0f380f',
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#2a2a2a' }}
    >
      {/* CRT TV Frame */}
      <div
        style={{
          background: '#4a3728',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
          border: '8px solid #3a2718',
        }}
      >
        {/* TV Brand Label */}
        <div className="text-center mb-2">
          <PixelText size="sm" color="#8b7355">PUCK-O-MATIC 3000</PixelText>
        </div>

        {/* Screen Bezel */}
        <div
          style={{
            background: '#1a1a1a',
            borderRadius: '10px',
            padding: '15px',
            border: '4px solid #0a0a0a',
          }}
        >
          {/* HUD Top */}
          <div
            className="flex justify-between items-center mb-2 px-4 py-2"
            style={{ background: '#0f380f', border: '2px solid #9bbc0f' }}
          >
            <div>
              <PixelText size="sm">P1</PixelText>
              <div className="mt-1">
                <Lives count={scores.player1} />
              </div>
            </div>
            <div className="text-center">
              <PixelText size="sm">HI-SCORE</PixelText>
              <div><PixelText size="lg" color="#ffd700">{String(highScore).padStart(3, '0')}</PixelText></div>
            </div>
            <div className="text-right">
              <PixelText size="sm" color="#ff6b6b">{mode === 'ai' ? 'CPU' : 'P2'}</PixelText>
              <div className="mt-1">
                <Lives count={scores.player2} />
              </div>
            </div>
          </div>

          {/* Game Screen */}
          <div className="relative" style={{ border: '4px solid #9bbc0f' }}>
            <canvas
              ref={canvasRef}
              width={PHYSICS_CONFIG.table.width}
              height={PHYSICS_CONFIG.table.height}
              className="cursor-none"
              style={{
                maxWidth: '100%',
                height: 'auto',
                imageRendering: 'pixelated',
              }}
            />

            {/* Menu Screen */}
            {status === 'menu' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: '#0f380f' }}
              >
                <div className="mb-8">
                  <PixelText size="xl" color="#9bbc0f">PUCK MASTERS</PixelText>
                </div>
                <div className="mb-4">
                  <PixelText size="sm" color="#8bac0f">© 1985 RETRO GAMES INC</PixelText>
                </div>
                <div className="mb-8">
                  {blinkState && <PixelText color="#ffd700">PRESS START</PixelText>}
                </div>
                <div className="flex flex-col gap-4">
                  <PixelButton onClick={() => { setMode('ai'); }} color="#9bbc0f">
                    1 PLAYER
                  </PixelButton>
                  <PixelButton onClick={() => { setMode('multiplayer'); startGame(); }} color="#8bac0f">
                    2 PLAYERS
                  </PixelButton>
                </div>
                {mode === 'ai' && (
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <PixelText size="sm">LEVEL SELECT</PixelText>
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((d, i) => (
                        <button
                          key={d}
                          onClick={() => { setDifficulty(d); startGame(); }}
                          className="px-4 py-2"
                          style={{
                            background: ['#00ff00', '#ffff00', '#ff0000'][i],
                            border: '3px solid #0f380f',
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: '0.5rem',
                          }}
                        >
                          {['EASY', 'NORMAL', 'HARD'][i]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Countdown */}
            {status === 'countdown' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(15, 56, 15, 0.9)' }}
              >
                <div className="text-center">
                  <PixelText size="xl" color="#ffd700">
                    {countdown > 0 ? countdown : 'GO!!'}
                  </PixelText>
                </div>
              </div>
            )}

            {/* Paused */}
            {status === 'paused' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(15, 56, 15, 0.95)' }}
              >
                <div className="mb-8">
                  {blinkState && <PixelText size="lg" color="#ffd700">PAUSED</PixelText>}
                </div>
                <div className="flex flex-col gap-3">
                  <PixelButton onClick={resumeGame}>CONTINUE</PixelButton>
                  <PixelButton onClick={resetGame} color="#ff6b6b">QUIT</PixelButton>
                </div>
              </div>
            )}

            {/* Game Over */}
            {status === 'gameover' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(15, 56, 15, 0.95)' }}
              >
                <div className="mb-4">
                  <PixelText size="lg" color={winner === 'player1' ? '#00ff00' : '#ff0000'}>
                    {winner === 'player1' ? 'YOU WIN!!' : 'GAME OVER'}
                  </PixelText>
                </div>
                <div className="mb-6">
                  <PixelText size="sm">SCORE: {scores.player1} - {scores.player2}</PixelText>
                </div>
                <div className="flex flex-col gap-3">
                  <PixelButton onClick={() => startGame()} color="#ffd700">RETRY</PixelButton>
                  <PixelButton onClick={resetGame}>MENU</PixelButton>
                </div>
              </div>
            )}
          </div>

          {/* Sound Bars */}
          <div className="flex justify-center gap-1 mt-2 h-4">
            {soundBars.map((height, i) => (
              <div
                key={i}
                className="w-2 transition-all duration-100"
                style={{
                  height: `${height * 2}px`,
                  background: '#9bbc0f',
                  alignSelf: 'flex-end',
                }}
              />
            ))}
          </div>
        </div>

        {/* TV Controls */}
        <div className="flex justify-between items-center mt-4 px-8">
          {/* Volume Knob */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #5a4a3a 0%, #3a2a1a 100%)',
                border: '2px solid #2a1a0a',
              }}
            />
            <PixelText size="sm" color="#8b7355">VOL</PixelText>
          </div>

          {/* Control buttons */}
          <div className="flex gap-3">
            <button
              onClick={pauseGame}
              disabled={status !== 'playing'}
              className="px-4 py-1"
              style={{
                background: '#3a2a1a',
                border: '2px solid #2a1a0a',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.4rem',
                color: status === 'playing' ? '#9bbc0f' : '#4a3a2a',
              }}
            >
              PAUSE
            </button>
          </div>

          {/* Channel Knob */}
          <div className="flex items-center gap-2">
            <PixelText size="sm" color="#8b7355">CH</PixelText>
            <div
              className="w-8 h-8 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #5a4a3a 0%, #3a2a1a 100%)',
                border: '2px solid #2a1a0a',
              }}
            />
          </div>
        </div>

        {/* Power LED */}
        <div className="flex justify-center mt-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: status !== 'menu' ? '#00ff00' : '#004400',
              boxShadow: status !== 'menu' ? '0 0 10px #00ff00' : 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
