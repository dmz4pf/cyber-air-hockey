'use client';

import { useEffect } from 'react';
import { DesignProvider, useDesign } from '@/designs/DesignContext';
import { ThemedGamePage } from '@/designs/ThemedGamePage';
import { ThemedMenu } from '@/designs/ThemedMenu';
import { useGameStore } from '@/stores/gameStore';

function MidnightClubGame() {
  const { setDesign } = useDesign();
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    setDesign('midnight-club');
  }, [setDesign]);

  if (status === 'menu') {
    return <ThemedMenu />;
  }

  return <ThemedGamePage />;
}

export default function MidnightClubPage() {
  return (
    <DesignProvider>
      <MidnightClubGame />
    </DesignProvider>
  );
}
