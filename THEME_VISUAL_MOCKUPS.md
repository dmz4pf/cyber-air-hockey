# Air Hockey - Theme Visual Mockups

This document provides ASCII art and detailed visual descriptions of each theme to help visualize the final implementations.

---

## THEME 1: ARCADE CLASSIC

### Main Game Screen
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ★ ★  ⚡  A I R   H O C K E Y  ⚡  ★ ★               ┃ ← Neon pink border
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                         ┃
┃     ╔═══════════════════════════════════════╗         ┃
┃     ║                                         ║         ┃
┃     ║          ██████                         ║         ┃ ← Pure black
┃     ║             0                           ║         ┃   background
┃     ║   ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄          ║         ┃
┃     ║            ◯                            ║         ┃ ← Center line
┃     ║   ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄          ║         ┃   (yellow)
┃     ║                                         ║         ┃
┃     ║             ●                           ║         ┃ ← Puck (white)
┃     ║         ╱       ╲                       ║         ┃   with yellow glow
┃     ║        │    ●    │                      ║         ┃
┃     ║         ╲       ╱                       ║         ┃
┃     ║                                         ║         ┃ ← Green paddle
┃     ║          ██████                         ║         ┃   (player 1)
┃     ║             0                           ║         ┃
┃     ╚═══════════════════════════════════════╝         ┃
┃                                                         ┃
┃  ┏━┓                                        ┏━┓        ┃
┃  ┃0┃ PLAYER 1                    PLAYER 2  ┃0┃        ┃ ← Scores in
┃  ┗━┛                                        ┗━┛        ┃   neon green/pink
┃                                                         ┃
┃          ┏━━━━━━━━━━━━━━━━━━━━━┓                      ┃
┃          ┃  PRESS START (P)     ┃ ← Button with       ┃
┃          ┗━━━━━━━━━━━━━━━━━━━━━┛   yellow border      ┃
┃                                                         ┃
┃              ▐  INSERT COIN  ▌  ← Blinking text       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Color Key:
█ = Neon Pink (#FF0040)
◯ = Neon Yellow (#FFE600)
● = Neon Green (#00FF88)
┄ = Yellow center line
Background = Pure Black (#000000)
Stars = Twinkling white dots
```

### Button States
```
NORMAL:
┏━━━━━━━━━━━━━━━━━━┓
┃   PLAY GAME      ┃  ← Pink gradient, yellow border
┗━━━━━━━━━━━━━━━━━━┛    Subtle inner highlight

HOVER:
┏━━━━━━━━━━━━━━━━━━┓
┃   PLAY GAME      ┃  ← Lifted 2px, brighter glow
┗━━━━━━━━━━━━━━━━━━┛    Pulsing yellow halo

ACTIVE:
┏━━━━━━━━━━━━━━━━━━┓
┃   PLAY GAME      ┃  ← Pressed down 1px
┗━━━━━━━━━━━━━━━━━━┛    Darker shadow
```

### Score Animation (On Goal)
```
Frame 1: Normal          Frame 2: Flash           Frame 3: Explode
   ╔═══╗                    ╔═══╗                   ╔═══╗
   ║ 3 ║                    ║ 3 ║ (WHITE!)         ║ 4 ║ *  * ← Particles
   ╚═══╝                    ╚═══╝                   ╚═══╝  *  *   bursting
   Green glow              Entire screen             Bigger glow
                           flashes white             Camera shakes
```

### Card/Panel Design
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃┏                        ┓┃ ← Yellow corner brackets
┃║  HIGH SCORES           ║┃
┃║                        ║┃
┃║  1. AAA ..... 9999     ║┃
┃║  2. BBB ..... 8888     ║┃ ← Pink text on black
┃║  3. CCC ..... 7777     ║┃
┃║                        ║┃
┃┗                        ┛┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  Pink outer border
  Yellow inner frame
```

---

## THEME 2: RETRO GAMING

### Main Game Screen
```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
▓ ████████████████████████████████████████████████████ ▓ ← Scanlines overlay
▓ ███  AIR HOCKEY v1.0  ██████████████████████████████ ▓   (horizontal lines)
▓ ████████████████████████████████████████████████████ ▓
▓ ███                                              ███ ▓
▓ ███  ┌─────────────────────────────────────┐    ███ ▓
▓ ███  │                                     │    ███ ▓
▓ ███  │         [PLAYER 2]                  │    ███ ▓ ← Phosphor green
▓ ███  │            SCORE: 0                 │    ███ ▓   text with glow
▓ ███  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │    ███ ▓
▓ ███  │           ⊚                         │    ███ ▓ ← Center circle
▓ ███  │                                     │    ███ ▓
▓ ███  │            ●                        │    ███ ▓ ← Puck (white)
▓ ███  │                                     │    ███ ▓
▓ ███  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │    ███ ▓
▓ ███  │                                     │    ███ ▓
▓ ███  │         [PLAYER 1]                  │    ███ ▓
▓ ███  │            SCORE: 0                 │    ███ ▓
▓ ███  └─────────────────────────────────────┘    ███ ▓
▓ ███                                              ███ ▓
▓ ███  > START_GAME_                               ███ ▓ ← Blinking cursor
▓ ███                                              ███ ▓
▓ ████████████████████████████████████████████████████ ▓
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

Color: Phosphor Green (#33FF00) on dark grey-brown (#0D0D0D)
Effect: Slight blur + afterglow on all text
       CRT curve at edges
       Scanlines animated drift
```

### Boot Sequence
```
Frame 1:                    Frame 2:                    Frame 3:
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│ _                   │    │ SYSTEM LOADING...█  │    │ SYSTEM LOADING...   │
│                     │    │                     │    │ [████████.......]   │
│                     │    │                     │    │                     │
│                     │    │                     │    │ READY_              │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
Cursor blinks             Typewriter effect          Progress bar fills
(0-500ms)                 (500-1500ms)               (1500-2500ms)
```

### Terminal Button
```
NORMAL:                   HOVER:                    ACTIVE:
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  START       │         │ >START_      │         │ >START_      │
└──────────────┘         └──────────────┘         └──────────────┘
Green border             Brighter glow            Flicker effect
                         Cursor blinks
```

### Score Display
```
╔═══════════╗
║  SCORE    ║
║           ║
║    03     ║ ← Large VT323 font
║           ║    Phosphor bloom (blurred glow below)
╚═══════════╝    Slight blur on entire text
  Green (#33FF00) with afterglow effect
```

### System Messages
```
┌─────────────────────────────────────────┐
│ [SYSTEM] GOAL DETECTED                  │
│ [SYSTEM] PLAYER_1_SCORE++               │
│ [SYSTEM] MATCH_CONTINUE                 │
│ >_                                      │ ← Blinking cursor
└─────────────────────────────────────────┘
```

---

## THEME 3: PREMIUM GAMING

### Main Game Screen
```
╭───────────────────────────────────────────────────────╮
│                                                       │ ← Deep charcoal
│        A I R   H O C K E Y                           │   (#0C0C0E)
│        ──────────────────                            │   with subtle
│                                                       │   gradient
│                                                       │
│    ╔══════════════════════════════════════╗         │
│    ║                                      ║         │
│    ║          ┌──────┐                    ║         │ ← Gold border
│    ║          │  00  │                    ║         │   (#D4AF37)
│    ║          └──────┘                    ║         │   with shimmer
│    ║   ─────────────────────────────      ║         │
│    ║          ⬡                           ║         │ ← Center circle
│    ║                                      ║         │   (gold, 20% opacity)
│    ║           ◯                          ║         │
│    ║       ╱───────╲                      ║         │ ← Puck (white)
│    ║      │    ●    │                     ║         │   with gold shadow
│    ║       ╲───────╱                      ║         │
│    ║                                      ║         │
│    ║   ─────────────────────────────      ║         │
│    ║                                      ║         │
│    ║          ┌──────┐                    ║         │
│    ║          │  00  │                    ║         │
│    ║          └──────┘                    ║         │
│    ╚══════════════════════════════════════╝         │
│                                                       │
│    ┌──────────────┐           ┌──────────────┐      │
│    │   00         │           │         00   │      │ ← Gold/silver
│    │   PLAYER 1   │           │   PLAYER 2   │      │   gradient text
│    └──────────────┘           └──────────────┘      │   with shimmer
│                                                       │
│           ┌─────────────────┐                        │
│           │   BEGIN MATCH   │ ← Gold gradient button│
│           └─────────────────┘   with metallic shine │
│                                                       │
╰───────────────────────────────────────────────────────╯

Visual Elements:
• Frosted glass cards with backdrop blur
• Soft gold glow in corners (ambient lighting)
• 1px refined borders
• Generous spacing (24px padding)
• Subtle noise texture overlay (1-2% opacity)
```

### Glass Card Design
```
╭─────────────────────────────────╮
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Frosted glass effect
│░                             ░░│   (backdrop-filter: blur)
│░  HIGH SCORES                ░░│
│░  ─────────                  ░░│   Gold border (1px)
│░                             ░░│   with 20% opacity
│░  1. Champion ..... 9999     ░░│
│░  2. Master   ..... 8888     ░░│   Crisp white text
│░  3. Expert   ..... 7777     ░░│   (#F5F5F5)
│░                             ░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
╰─────────────────────────────────╯
  Subtle shadow beneath
  Ambient glow on hover (radial gradient)
```

### Button States with Shimmer
```
NORMAL:                    HOVER:                   ACTIVE:
┌──────────────┐          ┌──────────────┐         ┌──────────────┐
│  START       │          │  START       │         │  START       │
└──────────────┘          └──────────────┘         └──────────────┘
Gold gradient             Shimmer passes           Pressed down 2px
Subtle shadow             from left to right       Softer glow
                          Lifted 2px up
                          Stronger gold glow

Shimmer effect: White light sweep at 45° angle
```

### Score with Gradient Text
```
        ╔════════╗
        ║   08   ║  ← Gradient gold (#D4AF37 → #B87333)
        ╚════════╝     Clipped to text
           ▓▓▓▓▓       Animated shimmer (moves right)
          Gold glow    Drop shadow beneath
```

### Trophy Icon (Winner)
```
      ⚜
    ╱───╲
   │     │  ← Gold trophy with metallic shimmer
   │ ★ 1 │     Rotates in 3D on appearance
    ╲─┬─╱      Gentle float animation
      │        Soft glow around
     ═══
```

---

## THEME 4: ELECTRIC VIBRANT

### Main Game Screen
```
╔═══════════════════════════════════════════════════════╗
║  ⚡  A I R   H O C K E Y  ⚡                          ║ ← Electric teal
║                                                       ║   (#14B8A6)
║   ╭──────────────────────────────────────────╮      ║   flowing border
║   │                                          │      ║
║   │         ▲  00  ▲                         │      ║ ← Geometric shapes
║   │         ▼      ▼                         │      ║   in accent colors
║   │  ╱━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╲       │      ║
║   │  ╲                                ╱       │      ║
║   │         ⬢                                │      ║ ← Hexagon center
║   │                                          │      ║
║   │             ●                            │      ║ ← Puck (white)
║   │         ╱▔▔▔╲                            │      ║   with blue glow
║   │        ╱  ●  ╲                           │      ║
║   │        ╲     ╱                           │      ║
║   │         ╲───╱                            │      ║
║   │                                          │      ║
║   │  ╱━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╲       │      ║
║   │  ╲                                ╱       │      ║
║   │         ▲  00  ▲                         │      ║
║   │         ▼      ▼                         │      ║
║   ╰──────────────────────────────────────────╯      ║
║                                                       ║
║   ╭──────────╮                    ╭──────────╮      ║
║   │   00     │                    │   00     │      ║ ← Teal/coral
║   │ PLAYER 1 │                    │ PLAYER 2 │      ║   gradient text
║   ╰──────────╯                    ╰──────────╯      ║   with underline
║   ─────────                       ─────────         ║   (pulsing)
║                                                       ║
║         ╭─────────────────╮                          ║
║         │   START GAME    │ ← Button with           ║
║         ╰─────────────────╯   animated gradient     ║
║                                  border flow         ║
╚═══════════════════════════════════════════════════════╝

Background:
• Mesh gradient orbs (blurred circles)
  - Teal orb top-left, floating
  - Blue orb bottom-right, floating
  - Coral orb center-bottom, floating
• Diagonal gradient base (#0A0F14 → #0F1419)
• Subtle geometric grid overlay
```

### Animated Border Card
```
Frame 1:                  Frame 2:                  Frame 3:
╭─────────────────╮      ╭─────────────────╮      ╭─────────────────╮
│▓                │      │ ▓               │      │  ▓              │
│ LEADERBOARD     │  →   │ LEADERBOARD     │  →   │ LEADERBOARD     │
│                 │      │                 │      │                 │
│ 1. Alice  999   │      │ 1. Alice  999   │      │ 1. Alice  999   │
│ 2. Bob    888   │      │ 2. Bob    888   │      │ 2. Bob    888   │
│                ▓│      │               ▓ │      │              ▓  │
╰─────────────────╯      ╰─────────────────╯      ╰─────────────────╯

Border gradient animates clockwise:
Teal (#14B8A6) → Blue (#3B82F6) → Coral (#FF6B6B) → Teal
Continuous flow, 4s loop
```

### Button with Gradient Animation
```
NORMAL:                   HOVER:                    ACTIVE:
╭──────────────╮         ╭──────────────╮         ╭──────────────╮
│  PLAY NOW    │         │  PLAY NOW    │         │  PLAY NOW    │
╰──────────────╯         ╰──────────────╯         ╰──────────────╯
Teal gradient            Animated gradient        Scale 0.98
Rounded (12px)           Teal→Blue→Teal           Spring back
                         Lifted 3px
                         Strong glow
```

### Score with Animated Underline
```
     ╔═══════╗
     ║  05   ║  ← Bold Space Grotesk
     ╚═══════╝     Electric teal
     ┉┉┉┉┉┉┉┉┉     Gradient glow
     ━━━━━━━━      Pulsing underline (gradient)
     ▔▔▔▔▔▔▔▔      Scales from 0.8x to 1x, loops
```

### Geometric Particle Burst
```
Before Score:            On Score:                After Score:
      00                      01                      01
                            ▲ ▼ ●
                          ■   ◆   ▲
Paddle hits puck       Triangles, circles,    Particles fade out
                       squares burst out      while score scales up
                       in player's color      with spring animation
```

### Mesh Gradient Background (Animated)
```
Layer 1: Base gradient (diagonal)
╔═══════════════════════════════╗
║ ▒▒▒▒▓▓▓▓████████▓▓▓▓▒▒▒▒     ║ ← #0A0F14 → #0F1419
║ ▒▒▒▒▓▓▓▓████████▓▓▓▓▒▒▒▒     ║
║ ▒▒▒▒▓▓▓▓████████▓▓▓▓▒▒▒▒     ║
╚═══════════════════════════════╝

Layer 2: Blurred color orbs (floating)
     ╭────╮                          Teal orb
     │▓▓▓▓│ ← blur(100px)           (moves slowly)
     │▓▓▓▓│    opacity: 0.3
     ╰────╯    Animates position

                  ╭─────╮           Blue orb
                  │▓▓▓▓▓│          (moves slowly)
                  │▓▓▓▓▓│
                  ╰─────╯

           ╭────╮                   Coral orb
           │▓▓▓▓│                  (moves slowly)
           ╰────╯

Orbs float in figure-8 patterns, 20-25s loops
Creates organic, living background
```

### Staggered Text Animation
```
Frame 1:        Frame 2:        Frame 3:        Frame 4:
P               P L             P L A Y         P L A Y E R

Each letter     Letters         All letters     Complete
appears with    stagger in      visible
spring bounce   0.1s delay                      Final state
and rotation    between each
```

---

## Comparison Table

| Element         | Arcade            | Retro              | Premium            | Electric           |
|-----------------|-------------------|--------------------|--------------------|-------------------|
| **Background**  | Pure black        | Dark grey-brown    | Deep charcoal      | Blue-black mesh   |
|                 | + starfield       | + scanlines        | + ambient glow     | + gradient orbs   |
| **Typography**  | Pixelated         | Monospace terminal | Elegant condensed  | Modern geometric  |
|                 | (Press Start 2P)  | (VT323)            | (Bebas Neue)       | (Space Grotesk)   |
| **Borders**     | Hard edges        | No radius          | Rounded (16px)     | Very rounded (20px)|
|                 | 3-4px thick       | 2-3px thick        | 1px refined        | Animated gradient |
| **Buttons**     | Neon + 3D depth   | Transparent        | Gradient fill      | Gradient flow     |
|                 | Arcade style      | + cursor           | + shimmer          | + spring bounce   |
| **Glow**        | Intense (25px)    | Soft (15px)        | Subtle (12px)      | Medium (18px)     |
|                 | Neon colors       | Phosphor bloom     | Gold shimmer       | Electric arc      |
| **Animation**   | Sharp, snappy     | Flicker, blink     | Smooth, elegant    | Bouncy, energetic |
|                 | Screen shake      | Scanline drift     | Float, shimmer     | Spring, stagger   |
| **Palette**     | Pink/Green/Yellow | Green/Amber        | Gold/Silver        | Teal/Coral/Blue   |
| **Emotion**     | Nostalgic, Bold   | Warm, Technical    | Luxurious, Refined | Fresh, Energetic  |

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. **Arcade Classic** - Simplest to implement
   - Pure colors, no gradients
   - Basic glow effects
   - Straightforward animations

### Phase 2: Effects (Week 2)
2. **Retro Gaming** - CRT effects
   - Scanline overlay
   - Phosphor blur
   - Terminal aesthetics

### Phase 3: Polish (Week 3)
3. **Premium Gaming** - Sophisticated effects
   - Gradient text
   - Glass morphism
   - Shimmer animations

### Phase 4: Advanced (Week 4)
4. **Electric Vibrant** - Most complex
   - Mesh gradients
   - Animated borders
   - Spring physics

---

## Quick Visual Reference

### Color Swatches

**Arcade Classic**
```
████ #FF0040  Neon Pink (Primary)
████ #00FF88  Neon Green (Secondary)
████ #FFE600  Neon Yellow (Accent)
████ #000000  Pure Black (Background)
```

**Retro Gaming**
```
████ #33FF00  Phosphor Green (Primary)
████ #FFAA00  Phosphor Amber (Secondary)
████ #00FFFF  Cyan (Accent)
████ #0D0D0D  Dark Brown-Grey (Background)
```

**Premium Gaming**
```
████ #D4AF37  Metallic Gold (Primary)
████ #C0C0C0  Brushed Silver (Secondary)
████ #E8D5B7  Champagne (Accent)
████ #0C0C0E  Deep Charcoal (Background)
```

**Electric Vibrant**
```
████ #14B8A6  Electric Teal (Primary)
████ #FF6B6B  Coral Red (Secondary)
████ #3B82F6  Bright Blue (Accent)
████ #0A0F14  Blue-Black (Background)
```

---

## Screen States

### Loading Screen
```
ARCADE:             RETRO:              PREMIUM:            ELECTRIC:
┏━━━━━━━━━━━━━┓    ┌───────────────┐    ╭───────────────╮    ╔════════════════╗
┃             ┃    │ LOADING...█   │    │   LOADING     │    ║   LOADING      ║
┃  ▂▄▆█▆▄▂    ┃    │ [████....] 40%│    │   ──────      │    ║   ⚡⚡⚡       ║
┃   LOADING   ┃    │               │    │   ═══════     │    ║   ╱──╲        ║
┃             ┃    └───────────────┘    ╰───────────────╯    ╚════════════════╝
┗━━━━━━━━━━━━━┛    Typewriter          Shimmer bars        Bouncing shapes
Pixel animation    Cursor blinks       Elegant fade        Spring physics
```

### Pause Menu
```
ARCADE:             RETRO:              PREMIUM:            ELECTRIC:
┏━━━━━━━━━━━━━┓    ┌───────────────┐    ╭───────────────╮    ╔════════════════╗
┃   PAUSED    ┃    │ > PAUSED      │    │    PAUSED     │    ║    PAUSED      ║
┃ =========== ┃    │               │    │    ─────      │    ║    ═════       ║
┃             ┃    │ > CONTINUE_   │    │               │    ║                ║
┃ [CONTINUE]  ┃    │   RESTART     │    │  ⎯  Continue  │    ║  ╱ Continue ╲  ║
┃ [RESTART]   ┃    │   QUIT        │    │  ⎯  Restart   │    ║  │ Restart  │  ║
┃ [QUIT]      ┃    │               │    │  ⎯  Quit      │    ║  ╲ Quit     ╱  ║
┃             ┃    └───────────────┘    ╰───────────────╯    ╚════════════════╝
┗━━━━━━━━━━━━━┛    Terminal prompt     Glass card          Geometric shapes
Neon borders       Cursor selection   Frosted glass       Rounded buttons
```

### Game Over
```
ARCADE:             RETRO:              PREMIUM:            ELECTRIC:
┏━━━━━━━━━━━━━┓    ┌───────────────┐    ╭───────────────╮    ╔════════════════╗
┃  GAME OVER  ┃    │ GAME_OVER     │    │   VICTORY     │    ║   PLAYER 1     ║
┃             ┃    │               │    │      ⚜        │    ║    WINS!       ║
┃  WINNER:    ┃    │ [SYSTEM]      │    │               │    ║                ║
┃   PLAYER 1  ┃    │ PLAYER_1_WINS │    │   PLAYER 1    │    ║    ★ ★ ★      ║
┃             ┃    │               │    │   CHAMPION    │    ║   ▲ ▼ ● ■     ║
┃ [TRY AGAIN] ┃    │ > RETRY_      │    │               │    ║                ║
┃             ┃    │   EXIT        │    │  Play Again   │    ║   Play Again   ║
┗━━━━━━━━━━━━━┛    └───────────────┘    ╰───────────────╯    ╚════════════════╝
Screen flash       Terminal output    Trophy icon         Confetti burst
Pixel "GAME OVER"  Blinking cursor    Elegant fade        Staggered text
```

---

## Animation Timing Reference

| Theme    | Button Hover | Score Update | Screen Transition | Particle Life |
|----------|--------------|--------------|-------------------|---------------|
| Arcade   | 100ms snap   | 200ms pulse  | 300ms fade        | 800ms        |
| Retro    | 200ms ease   | 200ms flicker| 500ms scan        | 1000ms       |
| Premium  | 400ms smooth | 600ms elastic| 800ms fade        | 1500ms       |
| Electric | 300ms spring | 400ms bounce | 600ms stagger     | 1200ms       |

---

These mockups provide a clear visual reference for implementing each theme. Each design is distinctive, with its own personality and visual language.
