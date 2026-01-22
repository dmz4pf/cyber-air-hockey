# Landing V3 - Design System

## Color Palette

### Primary Colors

```css
/* Background */
--bg-primary: #030308      /* Deep space black */

/* Accent Gradient Spectrum (Cyan family) */
--cyan-100: #00f0ff        /* Brightest cyan - primary accent */
--cyan-80:  #00d4ff        /* Light cyan */
--cyan-60:  #00b8ff        /* Medium cyan */
--cyan-40:  #009cff        /* Dark cyan */
--cyan-20:  #0080ff        /* Blue-cyan blend */

/* Text Colors */
--text-primary:   #ffffff  /* White - headings */
--text-secondary: #9ca3af  /* Gray-400 - body text */
```

### Color Usage Map

| Element | Color | Usage |
|---------|-------|-------|
| Background | #030308 | Main background, card backgrounds |
| Hero Title | Gradient #00f0ff → #00d4ff | Main "PHYSICS" heading |
| Hero Subtitle | Gradient #00d4ff → #009cff | "PLAYGROUND" heading |
| Puck 1 | #00f0ff | Primary pucks (every 5th) |
| Puck 2 | #00d4ff | Light pucks |
| Puck 3 | #00b8ff | Medium pucks |
| Puck 4 | #009cff | Dark pucks |
| Puck 5 | #0080ff | Blue pucks |
| Paddle | #00f0ff (40% opacity) | Radial gradient |
| Trails | Puck color (2-30% opacity) | Fading ghosts |
| Sparks | Puck color (80% opacity) | Speed indicators |
| Particles | #00f0ff | Explosion effects |
| Stats Numbers | #00f0ff | Counter displays |
| CTA Button | Gradient #00f0ff → #0080ff | Primary action |
| Feature Cards | #00f0ff (20% border) | Grid items |
| Glow Effects | #00f0ff (10-50% opacity) | Halos, blurs |

## Typography

### Font Families

```css
/* Primary Display Font */
--font-display: 'Orbitron', sans-serif;
/* Usage: Headings, buttons, stats, CTA */

/* Body Font */
--font-body: 'Inter', sans-serif;
/* Usage: Descriptions, body text */
```

### Font Sizes

| Element | Mobile | Desktop | Weight |
|---------|--------|---------|--------|
| Hero H1 | 4.5rem (72px) | 9rem (144px) | 700 (Bold) |
| Hero H2 | 3rem (48px) | 7rem (112px) | 700 (Bold) |
| Hero Body | 1.25rem (20px) | 1.5rem (24px) | 400 (Regular) |
| CTA Button | 1.5rem (24px) | 2rem (32px) | 700 (Bold) |
| Stats Numbers | 2.25rem (36px) | 2.25rem (36px) | 700 (Bold) |
| Stats Labels | 0.875rem (14px) | 0.875rem (14px) | 400 (Regular) |
| Section Headings | 3rem (48px) | 4rem (64px) | 700 (Bold) |
| Feature Titles | 1.5rem (24px) | 1.5rem (24px) | 700 (Bold) |
| Feature Body | 1rem (16px) | 1rem (16px) | 400 (Regular) |
| Final CTA | 1.875rem (30px) | 3rem (48px) | 700 (Bold) |

### Font Styling

```css
/* Orbitron Display */
font-family: var(--font-orbitron);
font-weight: 700;
letter-spacing: -0.02em;  /* Tight tracking */
line-height: 1.1;         /* Compact line height */

/* Body Text */
font-family: var(--font-inter);
font-weight: 400;
letter-spacing: 0;
line-height: 1.6;         /* Relaxed reading */
```

## Spacing System

### Scale (Tailwind-based)

```css
--space-1:  0.25rem   (4px)
--space-2:  0.5rem    (8px)
--space-3:  0.75rem   (12px)
--space-4:  1rem      (16px)
--space-6:  1.5rem    (24px)
--space-8:  2rem      (32px)
--space-12: 3rem      (48px)
--space-16: 4rem      (64px)
--space-20: 5rem      (80px)
--space-24: 6rem      (96px)
--space-32: 8rem      (128px)
```

### Spacing Usage

