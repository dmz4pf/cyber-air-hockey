/**
 * AudioManager - Singleton class for managing game audio
 * Handles music playback, sound effects, and volume control
 */

import { Howl, Howler } from 'howler';
import { AUDIO_CONFIG, isVariantConfig } from './sounds';
import { MusicName, SFXName } from './types';

// Debounce helper for rapid-fire sounds
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

class AudioManager {
  private static instance: AudioManager;

  private sounds: Map<string, Howl> = new Map();
  private music: Map<MusicName, Howl> = new Map();
  private currentMusic: Howl | null = null;
  private currentMusicName: MusicName | null = null;

  private initialized = false;
  private muted = false;

  // Volumes (0-1 scale)
  private masterVolume = 0.8;
  private sfxVolume = 1.0;
  private musicVolume = 0.5;

  // Debounced wall bounce to prevent sound spam
  private debouncedWallBounce: () => void;

  private constructor() {
    this.debouncedWallBounce = debounce(() => {
      this.playRandomVariant('wallBounce');
    }, 50);
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    // Load all music tracks
    for (const [name, config] of Object.entries(AUDIO_CONFIG.music)) {
      const howl = new Howl({
        src: [config.src],
        loop: config.loop ?? false,
        volume: (config.volume ?? 1) * this.musicVolume * this.masterVolume,
        preload: true,
        html5: true, // Better for long tracks
        onloaderror: (_, error) => {
          console.warn(`Failed to load music: ${name}`, error);
        },
      });
      this.music.set(name as MusicName, howl);
    }

    // Load all SFX
    for (const [name, config] of Object.entries(AUDIO_CONFIG.sfx)) {
      if (isVariantConfig(config)) {
        // Load each variant
        config.variants.forEach((src, i) => {
          const howl = new Howl({
            src: [src],
            volume: (config.volume ?? 1) * this.sfxVolume * this.masterVolume,
            preload: true,
            onloaderror: (_, error) => {
              console.warn(`Failed to load sound: ${name}-${i}`, error);
            },
          });
          this.sounds.set(`${name}-${i}`, howl);
        });
      } else {
        const howl = new Howl({
          src: [config.src],
          volume: (config.volume ?? 1) * this.sfxVolume * this.masterVolume,
          preload: true,
          onloaderror: (_, error) => {
            console.warn(`Failed to load sound: ${name}`, error);
          },
        });
        this.sounds.set(name, howl);
      }
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Volume control
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSFXVolumes();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolumes();
  }

  private updateAllVolumes(): void {
    this.updateSFXVolumes();
    this.updateMusicVolumes();
  }

  private updateSFXVolumes(): void {
    for (const [name, howl] of this.sounds) {
      // Get base volume from config
      const sfxName = name.replace(/-\d+$/, '') as SFXName;
      const config = AUDIO_CONFIG.sfx[sfxName];
      const baseVolume = isVariantConfig(config)
        ? config.volume ?? 1
        : config.volume ?? 1;
      howl.volume(baseVolume * this.sfxVolume * this.masterVolume);
    }
  }

  private updateMusicVolumes(): void {
    for (const [name, howl] of this.music) {
      const config = AUDIO_CONFIG.music[name];
      const baseVolume = config.volume ?? 1;
      howl.volume(baseVolume * this.musicVolume * this.masterVolume);
    }
  }

  // Mute control
  setMuted(muted: boolean): void {
    this.muted = muted;
    Howler.mute(muted);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  // SFX playback
  playSFX(name: SFXName): void {
    if (!this.initialized) return;

    const config = AUDIO_CONFIG.sfx[name];
    if (isVariantConfig(config)) {
      this.playRandomVariant(name);
    } else {
      const sound = this.sounds.get(name);
      sound?.play();
    }
  }

  private playRandomVariant(name: string): void {
    const config = AUDIO_CONFIG.sfx[name as SFXName];
    if (!isVariantConfig(config)) return;

    const variantCount = config.variants.length;
    const randomIndex = Math.floor(Math.random() * variantCount);
    const sound = this.sounds.get(`${name}-${randomIndex}`);
    sound?.play();
  }

  // Specific SFX methods
  playPaddleHit(): void {
    this.playSFX('paddleHit');
  }

  playWallBounce(): void {
    this.debouncedWallBounce();
  }

  playGoalScored(): void {
    this.playSFX('goalScored');
  }

  playCountdownBeep(): void {
    this.playSFX('countdownBeep');
  }

  playCountdownGo(): void {
    this.playSFX('countdownGo');
  }

  playVictory(): void {
    this.playSFX('victory');
  }

  playDefeat(): void {
    this.playSFX('defeat');
  }

  playButtonClick(): void {
    this.playSFX('buttonClick');
  }

  // Music playback
  playMusic(name: MusicName, fadeIn = 1000): void {
    if (!this.initialized) return;

    const nextTrack = this.music.get(name);
    if (!nextTrack) return;

    // If same track is already playing, do nothing
    if (this.currentMusicName === name && this.currentMusic?.playing()) {
      return;
    }

    // Fade out current music if playing
    if (this.currentMusic?.playing()) {
      this.currentMusic.fade(
        this.currentMusic.volume(),
        0,
        fadeIn / 2
      );
      this.currentMusic.once('fade', () => {
        this.currentMusic?.stop();
      });
    }

    // Start new track with fade in
    const config = AUDIO_CONFIG.music[name];
    const targetVolume = (config.volume ?? 1) * this.musicVolume * this.masterVolume;

    nextTrack.volume(0);
    nextTrack.play();
    nextTrack.fade(0, targetVolume, fadeIn);

    this.currentMusic = nextTrack;
    this.currentMusicName = name;
  }

  stopMusic(fadeOut = 500): void {
    if (!this.currentMusic?.playing()) return;

    this.currentMusic.fade(this.currentMusic.volume(), 0, fadeOut);
    this.currentMusic.once('fade', () => {
      this.currentMusic?.stop();
      this.currentMusic = null;
      this.currentMusicName = null;
    });
  }

  pauseMusic(): void {
    this.currentMusic?.pause();
  }

  resumeMusic(): void {
    if (this.currentMusic && !this.currentMusic.playing()) {
      this.currentMusic.play();
    }
  }

  getCurrentMusic(): MusicName | null {
    return this.currentMusicName;
  }

  // Cleanup
  dispose(): void {
    this.stopMusic(0);

    for (const howl of this.sounds.values()) {
      howl.unload();
    }
    for (const howl of this.music.values()) {
      howl.unload();
    }

    this.sounds.clear();
    this.music.clear();
    this.initialized = false;
  }
}

export default AudioManager;
