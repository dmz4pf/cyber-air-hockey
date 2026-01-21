'use client';

import { useEffect } from 'react';
import { DesignProvider, useDesign } from '@/designs/DesignContext';
import { ThemedGamePage } from '@/designs/ThemedGamePage';
import { ThemedMenu } from '@/designs/ThemedMenu';
import { useGameStore } from '@/stores/gameStore';

function TokyoDriftGame() {
  const { setDesign } = useDesign();
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    setDesign('tokyo-drift');
  }, [setDesign]);

  if (status === 'menu') {
    return <ThemedMenu />;
  }

  return <ThemedGamePage />;
}

export default function TokyoDriftPage() {
  return (
    <DesignProvider>
      <TokyoDriftGame />
    </DesignProvider>
  );
}
