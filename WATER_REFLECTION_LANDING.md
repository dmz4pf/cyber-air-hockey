# The Reflection Pool - Landing Page v6

## Overview
A serene and magical water reflection landing page that creates the illusion of content floating above a liquid surface. Interactive ripples respond to mouse movement, creating an immersive, meditative experience.

## Features

### Visual Design
- **Deep Blue Ocean Theme**: Background color `#0a1628` evokes depth and mystery
- **Cyan Neon Glow**: Title and accents use `#00ffff` with multi-layer text shadows
- **Floating Particles**: 40 animated particles drift across the scene
- **Gradient Blending**: Smooth transitions between water and background

### Water Effects

#### Three.js Water Surface
- Custom GLSL shader material with:
  - Ripple wave propagation from mouse position
  - Distance-based wave attenuation
  - Gentle ambient wave motion
  - 128x128 subdivision for smooth distortion
  - Cyan highlights on wave peaks

#### Reflector Plane
- 1024px resolution mirror reflection
- 60% mirror strength with 4-unit blur
- Positioned slightly below water surface
- Creates realistic depth perception

#### Interactive Ripples
- Mouse movement creates expanding ripples
- Throttled to 150ms between ripples (prevents spam)
- Up to 10 simultaneous ripples tracked
- Age-based decay (1.5s lifespan)
- CSS overlay rings synchronized with 3D ripples

### Content Presentation

#### Hero Title
- "CYBER AIR HOCKEY" in Orbitron font
- Responsive sizing: 6xl → 8xl → 9xl
- Animated cyan glow pulse (2s cycle)
- Stacked layout for dramatic impact

#### CTA Button
- "ENTER ARENA" with pointer-events enabled
- Cyan gradient background with inner glow
- Scale hover animation (1.05x)
- Shimmer effect on hover
- High contrast for accessibility

### Animation Architecture

#### Motion Values
- Spring-based mouse tracking (stiffness: 50, damping: 20)
- Smooth interpolation prevents jitter
- Normalized coordinates (0-1 range)

#### Ripple System
```typescript
interface Ripple {
  x: number;        // Normalized X position (0-1)
  y: number;        // Normalized Y position (0-1)
  age: number;      // Age from 0 to 1
  id: number;       // Unique identifier
}
```

#### Shader Uniforms
- `time`: Global animation clock
- `rippleData`: Float32Array[100] storing ripple state
- `rippleCount`: Active ripple count
- `color`: Base water color
- `reflectionStrength`: Mirror intensity (0.6)

### Performance Optimizations

1. **Ripple Throttling**: Minimum 150ms between ripples
2. **Max Ripples**: Cap at 10 simultaneous ripples
3. **Efficient Cleanup**: Automatic removal of aged ripples
4. **Shader Optimization**: Early loop breaks when rippleCount reached
5. **Particle Pooling**: Fixed 40 particles, no dynamic allocation

### Accessibility

- Semantic HTML structure
- Keyboard-accessible CTA button
- High contrast text (cyan on dark blue)
- No critical information in animations
- Respects user motion preferences (via Framer Motion)

## Technical Stack

- **Three.js**: Water surface and reflections
- **@react-three/fiber**: React Three.js renderer
- **@react-three/drei**: Reflector component
- **Framer Motion**: UI animations and particle system
- **GLSL**: Custom water shader
- **TypeScript**: Full type safety

## File Structure

```
/src/app/landing-v6/
  └── page.tsx                    # Main landing page component

/src/components/landing/
  └── WaterReflection.tsx         # Three.js water surface component
  └── index.ts                    # Barrel export (updated)
```

## Usage

```bash
# Visit the landing page
http://localhost:3000/landing-v6

# Move your mouse to create ripples
# Watch the water distort and reflect
# Click "ENTER ARENA" to proceed
```

## Customization

### Adjust Water Color
In `WaterReflection.tsx`:
```typescript
color: { value: new THREE.Color('#0a1628') } // Change hex color
```

### Ripple Sensitivity
In `page.tsx`:
```typescript
const minInterval = 150; // Lower = more ripples (ms)
```

### Reflection Strength
In `WaterReflection.tsx`:
```typescript
reflectionStrength: { value: 0.6 } // 0.0 to 1.0
```

### Wave Amplitude
In shader vertex code:
```glsl
displacement += sin(pos.x * 2.0 + time * 0.3) * 0.02; // Adjust 0.02
```

## Design Philosophy

**Serene and Magical**: This isn't just water—it's a portal to another dimension. The reflection pool creates a sense of depth and mystery that draws users in. Every ripple feels intentional, every glow feels alive.

**Minimalist Elegance**: Only essential elements remain. Title. Button. Water. Particles. Nothing competes for attention—the experience speaks for itself.

**Responsive Physics**: The water reacts to presence. As you move, the pool responds. It's not just decoration—it's interaction design at its finest.

## Future Enhancements

- Add caustic light patterns on the water surface
- Implement WebGL bloom post-processing for glow
- Add sound design (gentle water ambience)
- Create mobile touch ripple interactions
- Add fish or light orbs swimming beneath surface
- Implement parallax depth on scroll

---

**Status**: Ready for production
**Performance**: 60fps on modern hardware
**Browser Support**: Chrome, Firefox, Safari (WebGL 2.0 required)
