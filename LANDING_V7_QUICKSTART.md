# Landing V7: Cursor Possession - Quick Start

## What Was Built

A landing page where your cursor becomes a glowing paddle. Every element on the page responds to cursor proximity with physics-based reactions, particle bursts, and visual feedback.

## Files Created

```
✅ /src/app/landing-v7/page.tsx              (Main landing page)
✅ /src/components/landing/PaddleCursor.tsx  (Custom cursor with trail)
✅ /src/components/landing/ReactiveElement.tsx (Element reactions)
✅ /LANDING_V7_CURSOR_POSSESSION.md          (Full documentation)
✅ /LANDING_V7_QUICKSTART.md                 (This file)
```

## How to Run

```bash
# 1. Navigate to project
cd /Users/MAC/Desktop/dev/linera/air-hockey

# 2. Start dev server with Turbopack
npm run dev -- --turbopack

# 3. Open in browser
http://localhost:3000/landing-v7
```

## What to Experience

### 1. Custom Paddle Cursor
- Your default cursor is hidden
- A glowing cyan paddle appears instead
- White/cyan gradient with 3D depth
- Smooth GSAP lag creates weight feeling
- Energy rings pulse outward

### 2. Light Trail
- Last 10 cursor positions tracked
- Fading cyan circles trail behind
- Each has glow effect
- Creates light painting effect as you move

### 3. Element Reactions

**Title ("CYBER AIR HOCKEY")**
- Type: Shake
- When cursor approaches: Text wobbles and jitters
- When "hit": Particles burst at contact point

**CTA Button ("ENTER ARENA")**
- Type: Bounce
- When cursor approaches: Button pulses
- When "hit": Bounces away from cursor direction
- Returns with elastic spring animation

**Feature Cards (3 cards at bottom)**
- Type: Bounce
- Each card reacts independently
- Particles spawn on close contact
- Cards have proximity glow effect

### 4. Background Effects
- Cyber grid pattern (60px squares)
- 20 floating particles (random animations)
- Radial gradient overlays
- Animated scanline (CRT screen effect)

## Key Technologies

### GSAP (Cursor & Reactions)
```typescript
// Smooth cursor follow
gsap.to(cursorRef.current, {
  x: e.clientX,
  y: e.clientY,
  duration: 0.15,
  ease: 'power2.out'
});

// Elastic bounce back
gsap.to(element, {
  x: 0,
  y: 0,
  duration: 0.4,
  ease: 'elastic.out(1, 0.3)'
});
```

### Framer Motion (Page Animations)
```typescript
// Particle burst animation
<motion.div
  initial={{ opacity: 1, scale: 1 }}
  animate={{ opacity: 0, scale: 0 }}
  transition={{ duration: 0.8 }}
/>
```

## Component Usage

### Wrapping Elements for Reactivity
```tsx
import { ReactiveElement } from '@/components/landing/ReactiveElement';

<ReactiveElement
  intensity="high"    // low | medium | high (proximity distance)
  type="bounce"       // bounce | shake | ripple
>
  <YourComponent />
</ReactiveElement>
```

### Intensity Settings
- **low**: 60px detection radius, 8px bounce
- **medium**: 80px detection radius, 15px bounce
- **high**: 100px detection radius, 25px bounce

### Reaction Types
- **bounce**: Element pushed away, springs back
- **shake**: Random jitter with rotation
- **ripple**: Glow effect expands outward

## Visual Customization

### Change Cursor Color
```tsx
// PaddleCursor.tsx - line 96
className="w-8 h-8 rounded-full bg-gradient-to-br
  from-white via-cyan-200 to-cyan-400"  // ← Change these colors
```

### Change Trail Color
```tsx
// PaddleCursor.tsx - line 67
className="rounded-full bg-cyan-400"  // ← Change trail color
```

### Adjust Background Grid
```tsx
// page.tsx - line 31
backgroundSize: '60px 60px',  // ← Change grid spacing
```

