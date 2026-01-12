'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * CYBER ESPORTS DESIGN
 * - Futuristic holographic HUD
 * - Rank/ELO display system
 * - Combo counter with multiplier
 * - Real-time stats dashboard
 * - Hexagonal grid background
 * - Glowing particle effects
 * - Match timer with overtime
 * - Win streak indicator
 */

export default function CyberEsportsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [matchTime, setMatchTime] = useState(0);
  const [playerRank, setPlayerRank] = useState({ tier: 'GOLD', division: 'II', elo: 1847 });
  const [winStreak, setWinStreak] = useState(3);
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; life: number }[]>([]);
  const [hudPulse, setHudPulse] = useState(0);

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

  // HUD pulse animation
  useEffect(() => {
    const interval = setInterval(() => setHudPulse((p) => (p + 1) % 100), 50);
    return () => clearInterval(interval);
  }, []);

  // Match timer
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => setMatchTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Reset match time on new game
  useEffect(() => {
    if (status === 'countdown') {
      setMatchTime(0);
      setCombo(0);
    }
  }, [status]);

  // Particle system
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0);

        // Add new particles occasionally
        if (Math.random() > 0.7) {
          updated.push({
            x: Math.random() * PHYSICS_CONFIG.table.width,
            y: Math.random() * PHYSICS_CONFIG.table.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 50,
          });
        }
        return updated.slice(-30);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [status]);

  // Track score changes for combo
  const prevScores = useRef(scores);
  useEffect(() => {
    if (scores.player1 > prevScores.current.player1) {
      setCombo((c) => c + 1);
      setMaxCombo((m) => Math.max(m, combo + 1));
      // Burst of particles on goal
      const newParticles = Array.from({ length: 10 }).map(() => ({
        x: PHYSICS_CONFIG.table.width / 2,
        y: 50,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5,
        life: 30,
      }));
      setParticles((prev) => [...prev, ...newParticles].slice(-50));
    }
    if (scores.player2 > prevScores.current.player2) {
      setCombo(0); // Reset combo on opponent goal
    }
    prevScores.current = scores;
  }, [scores, combo]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Canvas rendering
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

    // Dark background with hex grid
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, table.width, table.height);

    // Animated hex grid
    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 + Math.sin(hudPulse * 0.1) * 0.05})`;
    ctx.lineWidth = 1;
    const hexSize = 30;
    for (let row = 0; row < table.height / hexSize + 1; row++) {
      for (let col = 0; col < table.width / hexSize + 1; col++) {
        const x = col * hexSize * 1.5;
        const y = row * hexSize * 1.732 + (col % 2) * hexSize * 0.866;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = x + hexSize * 0.5 * Math.cos(angle);
          const py = y + hexSize * 0.5 * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Draw particles
    particles.forEach((p) => {
      const alpha = p.life / 50;
      ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Goal zones with gradient
    const goalWidth = table.goalWidth;
    const goalX = (table.width - goalWidth) / 2;

    const grad1 = ctx.createLinearGradient(goalX, 0, goalX, 40);
    grad1.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(goalX, 0, goalWidth, 40);

    const grad2 = ctx.createLinearGradient(goalX, table.height, goalX, table.height - 40);
    grad2.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(goalX, table.height - 40, goalWidth, 40);

    // Center line with glow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 10]);
    ctx.beginPath();
    ctx.moveTo(0, table.height / 2);
    ctx.lineTo(table.width, table.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Border with glow
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 15;
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, table.width - 4, table.height - 4);
    ctx.shadowBlur = 0;

    const bodies = getBodies();
    if (!bodies) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const { puck, paddle1, paddle2 } = bodies;

    // Puck trail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(puck.position.x - puck.velocity.x * 2, puck.position.y - puck.velocity.y * 2, puckConfig.radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Puck with glow
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Opponent paddle (red glow)
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Player paddle (green glow)
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [getBodies, particles, hudPulse]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // HUD Components
  const HUDPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`relative ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        className="absolute top-0 left-0 w-2 h-2"
        style={{ borderTop: '2px solid #8b5cf6', borderLeft: '2px solid #8b5cf6' }}
      />
      <div
        className="absolute top-0 right-0 w-2 h-2"
        style={{ borderTop: '2px solid #8b5cf6', borderRight: '2px solid #8b5cf6' }}
      />
      <div
        className="absolute bottom-0 left-0 w-2 h-2"
        style={{ borderBottom: '2px solid #8b5cf6', borderLeft: '2px solid #8b5cf6' }}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-2"
        style={{ borderBottom: '2px solid #8b5cf6', borderRight: '2px solid #8b5cf6' }}
      />
      {children}
    </div>
  );

  const StatDisplay = ({ label, value, color = '#8b5cf6' }: { label: string; value: string | number; color?: string }) => (
    <div className="text-center">
      <div className="text-xs uppercase tracking-widest text-gray-500">{label}</div>
      <div className="text-lg font-bold" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>{value}</div>
    </div>
  );

  const rankColors: Record<string, string> = {
    BRONZE: '#cd7f32',
    SILVER: '#c0c0c0',
    GOLD: '#ffd700',
    PLATINUM: '#00ffff',
    DIAMOND: '#b9f2ff',
    MASTER: '#ff00ff',
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #050510 0%, #0a0a20 100%)' }}
    >
      {/* Top HUD Bar */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#ef4444',
            }}
          >
            ● LIVE
          </div>
          <span className="text-gray-400 text-sm" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            RANKED MATCH
          </span>
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", color: '#8b5cf6' }}>
          {formatTime(matchTime)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">PING</span>
          <span className="text-green-400 text-sm">24ms</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 gap-6">
        {/* Left Panel - Player Stats */}
        <HUDPanel className="w-56 p-4">
          <div className="text-center mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Your Rank</div>
            <div
              className="text-3xl font-bold"
              style={{ color: rankColors[playerRank.tier], fontFamily: "'Orbitron', sans-serif" }}
            >
              {playerRank.tier} {playerRank.division}
            </div>
            <div className="text-sm text-gray-400">{playerRank.elo} ELO</div>
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500">Win Streak</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(winStreak, 5) }).map((_, i) => (
                  <div key={i} className="w-2 h-4 bg-green-500" style={{ boxShadow: '0 0 5px #22c55e' }} />
                ))}
              </div>
            </div>
            <StatDisplay label="Combo" value={`${combo}x`} color={combo > 2 ? '#fbbf24' : '#8b5cf6'} />
            <StatDisplay label="Max Combo" value={`${maxCombo}x`} />
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <StatDisplay label="Mode" value={mode === 'ai' ? `AI-${difficulty.toUpperCase()}` : 'PVP'} />
          </div>
        </HUDPanel>

        {/* Center - Game Canvas */}
        <div className="relative">
          {/* Score overlay */}
          <div
            className="absolute -top-16 left-0 right-0 flex justify-between items-center px-8"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <div className="text-center">
              <div className="text-xs text-red-400 uppercase">Opponent</div>
              <div className="text-5xl font-bold text-red-500" style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}>
                {scores.player2}
              </div>
            </div>
            <div className="text-2xl text-gray-600">VS</div>
            <div className="text-center">
              <div className="text-xs text-green-400 uppercase">You</div>
              <div className="text-5xl font-bold text-green-500" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
                {scores.player1}
              </div>
            </div>
          </div>

          <HUDPanel className="p-2">
            <canvas
              ref={canvasRef}
              width={PHYSICS_CONFIG.table.width}
              height={PHYSICS_CONFIG.table.height}
              className="cursor-none"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            {/* Overlays */}
            {status === 'menu' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(5, 5, 16, 0.95)' }}
              >
                <div
                  className="text-5xl font-bold mb-2"
                  style={{ color: '#8b5cf6', fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 30px #8b5cf6' }}
                >
                  CYBER PUCK
                </div>
                <div className="text-gray-500 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  RANKED MATCHMAKING
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setMode('ai')}
                    className="px-8 py-4 font-bold transition-all hover:scale-105"
                    style={{
                      background: mode === 'ai' ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                      border: '2px solid #8b5cf6',
                      color: '#8b5cf6',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    VS AI
                  </button>
                  <button
                    onClick={() => { setMode('multiplayer'); startGame(); }}
                    className="px-8 py-4 font-bold transition-all hover:scale-105"
                    style={{
                      background: 'transparent',
                      border: '2px solid #6366f1',
                      color: '#6366f1',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    LOCAL PVP
                  </button>
                </div>

                {mode === 'ai' && (
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => { setDifficulty(d); startGame(); }}
                        className="px-6 py-2 text-sm uppercase"
                        style={{
                          background: difficulty === d ? '#8b5cf6' : 'transparent',
                          border: '1px solid #8b5cf6',
                          color: difficulty === d ? '#000' : '#8b5cf6',
                          fontFamily: "'Orbitron', sans-serif",
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {status === 'countdown' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(5, 5, 16, 0.9)' }}
              >
                <div className="text-gray-400 uppercase tracking-widest mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Match Starting
                </div>
                <div
                  className="text-9xl font-bold"
                  style={{ color: '#8b5cf6', fontFamily: "'Orbitron', sans-serif", textShadow: '0 0 50px #8b5cf6' }}
                >
                  {countdown > 0 ? countdown : 'GO'}
                </div>
              </div>
            )}

            {status === 'paused' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(5, 5, 16, 0.95)' }}
              >
                <div
                  className="text-4xl font-bold mb-8"
                  style={{ color: '#fbbf24', fontFamily: "'Orbitron', sans-serif" }}
                >
                  MATCH PAUSED
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={resumeGame}
                    className="px-8 py-3 font-bold"
                    style={{
                      background: '#22c55e',
                      border: 'none',
                      color: '#000',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    RESUME
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 font-bold"
                    style={{
                      background: 'transparent',
                      border: '2px solid #ef4444',
                      color: '#ef4444',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    FORFEIT
                  </button>
                </div>
              </div>
            )}

            {status === 'gameover' && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(5, 5, 16, 0.95)' }}
              >
                <div
                  className="text-5xl font-bold mb-4"
                  style={{
                    color: winner === 'player1' ? '#22c55e' : '#ef4444',
                    fontFamily: "'Orbitron', sans-serif",
                    textShadow: `0 0 30px ${winner === 'player1' ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  {winner === 'player1' ? 'VICTORY' : 'DEFEAT'}
                </div>
                <div className="text-gray-400 mb-2">
                  {winner === 'player1' ? '+25 ELO' : '-15 ELO'}
                </div>
                <div className="text-2xl text-gray-300 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  {scores.player1} - {scores.player2}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => startGame()}
                    className="px-8 py-3 font-bold"
                    style={{
                      background: '#8b5cf6',
                      border: 'none',
                      color: '#fff',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    REMATCH
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-8 py-3 font-bold"
                    style={{
                      background: 'transparent',
                      border: '2px solid #6366f1',
                      color: '#6366f1',
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    EXIT
                  </button>
                </div>
              </div>
            )}
          </HUDPanel>

          {/* Bottom controls */}
          <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
            <button
              onClick={pauseGame}
              disabled={status !== 'playing'}
              className="px-6 py-2 text-sm uppercase tracking-widest"
              style={{
                background: 'transparent',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: status === 'playing' ? '#8b5cf6' : '#333',
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              [ESC] Pause
            </button>
          </div>
        </div>

        {/* Right Panel - Match Stats */}
        <HUDPanel className="w-56 p-4">
          <div className="text-center mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Match Stats</div>
          </div>

          <div className="space-y-4">
            <StatDisplay label="Goals" value={scores.player1} color="#22c55e" />
            <StatDisplay label="Conceded" value={scores.player2} color="#ef4444" />
            <StatDisplay label="Time" value={formatTime(matchTime)} />
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="text-xs text-gray-500 uppercase text-center mb-2">First to 7</div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: i < scores.player1 ? '#22c55e' : i < scores.player1 + scores.player2 ? '#ef4444' : '#1f2937',
                    boxShadow: i < scores.player1 ? '0 0 5px #22c55e' : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full mt-6 py-2 text-xs uppercase tracking-widest"
            style={{
              background: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            Exit Match
          </button>
        </HUDPanel>
      </div>

      {/* Bottom HUD Bar */}
      <div
        className="flex items-center justify-center gap-8 px-6 py-2 text-xs text-gray-600"
        style={{
          background: 'rgba(99, 102, 241, 0.05)',
          borderTop: '1px solid rgba(99, 102, 241, 0.1)',
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        <span>CYBER PUCK v2.0</span>
        <span>•</span>
        <span>RANKED SEASON 7</span>
        <span>•</span>
        <span>Move mouse to control paddle</span>
      </div>
    </div>
  );
}
