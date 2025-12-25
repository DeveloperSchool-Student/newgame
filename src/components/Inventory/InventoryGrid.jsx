import { usePlayerContext } from '../../contexts/PlayerContext';

const rarityColors = {
  common: 'border-gray-500 bg-gray-500/10',
  uncommon: 'border-green-500 bg-green-500/10',
  combat: 'border-blue-500 bg-blue-500/10',
  epic: 'border-purple-500 bg-purple-500/10',
  legendary: 'border-yellow-500 bg-yellow-500/10',
  mythic: 'border-orange-500 bg-orange-500/10',
  divine: 'border-white bg-gradient-to-br from-white/20 via-cyan-500/20 to-purple-500/20',
};

const rarityLabels = {
  common: 'Звичайна',
  uncommon: 'Постійна',
  combat: 'Бойова',
  epic: 'Епічна',
  legendary: 'Легендарна',
  mythic: 'Міфічна',
  divine: 'Божественна',
};

export const InventoryGrid = ({ isOpen, onClose }) => {
  const { player, equipItem, useItem } = usePlayerContext();

  if (!isOpen) return null;

  // Створюємо сітку 4x5 (20 слотів)
  const gridSize = 20;
  const inventorySlots = Array.from({ length: gridSize }, (_, index) => {
    return player.inventory[index] || null;
  });

  const handleItemAction = (item) => {
    if (!item) return;

    if (item.slot) {
      // Екіпіруємо предмет
      equipItem(item.id);
    } else if (item.type === 'potion' || item.type === 'consumable') {
      // Використовуємо зілля або споживані предмети
      useItem(item.id);
    }
  };

  const getItemActionLabel = (item) => {
    if (!item) return '';
    if (item.slot) return 'Одягнути';
    if (item.type === 'potion' || item.type === 'consumable') return 'Використати';
    if (item.type === 'material') return 'Матеріал';
    if (item.type === 'special') return 'Спеціальний';
    return '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-fantasy-dark border-t-2 border-fantasy-purple rounded-t-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden glow-purple transform transition-all duration-300 translate-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-fantasy-purple/40 to-purple-600/40 px-6 py-4 border-b-2 border-fantasy-purple flex justify-between items-center">
          <h2 className="text-2xl font-bold text-fantasy-gold">Інвентар</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-3xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
          {/* Сітка інвентаря */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {inventorySlots.map((item, index) => (
              <div
                key={index}
                className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                  item
                    ? `${rarityColors[item.rarity] || rarityColors.common} cursor-pointer hover:scale-105`
                    : 'border-gray-700 bg-fantasy-dark/30 border-dashed'
                }`}
                onClick={() => item && handleItemAction(item)}
              >
                {item ? (
                  <>
                    <div className="text-2xl mb-1">
                      {item.icon || (
                        <>
                          {item.type === 'weapon' && '⚔️'}
                          {item.type === 'armor' && '🛡️'}
                          {item.type === 'potion' && '🧪'}
                          {item.type === 'consumable' && '🍎'}
                          {item.type === 'accessory' && (item.slot === 'ring' ? '💍' : item.slot === 'amulet' ? '🔮' : item.slot === 'belt' ? '👔' : '📦')}
                          {item.type === 'material' && '📦'}
                          {item.type === 'special' && '🗝️'}
                          {!['weapon', 'armor', 'potion', 'consumable', 'accessory', 'material', 'special'].includes(item.type) && '📦'}
                        </>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white text-center mb-1 line-clamp-2">
                      {item.name}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-fantasy-gold font-bold">
                        x{item.quantity}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">
                      {rarityLabels[item.rarity] || rarityLabels.common}
                    </div>
                  </>
                ) : (
                  <span className="text-gray-600 text-xs">Порожньо</span>
                )}
              </div>
            ))}
          </div>

          {/* Список предметів з деталями */}
          {player.inventory.length > 0 && (
            <div className="space-y-2 border-t border-fantasy-purple/30 pt-4">
              <h3 className="text-lg font-semibold text-fantasy-gold mb-3">
                Детальний список
              </h3>
              {player.inventory.map((item) => (
                <div
                  key={item.id}
                  className={`bg-fantasy-dark/50 border-2 rounded-lg p-4 hover:bg-fantasy-purple/10 transition-all ${
                    rarityColors[item.rarity] || rarityColors.common
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.rarity === 'uncommon' ? 'bg-green-500/30 text-green-300' :
                          item.rarity === 'combat' ? 'bg-blue-500/30 text-blue-300' :
                          item.rarity === 'epic' ? 'bg-purple-500/30 text-purple-300' :
                          item.rarity === 'legendary' ? 'bg-yellow-500/30 text-yellow-300' :
                          item.rarity === 'mythic' ? 'bg-orange-500/30 text-orange-300' :
                          item.rarity === 'divine' ? 'bg-gradient-to-r from-white/40 via-cyan-400/40 to-purple-400/40 text-white' :
                          'bg-gray-500/30 text-gray-300'
                        }`}>
                          {rarityLabels[item.rarity] || rarityLabels.common}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 capitalize mb-2">{item.type}</p>
                      {item.stats && (
                        <div className="text-xs text-gray-300">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <span key={stat} className="mr-2">
                              {stat === 'strength' && `Сила: +${value}`}
                              {stat === 'agility' && `Спритність: +${value}`}
                              {stat === 'defense' && `Захист: +${value}`}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.effect && (
                        <div className="text-xs text-fantasy-green mt-1">
                          Ефект: {item.effect.health && `+${item.effect.health} HP`}
                          {item.effect.mana && ` +${item.effect.mana} MP`}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {item.quantity > 1 && (
                        <span className="text-fantasy-gold font-bold">x{item.quantity}</span>
                      )}
                      <button
                        onClick={() => handleItemAction(item)}
                        className="btn-fantasy px-4 py-2 bg-fantasy-purple/60 hover:bg-fantasy-purple/80 text-white text-sm font-semibold rounded-lg transition-all"
                      >
                        {getItemActionLabel(item)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-fantasy-purple/30 flex justify-between items-center">
            <span className="text-gray-400">Золото:</span>
            <span className="text-fantasy-gold font-bold text-xl">{player.gold} 🪙</span>
          </div>
        </div>
      </div>
    </div>
  );
};

