'use client';

/**
 * AudioContext - React context for game audio
 * Provides audio controls throughout the app
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import AudioManager from '@/lib/audio/AudioManager';
import { AudioContextValue, MusicName } from '@/lib/audio/types';
import { useSettingsStore } from '@/stores/settingsStore';

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Optional hook that doesn't throw if context is missing
export function useAudioOptional(): AudioContextValue | null {
  return useContext(AudioContext);
}

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<MusicName | null>(null);

  const audioManagerRef = useRef<AudioManager | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Get audio settings from store
  const audioSettings = useSettingsStore((state) => state.settings.audio);

  // Initialize audio manager
  const initialize = useCallback(async () => {
    // Return existing promise if initialization is in progress
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    if (audioManagerRef.current?.isInitialized()) {
      return;
    }

    initPromiseRef.current = (async () => {
      try {
        const manager = AudioManager.getInstance();
        audioManagerRef.current = manager;
        await manager.init();
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    })();

    return initPromiseRef.current;
  }, []);

  // Sync settings store to audio manager
  useEffect(() => {
    const manager = audioManagerRef.current;
    if (!manager) return;

    manager.setMasterVolume(audioSettings.masterVolume / 100);
    manager.setSFXVolume(audioSettings.sfxVolume / 100);
    manager.setMusicVolume(audioSettings.musicVolume / 100);
  }, [audioSettings]);

  // Handle tab visibility for music
  useEffect(() => {
    const handleVisibilityChange = () => {
      const manager = audioManagerRef.current;
      if (!manager) return;

      if (document.hidden) {
        manager.pauseMusic();
      } else {
        manager.resumeMusic();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManagerRef.current?.dispose();
    };
  }, []);

  // Mute controls
  const toggleMute = useCallback(() => {
    const manager = audioManagerRef.current;
    if (!manager) return;

    const newMuted = manager.toggleMute();
    setIsMuted(newMuted);
  }, []);

  const setMutedState = useCallback((muted: boolean) => {
    const manager = audioManagerRef.current;
    if (!manager) return;

    manager.setMuted(muted);
    setIsMuted(muted);
  }, []);

  // SFX methods - initialize on first use if needed
  const playPaddleHit = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playPaddleHit();
  }, [initialize]);

  const playWallBounce = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playWallBounce();
  }, [initialize]);

  const playGoalScored = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playGoalScored();
  }, [initialize]);

  const playCountdownBeep = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playCountdownBeep();
  }, [initialize]);

  const playCountdownGo = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playCountdownGo();
  }, [initialize]);

  const playVictory = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playVictory();
  }, [initialize]);

  const playDefeat = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playDefeat();
  }, [initialize]);

  const playButtonClick = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playButtonClick();
  }, [initialize]);

  // Music methods
  const playMenuMusic = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playMusic('menu');
    setCurrentMusic('menu');
  }, [initialize]);

  const playGameMusic = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playMusic('gameplay');
    setCurrentMusic('gameplay');
  }, [initialize]);

  const stopMusic = useCallback(() => {
    audioManagerRef.current?.stopMusic();
    setCurrentMusic(null);
  }, []);

  const value: AudioContextValue = {
    isInitialized,
    isMuted,
    currentMusic,
    initialize,
    toggleMute,
    setMuted: setMutedState,
    playPaddleHit,
    playWallBounce,
    playGoalScored,
    playCountdownBeep,
    playCountdownGo,
    playVictory,
    playDefeat,
    playButtonClick,
    playMenuMusic,
    playGameMusic,
    stopMusic,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export default AudioContext;
