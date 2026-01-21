'use client';

/**
 * HeroSection - Clean hero with CTA for home page
 * No particles, no shimmer - just clean design
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/stores/themeStore';
import { useGameStore } from '@/stores/gameStore';
import { CyberButton } from '../ui/CyberButton';
import { StatusBadge } from '../ui/StatusBadge';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = '' }: HeroSectionProps) {
  const router = useRouter();
  const theme = useThemeStore((state) => state.theme);

  const goToModeSelection = useGameStore((state) => state.goToModeSelection);

  const handlePlayNow = () => {
    // Reset to mode selection and navigate to game page
    goToModeSelection();
    router.push('/game');
  };

  return (
    <section
      className={`relative min-h-[70vh] flex items-center justify-center ${className}`}
      style={{
        background: theme.colors.backgroundGradient || theme.colors.background,
      }}
    >
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Status badge */}
        <div className="flex justify-center mb-6">
          <StatusBadge status="live" pulse size="md" />
        </div>

        {/* Main heading */}
        <h1
          className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-wider"
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.text,
            textShadow: `0 0 ${theme.effects.glowIntensity}px ${theme.colors.primary}60`,
          }}
        >
          AIR{' '}
          <span style={{ color: theme.colors.primary }}>HOCKEY</span>
        </h1>

        {/* Subheading */}
        <p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          style={{ color: theme.colors.textMuted }}
        >
          Compete in the ultimate air hockey experience. Climb the ranks,
          unlock achievements, and prove you&apos;re the best.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <CyberButton
            variant="primary"
            size="lg"
            glow
            onClick={handlePlayNow}
          >
            PLAY NOW
          </CyberButton>
          <Link href="/leaderboard">
            <CyberButton variant="secondary" size="lg">
              VIEW RANKINGS
            </CyberButton>
          </Link>
        </div>

        {/* Stats row */}
        <div
          className="mt-12 flex items-center justify-center gap-8 md:gap-16"
          style={{ color: theme.colors.textMuted }}
        >
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading,
              }}
            >
              25+
            </div>
            <div className="text-sm uppercase tracking-wider">Achievements</div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading,
              }}
            >
              6
            </div>
            <div className="text-sm uppercase tracking-wider">Rank Tiers</div>
          </div>
          <div className="text-center">
            <div
              className="text-3xl font-bold"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading,
              }}
            >
              100
            </div>
            <div className="text-sm uppercase tracking-wider">Max Level</div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: `linear-gradient(to top, ${theme.colors.background}, transparent)`,
        }}
      />
    </section>
  );
}

export default HeroSection;
