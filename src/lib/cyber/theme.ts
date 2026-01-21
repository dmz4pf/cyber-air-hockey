/**
 * Air Hockey Design System Tokens
 * NO PURPLE - Using Electric Vibrant as default
 */

export const cyberTheme = {
  colors: {
    // Primary palette - Teal/Coral combo
    primary: '#14B8A6', // Teal - main accent
    secondary: '#FF6B6B', // Coral - secondary accent

    // Backgrounds
    bg: {
      primary: '#0A0F14', // Darkest
      secondary: '#0F1419', // Dark
      tertiary: '#151C24', // Slightly lighter
      panel: 'rgba(20, 184, 166, 0.08)',
      panelHover: 'rgba(20, 184, 166, 0.12)',
      overlay: 'rgba(10, 15, 20, 0.95)',
    },

    // Player semantic colors
    player: {
      you: '#14B8A6', // Teal
      youDark: '#042F2B',
      youGlow: 'rgba(20, 184, 166, 0.45)',
      opponent: '#FF6B6B', // Coral
      opponentDark: '#331515',
      opponentGlow: 'rgba(255, 107, 107, 0.45)',
    },

    // Rank tier colors
    rank: {
      BRONZE: '#cd7f32',
      SILVER: '#94a3b8',
      GOLD: '#fbbf24',
      PLATINUM: '#14B8A6',
      DIAMOND: '#3B82F6',
      MASTER: '#FF6B6B',
    },

    // State colors
    success: '#14B8A6',
    warning: '#fbbf24',
    error: '#FF6B6B',
    info: '#3B82F6',

    // Text hierarchy
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#64748B',
      accent: '#14B8A6',
    },

    // Borders
    border: {
      default: 'rgba(20, 184, 166, 0.2)',
      active: '#14B8A6',
      subtle: 'rgba(255, 255, 255, 0.08)',
    },

    // Puck
    puck: '#ffffff',
    puckGlow: 'rgba(59, 130, 246, 0.5)',
  },

  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '9xl': '8rem',
  },

  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
  },

  animation: {
    duration: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 700,
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    // HUD pulse interval in ms
    hudPulse: 50,
    // Particle spawn interval in ms
    particleSpawn: 70,
  },

  shadows: {
    glow: (color: string) => `0 0 20px ${color}40`,
    glowStrong: (color: string) => `0 0 30px ${color}60`,
    glowText: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}`,
    panel: '0 4px 20px rgba(0, 0, 0, 0.5)',
    button: '0 4px 15px rgba(0, 0, 0, 0.3)',
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type for the theme
export type CyberTheme = typeof cyberTheme;

// Helper to get rank color
export function getRankColor(tier: keyof typeof cyberTheme.colors.rank): string {
  return cyberTheme.colors.rank[tier];
}

// Helper to create glow shadow
export function createGlow(color: string, intensity: 'normal' | 'strong' = 'normal'): string {
  return intensity === 'strong'
    ? cyberTheme.shadows.glowStrong(color)
    : cyberTheme.shadows.glow(color);
}
