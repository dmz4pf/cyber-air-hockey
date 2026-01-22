# Landing V3 - Architecture & Data Flow

## Component Hierarchy

```
page.tsx (Landing V3)
│
├─ PhysicsCanvas
│  │
│  ├─ usePhysics hook
│  │  └─ Physics simulation state
│  │
│  └─ Canvas rendering loop
│     ├─ Puck trails
│     ├─ Pucks (glow + core + highlight + sparks)
│     ├─ Paddle (gradient + ring)
│     ├─ Target (if visible)
│     └─ Particles (explosions)
│
├─ Hero Section
│  ├─ Title (PHYSICS PLAYGROUND)
│  ├─ Description
│  ├─ CTA Button (PLAY NOW)
│  └─ Cursor hint
│
├─ Stats Bar (sticky)
│  ├─ Pucks Hit counter (GSAP animated)
│  ├─ Top Speed counter (GSAP animated)
│  └─ Chaos Level counter (GSAP animated)
│
├─ Features Section
│  └─ Feature Grid (4 cards)
│     └─ Framer Motion stagger
│
└─ Final CTA Section
   └─ PLAY NOW button
```

## Data Flow

### Physics State Flow

```
usePhysics Hook
    ↓
stateRef.current
    ├─ pucks[]
    │   ├─ position (x, y)
    │   ├─ velocity (vx, vy)
    │   ├─ trail[]
    │   └─ speed
    │
    ├─ paddle
    │   ├─ position (x, y)
    │   └─ velocity (vx, vy)
    │
    └─ stats
        ├─ pucksHit
        ├─ topSpeed
        └─ chaosLevel
```

### Event Flow

```
User moves cursor
    ↓
handleMouseMove / handleTouchMove
    ↓
updatePaddle(x, y)
    ↓
Calculate paddle velocity
    ↓
Update paddle position
    ↓
Render loop detects collision
    ↓
resolveCollision (momentum transfer)
    ↓
Update stats
    ↓
onPuckHit callback
    ↓
GSAP animate counter
    ↓
Screen shake effect
```

### Rendering Pipeline

```
requestAnimationFrame
    ↓
Clear canvas
    ↓
Get current physics state
    ↓
Draw loop:
│   ├─ For each puck:
│   │   ├─ Draw trail (fading alpha)
│   │   ├─ Draw outer glow
│   │   ├─ Draw core circle
│   │   ├─ Draw highlight
│   │   └─ Draw speed spark (if fast)
│   │
│   ├─ Draw paddle:
│   │   ├─ Radial gradient fill
│   │   └─ Ring outline
│   │
│   ├─ Draw target (if CTA visible):
│   │   ├─ Pulsing gradient
│   │   └─ Dashed ring
│   │
│   └─ For each particle:
│       ├─ Update position (velocity + gravity)
│       ├─ Fade alpha
│       └─ Draw circle
│
Check target collision
    ↓
Create explosion particles
    ↓
Callback to parent (onChaosChange)
    ↓
requestAnimationFrame (repeat)
```

## State Management Strategy

### Local State (useState)
- `stats` - Current game statistics
- `targetPosition` - CTA button position for collision detection
- `dimensions` - Canvas width/height

### Refs (useRef)
- `canvasRef` - Canvas DOM element
- `containerRef` - Container for sizing
- `ctaRef` - CTA button for position tracking
- `heroRef` - Hero section for shake effect
- `pucksHitRef` - Stat display element
- `topSpeedRef` - Stat display element
- `chaosLevelRef` - Stat display element
- `particlesRef` - Active particles array

### Physics Hook State (usePhysics)
- `stateRef` - Physics simulation state (pucks, paddle, stats)
- `animationFrameRef` - requestAnimationFrame ID
- `lastMouseRef` - Previous mouse position + time for velocity calc

## Performance Optimizations

### Canvas Rendering
1. **Device Pixel Ratio Scaling**
   ```typescript
   const dpr = window.devicePixelRatio || 1;
   canvas.width = width * dpr;
   canvas.height = height * dpr;
   ctx.scale(dpr, dpr);
   ```

2. **Gradient Caching**
   - Gradients created per-frame (not per-render-call)
   - Reused across multiple draw operations

3. **Early Exit Patterns**
   ```typescript
   if (!canvasRef.current || dimensions.width === 0) return;
   if (dvn < 0) return; // Separating velocities
   ```

### Physics Simulation
1. **Friction Damping** - Prevents infinite velocity buildup
2. **Speed Threshold** - Very slow pucks stop completely
3. **Trail Limiting** - Max 8 positions per puck
4. **Collision Exit** - Skip resolution if velocities separating

### Memory Management
1. **Particle Cleanup**
   ```typescript
   particlesRef.current = particlesRef.current.filter(p => p.alpha > 0);
   ```

2. **Event Listener Cleanup**
   ```typescript
   return () => {
     window.removeEventListener('mousemove', handleMouseMove);
     cancelAnimationFrame(animationId);
   };
   ```

## Callback Architecture

### Parent → Child (Props)
```typescript
<PhysicsCanvas
  onPuckHit={(count) => {...}}      // Hit detection callback
  onChaosChange={(level) => {...}}  // Stats update callback
  targetPosition={...}              // CTA position for collision
/>
```

