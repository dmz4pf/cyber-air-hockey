'use client';

/**
 * ArenaShowcase - "YOUR ARENA AWAITS" section with scroll-triggered animations
 * Displays the cyber arena table with staggered fly-in animations
 */

import { motion } from 'framer-motion';
import { cyberTheme } from '@/lib/cyber/theme';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const colors = {
  cyan: cyberTheme.colors.primary,
  white: '#ffffff',
  amber: '#f59e0b',
  deepSpace: cyberTheme.colors.bg.primary,
};

export function ArenaShowcase() {
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!arenaRef.current) return;

    // Create a holographic shimmer effect using brightness pulsing
    gsap.to(arenaRef.current, {
      filter: 'brightness(1.2)',
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <section className="relative px-4 py-32">
      <div className="max-w-6xl mx-auto">
        {/* Title - Flies in first */}
        <motion.h2
          className="text-4xl md:text-6xl font-bold text-center mb-8 uppercase"
          style={{
            fontFamily: cyberTheme.fonts.heading,
            color: cyberTheme.colors.primary,
            textShadow: `0 0 20px ${cyberTheme.colors.primary}`,
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0 }}
        >
          YOUR ARENA AWAITS
        </motion.h2>

        {/* Subtitle - Flies in second */}
        <motion.p
          className="text-center mb-16 text-xl"
          style={{
            color: cyberTheme.colors.text.secondary,
            fontFamily: cyberTheme.fonts.body,
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Step into the cyber arena where legends are born
        </motion.p>

        {/* Arena Table - Flies in third */}
        <motion.div
          className="relative mx-auto"
          style={{
            maxWidth: 800,
            aspectRatio: '16/9',
            perspective: 1000,
          }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div
            ref={arenaRef}
            className="relative w-full h-full rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.deepSpace} 0%, #0a0a15 100%)`,
              border: `2px solid ${cyberTheme.colors.primary}`,
              boxShadow: `
                0 0 40px ${cyberTheme.colors.primary}40,
                inset 0 0 60px ${cyberTheme.colors.primary}10
              `,
              transform: 'rotateX(30deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Holographic scan lines */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  ${cyberTheme.colors.primary}05 2px,
                  ${cyberTheme.colors.primary}05 4px
                )`,
              }}
              animate={{
                backgroundPosition: ['0% 0%', '0% 100%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Animated Match - Paddles and Puck */}
            <AnimatedMatch />

            {/* Center line */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-0.5"
              style={{
                background: cyberTheme.colors.primary,
                boxShadow: `0 0 10px ${cyberTheme.colors.primary}`,
                transform: 'translateX(-50%)',
              }}
            />

            {/* Center circle */}
            <motion.div
              className="absolute top-1/2 left-1/2"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: `2px solid ${cyberTheme.colors.primary}`,
                boxShadow: `0 0 20px ${cyberTheme.colors.primary}`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${cyberTheme.colors.primary}`,
                  `0 0 30px ${cyberTheme.colors.primary}`,
                  `0 0 20px ${cyberTheme.colors.primary}`,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Goal areas */}
            <div
              className="absolute top-1/2 left-4 w-16 h-32"
              style={{
                transform: 'translateY(-50%)',
                border: `2px solid ${colors.amber}`,
                borderLeft: 'none',
                boxShadow: `0 0 15px ${colors.amber}40`,
              }}
            />
            <div
              className="absolute top-1/2 right-4 w-16 h-32"
              style={{
                transform: 'translateY(-50%)',
                border: `2px solid ${colors.amber}`,
                borderRight: 'none',
                boxShadow: `0 0 15px ${colors.amber}40`,
              }}
            />

            {/* Corner markers */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
              (position) => {
                const [vertical, horizontal] = position.split('-');
                return (
                  <div
                    key={position}
                    className="absolute w-8 h-8"
                    style={{
                      [vertical]: 8,
                      [horizontal]: 8,
                      border: `2px solid ${cyberTheme.colors.primary}`,
                      borderBottom:
                        vertical === 'top' ? 'none' : `2px solid ${cyberTheme.colors.primary}`,
                      borderTop:
                        vertical === 'bottom'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      borderRight:
                        horizontal === 'left'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      borderLeft:
                        horizontal === 'right'
                          ? 'none'
                          : `2px solid ${cyberTheme.colors.primary}`,
                      opacity: 0.6,
                    }}
                  />
                );
              }
            )}


            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(${cyberTheme.colors.primary}40 1px, transparent 1px),
                  linear-gradient(90deg, ${cyberTheme.colors.primary}40 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${cyberTheme.colors.primary}10, transparent 70%)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </motion.div>

        {/* Status text */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              backgroundColor: `${cyberTheme.colors.primary}10`,
              border: `1px solid ${cyberTheme.colors.primary}`,
            }}
          >
            <motion.div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: cyberTheme.colors.primary,
                boxShadow: `0 0 10px ${cyberTheme.colors.primary}`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <span
              className="text-sm font-medium tracking-wider uppercase"
              style={{
                fontFamily: cyberTheme.fonts.heading,
                color: cyberTheme.colors.primary,
              }}
            >
              ARENA STATUS: ACTIVE
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Animated Match Component - Realistic air hockey simulation
const AnimatedMatch = () => {
  const puckRef = useRef<HTMLDivElement>(null);
  const leftPaddleRef = useRef<HTMLDivElement>(null);
  const rightPaddleRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!puckRef.current || !leftPaddleRef.current || !rightPaddleRef.current) return;

    // Create the match timeline
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.3,
    });

    // Match sequence: 2-3 second realistic rally
    tl
      // Starting position - puck at center, paddles ready
      .set(puckRef.current, { x: '50%', y: '50%', xPercent: -50, yPercent: -50 })
      .set(leftPaddleRef.current, { x: '25%', y: '50%', xPercent: -50, yPercent: -50 })
      .set(rightPaddleRef.current, { x: '75%', y: '50%', xPercent: -50, yPercent: -50 })

      // Rally 1: Left paddle hits to right
      .to(leftPaddleRef.current, {
        y: '45%',
        duration: 0.15,
        ease: 'power2.out'
      }, 0.1)
      .to(puckRef.current, {
        x: '70%',
        y: '45%',
        duration: 0.4,
        ease: 'power1.inOut'
      }, 0.15)

      // Rally 2: Right paddle returns
      .to(rightPaddleRef.current, {
        y: '40%',
        duration: 0.15,
        ease: 'power2.out'
      }, 0.45)
      .to(puckRef.current, {
        x: '35%',
        y: '60%',
        duration: 0.45,
        ease: 'power1.inOut'
      }, 0.5)

      // Rally 3: Left paddle repositions and hits
      .to(leftPaddleRef.current, {
        y: '62%',
        duration: 0.2,
        ease: 'power2.out'
      }, 0.85)
      .to(puckRef.current, {
        x: '72%',
        y: '55%',
        duration: 0.4,
        ease: 'power1.inOut'
      }, 0.95)

      // Rally 4: Right paddle final hit
      .to(rightPaddleRef.current, {
        y: '54%',
        duration: 0.15,
        ease: 'power2.out'
      }, 1.25)
      .to(puckRef.current, {
        x: '30%',
        y: '48%',
        duration: 0.45,
        ease: 'power1.inOut'
      }, 1.3)

      // Final shot: Left paddle winds up and shoots
      .to(leftPaddleRef.current, {
        y: '46%',
        duration: 0.2,
        ease: 'power2.inOut'
      }, 1.65)
      .to(puckRef.current, {
        x: '95%',
        y: '50%',
        duration: 0.5,
        ease: 'power2.in'
      }, 1.75)

      // Reset paddles to ready position
      .to([leftPaddleRef.current, rightPaddleRef.current], {
        y: '50%',
        duration: 0.3,
        ease: 'power1.inOut'
      }, 2.1);

    timelineRef.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <>
      {/* Left Paddle - Player (Green/Cyan) */}
      <div
        ref={leftPaddleRef}
        className="absolute"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.cyan}, ${colors.cyan}80)`,
          boxShadow: `
            0 0 20px ${colors.cyan},
            0 0 30px ${colors.cyan}80,
            inset 0 0 10px ${colors.cyan}
          `,
          border: `2px solid ${colors.cyan}`,
          zIndex: 2,
        }}
      />

      {/* Right Paddle - Opponent (Red/Amber) */}
      <div
        ref={rightPaddleRef}
        className="absolute"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.amber}, #ef4444)`,
          boxShadow: `
            0 0 20px ${colors.amber},
            0 0 30px ${colors.amber}80,
            inset 0 0 10px ${colors.amber}
          `,
          border: `2px solid ${colors.amber}`,
          zIndex: 2,
        }}
      />

      {/* Puck */}
      <div
        ref={puckRef}
        className="absolute"
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.white}, ${cyberTheme.colors.primary})`,
          boxShadow: `
            0 0 20px ${cyberTheme.colors.primary},
            0 0 40px ${cyberTheme.colors.primary}
          `,
          zIndex: 3,
        }}
      >
        {/* Puck trail effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${cyberTheme.colors.primary}60, transparent)`,
          }}
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </div>
    </>
  );
};

export default ArenaShowcase;
