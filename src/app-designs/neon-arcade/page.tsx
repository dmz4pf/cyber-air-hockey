'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * NEON ARCADE DESIGN
 * - Full arcade cabinet frame with wood paneling
 * - CRT monitor with scanlines and curve effect
 * - Animated neon signs around the cabinet
 * - LED segment score displays
 * - Coin slot with insert coin animation
 * - Joystick/button panel visualization
 * - Pulsing glow effects synced to gameplay
 */

interface CanvasRef {
  canvas: HTMLCanvasElement | null;
}

export default function NeonArcadePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [screenFlicker, setScreenFlicker] = useState(false);
  const [coinInserted, setCoinInserted] = useState(false);
  const [neonPhase, setNeonPhase] = useState(0);

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

  // Neon animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setNeonPhase((p) => (p + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Screen flicker effect
  useEffect(() => {
    const flicker = () => {
      if (Math.random() > 0.97) {
        setScreenFlicker(true);
        setTimeout(() => setScreenFlicker(false), 50);
      }
    };
    const interval = setInterval(flicker, 100);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (status !== 'countdown') return;
    const timer = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
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

  const getPuck = useCallback(() => {
    const bodies = getBodies();
    return bodies?.puck ?? null;
  }, [getBodies]);

  useAIOpponent({
    enabled: mode === 'ai' && status === 'playing',
    difficulty,
    onMove: handleAIMove,
    getPuck,
  });

  // Canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

    // CRT phosphor green-tinted black
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, table.width, table.height);

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < table.height; y += 3) {
      ctx.fillRect(0, y, table.width, 1);
    }

    // Neon grid floor effect
    ctx.strokeStyle = '#ff00ff20';
    ctx.lineWidth = 1;
    for (let x = 0; x < table.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, table.height);
      ctx.stroke();
    }
    for (let y = 0; y < table.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(table.width, y);
      ctx.stroke();
    }

    // Goal zones with neon glow
    const goalWidth = table.goalWidth;
    const goalX = (table.width - goalWidth) / 2;

    // Top goal
    const gradient1 = ctx.createLinearGradient(goalX, 0, goalX, 30);
    gradient1.addColorStop(0, '#ff008880');
    gradient1.addColorStop(1, '#ff008800');
    ctx.fillStyle = gradient1;
    ctx.fillRect(goalX, 0, goalWidth, 30);

    // Bottom goal
    const gradient2 = ctx.createLinearGradient(goalX, table.height, goalX, table.height - 30);
    gradient2.addColorStop(0, '#00ff8880');
    gradient2.addColorStop(1, '#00ff8800');
    ctx.fillStyle = gradient2;
    ctx.fillRect(goalX, table.height - 30, goalWidth, 30);

    // Center circle with glow
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center line
    ctx.strokeStyle = '#ff00ff60';
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    ctx.moveTo(0, table.height / 2);
    ctx.lineTo(table.width, table.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Border with intense glow
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 30;
    ctx.strokeRect(2, 2, table.width - 4, table.height - 4);
    ctx.shadowBlur = 0;

    // Get physics bodies
    const bodies = getBodies();
    if (!bodies) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const { puck, paddle1, paddle2 } = bodies;

    // Puck with trail effect
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Paddle 2 (opponent) - magenta neon
    ctx.shadowColor = '#ff0088';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#ff0088';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a0030';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Paddle 1 (player) - cyan neon
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#001a10';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [getBodies]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // LED Segment Display Component
  const LEDScore = ({ score, color }: { score: number; color: string }) => (
    <div
      className="font-mono text-6xl font-bold tracking-wider"
      style={{
        color,
        textShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
        fontFamily: "'Orbitron', monospace",
      }}
    >
      {String(score).padStart(2, '0')}
    </div>
  );

  // Neon Sign Component
  const NeonSign = ({ text, color, delay = 0 }: { text: string; color: string; delay?: number }) => {
    const brightness = Math.sin((neonPhase + delay) * (Math.PI / 180)) * 0.3 + 0.7;
    return (
      <div
        className="text-2xl font-bold uppercase tracking-widest"
        style={{
          color,
          opacity: brightness,
          textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`,
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        {text}
      </div>
    );
  };

  // Coin Slot Animation
  const handleCoinInsert = () => {
    setCoinInserted(true);
    setTimeout(() => {
      if (mode === 'ai') {
        startGame();
      } else {
        setMode('ai');
      }
    }, 500);
    setTimeout(() => setCoinInserted(false), 1000);
  };

  const handleStart = (selectedMode: 'ai' | 'multiplayer') => {
    setMode(selectedMode);
    if (selectedMode === 'multiplayer') {
      startGame();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
      }}
    >
      {/* Arcade Cabinet Frame */}
      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #2a1a1a 0%, #1a0a0a 100%)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 0 60px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)',
          border: '4px solid #3a2a2a',
        }}
      >
        {/* Cabinet Top - Marquee */}
        <div
          className="text-center py-4 mb-4 rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, #ff00ff20 0%, #00000080 100%)',
            border: '2px solid #ff00ff',
            boxShadow: '0 0 30px #ff00ff40',
          }}
        >
          <NeonSign text="★ NEON HOCKEY ★" color="#ffff00" />
          <div className="text-xs mt-1" style={{ color: '#ff00ff' }}>
            INSERT COIN TO PLAY
          </div>
        </div>

        {/* Score Display Panel */}
        <div
          className="flex justify-between items-center px-8 py-4 mb-4"
          style={{
            background: '#000',
            border: '3px solid #333',
            borderRadius: '8px',
          }}
        >
          <div className="text-center">
            <div className="text-xs mb-1" style={{ color: '#ff0088' }}>ENEMY</div>
            <LEDScore score={scores.player2} color="#ff0088" />
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl" style={{ color: '#ffff00' }}>VS</div>
            {status === 'playing' && (
              <div className="text-xs animate-pulse" style={{ color: '#00ff00' }}>● LIVE</div>
            )}
          </div>
          <div className="text-center">
            <div className="text-xs mb-1" style={{ color: '#00ff88' }}>PLAYER</div>
            <LEDScore score={scores.player1} color="#00ff88" />
          </div>
        </div>

        {/* CRT Screen Container */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            border: '8px solid #1a1a1a',
            boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)',
            opacity: screenFlicker ? 0.9 : 1,
          }}
        >
          {/* CRT Curve Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)',
              borderRadius: '10px',
            }}
          />

          {/* Game Canvas */}
          <canvas
            ref={canvasRef}
            width={PHYSICS_CONFIG.table.width}
            height={PHYSICS_CONFIG.table.height}
            className="cursor-none"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
            }}
          />

          {/* Countdown Overlay */}
          {status === 'countdown' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
              <div
                className="text-9xl font-bold animate-pulse"
                style={{
                  color: '#ffff00',
                  textShadow: '0 0 50px #ffff00, 0 0 100px #ffff00',
                  fontFamily: "'Orbitron', monospace",
                }}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </div>
            </div>
          )}

          {/* Menu Overlay */}
          {status === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div
                className="text-4xl font-bold mb-8 animate-pulse"
                style={{
                  color: '#ffff00',
                  textShadow: '0 0 30px #ffff00',
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                SELECT MODE
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleStart('ai')}
                  className="px-8 py-4 text-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: '#ff008840',
                    border: '2px solid #ff0088',
                    color: '#ff0088',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px #ff008840',
                  }}
                >
                  🤖 VS CPU
                </button>
                <button
                  onClick={() => handleStart('multiplayer')}
                  className="px-8 py-4 text-xl font-bold transition-all hover:scale-105"
                  style={{
                    background: '#00ff8840',
                    border: '2px solid #00ff88',
                    color: '#00ff88',
                    borderRadius: '8px',
                    boxShadow: '0 0 20px #00ff8840',
                  }}
                >
                  👥 2 PLAYER
                </button>
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          {status === 'menu' && mode === 'ai' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div
                className="text-3xl font-bold mb-6"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 20px #00ffff',
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                SELECT DIFFICULTY
              </div>
              <div className="flex flex-col gap-3">
                {(['easy', 'medium', 'hard'] as const).map((diff, i) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setDifficulty(diff);
                      startGame();
                    }}
                    className="px-12 py-3 text-lg font-bold transition-all hover:scale-105"
                    style={{
                      background: difficulty === diff ? '#ffff0040' : '#ffffff10',
                      border: `2px solid ${['#00ff00', '#ffff00', '#ff0000'][i]}`,
                      color: ['#00ff00', '#ffff00', '#ff0000'][i],
                      borderRadius: '4px',
                    }}
                  >
                    {diff.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {status === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div
                className="text-5xl font-bold mb-8"
                style={{
                  color: '#ff00ff',
                  textShadow: '0 0 30px #ff00ff',
                  fontFamily: "'Orbitron', sans-serif",
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              >
                PAUSED
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resumeGame}
                  className="px-8 py-3 font-bold"
                  style={{
                    background: '#00ff8840',
                    border: '2px solid #00ff88',
                    color: '#00ff88',
                    borderRadius: '4px',
                  }}
                >
                  RESUME
                </button>
                <button
                  onClick={() => {
                    resetGame();
                  }}
                  className="px-8 py-3 font-bold"
                  style={{
                    background: '#ff008840',
                    border: '2px solid #ff0088',
                    color: '#ff0088',
                    borderRadius: '4px',
                  }}
                >
                  QUIT
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {status === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
              <div
                className="text-5xl font-bold mb-4"
                style={{
                  color: winner === 'player1' ? '#00ff88' : '#ff0088',
                  textShadow: `0 0 40px ${winner === 'player1' ? '#00ff88' : '#ff0088'}`,
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {winner === 'player1' ? 'YOU WIN!' : 'GAME OVER'}
              </div>
              <div className="text-2xl mb-8" style={{ color: '#ffff00' }}>
                {scores.player1} - {scores.player2}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => startGame()}
                  className="px-8 py-3 font-bold animate-pulse"
                  style={{
                    background: '#ffff0040',
                    border: '2px solid #ffff00',
                    color: '#ffff00',
                    borderRadius: '4px',
                  }}
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 font-bold"
                  style={{
                    background: '#ffffff20',
                    border: '2px solid #ffffff',
                    color: '#ffffff',
                    borderRadius: '4px',
                  }}
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div
          className="mt-4 py-4 px-8 flex justify-between items-center"
          style={{
            background: '#0a0a0a',
            border: '3px solid #333',
            borderRadius: '8px',
          }}
        >
          {/* Coin Slot */}
          <button
            onClick={handleCoinInsert}
            className="flex flex-col items-center transition-transform hover:scale-105"
            style={{
              background: coinInserted ? '#ffff0040' : '#1a1a1a',
              border: '2px solid #ffff00',
              borderRadius: '8px',
              padding: '10px 20px',
            }}
          >
            <div className="text-xs" style={{ color: '#ffff00' }}>INSERT</div>
            <div className="text-lg font-bold" style={{ color: '#ffff00' }}>🪙 COIN</div>
          </button>

          {/* Joystick Visual */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #444, #111)',
                border: '3px solid #333',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
              }}
            />
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: '#ff0000',
                  boxShadow: '0 0 10px #ff000080',
                }}
              />
              <div
                className="w-8 h-8 rounded-full"
                style={{
                  background: '#0088ff',
                  boxShadow: '0 0 10px #0088ff80',
                }}
              />
            </div>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseGame}
            disabled={status !== 'playing'}
            className="px-6 py-3 font-bold transition-all"
            style={{
              background: status === 'playing' ? '#ff00ff40' : '#33333340',
              border: '2px solid #ff00ff',
              color: '#ff00ff',
              borderRadius: '4px',
              opacity: status === 'playing' ? 1 : 0.5,
            }}
          >
            PAUSE
          </button>
        </div>

        {/* Cabinet Base */}
        <div
          className="mt-4 text-center text-xs py-2"
          style={{ color: '#666' }}
        >
          © 1985 NEON ARCADE SYSTEMS • MOVE MOUSE TO CONTROL
        </div>
      </div>

      {/* Floating Neon Decorations */}
      <div
        className="fixed top-4 left-4"
        style={{
          transform: `translateY(${Math.sin(neonPhase * 0.05) * 5}px)`,
        }}
      >
        <NeonSign text="★" color="#ff00ff" delay={0} />
      </div>
      <div
        className="fixed top-4 right-4"
        style={{
          transform: `translateY(${Math.sin((neonPhase + 90) * 0.05) * 5}px)`,
        }}
      >
        <NeonSign text="★" color="#00ffff" delay={90} />
      </div>
    </div>
  );
}
