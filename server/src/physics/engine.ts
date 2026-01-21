import Matter from 'matter-js';
import { PHYSICS_CONFIG } from './config';

export interface GameState {
  puck: { x: number; y: number; vx: number; vy: number };
  paddle1: { x: number; y: number };
  paddle2: { x: number; y: number };
  score: { player1: number; player2: number };
  timestamp: number;
}

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private puck: Matter.Body;
  private paddle1: Matter.Body;
  private paddle2: Matter.Body;
  private walls: Matter.Body[];
  private score: { player1: number; player2: number };
  private tickInterval: NodeJS.Timeout | null = null;
  private onGoalCallback: ((scorer: 1 | 2) => void) | null = null;
  private paddle1Target: { x: number; y: number } | null = null;
  private paddle2Target: { x: number; y: number } | null = null;
  private goalScored: boolean = false;
  private paddle1PrevPos: { x: number; y: number } | null = null;
  private paddle2PrevPos: { x: number; y: number } | null = null;
  private lastTickTime: number = Date.now();

  constructor() {
    // Create Matter.js engine with zero gravity (air hockey table)
    this.engine = Matter.Engine.create({
      gravity: PHYSICS_CONFIG.engine.gravity,
    });
    this.world = this.engine.world;

    // Initialize score
    this.score = { player1: 0, player2: 0 };

    // Create physics bodies
    this.puck = this.createPuck();
    this.paddle1 = this.createPaddle(0, PHYSICS_CONFIG.table.height / 4); // Bottom half (player 1)
    this.paddle2 = this.createPaddle(0, -PHYSICS_CONFIG.table.height / 4); // Top half (player 2)
    this.walls = this.createWalls();

    // Add all bodies to the world
    Matter.Composite.add(this.world, [
      this.puck,
      this.paddle1,
      this.paddle2,
      ...this.walls,
    ]);

    // Set up collision detection for paddle-puck interactions
    this.setupCollisionHandling();
  }

  /**
   * Start the 60fps physics loop
   */
  start(): void {
    if (this.tickInterval) {
      return; // Already running
    }

    this.lastTickTime = Date.now(); // Initialize timing
    const tickMs = 1000 / PHYSICS_CONFIG.game.tickRate;
    this.tickInterval = setInterval(() => this.tick(), tickMs);
  }

  /**
   * Stop the physics loop
   */
  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Destroy the physics engine and clean up resources
   */
  destroy(): void {
    this.stop();

    // Remove event listeners
    Matter.Events.off(this.engine, 'collisionStart');

    // Clear the world
    Matter.World.clear(this.world, false);

    // Clear the engine
    Matter.Engine.clear(this.engine);

    // Clear references
    this.paddle1Target = null;
    this.paddle2Target = null;
    this.paddle1PrevPos = null;
    this.paddle2PrevPos = null;
    this.onGoalCallback = null;
  }

  /**
   * Set the target position for a paddle (paddle will move toward this position)
   */
  setPaddleTarget(playerNumber: 1 | 2, x: number, y: number): void {
    const clamped = this.clampPaddlePosition(playerNumber, x, y);
    if (playerNumber === 1) {
      this.paddle1Target = clamped;
    } else {
      this.paddle2Target = clamped;
    }
  }

  /**
   * Get the current game state
   */
  getState(): GameState {
    return {
      puck: {
        x: this.puck.position.x,
        y: this.puck.position.y,
        vx: this.puck.velocity.x,
        vy: this.puck.velocity.y,
      },
      paddle1: {
        x: this.paddle1.position.x,
        y: this.paddle1.position.y,
      },
      paddle2: {
        x: this.paddle2.position.x,
        y: this.paddle2.position.y,
      },
      score: { ...this.score },
      timestamp: Date.now(),
    };
  }

  /**
   * Register a callback for when a goal is scored
   */
  onGoal(callback: (scorer: 1 | 2) => void): void {
    this.onGoalCallback = callback;
  }

  /**
   * Reset the puck to the center of the table
   */
  resetPuck(): void {
    // Find a safe position to reset the puck (center, but offset if paddle is there)
    let resetX = 0;
    let resetY = 0;

    const safeDistance =
      PHYSICS_CONFIG.puck.radius + PHYSICS_CONFIG.paddle.radius + 5;

    // Check if paddle1 is near center
    const p1Dist = Math.sqrt(
      Math.pow(this.paddle1.position.x - resetX, 2) +
        Math.pow(this.paddle1.position.y - resetY, 2)
    );

    // Check if paddle2 is near center
    const p2Dist = Math.sqrt(
      Math.pow(this.paddle2.position.x - resetX, 2) +
        Math.pow(this.paddle2.position.y - resetY, 2)
    );

    // If either paddle is too close to center, offset the puck
    if (p1Dist < safeDistance || p2Dist < safeDistance) {
      // Place puck on the side away from the closest paddle
      if (p1Dist < p2Dist) {
        resetY = -50; // Toward player 2's side
      } else {
        resetY = 50; // Toward player 1's side
      }
    }

    Matter.Body.setPosition(this.puck, { x: resetX, y: resetY });
    Matter.Body.setVelocity(this.puck, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(this.puck, 0);
    this.goalScored = false;
  }

  /**
   * Reset the entire game state
   */
  resetGame(): void {
    this.score = { player1: 0, player2: 0 };
    this.resetPuck();

    // Reset paddles to starting positions
    Matter.Body.setPosition(this.paddle1, {
      x: 0,
      y: PHYSICS_CONFIG.table.height / 4,
    });
    Matter.Body.setPosition(this.paddle2, {
      x: 0,
      y: -PHYSICS_CONFIG.table.height / 4,
    });

    // Clear paddle targets
    this.paddle1Target = null;
    this.paddle2Target = null;
  }

  /**
   * Single physics tick
   */
  private tick(): void {
    const now = Date.now();
    const actualDeltaMs = now - this.lastTickTime;
    // Don't update lastTickTime here, it's updated in updatePaddlePositions

    // Move paddles toward their targets (this updates lastTickTime)
    this.updatePaddlePositions();

    // Cap puck speed BEFORE physics
    this.capPuckSpeed();

    // Run the physics simulation with actual delta time
    // Cap delta to prevent spiral of death on lag spikes
    const cappedDelta = Math.min(actualDeltaMs, 50); // Max 50ms step
    Matter.Engine.update(this.engine, cappedDelta);

    // Cap puck speed AFTER physics too (collision can exceed max)
    this.capPuckSpeed();

    // Check for goals (only if not already processing a goal)
    if (!this.goalScored) {
      const scorer = this.checkGoal();
      if (scorer !== null) {
        this.goalScored = true;
        this.score[scorer === 1 ? 'player1' : 'player2']++;

        if (this.onGoalCallback) {
          this.onGoalCallback(scorer);
        }

        // Reset puck after a delay
        setTimeout(() => {
          this.resetPuck();
        }, PHYSICS_CONFIG.game.goalPauseMs);
      }
    }
  }

  /**
   * Check if the puck has entered a goal
   * Returns 1 if player 1 scored (puck in top goal)
   * Returns 2 if player 2 scored (puck in bottom goal)
   * Returns null if no goal
   */
  private checkGoal(): 1 | 2 | null {
    const puckPos = this.puck.position;
    const halfGoalWidth = PHYSICS_CONFIG.table.goalWidth / 2;
    const halfTableHeight = PHYSICS_CONFIG.table.height / 2;
    const puckRadius = PHYSICS_CONFIG.puck.radius;

    // Check if puck is within goal width (horizontally)
    if (Math.abs(puckPos.x) <= halfGoalWidth) {
      // Player 1 scores (puck went through top goal, y < -halfHeight)
      if (puckPos.y < -(halfTableHeight + puckRadius)) {
        return 1;
      }
      // Player 2 scores (puck went through bottom goal, y > halfHeight)
      if (puckPos.y > halfTableHeight + puckRadius) {
        return 2;
      }
    }

    return null;
  }

  /**
   * Create the walls around the table (excluding goal openings)
   */
  private createWalls(): Matter.Body[] {
    const walls: Matter.Body[] = [];
    const { width, height, wallThickness, goalWidth } = PHYSICS_CONFIG.table;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      restitution: PHYSICS_CONFIG.wall.restitution,
      friction: PHYSICS_CONFIG.wall.friction,
      label: 'wall',
    };

    // Left wall (full height)
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth + wallThickness / 2),
        0,
        wallThickness,
        height + wallThickness * 2,
        wallOptions
      )
    );

    // Right wall (full height)
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth + wallThickness / 2,
        0,
        wallThickness,
        height + wallThickness * 2,
        wallOptions
      )
    );

    // Top wall - left segment (from left edge to goal opening)
    const topBottomSegmentWidth = (width - goalWidth) / 2;
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth - topBottomSegmentWidth / 2),
        -(halfHeight + wallThickness / 2),
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Top wall - right segment (from goal opening to right edge)
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth - topBottomSegmentWidth / 2,
        -(halfHeight + wallThickness / 2),
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Bottom wall - left segment
    walls.push(
      Matter.Bodies.rectangle(
        -(halfWidth - topBottomSegmentWidth / 2),
        halfHeight + wallThickness / 2,
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    // Bottom wall - right segment
    walls.push(
      Matter.Bodies.rectangle(
        halfWidth - topBottomSegmentWidth / 2,
        halfHeight + wallThickness / 2,
        topBottomSegmentWidth,
        wallThickness,
        wallOptions
      )
    );

    return walls;
  }

  /**
   * Create the puck body
   */
  private createPuck(): Matter.Body {
    return Matter.Bodies.circle(0, 0, PHYSICS_CONFIG.puck.radius, {
      mass: PHYSICS_CONFIG.puck.mass,
      restitution: PHYSICS_CONFIG.puck.restitution,
      friction: PHYSICS_CONFIG.puck.friction,
      frictionAir: PHYSICS_CONFIG.puck.frictionAir,
      label: 'puck',
    });
  }

  /**
   * Create a paddle body
   */
  private createPaddle(x: number, y: number): Matter.Body {
    return Matter.Bodies.circle(x, y, PHYSICS_CONFIG.paddle.radius, {
      mass: PHYSICS_CONFIG.paddle.mass,
      restitution: PHYSICS_CONFIG.paddle.restitution,
      friction: PHYSICS_CONFIG.paddle.friction,
      isStatic: false, // Dynamic but we control position directly
      label: 'paddle',
      inertia: Infinity, // Prevent rotation
    });
  }

  /**
   * Clamp paddle position to player's half of the table
   */
  private clampPaddlePosition(
    playerNumber: 1 | 2,
    x: number,
    y: number
  ): { x: number; y: number } {
    const halfWidth = PHYSICS_CONFIG.table.width / 2;
    const halfHeight = PHYSICS_CONFIG.table.height / 2;
    const paddleRadius = PHYSICS_CONFIG.paddle.radius;

    // Clamp X to table bounds (accounting for paddle radius)
    const clampedX = Math.max(
      -halfWidth + paddleRadius,
      Math.min(halfWidth - paddleRadius, x)
    );

    let clampedY: number;
    if (playerNumber === 1) {
      // Player 1 is at the bottom (y > 0), constrained to bottom half
      clampedY = Math.max(
        paddleRadius, // Can't cross center line
        Math.min(halfHeight - paddleRadius, y) // Can't go past bottom edge
      );
    } else {
      // Player 2 is at the top (y < 0), constrained to top half
      clampedY = Math.max(
        -(halfHeight - paddleRadius), // Can't go past top edge
        Math.min(-paddleRadius, y) // Can't cross center line
      );
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Update paddle positions toward their targets
   */
  private updatePaddlePositions(): void {
    const now = Date.now();
    const dt = (now - this.lastTickTime) / 1000; // seconds
    this.lastTickTime = now;

    if (this.paddle1Target) {
      // Calculate velocity based on position change
      const prevPos = this.paddle1PrevPos || this.paddle1.position;
      const dx = this.paddle1Target.x - prevPos.x;
      const dy = this.paddle1Target.y - prevPos.y;

      // Velocity = distance / time, capped at maxVelocity
      const maxVel = PHYSICS_CONFIG.paddle.maxVelocity;
      const vx = Math.max(-maxVel, Math.min(maxVel, dx / Math.max(dt, 0.001)));
      const vy = Math.max(-maxVel, Math.min(maxVel, dy / Math.max(dt, 0.001)));

      Matter.Body.setPosition(this.paddle1, this.paddle1Target);
      Matter.Body.setVelocity(this.paddle1, { x: vx, y: vy });

      this.paddle1PrevPos = { ...this.paddle1Target };
    }

    if (this.paddle2Target) {
      const prevPos = this.paddle2PrevPos || this.paddle2.position;
      const dx = this.paddle2Target.x - prevPos.x;
      const dy = this.paddle2Target.y - prevPos.y;

      const maxVel = PHYSICS_CONFIG.paddle.maxVelocity;
      const vx = Math.max(-maxVel, Math.min(maxVel, dx / Math.max(dt, 0.001)));
      const vy = Math.max(-maxVel, Math.min(maxVel, dy / Math.max(dt, 0.001)));

      Matter.Body.setPosition(this.paddle2, this.paddle2Target);
      Matter.Body.setVelocity(this.paddle2, { x: vx, y: vy });

      this.paddle2PrevPos = { ...this.paddle2Target };
    }
  }

  /**
   * Cap the puck speed to prevent it from going too fast
   */
  private capPuckSpeed(): void {
    const velocity = this.puck.velocity;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    if (speed > PHYSICS_CONFIG.puck.maxSpeed) {
      const scale = PHYSICS_CONFIG.puck.maxSpeed / speed;
      Matter.Body.setVelocity(this.puck, {
        x: velocity.x * scale,
        y: velocity.y * scale,
      });
    }
  }

  /**
   * Set up collision handling for paddle-puck interactions
   */
  private setupCollisionHandling(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        // Check if collision involves puck and paddle
        const isPuckPaddleCollision =
          (bodyA.label === 'puck' && bodyB.label === 'paddle') ||
          (bodyA.label === 'paddle' && bodyB.label === 'puck');

        if (isPuckPaddleCollision) {
          // The collision response is handled by Matter.js physics
          // We could add additional effects here (sound, visual feedback, etc.)
        }
      }
    });
  }
}
