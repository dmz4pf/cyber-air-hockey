# Landing V7: Architecture & Interaction Flow

## Component Hierarchy

```
LandingV7 (page.tsx)
│
├─ PaddleCursor
│  ├─ Trail Points (10x div)
│  │  └─ Fading circles
│  │
│  └─ Main Paddle
│     ├─ Outer glow (pulsing)
│     ├─ Paddle circle (gradient)
│     ├─ Highlight spot
│     ├─ Center dot
│     └─ Energy rings (ping animation)
│
├─ Background Layers
│  ├─ Cyber Grid (60px squares)
│  ├─ Radial Gradients (2 layers)
│  └─ FloatingParticles (20x)
│
├─ Hero Section
│  ├─ ReactiveElement (shake)
│  │  └─ "CYBER" Title
│  │
│  └─ ReactiveElement (shake)
│     └─ "AIR HOCKEY" Title
│
├─ Subtitle
│  └─ ReactiveElement (ripple)
│     └─ Tagline Text
│
├─ CTA Section
│  └─ ReactiveElement (bounce, high)
│     └─ "ENTER ARENA" Button
│        ├─ Gradient background
│        ├─ Border overlay
│        ├─ Shimmer effect
│        └─ Animated arrow
│
├─ Feature Cards (3x)
│  └─ ReactiveElement (bounce, medium)
│     └─ Card
│        ├─ Title
│        └─ Description
│
└─ Scanline Effect
   └─ Animated gradient bar
```

## Data Flow

### Cursor System

```
MouseMove Event
    ↓
Update mousePos.current
    ↓
    ├─→ GSAP animate cursor position
    │   └─ Duration: 0.15s (creates lag/weight)
    │
    └─→ Add to trail array
        └─ Slice to last 10 points
            └─ Render trail circles
                └─ Opacity: (10 - index) / 15
```

### Reaction System

```
MouseMove Event
    ↓
Calculate distance to element center
    ↓
Distance < threshold?
    │
    ├─ YES → Near element
    │   │
    │   ├─ setIsNear(true)
    │   │   └─ Trigger proximity effects
    │   │
    │   ├─ Calculate push direction
    │   │   └─ angle = atan2(dy, dx)
    │   │
    │   ├─ Apply reaction based on type
    │   │   ├─ bounce → Push + elastic return
    │   │   ├─ shake → Random jitter + rotation
    │   │   └─ ripple → Glow scale effect
    │   │
    │   └─ Distance < 50% threshold?
    │       └─ Create particle burst
    │           └─ 6 particles at 60° intervals
    │
    └─ NO → Away from element
        └─ setIsNear(false)
```

## State Management

### PaddleCursor Component

```typescript
State:
  trails: TrailPoint[]           // Last 10 cursor positions

Refs:
  cursorRef: HTMLDivElement      // Main cursor element
  trailIdRef: number             // Unique ID counter
  mousePos: { x, y }             // Current mouse position

Effects:
  - Hide default cursor on mount
  - Track mouse movement
  - Update cursor position via GSAP
  - Add trail points
  - Restore cursor on unmount
```

### ReactiveElement Component

```typescript
Props:
  children: ReactNode            // Wrapped element
  className?: string             // Additional styles
  intensity: 'low'|'medium'|'high' // Detection distance
  type: 'bounce'|'shake'|'ripple'  // Reaction style

State:
  particles: Particle[]          // Active burst particles
  isNear: boolean                // Proximity flag

Refs:
  elementRef: HTMLDivElement     // Element to react
  particleIdRef: number          // Unique ID counter

Effects:
  - Track mouse position
  - Calculate distance to element
  - Trigger reactions
  - Create particle bursts
  - Cleanup particles after 800ms
```

## Animation Timeline

### Page Load Sequence

```
t=0.0s   Background layers fade in
t=0.2s   Hero title "CYBER" animates from top
t=0.6s   Subtitle fades in
t=0.9s   CTA button scales up
t=1.2s   Feature cards slide up

Continuous:
  - Floating particles animate (2-5s loops)
  - Scanline moves (4s linear loop)
  - Cursor trail follows mouse
  - Energy rings ping (2s loop)
```

### Interaction Timeline

