'use client';

/**
 * AudioContext - React context for game audio
 * Uses synthesized sounds - works immediately, no files needed
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import SynthAudio from '@/lib/audio/SynthAudio';
import { useSettingsStore } from '@/stores/settingsStore';

interface AudioContextValue {
  isInitialized: boolean;
  isMuted: boolean;

  // Gameplay sounds
  playHit: (velocity: number) => void;
  playPaddleHit: () => void; // Legacy - uses medium intensity
  playWallBounce: () => void;
  playGoal: (isPlayer: boolean) => void;
  playGoalScored: () => void; // Legacy
  playCountdownBeep: () => void;
  playCountdownGo: () => void;
  playMatchPoint: () => void;
  playMatchEnd: () => void;
  playVictory: () => void;
  playDefeat: () => void;

  // UI sounds
  playClick: () => void;
  playButtonClick: () => void; // Legacy alias
  playHover: () => void;
  playBack: () => void;
  playToggle: (isOn: boolean) => void;
  playError: () => void;
  playPanelOpen: () => void;
  playPanelClose: () => void;

  // Music (stubs - to be implemented with actual music files)
  playMenuMusic: () => void;
  playGameMusic: () => void;
  stopMusic: () => void;

  // Controls
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudioContext(): AudioContextValue {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}

// Aliases for backward compatibility
export const useAudio = useAudioContext;
export function useAudioOptional(): AudioContextValue | null {
  return useContext(AudioContext);
}

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<SynthAudio | null>(null);

  const audioSettings = useSettingsStore((state) => state.settings.audio);

  // Initialize
  useEffect(() => {
    const audio = SynthAudio.getInstance();
    audioRef.current = audio;
    audio.init().then(() => setIsInitialized(true));

    return () => {
      // Don't dispose - singleton shared across app
    };
  }, []);

  // Sync volume settings
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.setMasterVolume(audioSettings.masterVolume / 100);
    audio.setSFXVolume(audioSettings.sfxVolume / 100);
  }, [audioSettings]);

  // Auto-unlock on first interaction
  useEffect(() => {
    const handleInteraction = async () => {
      await audioRef.current?.unlock();
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
  }, []);

  // Gameplay sounds
  const playHit = useCallback((velocity: number) => {
    audioRef.current?.playHit(velocity);
  }, []);

  const playPaddleHit = useCallback(() => {
    audioRef.current?.playHit(10); // Medium intensity
  }, []);

  const playWallBounce = useCallback(() => {
    audioRef.current?.playWallBounce();
  }, []);

  const playGoal = useCallback((isPlayer: boolean) => {
    audioRef.current?.playGoal(isPlayer);
  }, []);

  const playGoalScored = useCallback(() => {
    audioRef.current?.playGoal(true);
  }, []);

  const playCountdownBeep = useCallback(() => {
    audioRef.current?.playCountdownBeep();
  }, []);

  const playCountdownGo = useCallback(() => {
    audioRef.current?.playCountdownGo();
  }, []);

  const playMatchPoint = useCallback(() => {
    audioRef.current?.playMatchPoint();
  }, []);

  const playMatchEnd = useCallback(() => {
    audioRef.current?.playMatchEnd();
  }, []);

  const playVictory = useCallback(() => {
    audioRef.current?.playVictory();
  }, []);

  const playDefeat = useCallback(() => {
    audioRef.current?.playDefeat();
  }, []);

  // UI sounds
  const playClick = useCallback(() => {
    audioRef.current?.playClick();
  }, []);

  const playButtonClick = useCallback(() => {
    audioRef.current?.playClick();
  }, []);

  const playHover = useCallback(() => {
    audioRef.current?.playHover();
  }, []);

  const playBack = useCallback(() => {
    audioRef.current?.playBack();
  }, []);

  const playToggle = useCallback((isOn: boolean) => {
    audioRef.current?.playToggle(isOn);
  }, []);

  const playError = useCallback(() => {
    audioRef.current?.playError();
  }, []);

  const playPanelOpen = useCallback(() => {
    audioRef.current?.playPanelOpen();
  }, []);

  const playPanelClose = useCallback(() => {
    audioRef.current?.playPanelClose();
  }, []);

  // Music stubs (to be implemented with actual music files in Phase 4)
  const playMenuMusic = useCallback(() => {
    // TODO: Implement with actual music files
  }, []);

  const playGameMusic = useCallback(() => {
    // TODO: Implement with actual music files
  }, []);

  const stopMusic = useCallback(() => {
    // TODO: Implement with actual music files
  }, []);

  // Controls
  const toggleMute = useCallback(() => {
    const newMuted = audioRef.current?.toggleMute() ?? false;
    setIsMuted(newMuted);
  }, []);

  const setMutedState = useCallback((muted: boolean) => {
    audioRef.current?.setMuted(muted);
    setIsMuted(muted);
  }, []);

  const value: AudioContextValue = {
    isInitialized,
    isMuted,
    playHit,
    playPaddleHit,
    playWallBounce,
    playGoal,
    playGoalScored,
    playCountdownBeep,
    playCountdownGo,
    playMatchPoint,
    playMatchEnd,
    playVictory,
    playDefeat,
    playClick,
    playButtonClick,
    playHover,
    playBack,
    playToggle,
    playError,
    playPanelOpen,
    playPanelClose,
    playMenuMusic,
    playGameMusic,
    stopMusic,
    toggleMute,
    setMuted: setMutedState,
  };

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export default AudioContext;
