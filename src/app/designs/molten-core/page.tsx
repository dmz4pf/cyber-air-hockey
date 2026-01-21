'use client';

import { useEffect } from 'react';
import { DesignProvider, useDesign } from '@/designs/DesignContext';
import { ThemedGamePage } from '@/designs/ThemedGamePage';
import { ThemedMenu } from '@/designs/ThemedMenu';
import { useGameStore } from '@/stores/gameStore';

function MoltenCoreGame() {
  const { setDesign } = useDesign();
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    setDesign('molten-core');
  }, [setDesign]);

  if (status === 'menu') {
    return <ThemedMenu />;
  }

  return <ThemedGamePage />;
}

export default function MoltenCorePage() {
  return (
    <DesignProvider>
      <MoltenCoreGame />
    </DesignProvider>
  );
}