```
User hovers over button:

t=0.0s   Distance detected
         isNear = true
         Pulse animation starts

t=0.1s   Cursor enters 50% threshold
         Particle burst triggers
         6 particles spawn

t=0.2s   Cursor "hits" button
         Button pushed away
         GSAP: x/y offset in 0.2s

t=0.4s   Elastic return begins
         GSAP: elastic.out(1, 0.3)

t=0.8s   Button settled
         Particles fade out
         Ready for next interaction
```

## Performance Optimization

### GSAP Optimizations

```typescript
// Uses transform instead of top/left
gsap.to(element, {
  x: value,          // transform: translateX()
  y: value,          // transform: translateY()
  // GPU accelerated automatically
});

// Short durations for responsiveness
duration: 0.15,     // 150ms = ~9 frames at 60fps

// Power2 easing for natural feel
ease: 'power2.out'  // Decelerates smoothly
```

### React Optimizations

```typescript
// Limit trail array size
setTrails(prev => [...prev, newPoint].slice(-10));

// Cleanup particles
setTimeout(() => {
  setParticles(prev => prev.filter(...));
}, 800);

// Use refs for non-render values
const mousePos = useRef({ x: 0, y: 0 });
// No re-render on every mousemove
```

### CSS Optimizations

```css
/* GPU-accelerated properties */
transform: translate(-50%, -50%);  /* ✅ */
/* instead of */
left: 50%; top: 50%;               /* ❌ */

/* Compositor-only animations */
@keyframes ping {
  transform: scale(1.5);           /* ✅ */
  opacity: 0;                      /* ✅ */
}

/* Avoid layout thrashing */
box-shadow: ...;                   /* ✅ Better than border */
filter: blur(...);                 /* ✅ GPU accelerated */
```

## Interaction Patterns

### Proximity Detection

```typescript
// Calculate Euclidean distance
const distance = Math.sqrt(
  Math.pow(mouseX - elementX, 2) +
  Math.pow(mouseY - elementY, 2)
);

// Compare to threshold
if (distance < settings.distance) {
  // Trigger reaction
}
```

### Direction Calculation

```typescript
// Get angle from element to cursor
const angle = Math.atan2(
  cursorY - elementY,
  cursorX - elementX
);

// Convert to push direction (opposite)
const pushX = -Math.cos(angle) * force;
const pushY = -Math.sin(angle) * force;
```

### Particle Distribution

```typescript
// Spread particles in circle
const particles = Array.from({ length: 6 }, (_, i) => {
  const angle = (i / 6) * Math.PI * 2;  // 60° spacing
  const x = centerX + Math.cos(angle) * distance;
  const y = centerY + Math.sin(angle) * distance;
  return { x, y, angle };
});
```

## Visual Effects Stack

### Cursor Rendering

```
Layer 1 (z-40): Trail circles
  └─ Fading opacity
  └─ Decreasing size
  └─ Individual glows

Layer 2 (z-50): Main cursor
  └─ Outer glow (blur-xl)
  └─ Paddle circle
     ├─ Gradient fill
     ├─ Border
     ├─ Multiple box-shadows
     ├─ Highlight spot
     └─ Center dot
  └─ Energy rings (ping)
```

### Element Effects

```
Base Layer: Element content
  ↓
Proximity Layer (isNear):
  └─ Radial gradient glow
     └─ Scale 0.8 → 1.2
     └─ Blur 10px
  ↓
Pulse Layer (isNear):
  └─ Scale animation 1 → 1.05 → 1
     └─ Infinite loop while near
  ↓
Particle Layer (z-30):
  └─ Burst particles
     └─ Radial motion
     └─ Fade + scale to 0
```

## Event Flow

```
User moves mouse
    ↓
window.addEventListener('mousemove')
    ↓
    ├─→ PaddleCursor component
    │   ├─ Update mousePos.current
    │   ├─ Animate cursor (GSAP)
    │   └─ Add trail point
    │
    └─→ All ReactiveElement components
        └─ Calculate distance
            └─ Within threshold?
                ├─ YES: Apply reaction
                └─ NO: Reset to idle
```

## Memory Management

### Trail System
```typescript
// Before: Unlimited growth (memory leak)
setTrails([...trails, newPoint]);

// After: Fixed size (10 points max)
setTrails(prev => [...prev, newPoint].slice(-10));

// Memory: ~1KB (10 points × ~100 bytes each)
```

