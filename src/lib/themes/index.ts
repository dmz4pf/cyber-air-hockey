export type ThemeId = 'neon' | 'minimal' | 'retro' | 'ice' | 'cyber';

export interface ThemeColors {
  // Background
  background: string;
  backgroundGradient?: string;

  // Table
  table: string;
  tableBorder: string;
  centerLine: string;
  centerCircle: string;

  // Goals
  goalPlayer1: string;
  goalPlayer2: string;

  // Puck
  puck: string;
  puckGlow: string;
  puckShadow?: string;

  // Paddles
  paddle1: string;
  paddle1Glow: string;
  paddle1Inner: string;
  paddle2: string;
  paddle2Glow: string;
  paddle2Inner: string;

  // UI
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;

  // Score
  score1: string;
  score2: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: ThemeColors;
  effects: {
    glowIntensity: number;
    trailEffect: boolean;
    particles: boolean;
    scanlines: boolean;
    blur: number;
  };
  fonts: {
    heading: string;
    body: string;
    score: string;
  };
}

// ============================================
// THEME 1: NEON ARCADE
// Vibrant synthwave aesthetic with intense glows
// ============================================
export const neonTheme: Theme = {
  id: 'neon',
  name: 'Neon Arcade',
  description: 'Vibrant synthwave vibes with intense glow effects',
  colors: {
    background: '#0a0015',
    backgroundGradient: 'radial-gradient(ellipse at center, #1a0030 0%, #0a0015 100%)',
    table: '#12001f',
    tableBorder: '#ff00ff',
    centerLine: '#ff00ff40',
    centerCircle: '#00ffff40',
    goalPlayer1: '#00ff8840',
    goalPlayer2: '#ff008840',
    puck: '#ffffff',
    puckGlow: '#00ffff',
    paddle1: '#00ff88',
    paddle1Glow: '#00ff88',
    paddle1Inner: '#003322',
    paddle2: '#ff0088',
    paddle2Glow: '#ff0088',
    paddle2Inner: '#330022',
    primary: '#ff00ff',
    secondary: '#00ffff',
    accent: '#ffff00',
    text: '#ffffff',
    textMuted: '#888899',
    score1: '#00ff88',
    score2: '#ff0088',
  },
  effects: {
    glowIntensity: 30,
    trailEffect: true,
    particles: true,
    scanlines: false,
    blur: 0,
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Rajdhani', sans-serif",
    score: "'Orbitron', monospace",
  },
};

// ============================================
// THEME 2: MINIMALIST PRO
// Clean, elegant, tournament-ready design
// ============================================
export const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Minimalist Pro',
  description: 'Clean elegance for focused gameplay',
  colors: {
    background: '#fafafa',
    backgroundGradient: 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
    table: '#ffffff',
    tableBorder: '#e0e0e0',
    centerLine: '#00000015',
    centerCircle: '#00000010',
    goalPlayer1: '#22c55e15',
    goalPlayer2: '#ef444415',
    puck: '#1a1a1a',
    puckGlow: '#00000020',
    puckShadow: '#00000030',
    paddle1: '#1a1a1a',
    paddle1Glow: '#00000010',
    paddle1Inner: '#404040',
    paddle2: '#666666',
    paddle2Glow: '#00000010',
    paddle2Inner: '#888888',
    primary: '#1a1a1a',
    secondary: '#666666',
    accent: '#0066ff',
    text: '#1a1a1a',
    textMuted: '#888888',
    score1: '#1a1a1a',
    score2: '#666666',
  },
  effects: {
    glowIntensity: 0,
    trailEffect: false,
    particles: false,
    scanlines: false,
    blur: 0,
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
    score: "'SF Mono', 'Roboto Mono', monospace",
  },
};

