export const PHYSICS_CONFIG = {
  engine: {
    gravity: { x: 0, y: 0 }
  },
  table: {
    width: 500,
    height: 750,
    wallThickness: 20,
    goalWidth: 188  // Proportional to new width (37.5%)
  },
  puck: {
    radius: 12,
    mass: 0.1,
    restitution: 0.85,      // Reduced from 0.98 - walls absorb some energy
    friction: 0,
    frictionAir: 0.002,     // Increased from 0.0005 - puck slows down faster
    maxSpeed: 20,           // Reduced from 25 - lower top speed
    minSpeed: 2             // Minimum speed to prevent tediously slow gameplay
  },
  paddle: {
    radius: 25,
    mass: 1,
    restitution: 0.8,
    friction: 0.1,
    velocityTransfer: 0.7,  // Increased from 0.5 - paddle speed matters more
    maxVelocity: 15
  },
  wall: {
    restitution: 0.9,
    friction: 0
  },
  game: {
    maxScore: 7,
    countdownSeconds: 3,
    goalPauseMs: 1500,
    tickRate: 60,        // Physics updates per second
    broadcastRate: 30    // State broadcasts per second
  }
} as const;

export type PhysicsConfig = typeof PHYSICS_CONFIG;
