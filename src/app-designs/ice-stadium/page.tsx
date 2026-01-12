'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { usePlayerInput } from '@/hooks/usePlayerInput';
import { useAIOpponent } from '@/hooks/useAIOpponent';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * ICE STADIUM DESIGN
 * - ESPN/Sports broadcast style
 * - Live TV overlay with ticker
 * - Period system (3 periods)
 * - Shot clock and stats
 * - Crowd noise indicator
 * - Replay camera angles
 * - Team logos and names
 * - Commentary ticker at bottom
 */

export default function IceStadiumPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [period, setPeriod] = useState(1);
  const [periodTime, setPeriodTime] = useState(180);
  const [shots, setShots] = useState({ home: 0, away: 0 });
  const [crowdMeter, setCrowdMeter] = useState(50);
  const [tickerText, setTickerText] = useState('LIVE: Air Hockey Championship Finals - Home vs Away');
  const [isLive, setIsLive] = useState(true);

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

  // Period timer
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setPeriodTime((t) => {
        if (t <= 0) {
          if (period < 3) {
            setPeriod((p) => p + 1);
            return 180;
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, period]);

  // Crowd meter updates
  useEffect(() => {
    if (status !== 'playing') return;
    const interval = setInterval(() => {
      setCrowdMeter((m) => Math.min(100, Math.max(20, m + (Math.random() - 0.5) * 20)));
    }, 500);
    return () => clearInterval(interval);
  }, [status]);

  // Live indicator blink
  useEffect(() => {
    const interval = setInterval(() => setIsLive((l) => !l), 1000);
    return () => clearInterval(interval);
  }, []);

  // Ticker scroll
  useEffect(() => {
    const messages = [
      'LIVE: Air Hockey Championship Finals',
      `PERIOD ${period} - ${formatTime(periodTime)} remaining`,
      `SCORE: HOME ${scores.player1} - AWAY ${scores.player2}`,
      'Next match: Semi-Finals at 8:00 PM',
    ];
    let index = 0;
    const interval = setInterval(() => {
      setTickerText(messages[index % messages.length]);
      index++;
    }, 5000);
    return () => clearInterval(interval);
  }, [period, periodTime, scores]);

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
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Ice rink canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

    // Ice surface gradient
    const iceGradient = ctx.createLinearGradient(0, 0, 0, table.height);
    iceGradient.addColorStop(0, '#e8f4fc');
    iceGradient.addColorStop(0.5, '#ffffff');
    iceGradient.addColorStop(1, '#e8f4fc');
    ctx.fillStyle = iceGradient;
    ctx.fillRect(0, 0, table.width, table.height);

    // Ice texture scratches
    ctx.strokeStyle = 'rgba(200, 220, 240, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 50; i++) {
      const x1 = Math.random() * table.width;
      const y1 = Math.random() * table.height;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + (Math.random() - 0.5) * 40, y1 + (Math.random() - 0.5) * 40);
      ctx.stroke();
    }

    // Goal creases
    const goalWidth = table.goalWidth;
    const goalX = (table.width - goalWidth) / 2;

    // Top crease (red team)
    ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
    ctx.beginPath();
    ctx.ellipse(table.width / 2, 0, goalWidth / 2 + 20, 40, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bottom crease (blue team)
    ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
    ctx.beginPath();
    ctx.ellipse(table.width / 2, table.height, goalWidth / 2 + 20, 40, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Goal lines
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(goalX - 10, 0, goalWidth + 20, 4);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(goalX - 10, table.height - 4, goalWidth + 20, 4);

    // Center red line
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, table.height / 2 - 3, table.width, 6);

    // Blue lines
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, table.height * 0.3 - 2, table.width, 4);
    ctx.fillRect(0, table.height * 0.7 - 2, table.width, 4);

    // Center circle
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(table.width / 2, table.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Face-off dots
    const dotPositions = [
      { x: 80, y: table.height * 0.2 },
      { x: table.width - 80, y: table.height * 0.2 },
      { x: 80, y: table.height * 0.8 },
      { x: table.width - 80, y: table.height * 0.8 },
    ];
    dotPositions.forEach(({ x, y }) => {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Boards
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, table.width - 8, table.height - 8);

    const bodies = getBodies();
    if (!bodies) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const { puck, paddle1, paddle2 } = bodies;

    // Puck shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(puck.position.x + 3, puck.position.y + 3, puckConfig.radius, puckConfig.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Puck
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Away paddle (red/top)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fee2e2';
    ctx.beginPath();
    ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Home paddle (blue/bottom)
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#dbeafe';
    ctx.beginPath();
    ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [getBodies]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // Stat Box Component
  const StatBox = ({ label, value, color = '#1e3a5f' }: { label: string; value: string | number; color?: string }) => (
    <div className="text-center px-3">
      <div className="text-xs uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</div>
      <div className="text-lg font-bold" style={{ color, fontFamily: "'Bebas Neue', sans-serif" }}>{value}</div>
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0c1929 0%, #1a3a5c 100%)' }}
    >
      {/* Broadcast Header Bar */}
      <div
        className="flex items-center justify-between px-6 py-2"
        style={{ background: 'linear-gradient(90deg, #1e40af 0%, #0c1929 50%, #dc2626 100%)' }}
      >
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-white">LIVE</span>
            </div>
          )}
          <span className="text-white font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            AIR HOCKEY CHAMPIONSHIP
          </span>
        </div>
        <div className="text-white text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex gap-4">
          {/* Left Stats Panel */}
          <div
            className="w-48 rounded-lg p-4 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            {/* Away Team */}
            <div className="text-center pb-4 border-b border-white/20">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ background: '#dc2626' }}>
                <span className="text-2xl">🔴</span>
              </div>
              <div className="text-white font-bold">AWAY</div>
              <div className="text-4xl font-bold" style={{ color: '#fca5a5', fontFamily: "'Bebas Neue', sans-serif" }}>
                {scores.player2}
              </div>
            </div>

            {/* Period Info */}
            <div className="text-center py-4 border-b border-white/20">
              <div className="text-xs text-gray-400 uppercase">Period</div>
              <div className="text-3xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {period}/3
              </div>
              <div className="text-xl text-yellow-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {formatTime(periodTime)}
              </div>
            </div>

            {/* Home Team */}
            <div className="text-center pt-4">
              <div className="text-4xl font-bold" style={{ color: '#93c5fd', fontFamily: "'Bebas Neue', sans-serif" }}>
                {scores.player1}
              </div>
              <div className="text-white font-bold">HOME</div>
              <div className="w-16 h-16 mx-auto mt-2 rounded-full flex items-center justify-center" style={{ background: '#2563eb' }}>
                <span className="text-2xl">🔵</span>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="relative">
            {/* Camera angle indicator */}
            <div
              className="absolute -top-8 left-0 px-3 py-1 text-xs text-white rounded"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              📹 CAM 1 - CENTER ICE
            </div>

            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '4px solid #1e3a5f', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }}
            >
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
                  style={{ background: 'rgba(12, 25, 41, 0.95)' }}
                >
                  <div className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    ICE HOCKEY
                  </div>
                  <div className="text-xl text-gray-400 mb-8">Championship Finals</div>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => { setMode('ai'); }}
                      className="px-8 py-4 rounded-lg font-bold transition-transform hover:scale-105"
                      style={{
                        background: mode === 'ai' ? '#2563eb' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '2px solid #2563eb',
                      }}
                    >
                      VS CPU
                    </button>
                    <button
                      onClick={() => { setMode('multiplayer'); startGame(); }}
                      className="px-8 py-4 rounded-lg font-bold transition-transform hover:scale-105"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '2px solid #94a3b8',
                      }}
                    >
                      2 PLAYER
                    </button>
                  </div>
                  {mode === 'ai' && (
                    <div className="flex gap-2">
                      {(['easy', 'medium', 'hard'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => { setDifficulty(d); startGame(); }}
                          className="px-6 py-2 rounded text-sm capitalize"
                          style={{
                            background: difficulty === d ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                            color: difficulty === d ? '#000' : '#fff',
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
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(12, 25, 41, 0.8)' }}
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">Face-Off</div>
                    <div className="text-9xl font-bold text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {countdown > 0 ? countdown : 'DROP!'}
                    </div>
                  </div>
                </div>
              )}

              {status === 'paused' && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'rgba(12, 25, 41, 0.95)' }}
                >
                  <div className="text-4xl font-bold text-yellow-400 mb-8" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    TIMEOUT
                  </div>
                  <div className="flex gap-4">
                    <button onClick={resumeGame} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg">
                      RESUME
                    </button>
                    <button onClick={resetGame} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg">
                      END GAME
                    </button>
                  </div>
                </div>
              )}

              {status === 'gameover' && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'rgba(12, 25, 41, 0.95)' }}
                >
                  <div className="text-2xl text-gray-400 mb-2">FINAL</div>
                  <div
                    className="text-6xl font-bold mb-4"
                    style={{
                      color: winner === 'player1' ? '#93c5fd' : '#fca5a5',
                      fontFamily: "'Bebas Neue', sans-serif",
                    }}
                  >
                    {winner === 'player1' ? 'HOME WINS!' : 'AWAY WINS!'}
                  </div>
                  <div className="text-3xl text-white mb-8">
                    {scores.player1} - {scores.player2}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => startGame()} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg">
                      REMATCH
                    </button>
                    <button onClick={resetGame} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg">
                      MENU
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Stats Panel */}
          <div
            className="w-48 rounded-lg p-4 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
          >
            <div className="text-white text-center font-bold border-b border-white/20 pb-2">
              GAME STATS
            </div>

            <StatBox label="Shots" value={`${shots.home} - ${shots.away}`} />
            <StatBox label="Mode" value={mode === 'ai' ? difficulty.toUpperCase() : '2P'} color="#fbbf24" />

            {/* Crowd Meter */}
            <div className="mt-4">
              <div className="text-xs text-gray-400 uppercase text-center mb-2">Crowd Energy</div>
              <div className="h-24 bg-black/30 rounded relative overflow-hidden">
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{
                    height: `${crowdMeter}%`,
                    background: `linear-gradient(0deg, #dc2626 0%, #fbbf24 50%, #22c55e 100%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📣 {Math.round(crowdMeter)}%</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <button
              onClick={pauseGame}
              disabled={status !== 'playing'}
              className="mt-auto px-4 py-2 rounded text-sm font-bold"
              style={{
                background: status === 'playing' ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                color: status === 'playing' ? '#000' : '#666',
              }}
            >
              TIMEOUT
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div
        className="py-2 px-4 overflow-hidden"
        style={{ background: '#0c1929', borderTop: '2px solid #1e40af' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold px-2 py-1 bg-red-600 text-white rounded">BREAKING</span>
          <div className="text-white text-sm animate-pulse">{tickerText}</div>
        </div>
      </div>
    </div>
  );
}
