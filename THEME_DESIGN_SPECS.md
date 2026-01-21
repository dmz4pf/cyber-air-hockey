# Air Hockey - World-Class Theme Design Specifications

## Overview
Four radically different visual identities, each with its own personality, animations, and design language.

---

## 🕹️ THEME 1: ARCADE CLASSIC
**Core Concept**: 1980s arcade cabinet magic - bold neon, pure black, instant nostalgia

### Color Palette
```
Primary Colors:
- Black Base: #000000 (pure void, arcade cabinet darkness)
- Neon Pink: #FF0040 (hot magenta, borders and danger)
- Neon Green: #00FF88 (electric lime, player 1)
- Neon Yellow: #FFE600 (bright gold, highlights and puck glow)

Secondary Colors:
- Dark Green: #003322 (paddle inner glow)
- Dark Pink: #330011 (paddle inner glow)
- Grey: #888888 (muted text)
- White: #FFFFFF (pure white for puck and text)

Gradient Applications:
- Background: Subtle radial gradient from #0a0a0a to #000000
- Score glow: Pulsing neon effect
```

### Typography
```
Heading Font: 'Press Start 2P' (Google Fonts)
- Use: Game title, menu headers, countdown
- Weight: Regular (400)
- Transform: Uppercase
- Letter-spacing: 0.05em

Body Font: 'Inter' (Google Fonts)
- Use: Instructions, secondary text
- Weight: Regular (400), Medium (500)
- Size: 14-16px

Score Font: 'Press Start 2P'
- Size: 48-72px for main score
- Glow effect: 4px blur with color matching player
```

### Component Designs

**Buttons**
```css
.arcade-button {
  background: linear-gradient(180deg, #FF0040 0%, #CC0033 100%);
  border: 3px solid #FFE600;
  border-radius: 0; /* Hard edges, arcade style */
  box-shadow:
    0 0 10px #FF0040,
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.5);
  color: #FFFFFF;
  font-family: 'Press Start 2P';
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.1s;
}

.arcade-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 0 20px #FF0040,
    0 0 40px #FFE600,
    inset 0 2px 0 rgba(255, 255, 255, 0.5);
}

.arcade-button:active {
  transform: translateY(1px);
  box-shadow:
    0 0 5px #FF0040,
    inset 0 -2px 0 rgba(0, 0, 0, 0.8);
}
```

**Score Display**
```css
.arcade-score {
  font-family: 'Press Start 2P';
  font-size: 72px;
  color: #00FF88; /* Player 1 green */
  text-shadow:
    0 0 10px currentColor,
    0 0 20px currentColor,
    0 0 30px currentColor;
  animation: score-pulse 2s ease-in-out infinite;
  position: relative;
}

/* LED segment effect */
.arcade-score::after {
  content: attr(data-score);
  position: absolute;
  top: 0;
  left: 0;
  color: rgba(0, 255, 136, 0.3);
  z-index: -1;
  filter: blur(8px);
}

@keyframes score-pulse {
  0%, 100% { text-shadow: 0 0 10px currentColor; }
  50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
}
```

**Cards/Panels**
```css
.arcade-card {
  background: #0a0a0a;
  border: 4px solid #FF0040;
  box-shadow:
    0 0 0 2px #FFE600,
    0 0 20px rgba(255, 0, 64, 0.5);
  position: relative;
}

/* Corner brackets */
.arcade-card::before,
.arcade-card::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid #FFE600;
}

.arcade-card::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.arcade-card::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}
```