| Element | Margin/Padding |
|---------|----------------|
| Hero Title → Subtitle | mb-6 (24px) |
| Subtitle → Body | mb-8 (32px) |
| Body → CTA | mb-12 (48px) |
| Section Padding | py-32 (128px) |
| Stats Bar Padding | py-6 (24px) |
| Feature Card Padding | p-8 (32px) |
| Feature Grid Gap | gap-8 (32px) |
| CTA Button Padding | px-12 py-6 (48px 24px) |
| Final CTA Padding | px-16 py-8 (64px 32px) |

## Visual Effects

### Gradients

#### Text Gradients
```css
/* Hero Title */
background: linear-gradient(90deg, #00f0ff, #00d4ff, #00f0ff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Hero Subtitle */
background: linear-gradient(90deg, #00d4ff, #009cff, #00d4ff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Section Headings */
background: linear-gradient(90deg, #00f0ff, #0080ff);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

#### Background Gradients
```css
/* CTA Button */
background: linear-gradient(90deg, #00f0ff, #0080ff);
background-size: 200% 200%;
animation: gradientShift 3s linear infinite;

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

#### Radial Gradients
```css
/* Puck Glow */
radial-gradient(
  circle at center,
  rgba(0, 240, 255, 0.5) 0%,
  rgba(0, 240, 255, 0.25) 50%,
  rgba(0, 240, 255, 0) 100%
)

/* Paddle */
radial-gradient(
  circle at center,
  rgba(0, 240, 255, 0.4) 0%,
  rgba(0, 240, 255, 0.2) 70%,
  rgba(0, 240, 255, 0) 100%
)

/* Target Pulse */
radial-gradient(
  circle at center,
  rgba(0, 240, 255, 0.3) 0%,
  rgba(0, 240, 255, 0) 100%
)
```

### Shadows & Glows

```css
/* Card Hover Glow */
box-shadow: 0 0 40px rgba(0, 240, 255, 0.2);

/* Button Glow */
box-shadow: 0 0 60px rgba(0, 240, 255, 0.5);

/* Feature Card Background Glow */
filter: blur(40px);
opacity: 0.1;
```

### Borders

```css
/* Default */
border: 1px solid rgba(0, 240, 255, 0.2);

/* Hover */
border: 1px solid rgba(0, 240, 255, 0.4);

/* Target Ring */
border: 2px solid rgba(0, 240, 255, 0.5);
stroke-dasharray: 5 5;
```

### Opacity Levels

| Use Case | Opacity | Hex Suffix |
|----------|---------|------------|
| Invisible | 0% | 00 |
| Subtle Background | 10% | 1a |
| Light Border | 20% | 33 |
| Trail Start | 30% | 4d |
| Paddle Fill | 40% | 66 |
| Target | 50% | 80 |
| Hover Glow | 60% | 99 |
| Sparks | 80% | cc |
| Full Visible | 100% | ff |

## Animation Specifications

### Duration Scale

```css
--duration-instant: 0ms
--duration-fast:    100ms   /* Screen shake */
--duration-normal:  300ms   /* Hover states */
--duration-medium:  500ms   /* Counter updates */
--duration-slow:    600ms   /* Feature reveals */
--duration-slower:  800ms   /* Hero fade */
--duration-slowest: 3000ms  /* Gradient shift */
```

### Easing Curves

```css
/* GSAP Easings */
--ease-power2-out:  cubic-bezier(0.22, 1, 0.36, 1)
--ease-power2-in:   cubic-bezier(0.55, 0.085, 0.68, 0.53)
--ease-elastic:     /* GSAP elastic easing */

/* Framer Motion Easings */
--ease-default:     [0.6, 0.05, 0.01, 0.99]
```

### Animation Timeline

| Element | Trigger | Duration | Delay | Easing |
|---------|---------|----------|-------|--------|
| Hero Title | Page Load | 800ms | 200ms | Default |
| Hero Subtitle | Page Load | 800ms | 200ms | Default |
| Hero Body | Page Load | 800ms | 200ms | Default |
| Hero CTA | Page Load | 800ms | 200ms | Default |
| Cursor Hint | Page Load | 2000ms (loop) | 1000ms | Linear |
| Feature 1 | In View | 600ms | 0ms | Default |
| Feature 2 | In View | 600ms | 100ms | Default |
| Feature 3 | In View | 600ms | 200ms | Default |
| Feature 4 | In View | 600ms | 300ms | Default |
| Final CTA | In View | 600ms | 0ms | Default |
| Counter | On Change | 500ms | 0ms | Power2 Out |
| Screen Shake | On Hit | 100ms (x2) | 0ms | Power2 InOut |
| CTA Explosion | On Click | 600ms | 0ms | Power2 Out |

## Component Styles

### Hero Section
```css
height: 100vh;
background: #030308;
overflow: hidden;
position: relative;
```

### Stats Bar
```css
position: sticky;
top: 0;
z-index: 20;
background: rgba(3, 3, 8, 0.8);
backdrop-filter: blur(12px);
border-bottom: 1px solid rgba(0, 240, 255, 0.2);
```

### Feature Cards
```css
position: relative;
background: #030308;
border: 1px solid rgba(0, 240, 255, 0.2);
border-radius: 1rem;
padding: 2rem;
transition: border-color 300ms;

/* Glow Layer */
::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(0, 128, 255, 0.1));
  border-radius: 1rem;
  filter: blur(40px);
  opacity: 0;
  transition: opacity 300ms;
}

:hover::before {
  opacity: 1;
}
```

### CTA Button
```css
position: relative;
padding: 1.5rem 3rem;
font-size: 1.5rem;
font-weight: 700;
border-radius: 9999px;
overflow: hidden;
cursor: pointer;

/* Animated Background */
::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #00f0ff, #0080ff);
  background-size: 200% 200%;
  animation: gradientShift 3s linear infinite;
}

/* Hover Glow */
::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #00f0ff;
  opacity: 0;
  filter: blur(60px);
  transition: opacity 300ms;
}

:hover::after {
  opacity: 0.5;
}
```

## Canvas Visual Styles

### Puck Rendering
```javascript
// Outer Glow
ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
  .addColorStop(0, `${color}80`)
  .addColorStop(0.5, `${color}40`)
  .addColorStop(1, `${color}00`)

// Core Circle
ctx.fillStyle = color;  // Solid

// Highlight Spot
ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.4, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
```

### Trail Rendering
```javascript
trail.forEach((point, i) => {
  const alpha = (1 - (i / TRAIL_LENGTH)) * 0.3;
  ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
  ctx.arc(point.x, point.y, radius * 0.8, 0, Math.PI * 2);
});
```

### Particle Rendering
```javascript
ctx.fillStyle = `rgba(0, 240, 255, ${particle.alpha})`;
ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
```

## Responsive Breakpoints

### Breakpoint System
```css
/* Mobile First */
@media (min-width: 768px)  { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Large Desktop */ }
```

### Responsive Adjustments

| Element | Mobile (< 768px) | Desktop (>= 768px) |
|---------|------------------|-------------------|
| Hero H1 | 4.5rem (72px) | 9rem (144px) |
| Hero H2 | 3rem (48px) | 7rem (112px) |
| Hero Body | 1.25rem (20px) | 1.5rem (24px) |
| CTA Button | 1.5rem (24px) | 2rem (32px) |
| Section Heading | 3rem (48px) | 4rem (64px) |
| Feature Grid | 1 column | 4 columns |
| Stats Grid | 3 columns | 3 columns |
| Container Padding | px-4 (16px) | px-4 (16px) |

## Accessibility

### Color Contrast Ratios

| Foreground | Background | Ratio | WCAG Level |
|------------|-----------|-------|------------|
| #ffffff | #030308 | 18.5:1 | AAA |
| #00f0ff | #030308 | 7.2:1 | AA |
| #9ca3af | #030308 | 4.8:1 | AA |

### Focus States
```css
:focus-visible {
  outline: 2px solid #00f0ff;
  outline-offset: 4px;
}
```

## Design Tokens (Tailwind Config)

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'space-black': '#030308',
        'cyan': {
          100: '#00f0ff',
          80: '#00d4ff',
          60: '#00b8ff',
          40: '#009cff',
          20: '#0080ff',
        }
      },
      fontFamily: {
        'display': ['var(--font-orbitron)', 'sans-serif'],
        'body': ['var(--font-inter)', 'sans-serif'],
      }
    }
  }
}
```

---

This design system ensures visual consistency across the entire landing page while maintaining the addictive, high-energy aesthetic of a physics playground.
