import { useState, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useToast } from '../UI/Toast';

const LOCATIONS = {
  capital: { id: 'capital', name: 'Столиця', emoji: '🏰' },
  darkForest: { id: 'darkForest', name: 'Темний ліс', emoji: '🌲' },
  forgottenMines: { id: 'forgottenMines', name: 'Забуті шахти', emoji: '⛏️' },
};

const TRANSPORT_COSTS = {
  capital: { darkForest: 50, forgottenMines: 100 },
  darkForest: { capital: 50, forgottenMines: 75 },
  forgottenMines: { capital: 100, darkForest: 75 },
};

export const TransportSystem = ({ isOpen, onClose, currentLocation, onLocationChange }) => {
  const { player, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [selectedDestination, setSelectedDestination] = useState(null);

  const handleTravel = useCallback((destinationId) => {
    if (!currentLocation || !destinationId) return;

    const cost = TRANSPORT_COSTS[currentLocation.id]?.[destinationId] || 100;
    
    if (player.gold < cost) {
      showToast('Недостатньо золота для подорожі', 'error');
      return;
    }

    addGold(-cost);
    showToast(`Ви подорожуєте до ${LOCATIONS[destinationId]?.name} за ${cost} золота!`, 'success');
    onLocationChange?.(destinationId);
    onClose();
  }, [currentLocation, player.gold, addGold, showToast, onLocationChange, onClose]);

  if (!isOpen || !currentLocation) return null;

  const availableDestinations = Object.values(LOCATIONS).filter(
    (loc) => loc.id !== currentLocation.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-fantasy-gold">🚗 Транспорт</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Поточна локація:</div>
          <div className="text-lg font-bold text-white">
            {LOCATIONS[currentLocation.id]?.emoji} {LOCATIONS[currentLocation.id]?.name}
          </div>
        </div>

        <div className="space-y-3">
          {availableDestinations.map((destination) => {
            const cost = TRANSPORT_COSTS[currentLocation.id]?.[destination.id] || 100;
            const canAfford = player.gold >= cost;

            return (
              <button
                key={destination.id}
                onClick={() => handleTravel(destination.id)}
                disabled={!canAfford}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  canAfford
                    ? 'border-fantasy-purple bg-fantasy-dark/50 hover:bg-fantasy-purple/20'
                    : 'border-gray-600 bg-gray-900/50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{destination.emoji}</span>
                    <div className="text-left">
                      <div className="text-lg font-bold text-white">{destination.name}</div>
                      <div className="text-sm text-gray-400">Швидка подорож каретою</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                      {cost} 🪙
                    </div>
                    {!canAfford && (
                      <div className="text-xs text-red-400">Недостатньо</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-gray-400 text-center">
          Ваше золото: {player.gold} 🪙
        </div>
      </div>
    </div>
  );
};

