'use client';

/**
 * AudioContext - React context for game audio
 * Provides audio controls throughout the app
 *
 * Note: Consider using the useAudio() hook from @/lib/audio for simpler usage
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
import { MusicName } from '@/lib/audio/types';
import { useSettingsStore } from '@/stores/settingsStore';

// Context value interface for backward compatibility
interface AudioContextValue {
  isInitialized: boolean;
  isMuted: boolean;
  currentMusic: MusicName | null;
  initialize: () => Promise<void>;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;

  // SFX (legacy API - maintained for backward compatibility)
  playPaddleHit: () => void;
  playWallBounce: () => void;
  playGoalScored: () => void;
  playCountdownBeep: () => void;
  playCountdownGo: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playButtonClick: () => void;

  // New SFX API
  playHit: (velocity: number) => void;
  playGoal: (isPlayer: boolean) => void;
  playClick: () => void;
  playHover: () => void;

  // Music
  playMenuMusic: () => void;
  playGameMusic: () => void;
  playOvertimeMusic: () => void;
  stopMusic: () => void;

  // Ambient
  playAmbient: () => void;
  stopAmbient: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudioContext(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}

// Optional hook that doesn't throw if context is missing
export function useAudioContextOptional(): AudioContextValue | null {
  return useContext(AudioContext);
}

// Alias for backward compatibility
export const useAudioOptional = useAudioContextOptional;

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

  // Auto-unlock on first interaction
  useEffect(() => {
    const handleInteraction = async () => {
      await initialize();
      await audioManagerRef.current?.unlock();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [initialize]);

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

  // ═══════════════════════════════════════════════════════════
  // SFX - Legacy API (backward compatibility)
  // ═══════════════════════════════════════════════════════════

  const playPaddleHit = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    // Use medium intensity for legacy API
    audioManagerRef.current?.playHit(10);
  }, [initialize]);

  const playWallBounce = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playWallBounce();
  }, [initialize]);

  const playGoalScored = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playGoal(true);
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
    audioManagerRef.current?.playClick();
  }, [initialize]);

  // ═══════════════════════════════════════════════════════════
  // SFX - New API
  // ═══════════════════════════════════════════════════════════

  const playHit = useCallback(
    async (velocity: number) => {
      if (!audioManagerRef.current?.isInitialized()) await initialize();
      audioManagerRef.current?.playHit(velocity);
    },
    [initialize]
  );

  const playGoal = useCallback(
    async (isPlayer: boolean) => {
      if (!audioManagerRef.current?.isInitialized()) await initialize();
      audioManagerRef.current?.playGoal(isPlayer);
    },
    [initialize]
  );

  const playClick = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playClick();
  }, [initialize]);

  const playHover = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playHover();
  }, [initialize]);

  // ═══════════════════════════════════════════════════════════
  // Music
  // ═══════════════════════════════════════════════════════════

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

  const playOvertimeMusic = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.fadeToTrack('overtime');
    setCurrentMusic('overtime');
  }, [initialize]);

  const stopMusic = useCallback(() => {
    audioManagerRef.current?.stopMusic();
    setCurrentMusic(null);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // Ambient
  // ═══════════════════════════════════════════════════════════

  const playAmbient = useCallback(async () => {
    if (!audioManagerRef.current?.isInitialized()) await initialize();
    audioManagerRef.current?.playAmbient();
  }, [initialize]);

  const stopAmbient = useCallback(() => {
    audioManagerRef.current?.stopAmbient();
  }, []);

  const value: AudioContextValue = {
    isInitialized,
    isMuted,
    currentMusic,
    initialize,
    toggleMute,
    setMuted: setMutedState,

    // Legacy SFX
    playPaddleHit,
    playWallBounce,
    playGoalScored,
    playCountdownBeep,
    playCountdownGo,
    playVictory,
    playDefeat,
    playButtonClick,

    // New SFX
    playHit,
    playGoal,
    playClick,
    playHover,

    // Music
    playMenuMusic,
    playGameMusic,
    playOvertimeMusic,
    stopMusic,

    // Ambient
    playAmbient,
    stopAmbient,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export default AudioContext;
