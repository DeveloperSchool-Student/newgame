import { useState, useEffect } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useToast } from '../UI/Toast';
import { RESOURCES } from '../../data/items';
import { LoadingSpinner } from '../UI/LoadingSpinner';

// Ресурси доступні для збору на різних локаціях
const LOCATION_RESOURCES = {
  capital: [
    { resourceId: 'herb', name: 'Трава', chance: 0.6, minQuantity: 1, maxQuantity: 3 },
    { resourceId: 'water', name: 'Вода', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
    { resourceId: 'wood', name: 'Дерево', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
  ],
  darkForest: [
    { resourceId: 'herb', name: 'Трава', chance: 0.7, minQuantity: 2, maxQuantity: 4 },
    { resourceId: 'wood', name: 'Дерево', chance: 0.6, minQuantity: 1, maxQuantity: 3 },
    { resourceId: 'leather', name: 'Шкіра', chance: 0.3, minQuantity: 1, maxQuantity: 2 },
    { resourceId: 'bone', name: 'Кістка', chance: 0.2, minQuantity: 1, maxQuantity: 2 },
  ],
  forgottenMines: [
    { resourceId: 'iron_ore', name: 'Залізна руда', chance: 0.5, minQuantity: 1, maxQuantity: 3 },
    { resourceId: 'coal', name: 'Вугілля', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
    { resourceId: 'stone', name: 'Камінь', chance: 0.6, minQuantity: 1, maxQuantity: 3 },
    { resourceId: 'silver_ore', name: 'Срібна руда', chance: 0.15, minQuantity: 1, maxQuantity: 1 },
  ],
  // Додайте інші локації за потреби
};

export const ResourceGathering = ({ isOpen, onClose, locationId }) => {
  const { player, addItem } = usePlayerContext();
  const { showToast } = useToast();
  const [isGathering, setIsGathering] = useState(false);
  const [gatheringProgress, setGatheringProgress] = useState(0);
  const [availableResources, setAvailableResources] = useState([]);

  useEffect(() => {
    if (isOpen && locationId) {
      const resources = LOCATION_RESOURCES[locationId] || LOCATION_RESOURCES.capital;
      setAvailableResources(resources);
    }
  }, [isOpen, locationId]);

  const gatherResource = async (resourceConfig) => {
    if (isGathering) return;

    setIsGathering(true);
    setGatheringProgress(0);

    // Симуляція збору з прогресом
    const progressInterval = setInterval(() => {
      setGatheringProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Затримка для симуляції збору
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Перевірка чи випав ресурс
      const roll = Math.random();
      if (roll <= resourceConfig.chance) {
        const quantity = Math.floor(
          Math.random() * (resourceConfig.maxQuantity - resourceConfig.minQuantity + 1) +
          resourceConfig.minQuantity
        );

        const resource = RESOURCES[resourceConfig.resourceId];
        if (resource) {
          addItem({
            ...resource,
            quantity,
            stackable: true,
          });
          showToast(`Ви зібрали ${quantity}x ${resourceConfig.name}!`, 'success');
        }
      } else {
        showToast('Ресурс не знайдено', 'warning');
      }
    } catch (error) {
      console.error('Помилка збору ресурсів:', error);
      showToast('Помилка збору ресурсів', 'error');
    } finally {
      clearInterval(progressInterval);
      setIsGathering(false);
      setGatheringProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">🌿 Збір ресурсів</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {availableResources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">На цій локації немає доступних ресурсів</p>
            </div>
          ) : (
            availableResources.map((resourceConfig, index) => {
              const resource = RESOURCES[resourceConfig.resourceId];
              if (!resource) return null;

              return (
                <div
                  key={index}
                  className="border-2 border-fantasy-purple/30 rounded-lg p-4 bg-fantasy-dark/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{resource.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{resourceConfig.name}</h3>
                        <p className="text-sm text-gray-400">
                          Шанс: {Math.round(resourceConfig.chance * 100)}% | 
                          Кількість: {resourceConfig.minQuantity}-{resourceConfig.maxQuantity}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Ціна: {resource.basePrice} 🪙 за одиницю
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => gatherResource(resourceConfig)}
                      disabled={isGathering}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        isGathering
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-fantasy-purple hover:bg-purple-600 text-white'
                      }`}
                    >
                      {isGathering ? (
                        <div className="flex items-center gap-2">
                          <LoadingSpinner size="sm" />
                          <span>Збір...</span>
                        </div>
                      ) : (
                        'Зібрати'
                      )}
                    </button>
                  </div>
                  {isGathering && gatheringProgress > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-fantasy-purple h-2 rounded-full transition-all duration-200"
                          style={{ width: `${gatheringProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-fantasy-purple/30">
          <p className="text-sm text-gray-400 text-center">
            Збір ресурсів займає час. Деякі ресурси рідкісніші за інші.
          </p>
        </div>
      </div>
    </div>
  );
};

