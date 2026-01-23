/**
 * Audio System Types for Cyber Air Hockey
 */

export type SFXName =
  | 'paddleHit'
  | 'wallBounce'
  | 'goalScored'
  | 'countdownBeep'
  | 'countdownGo'
  | 'victory'
  | 'defeat'
  | 'buttonClick';

export type MusicName = 'menu' | 'gameplay';

export interface SoundConfig {
  src: string;
  volume?: number;
  loop?: boolean;
}

export interface VariantSoundConfig {
  variants: string[];
  volume?: number;
}

export interface AudioConfig {
  music: Record<MusicName, SoundConfig>;
  sfx: Record<SFXName, SoundConfig | VariantSoundConfig>;
}

export interface AudioState {
  isInitialized: boolean;
  isMuted: boolean;
  currentMusic: MusicName | null;
}

export interface AudioContextValue extends AudioState {
  initialize: () => Promise<void>;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;

  // SFX
  playPaddleHit: () => void;
  playWallBounce: () => void;
  playGoalScored: () => void;
  playCountdownBeep: () => void;
  playCountdownGo: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playButtonClick: () => void;

  // Music
  playMenuMusic: () => void;
  playGameMusic: () => void;
  stopMusic: () => void;
}
