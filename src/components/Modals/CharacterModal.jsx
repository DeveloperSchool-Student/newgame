import { usePlayerContext } from '../../contexts/PlayerContext';
import { useClanContext } from '../../contexts/ClanContext';
import { checkItemSet, getActiveSetBonuses } from '../../utils/itemSets';

export const CharacterModal = ({ isOpen, onClose }) => {
  const { player, unequipItem } = usePlayerContext();
  const { clan } = useClanContext();
  
  // Перевірка активних наборів
  const activeSets = checkItemSet(player.equippedItems, player.inventory);
  const setBonuses = getActiveSetBonuses(player.equippedItems, player.inventory);

  if (!isOpen) return null;

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const manaPercentage = (player.mana / player.maxMana) * 100;
  const expPercentage = (player.experience / player.experienceToNext) * 100;

  const slotLabels = {
    weapon: 'Зброя',
    armor: 'Броня',
    ring: 'Кільце',
    amulet: 'Амулет',
    belt: 'Пояс',
    boots: 'Чоботи',
    helmet: 'Шолом',
  };

  const slotIcons = {
    weapon: '⚔️',
    armor: '🛡️',
    ring: '💍',
    amulet: '🔮',
    belt: '👔',
    boots: '👢',
    helmet: '⛑️',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-xl w-11/12 max-w-2xl max-h-[90vh] overflow-hidden glow-purple transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-fantasy-purple/40 to-purple-600/40 px-6 py-4 border-b-2 border-fantasy-purple flex justify-between items-center">
          <h2 className="text-2xl font-bold text-fantasy-gold">Персонаж</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-3xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ліва колонка - Статистика */}
            <div className="md:col-span-1 space-y-4">
              {/* Інформація про персонажа */}
              <div className="text-center bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
                <div className="text-5xl mb-2">⚔️</div>
                <h3 className="text-xl font-bold text-fantasy-gold">{player.name}</h3>
                <p className="text-gray-400">Рівень {player.level}</p>
                {clan && (
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <span className="text-amber-300 font-semibold">[{clan.tag}]</span>
                    <span className="text-amber-200 text-sm">{clan.name}</span>
                  </div>
                )}
              </div>

              {/* Прогрес-бари */}
              <div className="space-y-3">
                {/* Health Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-fantasy-red font-semibold">HP</span>
                    <span className="text-white">
                      {player.health} / {player.maxHealth}
                    </span>
                  </div>
                  <div className="w-full bg-fantasy-dark/50 rounded-full h-2.5 border border-fantasy-red/50">
                    <div
                      className="bg-gradient-to-r from-red-600 to-fantasy-red h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${healthPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Mana Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-fantasy-purple font-semibold">MP</span>
                    <span className="text-white">
                      {player.mana} / {player.maxMana}
                    </span>
                  </div>
                  <div className="w-full bg-fantasy-dark/50 rounded-full h-2.5 border border-fantasy-purple/50">
                    <div
                      className="bg-gradient-to-r from-fantasy-purple to-purple-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${manaPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Experience Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-fantasy-gold font-semibold">XP</span>
                    <span className="text-white">
                      {player.experience} / {player.experienceToNext}
                    </span>
                  </div>
                  <div className="w-full bg-fantasy-dark/50 rounded-full h-2.5 border border-fantasy-gold/50">
                    <div
                      className="bg-gradient-to-r from-fantasy-gold to-yellow-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${expPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Статистика */}
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-fantasy-gold mb-3">Характеристики</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Сила</span>
                    <span className="text-fantasy-gold font-bold">{player.stats.strength}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Спритність</span>
                    <span className="text-fantasy-gold font-bold">{player.stats.agility}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Інтелект</span>
                    <span className="text-fantasy-gold font-bold">{player.stats.intelligence}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Захист</span>
                    <span className="text-fantasy-gold font-bold">
                      {player.stats.defense}
                      {setBonuses.defense > 0 && (
                        <span className="text-green-400 text-xs ml-1">(+{setBonuses.defense})</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Активні набори */}
              {activeSets.length > 0 && (
                <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-fantasy-gold mb-3">Активні набори</h4>
                  <div className="space-y-2">
                    {activeSets.map((set) => (
                      <div key={set.setId} className="border border-fantasy-purple/30 rounded p-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white text-sm font-semibold">{set.setName}</span>
                          <span className="text-fantasy-gold text-xs">
                            {set.equippedCount}/{set.totalCount}
                          </span>
                        </div>
                        {set.bonus && (
                          <div className="text-xs text-green-300">
                            Бонус ({set.equippedCount} предметів):{' '}
                            {Object.entries(set.bonus).map(([stat, value]) => (
                              <span key={stat} className="mr-2">
                                {stat === 'strength' && `+${value} сили`}
                                {stat === 'agility' && `+${value} спритності`}
                                {stat === 'intelligence' && `+${value} інтелекту`}
                                {stat === 'defense' && `+${value} захисту`}
                                {stat === 'health' && `+${value} HP`}
                                {stat === 'mana' && `+${value} MP`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Права колонка - Візуалізація персонажа зі слотами */}
            <div className="md:col-span-2">
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-fantasy-gold mb-4 text-center">
                  Екіпірування
                </h4>
                
                {/* Слоти для екіпірування */}
                <div className="space-y-4">
                  {/* Основні слоти */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Слот зброї */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 block">{slotLabels.weapon}</label>
                      <div
                        className={`min-h-[100px] border-2 rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.weapon
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.weapon ? (
                          <>
                            <div className="text-2xl mb-2">{slotIcons.weapon}</div>
                            <div className="text-sm font-semibold text-white text-center">
                              {player.equippedItems.weapon.name}
                            </div>
                            <button
                              onClick={() => unequipItem('weapon')}
                              className="mt-2 text-xs text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">Порожньо</span>
                        )}
                      </div>
                    </div>

                    {/* Слот броні */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400 block">{slotLabels.armor}</label>
                      <div
                        className={`min-h-[100px] border-2 rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.armor
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.armor ? (
                          <>
                            <div className="text-2xl mb-2">{slotIcons.armor}</div>
                            <div className="text-sm font-semibold text-white text-center">
                              {player.equippedItems.armor.name}
                            </div>
                            <button
                              onClick={() => unequipItem('armor')}
                              className="mt-2 text-xs text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-sm">Порожньо</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Додаткові слоти */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Шолом */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">{slotLabels.helmet}</label>
                      <div
                        className={`min-h-[80px] border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.helmet
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.helmet ? (
                          <>
                            <div className="text-xl mb-1">{slotIcons.helmet}</div>
                            <div className="text-xs font-semibold text-white text-center line-clamp-2">
                              {player.equippedItems.helmet.name}
                            </div>
                            <button
                              onClick={() => unequipItem('helmet')}
                              className="mt-1 text-[10px] text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px]">Порожньо</span>
                        )}
                      </div>
                    </div>

                    {/* Кільце */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">{slotLabels.ring}</label>
                      <div
                        className={`min-h-[80px] border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.ring
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.ring ? (
                          <>
                            <div className="text-xl mb-1">{slotIcons.ring}</div>
                            <div className="text-xs font-semibold text-white text-center line-clamp-2">
                              {player.equippedItems.ring.name}
                            </div>
                            <button
                              onClick={() => unequipItem('ring')}
                              className="mt-1 text-[10px] text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px]">Порожньо</span>
                        )}
                      </div>
                    </div>

                    {/* Амулет */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">{slotLabels.amulet}</label>
                      <div
                        className={`min-h-[80px] border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.amulet
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.amulet ? (
                          <>
                            <div className="text-xl mb-1">{slotIcons.amulet}</div>
                            <div className="text-xs font-semibold text-white text-center line-clamp-2">
                              {player.equippedItems.amulet.name}
                            </div>
                            <button
                              onClick={() => unequipItem('amulet')}
                              className="mt-1 text-[10px] text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px]">Порожньо</span>
                        )}
                      </div>
                    </div>

                    {/* Пояс */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">{slotLabels.belt}</label>
                      <div
                        className={`min-h-[80px] border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.belt
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.belt ? (
                          <>
                            <div className="text-xl mb-1">{slotIcons.belt}</div>
                            <div className="text-xs font-semibold text-white text-center line-clamp-2">
                              {player.equippedItems.belt.name}
                            </div>
                            <button
                              onClick={() => unequipItem('belt')}
                              className="mt-1 text-[10px] text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px]">Порожньо</span>
                        )}
                      </div>
                    </div>

                    {/* Чоботи */}
                    <div className="space-y-1">
                      <label className="text-xs text-gray-400 block">{slotLabels.boots}</label>
                      <div
                        className={`min-h-[80px] border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                          player.equippedItems.boots
                            ? 'border-fantasy-gold bg-fantasy-gold/10'
                            : 'border-gray-600 bg-fantasy-dark/30 border-dashed'
                        }`}
                      >
                        {player.equippedItems.boots ? (
                          <>
                            <div className="text-xl mb-1">{slotIcons.boots}</div>
                            <div className="text-xs font-semibold text-white text-center line-clamp-2">
                              {player.equippedItems.boots.name}
                            </div>
                            <button
                              onClick={() => unequipItem('boots')}
                              className="mt-1 text-[10px] text-fantasy-red hover:text-red-400"
                            >
                              Зняти
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[10px]">Порожньо</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Золото */}
                <div className="mt-6 pt-4 border-t border-fantasy-purple/30 flex justify-between items-center">
                  <span className="text-gray-400">Золото:</span>
                  <span className="text-fantasy-gold font-bold text-xl">{player.gold} 🪙</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

