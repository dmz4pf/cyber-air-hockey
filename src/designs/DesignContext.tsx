'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DesignId, DesignConfig } from './types';

// Import all design configs
import { neonArcadeConfig } from './neon-arcade/config';
import { minimalistConfig } from './minimalist/config';
import { retroPixelConfig } from './retro-pixel/config';
import { iceStadiumConfig } from './ice-stadium/config';
import { cyberEsportsConfig } from './cyber-esports/config';

const designConfigs: Record<DesignId, DesignConfig> = {
  'neon-arcade': neonArcadeConfig,
  'minimalist': minimalistConfig,
  'retro-pixel': retroPixelConfig,
  'ice-stadium': iceStadiumConfig,
  'cyber-esports': cyberEsportsConfig,
};

interface DesignContextType {
  designId: DesignId;
  config: DesignConfig;
  setDesign: (id: DesignId) => void;
  allDesigns: DesignConfig[];
}

const DesignContext = createContext<DesignContextType | null>(null);

export function DesignProvider({ children }: { children: ReactNode }) {
  const [designId, setDesignId] = useState<DesignId>('neon-arcade');

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('air-hockey-design');
    if (saved && saved in designConfigs) {
      setDesignId(saved as DesignId);
    }
  }, []);

  const setDesign = (id: DesignId) => {
    setDesignId(id);
    localStorage.setItem('air-hockey-design', id);
  };

  const config = designConfigs[designId];
  const allDesigns = Object.values(designConfigs);

  return (
    <DesignContext.Provider value={{ designId, config, setDesign, allDesigns }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
