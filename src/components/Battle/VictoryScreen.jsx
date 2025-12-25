import { usePlayerContext } from '../../contexts/PlayerContext';

const generateBossLoot = () => {
  const lootItems = [
    {
      id: Date.now(),
      name: 'Меч переможця',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'epic',
      quantity: 1,
      stats: { strength: 20, agility: 5 },
    },
    {
      id: Date.now() + 1,
      name: 'Броня легенди',
      type: 'armor',
      slot: 'armor',
      rarity: 'epic',
      quantity: 1,
      stats: { defense: 15, strength: 5 },
    },
    {
      id: Date.now() + 2,
      name: 'Зілля великого здоров\'я',
      type: 'potion',
      slot: null,
      rarity: 'rare',
      quantity: 3,
      effect: { health: 50 },
    },
    {
      id: Date.now() + 3,
      name: 'Золота монета боса',
      type: 'currency',
      slot: null,
      rarity: 'epic',
      quantity: 1,
    },
  ];
  return lootItems[Math.floor(Math.random() * lootItems.length)];
};

export const VictoryScreen = ({ isOpen, onClose, experienceGained, onClaimLoot }) => {
  const { player } = usePlayerContext();

  if (!isOpen) return null;

  const handleClaimLoot = () => {
    const loot = generateBossLoot();
    onClaimLoot(loot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center modal-backdrop">
      <div
        className="bg-gradient-to-br from-fantasy-dark via-purple-900 to-fantasy-dark border-4 border-fantasy-gold rounded-2xl w-11/12 max-w-md p-8 glow-gold transform scale-100"
        style={{ boxShadow: '0 0 30px rgba(253, 203, 110, 0.8)' }}
      >
        {/* Victory Header */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-fantasy-gold mb-2">ПЕРЕМОГА!</h2>
          <p className="text-xl text-gray-300">Ви перемогли боса!</p>
        </div>

        {/* Rewards */}
        <div className="bg-fantasy-dark/50 border border-fantasy-purple/50 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-fantasy-gold mb-4">Нагороди:</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-white">Досвід</span>
              </div>
              <span className="text-fantasy-gold font-bold text-xl">+{experienceGained} XP</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-white">Золото</span>
              </div>
              <span className="text-fantasy-gold font-bold text-xl">+{Math.floor(experienceGained * 2)} 🪙</span>
            </div>

            <div className="border-t border-fantasy-purple/30 pt-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📦</span>
                <span className="text-white">Випадковий предмет</span>
              </div>
              <p className="text-sm text-gray-400">Натисніть "Забрати лут" щоб отримати</p>
            </div>
          </div>
        </div>

        {/* Player Stats Update */}
        <div className="bg-fantasy-dark/30 border border-fantasy-purple/30 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400 mb-2">Ваш прогрес:</div>
          <div className="flex items-center justify-between">
            <span className="text-white">Рівень {player.level}</span>
            <span className="text-fantasy-gold">
              {player.experience} / {player.experienceToNext} XP
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleClaimLoot}
            className="btn-fantasy w-full bg-gradient-to-r from-fantasy-gold to-yellow-500 hover:from-yellow-500 hover:to-fantasy-gold text-fantasy-dark font-bold py-4 px-6 rounded-lg transition-all duration-300 text-lg glow-gold"
          >
            🎁 Забрати лут
          </button>
          <button
            onClick={onClose}
            className="btn-fantasy w-full bg-fantasy-purple/60 hover:bg-fantasy-purple/80 text-white font-semibold py-3 px-6 rounded-lg transition-all"
          >
            Продовжити
          </button>
        </div>
      </div>
    </div>
  );
};

