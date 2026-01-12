'use client';

import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { PHYSICS_CONFIG } from '@/lib/physics/config';
import { GameBodies } from '@/lib/physics/engine';

interface GameCanvasProps {
  getBodies: () => GameBodies | null;
}

export interface GameCanvasRef {
  canvas: HTMLCanvasElement | null;
}

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(
  function GameCanvas({ getBodies }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

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

      // Draw puck with glow
      ctx.save();
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(puck.position.x, puck.position.y, puckConfig.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw paddle 1 (player - bottom) with glow
      ctx.save();
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00cc00';
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      ctx.fillStyle = '#004400';
      ctx.beginPath();
      ctx.arc(paddle1.position.x, paddle1.position.y, paddle.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw paddle 2 (AI/opponent - top) with glow
      ctx.save();
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.arc(paddle2.position.x, paddle2.position.y, paddle.radius, 0, Math.PI * 2);
      ctx.fill();
      // Inner circle
      ctx.fillStyle = '#440000';
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