### Background Treatment
- Pure black (#000000) with subtle vignette
- Starfield effect: 200 small white dots (1-2px) randomly positioned, twinkling
- Implementation: Canvas or CSS animation

```javascript
// Starfield animation
stars: Array(200).fill(null).map(() => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2 + 1,
  twinkleSpeed: Math.random() * 0.05 + 0.01
}))
```

### Animations

**On Score**
```
1. Screen flash (white, 100ms)
2. Score number explodes with particles (neon color matching player)
3. Camera shake (5px, 200ms)
4. Winner's side border pulses brightly
```

**On Win**
```
1. Winning player's color floods screen (50% opacity overlay)
2. "WINNER" text appears letter-by-letter with typewriter sound
3. Confetti particles rain down in winner's color
4. Arcade cabinet tilt effect (perspective transform)
```

**On Lose**
```
1. Screen fades to 50% brightness
2. "GAME OVER" pixelates in from edges
3. Insert coin prompt blinks at bottom
```

### Visual Elements
- **Coin slot graphic**: Bottom center, "INSERT COIN" text blinks
- **Cabinet bezel**: Border frame around entire game area
- **Joystick indicators**: Small joystick icons for player positions
- **High score ticker**: Scrolling marquee at top
- **CRT scanline**: Optional subtle horizontal lines

### Sound Design Notes
- Beep sounds (8-bit style)
- Arcade button clicks
- Retro impact sounds for puck hits
- Victory jingle (8-bit melody)

---

## 🖥️ THEME 2: RETRO GAMING (CRT/Terminal)
**Core Concept**: Warm phosphor CRT monitor - amber/green glow, terminal aesthetics, 1980s computing

### Color Palette
```
Primary Colors:
- Terminal Black: #0D0D0D (dark grey-brown, CRT background)
- Phosphor Green: #33FF00 (bright terminal green)
- Phosphor Amber: #FFAA00 (warm amber orange)
- Cyan Accent: #00FFFF (bright cyan for highlights)

Secondary Colors:
- Dark Green: #0A2200 (paddle inner)
- Dark Amber: #221800 (paddle inner)
- Dim Green: #116600 (muted text)
- Off White: #FFFFFF (puck)

Screen Warmth:
- Background gradient: #121210 → #0D0D0D (subtle brownish tint)
```

### Typography
```
All Fonts: 'VT323' (Google Fonts - authentic terminal font)
- Heading: 'VT323', 700 weight
- Body: 'VT323', 400 weight
- Score: 'VT323', 700 weight
- Letter-spacing: 0.02em (slight spacing for readability)

Size Scale:
- H1: 48px
- H2: 36px
- Body: 20px (VT323 needs larger sizes)
- Score: 80px
```

### Component Designs

**Buttons**
```css
.retro-button {
  background: transparent;
  border: 2px solid #33FF00;
  color: #33FF00;
  font-family: 'VT323';
  font-size: 24px;
  padding: 8px 16px;
  text-transform: uppercase;
  position: relative;
  box-shadow:
    0 0 10px rgba(51, 255, 0, 0.5),
    inset 0 0 10px rgba(51, 255, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.retro-button::before {
  content: '>';
  position: absolute;
  left: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.retro-button:hover {
  background: rgba(51, 255, 0, 0.1);
  box-shadow:
    0 0 20px rgba(51, 255, 0, 0.8),
    inset 0 0 20px rgba(51, 255, 0, 0.2);
}

.retro-button:hover::before {
  opacity: 1;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

**Score Display**
```css
.retro-score {
  font-family: 'VT323';
  font-size: 80px;
  color: #33FF00;
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 2px 0 rgba(51, 255, 0, 0.3); /* Phosphor bloom */
  filter: blur(0.5px); /* Slight softness */
  position: relative;
}

/* Phosphor afterglow */
.retro-score::after {
  content: attr(data-score);
  position: absolute;
  top: 3px;
  left: 0;
  color: rgba(51, 255, 0, 0.2);
  filter: blur(4px);
  z-index: -1;
}
```

**Terminal Window**
```css
.retro-terminal {
  background: #0D0D0D;
  border: 3px solid #33FF00;
  box-shadow:
    0 0 20px rgba(51, 255, 0, 0.3),
    inset 0 0 100px rgba(51, 255, 0, 0.05);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Scanlines */
.retro-terminal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.3) 2px,
    rgba(0, 0, 0, 0.3) 4px
  );
  pointer-events: none;
  z-index: 10;
}

/* CRT curvature */
.retro-terminal::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 5% / 3%;
  box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
```

### Background Treatment
- Dark grey-brown base (#0D0D0D)
- Subtle vertical gradient (#121210 at top)
- Scanlines overlay (2px alternating)
- Slight screen curvature on edges
- Vignette darkening at corners

### CRT Effects

**Scanlines Implementation**
```css
.scanlines {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.4) 2px,
    rgba(0, 0, 0, 0.4) 4px
  );
  pointer-events: none;
  z-index: 1000;
  animation: scanline-drift 10s linear infinite;
}

