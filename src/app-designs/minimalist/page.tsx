'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * MINIMALIST PRO DESIGN
 * - Clean white background with subtle gradients
 * - Floating glass-morphism cards
 * - Elegant serif typography
 * - Smooth micro-animations
 * - Apple-inspired design language
 * - Subtle shadows, no harsh effects
 * - Tournament/professional aesthetic
 */

export default function MinimalistPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

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

  // Time counter for game
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Reset time on new game
  useEffect(() => {
    if (status === 'countdown') setTime(0);
  }, [status]);

  // Parallax mouse effect
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

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

  // Canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

    // Pure white surface
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, table.width, table.height);

    // Subtle paper texture
    ctx.fillStyle = '#f8f8f8';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * table.width;
      const y = Math.random() * table.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // Goal zones - subtle colored
    const goalWidth = table.goalWidth;
    const goalX = (table.width - goalWidth) / 2;

    ctx.fillStyle = '#fee2e2';
    ctx.fillRect(goalX, 0, goalWidth, 20);
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.strokeRect(goalX, 0, goalWidth, 20);

    ctx.fillStyle = '#dcfce7';
    ctx.fillRect(goalX, table.height - 20, goalWidth, 20);
    ctx.strokeStyle = '#86efac';
    ctx.strokeRect(goalX, table.height - 20, goalWidth, 20);

    // Center line - subtle
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(30, table.height / 2);
    ctx.lineTo(table.width - 30, table.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Border - thin elegant
    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, table.width - 2, table.height - 2);

    const bodies = getBodies();
    if (!bodies) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const { puck, paddle1, paddle2 } = bodies;

    // Puck - dark with subtle shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Paddle 2 - subtle gray
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#737373';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a3a3a3';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Paddle 1 - dark
    ctx.fillStyle = '#262626';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#525252';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [getBodies]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Glass Card Component
  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`backdrop-blur-xl rounded-2xl ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transform: `translate(${mousePos.x * 0.1}px, ${mousePos.y * 0.1}px)`,
        transition: 'transform 0.3s ease-out',
      }}
    >
      {children}
    </div>
  );

  // Elegant Button Component
  const Button = ({
    children,
    onClick,
    variant = 'primary',
    disabled = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: variant === 'primary' ? '#262626' : 'transparent',
        color: variant === 'primary' ? '#ffffff' : '#262626',
        border: variant === 'primary' ? 'none' : '1.5px solid #d4d4d4',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{
        background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
      }}
    >
      {/* Floating background circles */}
      <div
        className="fixed w-96 h-96 rounded-full opacity-30 -top-48 -right-48"
        style={{
          background: 'radial-gradient(circle, #e0f2fe 0%, transparent 70%)',
          transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
        }}
      />
      <div
        className="fixed w-96 h-96 rounded-full opacity-30 -bottom-48 -left-48"
        style={{
          background: 'radial-gradient(circle, #fce7f3 0%, transparent 70%)',
          transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
        }}
      />

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <h1
          className="text-4xl font-light tracking-tight mb-2"
          style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
        >
          Air Hockey
        </h1>
        <p className="text-sm" style={{ color: '#737373' }}>
          Tournament Edition
        </p>
      </div>

      {/* Score Panel */}
      <GlassCard className="px-12 py-6 mb-6 flex items-center gap-12">
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#737373' }}>
            {mode === 'ai' ? 'Computer' : 'Player 2'}
          </div>
          <div
            className="text-5xl font-light tabular-nums"
            style={{ color: '#737373', fontFamily: 'Georgia, serif' }}
          >
            {scores.player2}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-light" style={{ color: '#d4d4d4' }}>—</div>
          <div className="text-xs mt-2" style={{ color: '#a3a3a3' }}>
            {formatTime(time)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: '#262626' }}>
            You
          </div>
          <div
            className="text-5xl font-light tabular-nums"
            style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
          >
            {scores.player1}
          </div>
        </div>
      </GlassCard>

      {/* Game Container */}
      <div className="relative z-10">
        <GlassCard className="p-4">
          <canvas
            ref={canvasRef}
            width={PHYSICS_CONFIG.table.width}
            height={PHYSICS_CONFIG.table.height}
            className="cursor-none rounded-lg"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />

          {/* Menu Overlay */}
          {status === 'menu' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: 'rgba(250, 250, 250, 0.95)' }}
            >
              <h2
                className="text-3xl font-light mb-8"
                style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
              >
                Choose your game
              </h2>
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setMode('ai');
                  }}
                  className="px-10 py-6 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: mode === 'ai' ? '#262626' : '#f5f5f5',
                    color: mode === 'ai' ? '#ffffff' : '#262626',
                  }}
                >
                  <div className="text-3xl mb-2">○</div>
                  <div className="font-medium">vs Computer</div>
                </button>
                <button
                  onClick={() => {
                    setMode('multiplayer');
                    startGame();
                  }}
                  className="px-10 py-6 rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: '#f5f5f5',
                    color: '#262626',
                  }}
                >
                  <div className="text-3xl mb-2">○○</div>
                  <div className="font-medium">Two Players</div>
                </button>
              </div>
              {mode === 'ai' && (
                <div className="flex flex-col items-center">
                  <p className="text-sm mb-4" style={{ color: '#737373' }}>
                    Difficulty
                  </p>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className="px-6 py-2 rounded-full text-sm capitalize transition-all"
                        style={{
                          background: difficulty === d ? '#262626' : 'transparent',
                          color: difficulty === d ? '#ffffff' : '#737373',
                          border: '1px solid #e5e5e5',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button onClick={() => startGame()}>
                      Start Game
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Countdown */}
          {status === 'countdown' && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-lg"
              style={{ background: 'rgba(250, 250, 250, 0.9)' }}
            >
              <div
                className="text-8xl font-light"
                style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
              >
                {countdown > 0 ? countdown : 'Go'}
              </div>
            </div>
          )}

          {/* Paused */}
          {status === 'paused' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: 'rgba(250, 250, 250, 0.95)' }}
            >
              <h2
                className="text-3xl font-light mb-8"
                style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
              >
                Paused
              </h2>
              <div className="flex gap-4">
                <Button onClick={resumeGame}>Resume</Button>
                <Button onClick={resetGame} variant="secondary">
                  Quit
                </Button>
              </div>
            </div>
          )}

          {/* Game Over */}
          {status === 'gameover' && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
              style={{ background: 'rgba(250, 250, 250, 0.95)' }}
            >
              <div className="text-6xl mb-4">{winner === 'player1' ? '●' : '○'}</div>
              <h2
                className="text-3xl font-light mb-2"
                style={{ color: '#262626', fontFamily: 'Georgia, serif' }}
              >
                {winner === 'player1' ? 'Victory' : 'Defeat'}
              </h2>
              <p className="mb-8" style={{ color: '#737373' }}>
                {scores.player1} — {scores.player2}
              </p>
              <div className="flex gap-4">
                <Button onClick={() => startGame()}>Play Again</Button>
                <Button onClick={resetGame} variant="secondary">
                  Menu
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mt-6 relative z-10">
        <button
          onClick={resetGame}
          className="text-sm transition-colors hover:text-gray-900"
          style={{ color: '#a3a3a3' }}
        >
          ← Menu
        </button>
        <div className="text-xs" style={{ color: '#d4d4d4' }}>
          Use mouse or touch to play
        </div>
        <button
          onClick={pauseGame}
          disabled={status !== 'playing'}
          className="text-sm transition-colors hover:text-gray-900"
          style={{ color: status === 'playing' ? '#a3a3a3' : '#e5e5e5' }}
        >
          Pause
        </button>
      </div>
    </div>
  );
}
