/**
 * Sound Configuration for Cyber Air Hockey
 * Defines all audio assets and their paths
 */

import { AudioConfig } from './types';

export const AUDIO_CONFIG: AudioConfig = {
  music: {
    menu: {
      src: '/audio/music/menu-ambient.mp3',
      loop: true,
      volume: 0.4,
    },
    gameplay: {
      src: '/audio/music/gameplay-action.mp3',
      loop: true,
      volume: 0.5,
    },
  },
  sfx: {
    paddleHit: {
      variants: [
        '/audio/sfx/paddle-hit-1.mp3',
        '/audio/sfx/paddle-hit-2.mp3',
        '/audio/sfx/paddle-hit-3.mp3',
      ],
      volume: 0.7,
    },
    wallBounce: {
      variants: [
        '/audio/sfx/wall-bounce-1.mp3',
        '/audio/sfx/wall-bounce-2.mp3',
      ],
      volume: 0.4,
    },
    goalScored: {
      src: '/audio/sfx/goal-scored.mp3',
      volume: 0.8,
    },
    countdownBeep: {
      src: '/audio/sfx/countdown-beep.mp3',
      volume: 0.6,
    },
    countdownGo: {
      src: '/audio/sfx/countdown-go.mp3',
      volume: 0.7,
    },
    victory: {
      src: '/audio/sfx/victory-fanfare.mp3',
      volume: 0.8,
    },
    defeat: {
      src: '/audio/sfx/defeat-sound.mp3',
      volume: 0.6,
    },
    buttonClick: {
      src: '/audio/sfx/button-click.mp3',
      volume: 0.5,
    },
  },
};

// Helper to check if config has variants
export function isVariantConfig(
  config: { src: string } | { variants: string[] }
): config is { variants: string[]; volume?: number } {
  return 'variants' in config;
}
