import { createContext, useContext } from 'react';
import { usePlayer } from '../hooks/usePlayer';

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
  const playerData = usePlayer();
  return (
    <PlayerContext.Provider value={playerData}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
};

