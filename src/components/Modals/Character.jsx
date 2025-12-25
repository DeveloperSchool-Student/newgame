import { usePlayerContext } from '../../contexts/PlayerContext';

export const Character = ({ isOpen, onClose }) => {
  const { player } = usePlayerContext();

  if (!isOpen) return null;

  const healthPercentage = (player.health / player.maxHealth) * 100;
  const manaPercentage = (player.mana / player.maxMana) * 100;
  const expPercentage = (player.experience / player.experienceToNext) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-md max-h-[80vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <h2 className="text-2xl font-bold text-fantasy-gold">Персонаж</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Character Info */}
          <div className="text-center">
            <div className="text-4xl mb-2">⚔️</div>
            <h3 className="text-2xl font-bold text-fantasy-gold">{player.name}</h3>
            <p className="text-gray-400">Рівень {player.level}</p>
          </div>

          {/* Experience Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Досвід</span>
              <span className="text-fantasy-gold">
                {player.experience} / {player.experienceToNext}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-3 border border-fantasy-purple/50">
              <div
                className="bg-gradient-to-r from-fantasy-purple to-fantasy-gold h-3 rounded-full transition-all duration-300"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fantasy-red">Здоров'я</span>
              <span className="text-white">
                {player.health} / {player.maxHealth}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-3 border border-fantasy-red/50">
              <div
                className="bg-fantasy-red h-3 rounded-full transition-all duration-300"
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fantasy-purple">Мана</span>
              <span className="text-white">
                {player.mana} / {player.maxMana}
              </span>
            </div>
            <div className="w-full bg-fantasy-dark/50 rounded-full h-3 border border-fantasy-purple/50">
              <div
                className="bg-fantasy-purple h-3 rounded-full transition-all duration-300"
                style={{ width: `${manaPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-fantasy-purple/30 pt-4">
            <h4 className="text-lg font-semibold text-fantasy-gold mb-3">Характеристики</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Сила</div>
                <div className="text-fantasy-gold text-xl font-bold">{player.stats.strength}</div>
              </div>
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Спритність</div>
                <div className="text-fantasy-gold text-xl font-bold">{player.stats.agility}</div>
              </div>
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Інтелект</div>
                <div className="text-fantasy-gold text-xl font-bold">{player.stats.intelligence}</div>
              </div>
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3">
                <div className="text-gray-400 text-sm">Захист</div>
                <div className="text-fantasy-gold text-xl font-bold">{player.stats.defense}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