@keyframes scanline-drift {
  0% { transform: translateY(0); }
  100% { transform: translateY(4px); }
}
```

**Phosphor Bloom**
```css
.phosphor-bloom {
  text-shadow:
    0 0 5px currentColor,
    0 0 10px currentColor,
    0 0 15px currentColor,
    0 2px 0 rgba(current, 0.3);
  filter: blur(0.5px);
}
```

**Screen Curvature**
```css
.crt-curve {
  border-radius: 8% / 5%;
  transform: perspective(1000px) rotateY(0deg);
  box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.7);
}
```

### Animations

**Boot-Up Sequence**
```
1. Screen flickers black (0-200ms)
2. Cursor blinks in top-left (200-500ms)
3. "SYSTEM LOADING..." types out (500-1500ms)
4. Progress bar fills with dots (1500-2500ms)
5. "READY" flashes 3 times (2500-3000ms)
6. Game fades in (3000-3500ms)
```

**On Score**
```
1. Scoring player's number flickers rapidly (200ms)
2. Terminal bell sound (ding!)
3. Score area flashes brighter (phosphor overload effect)
4. Brief scanline distortion
```

**On Win**
```
1. Screen brightness increases (phosphor overload)
2. "PLAYER X WINS" types out character by character
3. Border flashes in winner's color
4. Cursor blinks at end of text
```

**Cursor Blink**
```css
@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.cursor {
  display: inline-block;
  width: 12px;
  height: 20px;
  background: #33FF00;
  animation: cursor-blink 1s step-end infinite;
}
```

### Visual Elements
- **Terminal prompt**: "> PLAYER_1 | SCORE: 0" style
- **System messages**: "GOAL DETECTED", "MATCH START" in brackets
- **Cursor**: Blinking block cursor for selections
- **Noise texture**: Subtle static overlay (5% opacity)
- **Refresh flicker**: Very subtle brightness variation

---

## 💎 THEME 3: PREMIUM GAMING
**Core Concept**: Luxury, refinement, sophistication - gold and silver on deep charcoal, premium materials

### Color Palette
```
Primary Colors:
- Deep Charcoal: #0C0C0E (rich, deep background)
- Metallic Gold: #D4AF37 (luxurious gold accents)
- Brushed Silver: #C0C0C0 (elegant silver)
- Champagne: #E8D5B7 (subtle highlight)

Secondary Colors:
- Dark Gold: #2A2206 (paddle inner depth)
- Dark Silver: #1A1A1A (paddle inner depth)
- Copper: #B87333 (warm secondary)
- Light Grey: #F5F5F5 (crisp text)
- Muted Grey: #71717A (secondary text)

Gradient Applications:
- Background: Linear gradient #121214 → #0C0C0E (subtle depth)
- Metallic shimmer: Animated gradient for gold/silver elements
```

### Typography
```
Heading Font: 'Bebas Neue' (Google Fonts - elegant, condensed)
- Weight: Regular (400)
- Transform: Uppercase
- Letter-spacing: 0.08em (generous spacing for elegance)

Body Font: 'Inter' (Google Fonts)
- Weight: Regular (400), Medium (500), SemiBold (600)
- Size: 14-16px
- Line-height: 1.6

