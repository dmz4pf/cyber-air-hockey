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
          viewport={{ once: true, amount: 0.3 }}
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
          viewport={{ once: true, amount: 0.3 }}
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
          viewport={{ once: true, amount: 0.3 }}
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

            {/* Energy pulses from center */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: `2px solid ${cyberTheme.colors.primary}`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: [1, 3, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeOut',
                }}
              />
            ))}

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

            {/* Animated Puck */}
            <AnimatedPuck />

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
          viewport={{ once: true, amount: 0.3 }}
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

// Animated Puck Component
const AnimatedPuck = () => {
  // Bouncing pattern: figure-8 motion
  return (
    <motion.div
      className="absolute"
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${colors.white}, ${cyberTheme.colors.primary})`,
        boxShadow: `
          0 0 20px ${cyberTheme.colors.primary},
          0 0 40px ${cyberTheme.colors.primary}
        `,
      }}
      animate={{
        x: [
          '20%',
          '40%',
          '60%',
          '80%',
          '60%',
          '40%',
          '20%',
        ],
        y: [
          '30%',
          '20%',
          '40%',
          '30%',
          '60%',
          '70%',
          '30%',
        ],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Puck trail */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${cyberTheme.colors.primary}60, transparent)`,
        }}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

export default ArenaShowcase;
