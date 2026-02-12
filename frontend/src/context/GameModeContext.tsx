// src/context/GameModeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Mode = 'sequential' | 'daily' | 'weekly';

interface GameModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const GameModeContext = createContext<GameModeContextType>({
  mode: 'sequential',
  setMode: () => {},
});

export const GameModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<Mode>('sequential');
  return (
    <GameModeContext.Provider value={{ mode, setMode }}>
      {children}
    </GameModeContext.Provider>
  );
};

export const useGameMode = () => useContext(GameModeContext);
