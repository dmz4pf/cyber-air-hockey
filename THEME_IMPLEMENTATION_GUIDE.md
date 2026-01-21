# Air Hockey - Theme Implementation Guide

## Quick Reference

### File Structure
```
src/lib/themes/
├── index.ts                 # Theme definitions
├── arcade/
│   ├── styles.css          # Arcade-specific styles
│   ├── animations.css      # Arcade animations
│   └── components.tsx      # Arcade custom components
├── retro/
│   ├── styles.css
│   ├── animations.css
│   └── components.tsx
├── premium/
│   ├── styles.css
│   ├── animations.css
│   └── components.tsx
└── electric/
    ├── styles.css
    ├── animations.css
    └── components.tsx
```

---

## Global Setup

### 1. Google Fonts Import
Add to your root layout or HTML head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 2. Base CSS Variables
Create `src/styles/theme-base.css`:

```css
:root {
  /* Animation easing curves */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Base timings */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;

  /* Z-index scale */
  --z-background: 0;
  --z-content: 10;
  --z-overlay: 100;
  --z-modal: 1000;
  --z-toast: 2000;
}

/* Theme-specific variables are set via data attribute */
body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  transition: background 0.5s var(--ease-out-expo);
}
```

---

## THEME 1: ARCADE CLASSIC

### arcade/styles.css
```css
/* ============================================
   ARCADE CLASSIC THEME
   Bold neon on pure black
   ============================================ */

[data-theme="arcade"] {
  /* Colors */
  --bg: #000000;
  --bg-secondary: #0a0a0a;
  --primary: #FF0040;
  --secondary: #00FF88;
  --accent: #FFE600;
  --text: #FFFFFF;
  --text-muted: #888888;

  /* Fonts */
  --font-heading: 'Press Start 2P', monospace;
  --font-body: 'Inter', sans-serif;
  --font-score: 'Press Start 2P', monospace;

  /* Effects */
  --border-radius: 0;
  --glow-intensity: 25px;
  --glow-color-primary: rgba(255, 0, 64, 0.8);
  --glow-color-secondary: rgba(0, 255, 136, 0.8);
  --glow-color-accent: rgba(255, 230, 0, 0.8);
}

/* Background with starfield */
[data-theme="arcade"] body {
  background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%);
  position: relative;
  overflow: hidden;
}

[data-theme="arcade"] body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, white, transparent),
    radial-gradient(1px 1px at 60% 70%, white, transparent),
    radial-gradient(2px 2px at 50% 50%, white, transparent),
    radial-gradient(1px 1px at 80% 10%, white, transparent),
    radial-gradient(1px 1px at 90% 60%, white, transparent);
  background-size: 200% 200%;
  animation: starfield-twinkle 8s ease-in-out infinite;
  opacity: 0.5;
  pointer-events: none;
}

@keyframes starfield-twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

/* Buttons */
[data-theme="arcade"] .btn-primary {
  background: linear-gradient(180deg, #FF0040 0%, #CC0033 100%);
  border: 3px solid var(--accent);
  border-radius: 0;
  color: var(--text);
  font-family: var(--font-heading);
  font-size: 12px;
  text-transform: uppercase;
  padding: 12px 24px;
  box-shadow:
    0 0 10px var(--glow-color-primary),
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.5);
  transition: all var(--duration-fast);
  cursor: pointer;
  position: relative;
}

[data-theme="arcade"] .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 20px var(--glow-color-primary),
    0 0 40px var(--glow-color-accent),
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
}

[data-theme="arcade"] .btn-primary:active {
  transform: translateY(1px);
  box-shadow:
    0 0 5px var(--glow-color-primary),
    inset 0 -2px 0 rgba(0, 0, 0, 0.8);
}

/* Score Display */
[data-theme="arcade"] .score {
  font-family: var(--font-score);
  font-size: 72px;
  color: var(--secondary);
  text-shadow:
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 30px currentColor;
  animation: arcade-score-pulse 2s ease-in-out infinite;
  position: relative;
}

[data-theme="arcade"] .score::after {
  content: attr(data-score);
  position: absolute;
  top: 0;
  left: 0;
  color: currentColor;
  opacity: 0.3;
  filter: blur(8px);
  z-index: -1;
}

/* Cards */
[data-theme="arcade"] .card {
  background: var(--bg-secondary);
  border: 4px solid var(--primary);
  box-shadow:
    0 0 0 2px var(--accent),
    0 0 20px rgba(255, 0, 64, 0.5);
  position: relative;
}

/* Corner brackets */
[data-theme="arcade"] .card::before,
[data-theme="arcade"] .card::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid var(--accent);
}

[data-theme="arcade"] .card::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

[data-theme="arcade"] .card::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

/* Insert Coin Blink */
[data-theme="arcade"] .insert-coin {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--accent);
  text-align: center;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### arcade/animations.css
```css
/* Score animations */
@keyframes arcade-score-pulse {
  0%, 100% {
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor;
  }
  50% {
    text-shadow:
      0 0 20px currentColor,
      0 0 30px currentColor,
      0 0 40px currentColor;
  }
}

