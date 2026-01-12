'use client';

/**
 * NavLinks - Navigation links component
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cyberTheme } from '@/lib/cyber/theme';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface NavLinksProps {
  links?: NavLink[];
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const defaultLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/game', label: 'Play', icon: '🎮' },
  { href: '/profile', label: 'Profile', icon: '👤' },
  { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

const sizeConfig = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function NavLinks({
  links = defaultLinks,
  direction = 'horizontal',
  size = 'md',
  className = '',
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex ${
        direction === 'vertical' ? 'flex-col' : 'items-center gap-1'
      } ${className}`}
    >
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-md ${sizeConfig[size]} transition-all duration-200`}
            style={{
              backgroundColor: isActive
                ? `${cyberTheme.colors.primary}20`
                : 'transparent',
              color: isActive
                ? cyberTheme.colors.primary
                : cyberTheme.colors.text.secondary,
              fontFamily: cyberTheme.fonts.heading,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = `${cyberTheme.colors.primary}10`;
                e.currentTarget.style.color = cyberTheme.colors.text.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = cyberTheme.colors.text.secondary;
              }
            }}
          >
            {link.icon && <span className="text-base">{link.icon}</span>}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default NavLinks;