### Child → Parent (Callbacks)
- `onPuckHit` - Triggered when puck enters CTA radius
- `onChaosChange` - Updates every frame with average speed

### Hook → Component (Returns)
```typescript
const { getState, updatePaddle, hitTarget, resetStats } = usePhysics(...);
```

## Animation Timing

### GSAP Animations
- Counter updates: 0.5s duration, power2.out easing
- Screen shake: 0.1s duration, 2 repeats (yoyo)
- CTA explosion: 0.6s duration, power2.out easing

### Framer Motion Animations
- Hero fade: 0.8s duration, 0.2s delay
- Feature stagger: 0.6s duration, 0.1s per item
- Button hover: Instant scale transform
- Scroll transforms: Linked to scroll progress

### Canvas Animations
- Physics loop: 60fps (requestAnimationFrame)
- Trail fade: Linear alpha decrease
- Particle fade: 0.02 alpha decrease per frame
- Target pulse: sin(time / 200) oscillation

## Coordinate Systems

### Screen Coordinates
- Origin: Top-left corner (0, 0)
- X-axis: Left → Right
- Y-axis: Top → Bottom

### Canvas Coordinates
- Same as screen but scaled by device pixel ratio
- Drawing operations use logical coordinates
- Automatic scaling via ctx.scale(dpr, dpr)

### Physics Coordinates
- Position: Absolute (x, y) in canvas space
- Velocity: Pixels per frame (vx, vy)
- Acceleration: Pixels per frame² (gravity, friction)

## Collision Detection Math

### Circle-to-Circle Detection
```typescript
distance = √((x2 - x1)² + (y2 - y1)²)
collision = distance < (r1 + r2)
```

### Collision Response (Impulse Method)
```typescript
// Normalize collision vector
nx = dx / distance
ny = dy / distance

// Relative velocity in collision normal
dvn = (v1x - v2x) * nx + (v1y - v2y) * ny

// Calculate impulse
impulse = (2 * dvn) / (m1 + m2)

// Apply impulse to velocities
v1x -= impulse * m2 * nx
v1y -= impulse * m2 * ny
v2x += impulse * m1 * nx
v2y += impulse * m1 * ny
```

### Separation Resolution
```typescript
overlap = (r1 + r2) - distance
separation = overlap / 2

obj1.x -= separationX
obj1.y -= separationY
obj2.x += separationX
obj2.y += separationY
```

## Constants Reference

### Physics Constants
```typescript
GRAVITY = 0              // No vertical acceleration
FRICTION = 0.995         // 0.5% velocity loss per frame
BOUNCE_DAMPING = 0.85    // 15% energy loss on wall bounce
COLLISION_FORCE = 1.2    // 20% collision amplification
PUCK_RADIUS = 12         // Puck size in pixels
PADDLE_RADIUS = 40       // Paddle size in pixels
TRAIL_LENGTH = 8         // Number of trail positions
MIN_SPEED = 0.5          // Velocity threshold for stopping
```

### Visual Constants
```typescript
PUCK_COLORS = [
  '#00f0ff',  // Primary cyan
  '#00d4ff',  // Light cyan
  '#00b8ff',  // Medium cyan
  '#009cff',  // Dark cyan
  '#0080ff'   // Blue
]

PARTICLE_COUNT = 30      // Particles per explosion
TRAIL_ALPHA_DECAY = 1 / TRAIL_LENGTH
PARTICLE_ALPHA_DECAY = 0.02
TARGET_PULSE_SPEED = 200 // Milliseconds per cycle
```

## Browser Events

### Mouse Events
- `mousemove` - Updates paddle position
- `click` - CTA button activation

### Touch Events
- `touchmove` - Mobile paddle control
- `passive: false` - Required for preventDefault

### Window Events
- `resize` - Updates canvas dimensions + CTA position
- `scroll` - Updates CTA position for collision detection

## Type Definitions

### Puck Type
```typescript
interface Puck {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  speed: number;
}
```

### Paddle Type
```typescript
interface Paddle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}
```

### Stats Type
```typescript
interface Stats {
  pucksHit: number;
  topSpeed: number;
  chaosLevel: number;
}
```

## Accessibility Considerations

### Current Implementation
- Cursor-controlled gameplay (requires mouse/touch)
- Visual feedback (trails, sparks, explosions)
- No audio cues
- No keyboard controls

### Potential Improvements
- [ ] Keyboard paddle control (arrow keys)
- [ ] Screen reader announcements for stats
- [ ] Reduced motion mode (disable trails/particles)
- [ ] High contrast mode
- [ ] Sound effects toggle
- [ ] Auto-play pause option

## Testing Strategy

### Unit Tests
- [ ] Physics collision detection
- [ ] Velocity calculations
- [ ] Boundary checking
- [ ] Particle lifecycle

### Integration Tests
- [ ] Mouse event handling
- [ ] Touch event handling
- [ ] Resize responsiveness
- [ ] CTA position tracking

### Visual Tests
- [ ] Canvas rendering at different DPR
- [ ] Trail rendering
- [ ] Particle effects
- [ ] Animation smoothness

### Performance Tests
- [ ] 60fps maintenance
- [ ] Memory leak detection
- [ ] Canvas scaling efficiency
- [ ] Event handler debouncing

---

This architecture provides a solid foundation for future enhancements while maintaining clean separation of concerns and optimal performance.