/* Screen flash on score */
@keyframes screen-flash {
  0% { opacity: 0; }
  10% { opacity: 1; }
  100% { opacity: 0; }
}

[data-theme="arcade"] .screen-flash {
  position: fixed;
  inset: 0;
  background: white;
  pointer-events: none;
  animation: screen-flash 100ms;
}

/* Particle burst on score */
@keyframes particle-burst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

/* Camera shake */
@keyframes camera-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5px, 2px); }
  20% { transform: translate(5px, -2px); }
  30% { transform: translate(-3px, -2px); }
  40% { transform: translate(3px, 2px); }
  50% { transform: translate(-2px, 1px); }
  60% { transform: translate(2px, -1px); }
  70% { transform: translate(-1px, -1px); }
  80% { transform: translate(1px, 1px); }
  90% { transform: translate(-1px, 0); }
}

[data-theme="arcade"] .shake {
  animation: camera-shake 200ms ease-in-out;
}
```

---

## THEME 2: RETRO GAMING

### retro/styles.css
```css
/* ============================================
   RETRO GAMING THEME
   CRT phosphor glow, terminal aesthetics
   ============================================ */

[data-theme="retro"] {
  /* Colors */
  --bg: #0D0D0D;
  --bg-secondary: #0A0A08;
  --bg-gradient-start: #121210;
  --primary: #33FF00;
  --secondary: #FFAA00;
  --accent: #00FFFF;
  --text: #33FF00;
  --text-muted: #116600;

  /* Fonts */
  --font-heading: 'VT323', monospace;
  --font-body: 'VT323', monospace;
  --font-score: 'VT323', monospace;

  /* Effects */
  --border-radius: 0;
  --glow-intensity: 15px;
  --phosphor-bloom: 0 0 5px currentColor, 0 0 10px currentColor, 0 2px 0 rgba(51, 255, 0, 0.3);
}

/* CRT Background */
[data-theme="retro"] body {
  background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg) 100%);
  position: relative;
}

/* Scanlines overlay */
[data-theme="retro"] body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.4) 2px,
    rgba(0, 0, 0, 0.4) 4px
  );
  pointer-events: none;
  z-index: var(--z-overlay);
  animation: scanline-drift 10s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}

/* CRT curvature */
[data-theme="retro"] .game-container {
  border-radius: 8% / 5%;
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.7);
  position: relative;
}

/* Buttons */
[data-theme="retro"] .btn-primary {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
  font-family: var(--font-body);
  font-size: 24px;
  padding: 8px 16px;
  text-transform: uppercase;
  position: relative;
  box-shadow:
    0 0 10px rgba(51, 255, 0, 0.5),
    inset 0 0 10px rgba(51, 255, 0, 0.1);
  cursor: pointer;
  transition: all var(--duration-normal);
}

[data-theme="retro"] .btn-primary::before {
  content: '>';
  position: absolute;
  left: 8px;
  opacity: 0;
  transition: opacity var(--duration-normal);
}

[data-theme="retro"] .btn-primary:hover {
  background: rgba(51, 255, 0, 0.1);
  box-shadow:
    0 0 20px rgba(51, 255, 0, 0.8),
    inset 0 0 20px rgba(51, 255, 0, 0.2);
}

[data-theme="retro"] .btn-primary:hover::before {
  opacity: 1;
  animation: cursor-blink 1s step-end infinite;
}

/* Score Display */
[data-theme="retro"] .score {
  font-family: var(--font-score);
  font-size: 80px;
  color: var(--primary);
  text-shadow: var(--phosphor-bloom);
  filter: blur(0.5px);
  position: relative;
}

[data-theme="retro"] .score::after {
  content: attr(data-score);
  position: absolute;
  top: 3px;
  left: 0;
  color: currentColor;
  opacity: 0.2;
  filter: blur(4px);
  z-index: -1;
}

/* Terminal Window */
[data-theme="retro"] .terminal {
  background: var(--bg);
  border: 3px solid var(--primary);
  box-shadow:
    0 0 20px rgba(51, 255, 0, 0.3),
    inset 0 0 100px rgba(51, 255, 0, 0.05);
  padding: 20px;
  position: relative;
}