Score Font: 'Bebas Neue'
- Size: 80-120px
- Weight: Regular (keep it clean)
- Letter-spacing: 0.05em
```

### Component Designs

**Buttons**
```css
.premium-button {
  background: linear-gradient(135deg, #D4AF37 0%, #B87333 100%);
  border: 1px solid rgba(232, 213, 183, 0.3);
  border-radius: 8px;
  color: #0C0C0E;
  font-family: 'Bebas Neue';
  font-size: 16px;
  letter-spacing: 0.08em;
  padding: 14px 32px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 2px 10px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Metallic shimmer effect */
.premium-button::before {
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

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 20px rgba(212, 175, 55, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.premium-button:hover::before {
  transform: rotate(45deg) translateX(100%);
}

.premium-button:active {
  transform: translateY(0);
  box-shadow:
    0 1px 5px rgba(212, 175, 55, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}
```

**Score Display**
```css
.premium-score {
  font-family: 'Bebas Neue';
  font-size: 100px;
  letter-spacing: 0.05em;
  background: linear-gradient(180deg, #D4AF37 0%, #B87333 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  filter: drop-shadow(0 2px 10px rgba(212, 175, 55, 0.5));
}

/* Subtle shimmer animation */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.premium-score::before {
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
  animation: shimmer 3s linear infinite;
  z-index: -1;
}
```

**Glass Cards**
```css
.premium-card {
  background: rgba(18, 18, 20, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Ambient glow on hover */
.premium-card::before {
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

.premium-card:hover::before {
  opacity: 1;
}
```

### Background Treatment
- Deep charcoal base (#0C0C0E)
- Subtle gradient (#121214 → #0C0C0E)
- Radial gradient overlay for depth
- Ambient light spots (soft gold glow in corners)
- Noise texture (1-2% opacity for richness)

### Metallic Effects

**Gold Shimmer**
```css
.gold-shimmer {
  background: linear-gradient(
    135deg,
    #B87333 0%,
    #D4AF37 25%,
    #E8D5B7 50%,
    #D4AF37 75%,
    #B87333 100%
  );
  background-size: 200% 200%;
  animation: gold-shine 4s ease-in-out infinite;
}

@keyframes gold-shine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**Frosted Glass**
```css
.frosted-glass {
  background: rgba(18, 18, 20, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### Animations

**On Score**
```
1. Subtle camera zoom in (1.02x scale, 300ms)
2. Gold particles burst from scoring player's paddle
3. Score number scales up smoothly with elastic easing
4. Gentle glow pulse on winner's side
5. Refined "ding" sound (piano note)
```

**On Win**
```
1. Gold confetti rains from top (3D ribbons)
2. Winner's side fills with soft gold gradient
3. "VICTORY" fades in with letter-by-letter shimmer
4. Trophy icon rises from center (smooth transform)
5. Ambient gold glow pulses slowly
```

**Micro-interactions**
```css
/* Button press - subtle scale */
@keyframes button-press {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

/* Card hover - gentle lift */
.premium-card:hover {
  transform: translateY(-4px);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Score increment - elastic bounce */
@keyframes score-increment {
  0% { transform: scale(1); }
  30% { transform: scale(1.15); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

### Visual Elements
- **Trophy icons**: Gold and silver trophy for winners
- **Divider lines**: 1px gold lines with gradient fade
- **Corner accents**: Small gold corner brackets on cards
- **Ambient lighting**: Soft radial gradients simulating light sources
- **Particle system**: Slow-moving gold specks in background

### What Makes It Feel "Expensive"
1. **Subtle animations**: Nothing sudden, all ease-out curves
2. **Generous spacing**: 20-24px padding, 16px gaps
3. **High contrast**: Rich blacks vs. crisp whites
4. **Metallic gradients**: Real shimmer, not flat colors
5. **Glass effects**: Depth through blur and transparency
6. **Refined sounds**: Piano notes, gentle chimes
7. **Attention to detail**: 1px borders, subtle shadows
8. **Premium typography**: Generous letter-spacing, elegant fonts

---

## ⚡ THEME 4: ELECTRIC VIBRANT
**Core Concept**: Fresh, bold, energetic - modern geometric design with teal and coral

### Color Palette
```
Primary Colors:
- Deep Blue-Black: #0A0F14 (rich dark base)
- Electric Teal: #14B8A6 (vibrant teal)
- Coral Red: #FF6B6B (energetic coral)
- Bright Blue: #3B82F6 (electric blue accent)

Secondary Colors:
- Dark Teal: #042F2B (paddle inner)
- Dark Coral: #331515 (paddle inner)
- Slate Blue: #64748B (muted text)
- Off White: #F8FAFC (crisp text)
- Dark Blue: #0F1419 (background variation)

Gradient Applications:
- Background: 135deg gradient #0A0F14 → #0F1419 → #0A0F14 (diagonal flow)
- Mesh gradients: Blurred color orbs for modern look
- Accent trails: Gradient trails behind moving elements
```

### Typography
```
Heading Font: 'Space Grotesk' (Google Fonts - geometric, modern)
- Weight: Bold (700) for headings
- Weight: Medium (500) for subheadings
- Transform: Uppercase for major headings
- Letter-spacing: 0.05em

Body Font: 'Inter' (Google Fonts)
- Weight: Regular (400), Medium (500), SemiBold (600)
- Size: 14-16px
- Line-height: 1.5

Score Font: 'Space Grotesk'
- Weight: Bold (700)
- Size: 90-110px
- Letter-spacing: 0.02em
```

### Component Designs

**Buttons**
```css
.electric-button {
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  border: none;
  border-radius: 12px;
  color: #0A0F14;
  font-family: 'Space Grotesk';
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.05em;
  padding: 16px 32px;
  position: relative;
  cursor: pointer;
  box-shadow:
    0 4px 15px rgba(20, 184, 166, 0.4),
    0 0 0 1px rgba(20, 184, 166, 0.2);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

/* Animated gradient background */
.electric-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    #14B8A6 0%,
    #3B82F6 50%,
    #14B8A6 100%
  );
  background-size: 200% 200%;
  opacity: 0;
  transition: opacity 0.3s;
  animation: gradient-shift 3s ease infinite;
}

@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.electric-button:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow:
    0 8px 25px rgba(20, 184, 166, 0.6),
    0 0 30px rgba(20, 184, 166, 0.3);
}

.electric-button:hover::before {
  opacity: 1;
}

.electric-button:active {
  transform: translateY(-1px) scale(0.98);
}
```

**Score Display**
```css
.electric-score {
  font-family: 'Space Grotesk';
  font-weight: 700;
  font-size: 100px;
  letter-spacing: 0.02em;
  color: #14B8A6;
  position: relative;
  text-shadow:
    0 0 20px rgba(20, 184, 166, 0.8),
    0 0 40px rgba(20, 184, 166, 0.4);
  filter: drop-shadow(0 4px 15px rgba(20, 184, 166, 0.5));
}

/* Animated underline */
.electric-score::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    #14B8A6 50%,
    transparent 100%
  );
  animation: underline-pulse 2s ease-in-out infinite;
}

@keyframes underline-pulse {
  0%, 100% { opacity: 0.3; transform: scaleX(0.8); }
  50% { opacity: 1; transform: scaleX(1); }
}
```

**Modern Cards**
```css
.electric-card {
  background: rgba(15, 20, 25, 0.8);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

/* Animated border gradient */
.electric-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  padding: 2px;
  background: linear-gradient(
    135deg,
    #14B8A6 0%,
    #3B82F6 50%,
    #FF6B6B 100%
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

/* Hover glow */
.electric-card:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(20, 184, 166, 0.3);
  transform: translateY(-4px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Background Treatment
- Deep blue-black base (#0A0F14)
- Diagonal gradient (#0A0F14 → #0F1419 → #0A0F14)
- Gradient mesh orbs (blurred colored circles)
- Animated position shift (subtle parallax)
- Grid overlay (faint geometric lines)

**Mesh Gradient Implementation**
```css
.mesh-background {
  position: fixed;
  inset: 0;
  background: #0A0F14;
  overflow: hidden;
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.mesh-orb-1 {
  top: 10%;
  left: 20%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #14B8A6 0%, transparent 70%);
  animation-delay: 0s;
}

.mesh-orb-2 {
  top: 60%;
  right: 15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #3B82F6 0%, transparent 70%);
  animation-delay: -7s;
}

.mesh-orb-3 {
  bottom: 10%;
  left: 50%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #FF6B6B 0%, transparent 70%);
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 40px) scale(0.9); }
  75% { transform: translate(40px, 30px) scale(1.05); }
}
```

### Bold Geometric Shapes
```css
/* Triangle accent */
.triangle-accent {
  width: 0;
  height: 0;
  border-left: 30px solid transparent;
  border-right: 30px solid transparent;
  border-bottom: 50px solid #14B8A6;
  position: absolute;
  top: 20px;
  right: 20px;
  opacity: 0.2;
}

/* Hexagon */
.hexagon {
  width: 100px;
  height: 60px;
  background: #14B8A6;
  position: relative;
  clip-path: polygon(
    25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%
  );
}

/* Animated circles */
.geometric-circle {
  width: 200px;
  height: 200px;
  border: 3px solid #3B82F6;
  border-radius: 50%;
  position: absolute;
  animation: pulse-circle 3s ease-in-out infinite;
}

@keyframes pulse-circle {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.2; }
}
```

### Animations

**On Score**
```
1. Explosive particle burst (geometric shapes: triangles, circles, squares)
2. Screen flash with scoring player's color (50ms)
3. Score number bounces in with spring animation
4. Electric arc effect from paddle to score display
5. Camera zoom and slight rotation (2deg)
```

**On Win**
```
1. Winning color floods screen with gradient wave
2. "PLAYER X WINS" animates in with stagger effect
3. Confetti explosion (geometric shapes in player color)
4. Background mesh orbs pulse rapidly
5. Trophy icon rotates in 3D
```

**Energetic Animations**
```css
/* Spring bounce */
@keyframes spring-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  70% { transform: scale(0.9); }
  85% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Stagger text reveal */
.stagger-text span {
  display: inline-block;
  opacity: 0;
  animation: letter-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.stagger-text span:nth-child(1) { animation-delay: 0s; }
.stagger-text span:nth-child(2) { animation-delay: 0.1s; }
.stagger-text span:nth-child(3) { animation-delay: 0.2s; }

@keyframes letter-in {
  0% { opacity: 0; transform: translateY(20px) rotate(-10deg); }
  100% { opacity: 1; transform: translateY(0) rotate(0); }
}

/* Electric trail */
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
```

### Motion Design Principles
1. **Spring animations**: Bouncy, energetic easing (cubic-bezier(0.34, 1.56, 0.64, 1))
2. **Staggered reveals**: Elements appear in sequence, not all at once
3. **Parallax scrolling**: Background moves slower than foreground
4. **Magnetic buttons**: Cursor attracts button slightly on proximity
5. **Ripple effects**: Waves emanate from interaction points
6. **Gradient shifts**: Animated gradient backgrounds constantly moving

### Visual Elements
- **Geometric particles**: Triangles, circles, squares in accent colors
- **Grid overlay**: Subtle diagonal grid lines (1px, 10% opacity)
- **Corner brackets**: Animated L-shaped brackets on cards
- **Progress bars**: Gradient-filled with animated shine
- **Glow effects**: Pulsing glows on all interactive elements

### How to Achieve "Fresh and Modern"
1. **Bold color combinations**: Teal + coral is unconventional and vibrant
2. **Generous rounded corners**: 12-20px border-radius
3. **Gradient everything**: Borders, backgrounds, text fills
4. **Geometric shapes**: Angular elements, not just rectangles
5. **Dynamic motion**: Nothing is static, subtle animations everywhere
6. **High contrast**: Deep darks vs. bright colors
7. **Glassmorphism**: Frosted glass effects with blur
8. **Mesh gradients**: Organic flowing backgrounds

---

## Implementation Guide

### CSS Variables Setup
```css
:root {
  /* Theme is set via data attribute: <body data-theme="arcade"> */
}

[data-theme="arcade"] {
  --bg: #000000;
  --primary: #FF0040;
  --secondary: #00FF88;
  --accent: #FFE600;
  --text: #FFFFFF;
  --font-heading: 'Press Start 2P', monospace;
  --font-body: 'Inter', sans-serif;
  --border-radius: 0;
  --glow-intensity: 25px;
}

[data-theme="retro"] {
  --bg: #0D0D0D;
  --primary: #33FF00;
  --secondary: #FFAA00;
  --accent: #00FFFF;
  --text: #33FF00;
  --font-heading: 'VT323', monospace;
  --font-body: 'VT323', monospace;
  --border-radius: 0;
  --glow-intensity: 15px;
}

[data-theme="premium"] {
  --bg: #0C0C0E;
  --primary: #D4AF37;
  --secondary: #C0C0C0;
  --accent: #E8D5B7;
  --text: #F5F5F5;
  --font-heading: 'Bebas Neue', sans-serif;
  --font-body: 'Inter', sans-serif;
  --border-radius: 16px;
  --glow-intensity: 12px;
}

[data-theme="electric"] {
  --bg: #0A0F14;
  --primary: #14B8A6;
  --secondary: #FF6B6B;
  --accent: #3B82F6;
  --text: #F8FAFC;
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --border-radius: 20px;
  --glow-intensity: 18px;
}
```

### Google Fonts Import
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Animation Performance Tips
```css
/* Use will-change sparingly */
.animated-element {
  will-change: transform, opacity;
}

/* Prefer transform and opacity for smooth 60fps */
.smooth-move {
  transform: translateX(100px);
  opacity: 0.5;
  transition: transform 0.3s, opacity 0.3s;
}

/* Use GPU acceleration */
.gpu-accelerated {
  transform: translateZ(0);
}
```

---

## Summary Table

| Theme | Primary Color | Font | Key Effect | Emotion |
|-------|---------------|------|------------|---------|
| Arcade Classic | #FF0040 Pink | Press Start 2P | Neon glow | Nostalgic, Bold |
| Retro Gaming | #33FF00 Green | VT323 | CRT scanlines | Warm, Technical |
| Premium Gaming | #D4AF37 Gold | Bebas Neue | Metallic shimmer | Luxurious, Refined |
| Electric Vibrant | #14B8A6 Teal | Space Grotesk | Mesh gradients | Fresh, Energetic |

---

## Next Steps
1. Review these specifications
2. Choose implementation priority
3. Create component library for each theme
4. Build theme switcher UI
5. Test animations at 60fps
6. Polish micro-interactions
7. Take before/after screenshots

Each theme is a complete visual identity, not just a color swap. They tell different stories and evoke different emotions.
