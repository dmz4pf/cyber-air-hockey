'use client';

/**
 * Cyber Esports Layout - Shared layout for all cyber theme pages
 */

import React from 'react';
import { TopNavBar } from '@/components/cyber/layout';
import { cyberTheme } from '@/lib/cyber/theme';

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: cyberTheme.colors.bg.primary,
        color: cyberTheme.colors.text.primary,
      }}
    >
      {/* Navigation */}
      <TopNavBar />

      {/* Main content with top padding for fixed navbar */}
      <main className="pt-16">
        {children}
      </main>

      {/* Background effects */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${cyberTheme.colors.primary}10 0%, transparent 50%)`,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(${cyberTheme.colors.primary}08 1px, transparent 1px),
            linear-gradient(90deg, ${cyberTheme.colors.primary}08 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