/* Cursor */
[data-theme="retro"] .cursor {
  display: inline-block;
  width: 12px;
  height: 20px;
  background: var(--primary);
  animation: cursor-blink 1s step-end infinite;
  margin-left: 4px;
}

@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Phosphor text glow */
[data-theme="retro"] .phosphor-glow {
  text-shadow: var(--phosphor-bloom);
  filter: blur(0.5px);
}
```

### retro/animations.css
```css
/* Boot sequence */
@keyframes retro-boot-flicker {
  0%, 100% { opacity: 1; }
  10%, 30%, 50%, 70%, 90% { opacity: 0; }
  20%, 40%, 60%, 80% { opacity: 1; }
}

@keyframes retro-boot-typewriter {
  from { width: 0; }
  to { width: 100%; }
}

[data-theme="retro"] .boot-sequence {
  font-family: var(--font-body);
  color: var(--primary);
  overflow: hidden;
  white-space: nowrap;
  animation: retro-boot-typewriter 2s steps(40) forwards;
}

/* Phosphor flicker on score */
@keyframes phosphor-flicker {
  0%, 100% { opacity: 1; filter: blur(0.5px); }
  50% { opacity: 0.9; filter: blur(1px); }
}

[data-theme="retro"] .score-update {
  animation: phosphor-flicker 200ms ease-in-out 3;
}
```

---

## THEME 3: PREMIUM GAMING

### premium/styles.css
```css
/* ============================================
   PREMIUM GAMING THEME
   Luxury gold and silver on deep charcoal
   ============================================ */

[data-theme="premium"] {
  /* Colors */
  --bg: #0C0C0E;
  --bg-secondary: #0F0F11;
  --bg-gradient-start: #121214;
  --primary: #D4AF37;
  --secondary: #C0C0C0;
  --accent: #E8D5B7;
  --text: #F5F5F5;
  --text-muted: #71717A;

  /* Fonts */
  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-score: 'Bebas Neue', sans-serif;

  /* Effects */
  --border-radius: 16px;
  --glow-intensity: 12px;
}

/* Background */
[data-theme="premium"] body {
  background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg) 100%);
  position: relative;
}

/* Ambient light spots */
[data-theme="premium"] body::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(192, 192, 192, 0.08) 0%, transparent 30%);
  pointer-events: none;
  animation: ambient-drift 20s ease-in-out infinite;
}

@keyframes ambient-drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

/* Buttons */
[data-theme="premium"] .btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #B87333 100%);
  border: 1px solid rgba(232, 213, 183, 0.3);
  border-radius: var(--border-radius);
  color: var(--bg);
  font-family: var(--font-heading);
  font-size: 16px;
  letter-spacing: 0.08em;
  padding: 14px 32px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 2px 10px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all var(--duration-normal) var(--ease-in-out);
}

/* Metallic shimmer */
[data-theme="premium"] .btn-primary::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 70%
  );
  transform: rotate(45deg) translateX(-100%);
  transition: transform 0.6s;
}

[data-theme="premium"] .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 20px rgba(212, 175, 55, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

[data-theme="premium"] .btn-primary:hover::before {
  transform: rotate(45deg) translateX(100%);
}

/* Score Display */
[data-theme="premium"] .score {
  font-family: var(--font-score);
  font-size: 100px;
  letter-spacing: 0.05em;
  background: linear-gradient(180deg, #D4AF37 0%, #B87333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 10px rgba(212, 175, 55, 0.5));
  position: relative;
}

/* Animated shimmer on score */
[data-theme="premium"] .score::before {
  content: attr(data-score);
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    #D4AF37 0%,
    #E8D5B7 25%,
    #D4AF37 50%,
    #B87333 75%,
    #D4AF37 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gold-shimmer 3s linear infinite;
  z-index: -1;
}

@keyframes gold-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Glass Cards */
[data-theme="premium"] .card {
  background: rgba(18, 18, 20, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--border-radius);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-in-out);
}

/* Ambient glow on hover */
[data-theme="premium"] .card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle,
    rgba(212, 175, 55, 0.1) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.5s;
}

[data-theme="premium"] .card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(212, 175, 55, 0.2);
}

