'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { PHYSICS_CONFIG } from '@/lib/physics/config';

/**
 * Minimal interface for bodies that can be rendered.
 * This interface is satisfied by both:
 * - Local physics engine (GameBodies from useGameEngine)
 * - Server-authoritative state (MultiplayerBodies from useMultiplayerGameEngine)
 */
export interface RenderableBodies {
  puck: { position: { x: number; y: number } };
  paddle1: { position: { x: number; y: number } };
  paddle2: { position: { x: number; y: number } };
}

interface GameCanvasProps {
  getBodies: () => RenderableBodies | null;
}

export interface GameCanvasRef {
  canvas: HTMLCanvasElement | null;
}

// Puck trail configuration
const TRAIL_LENGTH = 12; // Number of trail points
const TRAIL_FADE_RATE = 0.85; // How quickly opacity fades (0-1)

// Paddle trail configuration (shorter than puck)
const PADDLE_TRAIL_LENGTH = 6;
const PADDLE_TRAIL_FADE_RATE = 0.75;

// Paddle glow animation
const GLOW_PULSE_SPEED = 0.003; // Speed of pulsing
const GLOW_MIN = 15;
const GLOW_MAX = 30;

// Contact flash duration (ms)
const CONTACT_FLASH_DURATION = 150;

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  function GameCanvas({ getBodies }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    // Store puck position history for trail effect
    const puckTrailRef = useRef<{ x: number; y: number }[]>([]);
    // Store paddle position history for trail effects
    const paddle1TrailRef = useRef<{ x: number; y: number }[]>([]);
    const paddle2TrailRef = useRef<{ x: number; y: number }[]>([]);
    // Track time for pulsing animation
    const timeRef = useRef<number>(0);
    // Track contact flash state
    const paddle1ContactRef = useRef<number>(0); // timestamp of last contact
    const paddle2ContactRef = useRef<number>(0);
    // Track previous puck position to detect new collisions
    const lastPuckPosRef = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
    }));

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const { table, paddle, puck: puckConfig } = PHYSICS_CONFIG;

      // Clear canvas with dark background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, table.width, table.height);

      // Draw goal zones (bright colored areas)
      const goalWidth = table.goalWidth;
      const goalX = (table.width - goalWidth) / 2;

      // Top goal zone (red - AI/Player 2 defends this)
      ctx.fillStyle = '#ff000050';
      ctx.fillRect(goalX, 0, goalWidth, 25);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(goalX, 0, goalWidth, 25);

      // Bottom goal zone (green - Player 1 defends this)
      ctx.fillStyle = '#00ff0050';
      ctx.fillRect(goalX, table.height - 25, goalWidth, 25);
      ctx.strokeStyle = '#00ff00';
      ctx.strokeRect(goalX, table.height - 25, goalWidth, 25);

      // Draw center line
      ctx.strokeStyle = '#ffffff30';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, table.height / 2);
      ctx.lineTo(table.width, table.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw center circle
      ctx.beginPath();
      ctx.arc(table.width / 2, table.height / 2, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Draw table border
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, table.width - 4, table.height - 4);

      // Get physics bodies
      const bodies = getBodies();
      if (!bodies) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      const { puck, paddle1, paddle2 } = bodies;
      const now = performance.now();
      timeRef.current = now;

      // Calculate pulsing glow intensity
      const pulsePhase = Math.sin(now * GLOW_PULSE_SPEED);
      const baseGlow = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * (0.5 + 0.5 * pulsePhase);

      // Detect paddle-puck collisions for flash effect
      const collisionDistance = paddle.radius + puckConfig.radius;
      const dist1 = Math.hypot(
        puck.position.x - paddle1.position.x,
        puck.position.y - paddle1.position.y
      );
      const dist2 = Math.hypot(
        puck.position.x - paddle2.position.x,
        puck.position.y - paddle2.position.y
      );

      // Check if this is a new collision (not continuous contact)
      const lastPuck = lastPuckPosRef.current;
      if (lastPuck) {
        const lastDist1 = Math.hypot(lastPuck.x - paddle1.position.x, lastPuck.y - paddle1.position.y);
        const lastDist2 = Math.hypot(lastPuck.x - paddle2.position.x, lastPuck.y - paddle2.position.y);

        // Trigger flash only on new contact
        if (dist1 <= collisionDistance * 1.1 && lastDist1 > collisionDistance * 1.1) {
          paddle1ContactRef.current = now;
        }
        if (dist2 <= collisionDistance * 1.1 && lastDist2 > collisionDistance * 1.1) {
          paddle2ContactRef.current = now;
        }
      }
      lastPuckPosRef.current = { x: puck.position.x, y: puck.position.y };

      // Calculate flash intensity (fades over CONTACT_FLASH_DURATION)
      const flash1 = Math.max(0, 1 - (now - paddle1ContactRef.current) / CONTACT_FLASH_DURATION);
      const flash2 = Math.max(0, 1 - (now - paddle2ContactRef.current) / CONTACT_FLASH_DURATION);

      // Update puck trail history
      const trail = puckTrailRef.current;
      trail.unshift({ x: puck.position.x, y: puck.position.y });
      if (trail.length > TRAIL_LENGTH) {
        trail.pop();
      }

      // Update paddle trails
      const paddle1Trail = paddle1TrailRef.current;
      paddle1Trail.unshift({ x: paddle1.position.x, y: paddle1.position.y });
      if (paddle1Trail.length > PADDLE_TRAIL_LENGTH) {
        paddle1Trail.pop();
      }

      const paddle2Trail = paddle2TrailRef.current;
      paddle2Trail.unshift({ x: paddle2.position.x, y: paddle2.position.y });
      if (paddle2Trail.length > PADDLE_TRAIL_LENGTH) {
        paddle2Trail.pop();
      }

      // Draw paddle 1 trail
      ctx.save();
      for (let i = paddle1Trail.length - 1; i >= 1; i--) {
        const point = paddle1Trail[i];
        const opacity = Math.pow(PADDLE_TRAIL_FADE_RATE, i) * 0.4;
        const size = paddle.radius * (1 - i / paddle1Trail.length * 0.3);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 204, 0, ${opacity})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw paddle 2 trail
      ctx.save();
      for (let i = paddle2Trail.length - 1; i >= 1; i--) {
        const point = paddle2Trail[i];
        const opacity = Math.pow(PADDLE_TRAIL_FADE_RATE, i) * 0.4;
        const size = paddle.radius * (1 - i / paddle2Trail.length * 0.3);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 0, 0, ${opacity})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw puck trail (before the puck itself)
      ctx.save();
      for (let i = trail.length - 1; i >= 1; i--) {
        const point = trail[i];
        const opacity = Math.pow(TRAIL_FADE_RATE, i) * 0.6;
        const size = puckConfig.radius * (1 - i / trail.length * 0.5);

        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      }
      ctx.restore();

      // Draw puck with glow
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw paddle 1 (player - bottom) with pulsing glow and contact flash
      ctx.save();
      const glow1 = baseGlow + flash1 * 25; // Extra glow on contact
      const green1 = Math.min(255, 204 + flash1 * 51); // Brighten on contact (204 -> 255)
      ctx.shadowColor = `rgb(0, ${green1}, 0)`;
      ctx.shadowBlur = glow1;
      ctx.fillStyle = `rgb(0, ${green1}, 0)`;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      const innerGreen1 = Math.min(100, 68 + flash1 * 32);
      ctx.fillStyle = `rgb(0, ${innerGreen1}, 0)`;
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw paddle 2 (AI/opponent - top) with pulsing glow and contact flash
      ctx.save();
      const glow2 = baseGlow + flash2 * 25;
      const red2 = Math.min(255, 204 + flash2 * 51); // Brighten on contact
      ctx.shadowColor = `rgb(${red2}, 0, 0)`;
      ctx.shadowBlur = glow2;
      ctx.fillStyle = `rgb(${red2}, 0, 0)`;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      const innerRed2 = Math.min(100, 68 + flash2 * 32);
      ctx.fillStyle = `rgb(${innerRed2}, 0, 0)`;
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    }, [getBodies]);

    useEffect(() => {
      animationRef.current = requestAnimationFrame(draw);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [draw]);

    return (
      <canvas
        ref={canvasRef}
        width={PHYSICS_CONFIG.table.width}
        height={PHYSICS_CONFIG.table.height}
        className="rounded-lg border-4 border-gray-700 shadow-2xl cursor-none"
        style={{
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: `${PHYSICS_CONFIG.table.width} / ${PHYSICS_CONFIG.table.height}`,
        }}
      />
    );
  }
);