### Particle System
```typescript
// Creation
setParticles(prev => [...prev, ...newParticles]);

// Cleanup after 800ms
setTimeout(() => {
  setParticles(prev =>
    prev.filter(p => !newParticles.includes(p))
  );
}, 800);

// Max particles: 6 per burst × active bursts
// Typical: 6-18 particles at any time
```

### GSAP Tweens
```typescript
// GSAP automatically:
// - Kills overlapping tweens (same target + property)
// - Cleans up completed tweens
// - Reuses tween objects when possible

// Manual cleanup on unmount
useEffect(() => {
  return () => {
    gsap.killTweensOf(elementRef.current);
  };
}, []);
```

## Coordinate Systems

### Screen Coordinates (Mouse)
```
(0, 0) ─────────────→ X
  │
  │     Cursor at (clientX, clientY)
  │
  ↓
  Y
```

### Element Coordinates
```typescript
const rect = element.getBoundingClientRect();
const centerX = rect.left + rect.width / 2;
const centerY = rect.top + rect.height / 2;

// Distance to cursor
const dx = mouseX - centerX;
const dy = mouseY - centerY;
const distance = Math.sqrt(dx² + dy²);
```

### Transform Coordinates (GSAP)
```css
/* Element starts at natural position */
transform: translate(0, 0);

/* Push 15px left, 10px up */
transform: translate(-15px, -10px);

/* Return to natural position */
transform: translate(0, 0);
```

## Browser Rendering Pipeline

```
JavaScript (GSAP/React)
    ↓
Style Calculation
    ↓
Layout (if needed)
    ↓
Paint (if needed)
    ↓
Composite (GPU)
    ↓
Display

Optimizations:
- transform: Skips Layout & Paint
- opacity: Skips Layout
- box-shadow: Skips Layout
- will-change: Promotes to GPU layer
```

## Responsiveness Strategy

### Mobile Considerations
```typescript
// Detect touch devices
const isTouchDevice = 'ontouchstart' in window;

if (isTouchDevice) {
  // Alternative: Tap to create ripple
  element.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    createRippleAt(touch.clientX, touch.clientY);
  });
} else {
  // Mouse interactions (current implementation)
  window.addEventListener('mousemove', handleMouseMove);
}
```

### Viewport Scaling
```css
/* Hero text responsive */
text-7xl   /* 72px on mobile */
md:text-9xl /* 128px on desktop */

/* Grid scales with viewport */
background-size: 60px 60px;  /* Could use vw units */

/* Particle density */
20 particles on desktop
10 particles on mobile  /* Reduce for performance */
```

## Error Handling

### Component Mount Safety
```typescript
useEffect(() => {
  const element = elementRef.current;
  if (!element) return;  // Guard clause

  // Setup

  return () => {
    // Cleanup
  };
}, []);
```

### GSAP Null Checks
```typescript
if (cursorRef.current) {
  gsap.to(cursorRef.current, { ... });
}
// Prevents "Cannot animate null" errors
```

### Particle Cleanup
```typescript
setTimeout(() => {
  setParticles(prev =>
    prev.filter(p => !newParticles.find(np => np.id === p.id))
  );
}, 800);
// Ensures particles always cleanup
// Even if component unmounts mid-animation
```

## Future Architecture Enhancements

### 1. Centralized Event Manager
```typescript
// Instead of: Each component listens to mousemove
// Better: Single listener broadcasts to subscribers

class CursorManager {
  private listeners = new Set();

  subscribe(callback) {
    this.listeners.add(callback);
  }

  broadcast(x, y) {
    this.listeners.forEach(cb => cb(x, y));
  }
}
```

### 2. Object Pool for Particles
```typescript
// Reuse particle objects instead of creating new
class ParticlePool {
  private pool: Particle[] = [];

  acquire() {
    return this.pool.pop() || new Particle();
  }

  release(particle) {
    particle.reset();
    this.pool.push(particle);
  }
}
```

### 3. Spatial Hashing
```typescript
// Only check proximity for nearby elements
// Not every element on every mousemove

class SpatialGrid {
  private cells: Map<string, Element[]>;

  insert(element) { ... }
  getNearbyCells(x, y, radius) { ... }
}
```

---

**Architecture Philosophy:**
- Separation of concerns (cursor vs reactions)
- Composable components (wrap anything)
- Performance by default (GPU, cleanup)
- Extensible patterns (easy to add new reaction types)