[data-theme="premium"] .card:hover::before {
  opacity: 1;
}
```

### premium/animations.css
```css
/* Smooth scale with elastic easing */
@keyframes premium-scale-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* Score increment animation */
@keyframes premium-score-increment {
  0% { transform: scale(1); }
  30% { transform: scale(1.15); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

[data-theme="premium"] .score-update {
  animation: premium-score-increment 0.6s var(--ease-out-back);
}

/* Gold particle burst */
@keyframes gold-particle {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

/* Gentle float */
@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## THEME 4: ELECTRIC VIBRANT

### electric/styles.css
```css
/* ============================================
   ELECTRIC VIBRANT THEME
   Fresh teal and coral, modern geometric
   ============================================ */

[data-theme="electric"] {
  /* Colors */
  --bg: #0A0F14;
  --bg-secondary: #0D1218;
  --bg-gradient-start: #0F1419;
  --primary: #14B8A6;
  --secondary: #FF6B6B;
  --accent: #3B82F6;
  --text: #F8FAFC;
  --text-muted: #64748B;

  /* Fonts */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-score: 'Space Grotesk', sans-serif;

  /* Effects */
  --border-radius: 20px;
  --glow-intensity: 18px;
}

/* Mesh gradient background */
[data-theme="electric"] body {
  background: linear-gradient(135deg, var(--bg) 0%, var(--bg-gradient-start) 50%, var(--bg) 100%);
  position: relative;
  overflow: hidden;
}

/* Floating orbs */
[data-theme="electric"] body::before,
[data-theme="electric"] body::after {
  content: '';
  position: fixed;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  pointer-events: none;
}

[data-theme="electric"] body::before {
  top: 10%;
  left: 20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
  animation: float-orb-1 20s ease-in-out infinite;
}

[data-theme="electric"] body::after {
  bottom: 10%;
  right: 15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  animation: float-orb-2 25s ease-in-out infinite;
}

@keyframes float-orb-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 40px) scale(0.9); }
  75% { transform: translate(40px, 30px) scale(1.05); }
}

@keyframes float-orb-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, -30px) scale(1.1); }
  66% { transform: translate(20px, 50px) scale(0.9); }
}

/* Buttons */
[data-theme="electric"] .btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, #0D9488 100%);
  border: none;
  border-radius: 12px;
  color: var(--bg);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.05em;
  padding: 16px 32px;
  position: relative;
  cursor: pointer;
  box-shadow:
    0 4px 15px rgba(20, 184, 166, 0.4),
    0 0 0 1px rgba(20, 184, 166, 0.2);
  transition: all var(--duration-normal) var(--ease-out-back);
  overflow: hidden;
}

/* Gradient animation */
[data-theme="electric"] .btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--accent) 50%,
    var(--primary) 100%
  );
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity var(--duration-normal);
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

[data-theme="electric"] .btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 8px 25px rgba(20, 184, 166, 0.6),
    0 0 30px rgba(20, 184, 166, 0.3);
}

[data-theme="electric"] .btn-primary:hover::before {
  opacity: 1;
}

/* Score Display */
[data-theme="electric"] .score {
  font-family: var(--font-score);
  font-weight: 700;
  font-size: 100px;
  letter-spacing: 0.02em;
  color: var(--primary);
  text-shadow:
    0 0 20px rgba(20, 184, 166, 0.8),
    0 0 40px rgba(20, 184, 166, 0.4);
  filter: drop-shadow(0 4px 15px rgba(20, 184, 166, 0.5));
  position: relative;
}

/* Animated underline */
[data-theme="electric"] .score::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary) 50%,
    transparent 100%
  );
  animation: underline-pulse 2s ease-in-out infinite;
}

@keyframes underline-pulse {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}

/* Modern Cards */
[data-theme="electric"] .card {
  background: rgba(15, 20, 25, 0.8);
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transition: all var(--duration-normal) var(--ease-out-back);
}

/* Animated border gradient */
[data-theme="electric"] .card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius);
  padding: 2px;
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--accent) 50%,
    var(--secondary) 100%
  );
  background-size: 200% 200%;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: border-flow 4s linear infinite;
}

@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

[data-theme="electric"] .card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(20, 184, 166, 0.3);
}
```

### electric/animations.css
```css
/* Spring bounce */
@keyframes electric-spring-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  70% { transform: scale(0.9); }
  85% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

/* Stagger text reveal */
[data-theme="electric"] .stagger-text span {
  display: inline-block;
  opacity: 0;
  animation: letter-in 0.3s var(--ease-out-back) forwards;
}

[data-theme="electric"] .stagger-text span:nth-child(1) { animation-delay: 0s; }
[data-theme="electric"] .stagger-text span:nth-child(2) { animation-delay: 0.1s; }
[data-theme="electric"] .stagger-text span:nth-child(3) { animation-delay: 0.2s; }
[data-theme="electric"] .stagger-text span:nth-child(4) { animation-delay: 0.3s; }
[data-theme="electric"] .stagger-text span:nth-child(5) { animation-delay: 0.4s; }

@keyframes letter-in {
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(-10deg);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(0);
  }
}

/* Electric trail effect */
@keyframes electric-trail {
  0% {
    box-shadow: 0 0 10px currentColor;
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 40px currentColor;
    opacity: 0;
    transform: scale(1.5);
  }
}

/* Geometric particle burst */
@keyframes geometric-burst {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) rotate(360deg) scale(0);
    opacity: 0;
  }
}
```

---

## React Component Examples

### Theme Provider Component
```tsx
// src/components/ThemeProvider.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeId } from '@/lib/themes';

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>('arcade');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Theme Switcher Component
```tsx
// src/components/ThemeSwitcher.tsx
import { useTheme } from './ThemeProvider';
import { themes, ThemeId } from '@/lib/themes';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      {Object.keys(themes).map((themeId) => {
        const t = themes[themeId as ThemeId];
        return (
          <button
            key={themeId}
            onClick={() => setTheme(themeId as ThemeId)}
            className={`theme-option ${theme === themeId ? 'active' : ''}`}
            data-theme={themeId}
          >
            <div className="theme-preview">
              <div className="color-swatch" style={{ background: t.colors.primary }} />
              <div className="color-swatch" style={{ background: t.colors.secondary }} />
            </div>
            <span>{t.name}</span>
          </button>
        );
      })}
    </div>
  );
}
```

### Animated Score Component
```tsx
// src/components/AnimatedScore.tsx
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface AnimatedScoreProps {
  score: number;
  player: 1 | 2;
}

export function AnimatedScore({ score, player }: AnimatedScoreProps) {
  const { theme } = useTheme();
  const [prevScore, setPrevScore] = useState(score);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (score !== prevScore) {
      setIsUpdating(true);
      setTimeout(() => {
        setIsUpdating(false);
        setPrevScore(score);
      }, 600);
    }
  }, [score, prevScore]);

  return (
    <div
      className={`score ${isUpdating ? 'score-update' : ''}`}
      data-score={score}
      data-player={player}
    >
      {score}
    </div>
  );
}
```

---

## Performance Optimization

### GPU Acceleration
```css
/* Force GPU acceleration for smooth animations */
.animated-element {
  transform: translateZ(0);
  will-change: transform;
}