// ============================================
// THEME 3: RETRO PIXEL
// Classic 8-bit arcade nostalgia
// ============================================
export const retroTheme: Theme = {
  id: 'retro',
  name: 'Retro Pixel',
  description: '8-bit arcade nostalgia with CRT effects',
  colors: {
    background: '#000000',
    backgroundGradient: 'linear-gradient(180deg, #001100 0%, #000000 100%)',
    table: '#001a00',
    tableBorder: '#00ff00',
    centerLine: '#00ff0040',
    centerCircle: '#00ff0030',
    goalPlayer1: '#00ff0030',
    goalPlayer2: '#ff000030',
    puck: '#ffff00',
    puckGlow: '#ffff00',
    paddle1: '#00ff00',
    paddle1Glow: '#00ff00',
    paddle1Inner: '#004400',
    paddle2: '#ff0000',
    paddle2Glow: '#ff0000',
    paddle2Inner: '#440000',
    primary: '#00ff00',
    secondary: '#ffff00',
    accent: '#ff0000',
    text: '#00ff00',
    textMuted: '#008800',
    score1: '#00ff00',
    score2: '#ff0000',
  },
  effects: {
    glowIntensity: 15,
    trailEffect: false,
    particles: false,
    scanlines: true,
    blur: 0,
  },
  fonts: {
    heading: "'Press Start 2P', cursive",
    body: "'VT323', monospace",
    score: "'Press Start 2P', monospace",
  },
};

// ============================================
// THEME 4: ICE RINK
// Realistic ice hockey atmosphere
// ============================================
export const iceTheme: Theme = {
  id: 'ice',
  name: 'Ice Rink',
  description: 'Realistic ice hockey atmosphere',
  colors: {
    background: '#0c1929',
    backgroundGradient: 'linear-gradient(180deg, #1a3a5c 0%, #0c1929 100%)',
    table: '#d4e5f7',
    tableBorder: '#2563eb',
    centerLine: '#ef444480',
    centerCircle: '#ef444460',
    goalPlayer1: '#dc262640',
    goalPlayer2: '#dc262640',
    puck: '#1a1a1a',
    puckGlow: '#00000040',
    puckShadow: '#00000060',
    paddle1: '#1e40af',
    paddle1Glow: '#3b82f640',
    paddle1Inner: '#1e3a8a',
    paddle2: '#dc2626',
    paddle2Glow: '#ef444440',
    paddle2Inner: '#991b1b',
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#dc2626',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    score1: '#3b82f6',
    score2: '#ef4444',
  },
  effects: {
    glowIntensity: 8,
    trailEffect: true,
    particles: false,
    scanlines: false,
    blur: 1,
  },
  fonts: {
    heading: "'Bebas Neue', sans-serif",
    body: "'Open Sans', sans-serif",
    score: "'Bebas Neue', sans-serif",
  },
};

// ============================================
// THEME 5: CYBER SPORTS
// Esports-ready with dynamic overlays
// ============================================
export const cyberTheme: Theme = {
  id: 'cyber',
  name: 'Cyber Sports',
  description: 'Esports-ready with dynamic HUD',
  colors: {
    background: '#030712',
    backgroundGradient: 'linear-gradient(135deg, #030712 0%, #111827 50%, #030712 100%)',
    table: '#111827',
    tableBorder: '#6366f1',
    centerLine: '#8b5cf640',
    centerCircle: '#6366f140',
    goalPlayer1: '#10b98130',
    goalPlayer2: '#f4365430',
    puck: '#f8fafc',
    puckGlow: '#8b5cf6',
    paddle1: '#10b981',
    paddle1Glow: '#10b981',
    paddle1Inner: '#064e3b',
    paddle2: '#f43654',
    paddle2Glow: '#f43654',
    paddle2Inner: '#7f1d2d',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f43654',
    text: '#f8fafc',
    textMuted: '#6b7280',
    score1: '#10b981',
    score2: '#f43654',
  },
  effects: {
    glowIntensity: 20,
    trailEffect: true,
    particles: true,
    scanlines: false,
    blur: 0,
  },
  fonts: {
    heading: "'Exo 2', sans-serif",
    body: "'Exo 2', sans-serif",
    score: "'Orbitron', monospace",
  },
};

export const themes: Record<ThemeId, Theme> = {
  neon: neonTheme,
  minimal: minimalTheme,
  retro: retroTheme,
  ice: iceTheme,
  cyber: cyberTheme,
};

export const themeList = Object.values(themes);