### Modify Particle Count
```tsx
// ReactiveElement.tsx - line 105
Array.from({ length: 6 }, ...)  // ← Change particle count
```

## Performance Features

1. **Trail Optimization**
   - Limited to 10 points max
   - Old points automatically removed
   - Prevents memory leaks

2. **Particle Cleanup**
   - Auto-remove after 800ms
   - No DOM accumulation

3. **GPU Acceleration**
   - All animations use CSS transforms
   - GSAP automatically promotes to GPU
   - Smooth 60fps on modern devices

4. **Smart Detection**
   - Distance calculation cached
   - Only animate when cursor nearby
   - Idle elements don't compute

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Best performance |
| Firefox | ✅ Full | Excellent |
| Safari | ✅ Full | May need prefixes |
| Mobile | ⚠️ Partial | No cursor (touch events needed) |

## Troubleshooting

### Cursor not showing
- Check if `cursor: 'none'` is applied to body
- Ensure PaddleCursor component is mounted
- Check browser console for errors

### Elements not reacting
- Verify elements are wrapped in ReactiveElement
- Check intensity setting (may be too low)
- Ensure GSAP is installed: `npm install gsap`

### Trail not appearing
- Check if trail state is updating (React DevTools)
- Verify trail rendering (should be 10 divs)
- Clear browser cache

### Performance issues
- Reduce floating particle count (line 204 in page.tsx)
- Lower trail point count (line 38 in PaddleCursor.tsx)
- Simplify particle burst (line 105 in ReactiveElement.tsx)

## Next Enhancement Ideas

### Sound Effects
```tsx
const hitSound = new Audio('/sounds/hit.mp3');
// Play on particle burst
```

### Touch Support (Mobile)
```tsx
const handleTouch = (e: TouchEvent) => {
  const touch = e.touches[0];
  // Create ripple at touch point
};
```

### Combo System
```tsx
const [hitCount, setHitCount] = useState(0);
// Increment on hit, reset after 2s
// Show "COMBO x3!" at threshold
```

### Score Display
```tsx
const [score, setScore] = useState(0);
// +10 per element hit
// Bonus for hitting all elements
```

## Code Quality

### TypeScript
- ✅ Fully typed components
- ✅ Proper interface definitions
- ✅ No `any` types used

### Accessibility
- ⚠️ Custom cursor may confuse screen readers
- ⚠️ Consider adding `aria-live` for reactions
- ⚠️ Add keyboard navigation for interactions

### Performance
- ✅ Optimized animations
- ✅ Cleanup functions in useEffect
- ✅ Memoization opportunities available

## Architecture Highlights

### Separation of Concerns
- **PaddleCursor**: Cursor visuals only
- **ReactiveElement**: Element reactions only
- **page.tsx**: Layout and composition

### Reusability
- ReactiveElement works on ANY component
- Configurable intensity and reaction type
- Drop-in replacement (just wrap your elements)

### Maintainability
- Clear prop interfaces
- Inline documentation
- Logical file organization

## Testing Checklist

- [ ] Cursor appears and follows mouse smoothly
- [ ] Trail appears behind cursor
- [ ] Title shakes when cursor approaches
- [ ] Button bounces when hit
- [ ] Particles burst on close contact
- [ ] Feature cards react independently
- [ ] Background grid visible
- [ ] Floating particles animate
- [ ] Scanline moves vertically
- [ ] Page loads without errors

## Resources

**Documentation**:
- GSAP: https://greensock.com/docs/
- Framer Motion: https://www.framer.com/motion/

**Color Palette**:
- Cyan: `#22D3EE` (rgb(34, 211, 238))
- Purple: `#A78BFA` (rgb(167, 139, 250))
- Pink: `#F472B6` (rgb(244, 114, 182))

**Fonts**:
- Orbitron: Available in project globals

**Animations**:
- Already defined in `/src/app/globals.css`
- Shimmer, pulse, float, etc.

---

**Built with craftsmanship. Every pixel matters. Every interaction should feel inevitable.**
