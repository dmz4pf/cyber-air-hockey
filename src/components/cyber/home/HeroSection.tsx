'use client';

/**
 * HeroSection - Hero with title, animated elements, and CTA
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';
import { useGameStore } from '@/stores/gameStore';
import { CyberButton } from '../ui/CyberButton';

const TAGLINES = ['COMPETE', 'DOMINATE', 'WIN'];

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const router = useRouter();

  const goToModeSelection = useGameStore((state) => state.goToModeSelection);

  // Cycle through taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayNow = () => {
    goToModeSelection();
    router.push('/game');
  };

  return (
    <section
      className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${cyberTheme.colors.primary}15 0%, transparent 60%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Main heading */}
        <h1
          className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-wider"
          style={{
            fontFamily: cyberTheme.fonts.heading,
            color: cyberTheme.colors.text.primary,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}60`,
          }}
        >
          CYBER{' '}
          <span style={{ color: cyberTheme.colors.primary }}>AIR HOCKEY</span>
        </h1>

        {/* Animated puck divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className="h-[2px] w-16 md:w-24"
            style={{
              background: `linear-gradient(to right, transparent, ${cyberTheme.colors.primary})`,
            }}
          />
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: cyberTheme.colors.text.primary,
              boxShadow: `0 0 12px ${cyberTheme.colors.primary}, 0 0 24px ${cyberTheme.colors.primary}50`,
            }}
          />
          <div
            className="h-[2px] w-16 md:w-24"
            style={{
              background: `linear-gradient(to left, transparent, ${cyberTheme.colors.primary})`,
            }}
          />
        </div>

        {/* Cycling tagline */}
        <div className="h-8 mb-10 overflow-hidden">
          <p
            key={taglineIndex}
            className="text-lg md:text-xl font-bold uppercase tracking-[0.3em] animate-fadeInUp"
            style={{
              color: cyberTheme.colors.text.muted,
              fontFamily: cyberTheme.fonts.heading,
            }}
          >
            {TAGLINES[taglineIndex]}
          </p>
        </div>

        {/* Centered CTA button */}
        <div className="flex justify-center">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={handlePlayNow}
          >
            PLAY NOW
          </CyberButton>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to top, ${cyberTheme.colors.bg.primary}, transparent)`,
        }}
      />

      {/* Keyframe animation for tagline */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 2s ease-in-out;
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
