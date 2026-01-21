export const PHYSICS_CONFIG = {
  engine: {
    gravity: { x: 0, y: 0 }
  },
  table: {
    width: 400,
    height: 600,
    wallThickness: 20,
    goalWidth: 150
  },
  puck: {
    radius: 12,
    mass: 0.1,
    restitution: 0.98,
    friction: 0,
    frictionAir: 0.0005,
    maxSpeed: 25
  },
  paddle: {
    radius: 25,
    mass: 1,
    restitution: 0.8,
    friction: 0.1,
    velocityTransfer: 0.5,
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