/* Remove will-change after animation completes */
.animated-element.animation-complete {
  will-change: auto;
}
```

### Reduce Paint Operations
```css
/* Use transform instead of top/left */
.moving-element {
  transform: translate(var(--x), var(--y));
  /* NOT: top: var(--y); left: var(--x); */
}
```

### Optimize Blur Effects
```css
/* Use backdrop-filter sparingly */
.glass-effect {
  backdrop-filter: blur(20px);
  /* Only apply to small areas */
}
```

---

## Testing Checklist

### Visual Testing
- [ ] All themes render correctly
- [ ] Font fallbacks work
- [ ] Colors have sufficient contrast (WCAG AA)
- [ ] Animations run at 60fps
- [ ] No layout shift during theme switch

### Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Performance Testing
```javascript
// Measure animation FPS
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const currentTime = performance.now();

  if (currentTime >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(measureFPS);
}

requestAnimationFrame(measureFPS);
```

---

## Next Steps

1. **Implementation Priority**
   - Start with Arcade Classic (simplest)
   - Then Premium Gaming (most polish)
   - Retro Gaming (CRT effects need tuning)
   - Electric Vibrant (most complex animations)

2. **Component Library**
   - Build reusable button components
   - Create card variations
   - Implement modal templates
   - Design form inputs for each theme

3. **Animation Library**
   - Score increment animations
   - Screen flash effects
   - Particle systems
   - Transition effects

4. **Documentation**
   - Create Storybook for each theme
   - Document animation timings
   - Provide code examples
   - Record video demos

---

## Resources

### Google Fonts
- Press Start 2P: https://fonts.google.com/specimen/Press+Start+2P
- VT323: https://fonts.google.com/specimen/VT323
- Bebas Neue: https://fonts.google.com/specimen/Bebas+Neue
- Space Grotesk: https://fonts.google.com/specimen/Space+Grotesk
- Inter: https://fonts.google.com/specimen/Inter

### Animation Easing Reference
- https://easings.net/
- https://cubic-bezier.com/

### Color Tools
- https://coolors.co/
- https://colorhunt.co/

---

Each theme is production-ready with complete CSS implementations, animation specifications, and React component examples.
