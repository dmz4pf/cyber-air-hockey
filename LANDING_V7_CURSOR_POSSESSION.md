# Landing V7: Cursor Possession

## Overview
A revolutionary landing page where the cursor becomes a glowing paddle with physics-based interactions. Every element on the page reacts to cursor proximity and collision.

## URL
`http://localhost:3000/landing-v7`

## Visual Identity

### Color Palette
- **Background**: `#050510` (Deep space black)
- **Primary**: `#22D3EE` (Cyan glow)
- **Secondary**: `#A78BFA` (Purple accent)
- **Accent**: `#F472B6` (Pink highlight)

### Typography
- **Font**: Orbitron (Cyber-futuristic)
- **Sizes**:
  - Hero: 9rem (144px) on desktop
  - Subtitle: 7rem (112px)
  - CTA: 2rem (32px)

## Core Features

### 1. Paddle Cursor
**Location**: `/src/components/landing/PaddleCursor.tsx`

The custom cursor replaces the default with a glowing paddle:

- **Visual Elements**:
  - White/cyan gradient paddle (8px diameter)
  - Glowing outer ring with pulse animation
  - Highlight spot for 3D depth effect
  - Energy rings that ping outward

- **Trail System**:
  - Last 10 cursor positions tracked
  - Fading cyan circles (decreasing size and opacity)
  - Each trail point has individual glow effect

- **Animation**:
  - GSAP smooth lag (0.15s duration, power2.out easing)
  - Gives paddle physical weight and momentum
  - Trail creates light painting effect

### 2. Reactive Elements
**Location**: `/src/components/landing/ReactiveElement.tsx`

Makes ANY wrapped element respond to cursor proximity:

- **Proximity Detection**:
  - Calculates distance from cursor to element center
  - Three intensity levels: low (60px), medium (80px), high (100px)

- **Reaction Types**:

  **Bounce** (Default):
  - Element pushed away from cursor direction
  - Elastic return animation (elastic.out easing)
  - Creates satisfying "hit" feeling

  **Shake**:
  - Random jitter in X/Y position
  - Slight rotation wobble
  - Repeats 3 times with yoyo

  **Ripple**:
  - Radial gradient glow appears
  - Scales from 0.8 to 1.2
  - Blur effect for ethereal feel

- **Particle Burst**:
  - 6 particles spawn on close contact
  - Each travels in circular pattern (360° / 6 = 60° spacing)
  - Fade out over 0.8s
  - Cyan glow effect on each particle

### 3. Main Landing Page
**Location**: `/src/app/landing-v7/page.tsx`

The orchestration of all elements:

- **Background Layers**:
  1. Cyber grid (60px squares, cyan lines at 20% opacity)
  2. Radial gradients (cyan center, purple accent at 80% 20%)
  3. Floating particles (20 total, randomized positions/animations)

- **Hero Section**:
  - "CYBER" title with gradient text (cyan → purple → pink)
  - "AIR HOCKEY" with neon cyan glow
  - Both wrapped in ReactiveElement with "shake" type
  - Subtitle with "ripple" effect

- **CTA Button**:
  - Gradient background (cyan → purple)
  - Multi-layer shadow for depth
  - Shimmer effect on hover
  - Animated arrow (→) that pulses
  - Wrapped in ReactiveElement with "bounce" at high intensity

- **Feature Cards**:
  - 3-column grid on desktop
  - Each card is a ReactiveElement (medium bounce)
  - Glassmorphism effect (backdrop-blur)
  - Cyan border with subtle glow

- **Scanline Effect**:
  - Vertical gradient bar
  - Animates from -100% to 200% Y position
  - 4s linear loop
  - Adds CRT screen aesthetic

### 4. Floating Particles
**Component**: `FloatingParticles` (inline in page.tsx)

Background ambiance:

- **Generation**:
  - 20 particles total
  - Randomized X/Y positions (0-100%)
  - Sizes: 2-6px
  - Durations: 2-5s
  - Staggered delays: 0-2s

- **Animation**:
  - Vertical float: -30px up and back
  - Horizontal drift: ±10px random
  - Opacity pulse: 0.3 → 0.6 → 0.3
  - Scale pulse: 1 → 1.2 → 1
  - Infinite loop with easeInOut

