import type { Metadata } from 'next';
import { Inter, Orbitron, Press_Start_2P, Bebas_Neue } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Base font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Neon Arcade / Cyber Esports font
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

// Retro Pixel font
const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start',
});

// Ice Stadium font
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
});

export const metadata: Metadata = {
  title: 'Air Hockey',
  description: 'Classic air hockey game built with Next.js and Matter.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${orbitron.variable} ${pressStart.variable} ${bebasNeue.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
