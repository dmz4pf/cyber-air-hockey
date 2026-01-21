'use client';

import { useEffect } from 'react';
import { DesignProvider, useDesign } from '@/designs/DesignContext';
import { ThemedGamePage } from '@/designs/ThemedGamePage';
import { ThemedMenu } from '@/designs/ThemedMenu';
import { useGameStore } from '@/stores/gameStore';

function SynthwaveSunsetGame() {
  const { setDesign } = useDesign();
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    setDesign('synthwave-sunset');
  }, [setDesign]);

  if (status === 'menu') {
    return <ThemedMenu />;
  }

  return <ThemedGamePage />;
}

export default function SynthwaveSunsetPage() {
  return (
    <DesignProvider>
      <SynthwaveSunsetGame />
    </DesignProvider>
  );
}