## Technical Implementation

### GSAP Usage
Used for cursor smoothing and element reactions:

```typescript
// Cursor follow
gsap.to(cursorRef.current, {
  x: e.clientX,
  y: e.clientY,
  duration: 0.15,
  ease: 'power2.out'
});

// Bounce reaction
gsap.to(element, {
  x: pushX,
  y: pushY,
  duration: 0.2,
  ease: 'power2.out',
  onComplete: () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'elastic.out(1, 0.3)'
    });
  }
});
```

### Framer Motion Usage
Used for page animations and particle effects:

```typescript
// Hero fade-in
<motion.div
  initial={{ opacity: 0, y: -50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
>

// Particle burst
<motion.div
  initial={{ x: particle.x, y: particle.y, opacity: 1 }}
  animate={{ x: targetX, y: targetY, opacity: 0 }}
  transition={{ duration: 0.8, ease: 'easeOut' }}
>
```

## User Experience Flow

1. **Page Load**:
   - Background elements fade in
   - Hero text animates from top
   - Cursor transforms to paddle

2. **Exploration**:
   - User moves cursor around
   - Trail follows, creating light painting
   - Elements pulse when cursor approaches

3. **Interaction**:
   - Hovering over title makes it shake
   - Button bounces away when "hit"
   - Particles burst on contact
   - Everything feels alive and reactive

4. **Immersion**:
   - No default cursor visible
   - Every element responds to presence
   - Page feels like a game arena
   - User already "playing" before clicking anything

## Design Principles

1. **Weight & Impact**:
   - Cursor has mass through lag
   - Elements react with physics
   - Collisions create visual feedback

2. **Reactivity Everywhere**:
   - No static elements
   - Everything responds to proximity
   - Multiple layers of interaction

3. **Visual Hierarchy**:
   - Cursor is brightest element
   - Hero text second brightest
   - Background elements subtle
   - Creates natural focus flow

4. **Performance**:
   - GSAP for smooth animations
   - Particle cleanup (max 10 trail points)
   - CSS transforms (GPU accelerated)
   - No layout thrashing

## Files Created

```
/src/app/landing-v7/
  └── page.tsx                       # Main landing page

/src/components/landing/
  ├── PaddleCursor.tsx              # Custom cursor with trail
  └── ReactiveElement.tsx           # Element reaction wrapper
```

## How to Use

1. **Start dev server**:
   ```bash
   cd /Users/MAC/Desktop/dev/linera/air-hockey
   npm run dev -- --turbopack
   ```

2. **Navigate to**:
   ```
   http://localhost:3000/landing-v7
   ```

3. **Interact**:
   - Move cursor around the page
   - Watch trail paint light behind you
   - Hover over title, subtitle, button
   - See elements bounce/shake/pulse
   - Look for particle bursts on contact

## Customization

### Change Cursor Size
```tsx
// PaddleCursor.tsx, line 68
<div className="w-8 h-8 ...">  // Change w-8 h-8
```

### Adjust Reaction Distance
```tsx
// ReactiveElement.tsx, line 23
const settings = {
  low: { distance: 60, ... },      // Increase/decrease distance
  medium: { distance: 80, ... },
  high: { distance: 100, ... }
}
```

### Modify Particle Count
```tsx
// ReactiveElement.tsx, line 105
const newParticles = Array.from({ length: 6 }, ...)  // Change 6
```

### Background Grid Size
```tsx
// page.tsx, line 31
backgroundSize: '60px 60px',  // Change grid spacing
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (may need -webkit prefixes)
- Mobile: Cursor effects disabled (no mouse), touch events could be added

## Performance Notes

- Trail limited to 10 points (prevents memory leak)
- Particles auto-cleanup after 800ms
- GSAP uses GPU-accelerated transforms
- Framer Motion optimizes layout calculations
- Scanline uses transform (not top/bottom for better perf)

## Next Steps

Potential enhancements:
- Add sound effects on collision
- Touch support for mobile (tap creates ripple)
- Different cursor shapes (puck, ball, etc.)
- Element "break" animation on hard hit
- Score counter for hits
- Combo system for rapid hits
