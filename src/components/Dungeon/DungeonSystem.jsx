import { useState, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';

// Визначення підземель з рівнями
const DUNGEONS = {
  shadowCaves: {
    id: 'shadowCaves',
    name: 'Тіньові Печери',
    description: 'Темні печери, повні тіньових істот',
    minLevel: 1,
    maxLevel: 10,
    levels: 5,
    emoji: '🕳️',
  },
  forgottenCrypt: {
    id: 'forgottenCrypt',
    name: 'Забута Крипта',
    description: 'Стародавня крипта з нежиттю',
    minLevel: 5,
    maxLevel: 15,
    levels: 10,
    emoji: '⚰️',
  },
  fireTemple: {
    id: 'fireTemple',
    name: 'Вогняний Храм',
    description: 'Храм вогняних демонів',
    minLevel: 10,
    maxLevel: 25,
    levels: 15,
    emoji: '🔥',
  },
  frozenDepths: {
    id: 'frozenDepths',
    name: 'Крижані Глибини',
    description: 'Льодяні підземелля з крижаними монстрами',
    minLevel: 15,
    maxLevel: 30,
    levels: 15,
    emoji: '❄️',
  },
  abyssalPit: {
    id: 'abyssalPit',
    name: 'Безодня',
    description: 'Глибини пекла з демонічними істотами',
    minLevel: 25,
    maxLevel: 50,
    levels: 25,
    emoji: '💀',
  },
  dragonLair: {
    id: 'dragonLair',
    name: 'Лігво Дракона',
    description: 'Легендарне лігво з древніми драконами',
    minLevel: 40,
    maxLevel: 100,
    levels: 50,
    emoji: '🐉',
  },
};

// Генерація монстрів для рівня
const generateMonster = (dungeonId, level, playerLevel) => {
  const dungeon = DUNGEONS[dungeonId];
  const monsterLevel = Math.min(dungeon.minLevel + level, dungeon.maxLevel);
  
  const monsters = {
    shadowCaves: [
      { name: 'Тіньовий Слизняк', emoji: '👾', multiplier: 1.0 },
      { name: 'Темний Кажан', emoji: '🦇', multiplier: 1.2 },
      { name: 'Тіньовий Воїн', emoji: '⚔️', multiplier: 1.5 },
    ],
    forgottenCrypt: [
      { name: 'Скелет', emoji: '💀', multiplier: 1.0 },
      { name: 'Зомбі', emoji: '🧟', multiplier: 1.3 },
      { name: 'Відьма', emoji: '🧙‍♀️', multiplier: 1.6 },
    ],
    fireTemple: [
      { name: 'Вогняний Елементаль', emoji: '🔥', multiplier: 1.2 },
      { name: 'Лавовий Гігант', emoji: '👹', multiplier: 1.5 },
      { name: 'Вогняний Демон', emoji: '😈', multiplier: 2.0 },
    ],
    frozenDepths: [
      { name: 'Крижаний Вовк', emoji: '🐺', multiplier: 1.1 },
      { name: 'Снігова Відьма', emoji: '🧊', multiplier: 1.4 },
      { name: 'Морозний Дракон', emoji: '🐲', multiplier: 1.8 },
    ],
    abyssalPit: [
      { name: 'Малий Демон', emoji: '👿', multiplier: 1.3 },
      { name: 'Пекельний Гончак', emoji: '🐕', multiplier: 1.6 },
      { name: 'Владика Безодні', emoji: '👹', multiplier: 2.2 },
    ],
    dragonLair: [
      { name: 'Юний Дракон', emoji: '🦎', multiplier: 1.5 },
      { name: 'Дорослий Дракон', emoji: '🐉', multiplier: 2.5 },
      { name: 'Древній Дракон', emoji: '🐲', multiplier: 4.0 },
    ],
  };

  const dungeonMonsters = monsters[dungeonId] || monsters.shadowCaves;
  const monsterIndex = Math.min(Math.floor(level / (dungeon.levels / dungeonMonsters.length)), dungeonMonsters.length - 1);
  const baseMonster = dungeonMonsters[monsterIndex];

  return {
    ...baseMonster,
    level: monsterLevel,
    hp: Math.floor(50 * monsterLevel * baseMonster.multiplier),
    maxHp: Math.floor(50 * monsterLevel * baseMonster.multiplier),
    attack: Math.floor(10 * monsterLevel * baseMonster.multiplier),
    defense: Math.floor(5 * monsterLevel * baseMonster.multiplier),
    expReward: Math.floor(20 * monsterLevel * baseMonster.multiplier),
    goldReward: Math.floor(15 * monsterLevel * baseMonster.multiplier),
  };
};

export const DungeonSystem = ({ isOpen, onClose }) => {
  const { player, addExperience, addGold, updateHealth } = usePlayerContext();
  const [selectedDungeon, setSelectedDungeon] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentMonster, setCurrentMonster] = useState(null);
  const [inBattle, setInBattle] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [isExploring, setIsExploring] = useState(false);

  const handleSelectDungeon = useCallback((dungeonId) => {
    const dungeon = DUNGEONS[dungeonId];
    if (player.level < dungeon.minLevel) {
      alert(`Потрібен рівень ${dungeon.minLevel} для входу!`);
      return;
    }
    setSelectedDungeon(dungeonId);
    setCurrentLevel(1);
    setInBattle(false);
    setIsExploring(true);
    setBattleLog([]);
  }, [player.level]);

  const handleExploreLevel = useCallback(() => {
    if (!selectedDungeon) return;

    const monster = generateMonster(selectedDungeon, currentLevel, player.level);
    setCurrentMonster(monster);
    setInBattle(true);
    setBattleLog([`Ви зустріли ${monster.emoji} ${monster.name} (Рівень ${monster.level})!`]);
  }, [selectedDungeon, currentLevel, player.level]);

  const handleAttack = useCallback(() => {
    if (!currentMonster || !inBattle) return;

    const playerAttack = Math.floor(player.stats.strength * 5 + Math.random() * 20);
    const monsterAttackValue = Math.floor(currentMonster.attack + Math.random() * 10);
    const playerDefense = player.stats.defense || 5;
    const damageToPlayer = Math.max(1, monsterAttackValue - playerDefense);

    // Гравець атакує
    const newMonsterHp = Math.max(0, currentMonster.hp - playerAttack);
    setCurrentMonster(prev => ({ ...prev, hp: newMonsterHp }));
    setBattleLog(prev => [...prev, `Ви завдали ${playerAttack} урону!`]);

    if (newMonsterHp <= 0) {
      // Монстр переможений
      setBattleLog(prev => [...prev, `✅ ${currentMonster.name} переможений!`]);
      setBattleLog(prev => [...prev, `+${currentMonster.expReward} досвіду, +${currentMonster.goldReward} золота`]);
      
      addExperience(currentMonster.expReward);
      addGold(currentMonster.goldReward);
      
      setInBattle(false);
      
      // Можливість перейти на наступний рівень
      const dungeon = DUNGEONS[selectedDungeon];
      if (currentLevel < dungeon.levels) {
        setTimeout(() => {
          setBattleLog(prev => [...prev, `Перейти на рівень ${currentLevel + 1}?`]);
        }, 1000);
      } else {
        setTimeout(() => {
          setBattleLog(prev => [...prev, `🎉 Підземелля завершено! Ви молодець!`]);
          setIsExploring(false);
        }, 1000);
      }
      return;
    }

    // Монстр атакує
    updateHealth(-damageToPlayer);
    setBattleLog(prev => [...prev, `${currentMonster.name} завдав вам ${damageToPlayer} урону!`]);

    // Перевірка смерті гравця
    if (player.health - damageToPlayer <= 0) {
      setBattleLog(prev => [...prev, `💀 Ви загинули! Підземелля провалено.`]);
      setInBattle(false);
      setIsExploring(false);
      setTimeout(() => {
        updateHealth(player.maxHealth); // Відновлюємо HP
        setSelectedDungeon(null);
      }, 2000);
    }
  }, [currentMonster, inBattle, player, addExperience, addGold, updateHealth, selectedDungeon, currentLevel]);

  const handleNextLevel = useCallback(() => {
    const dungeon = DUNGEONS[selectedDungeon];
    if (currentLevel < dungeon.levels) {
      setCurrentLevel(prev => prev + 1);
      setBattleLog([]);
      setInBattle(false);
    }
  }, [selectedDungeon, currentLevel]);

  const handleExit = useCallback(() => {
    setSelectedDungeon(null);
    setCurrentLevel(1);
    setInBattle(false);
    setIsExploring(false);
    setBattleLog([]);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-purple">⚔️ Підземелля</h2>
            <p className="text-xs text-gray-400">Досліджуйте підземелля та боріться з монстрами!</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-red transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isExploring ? (
            /* Вибір підземелля */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(DUNGEONS).map((dungeon) => (
                <div
                  key={dungeon.id}
                  onClick={() => handleSelectDungeon(dungeon.id)}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:scale-105 ${
                    player.level >= dungeon.minLevel
                      ? 'border-fantasy-purple bg-fantasy-dark/50 hover:border-fantasy-gold'
                      : 'border-gray-600 bg-gray-800/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-5xl text-center mb-2">{dungeon.emoji}</div>
                  <div className="text-white font-bold text-center mb-1">{dungeon.name}</div>
                  <div className="text-gray-400 text-xs text-center mb-2">{dungeon.description}</div>
                  <div className="text-center">
                    <div className="text-sm text-fantasy-gold">Рівні: {dungeon.levels}</div>
                    <div className="text-xs text-gray-400">
                      Рекомендовано: {dungeon.minLevel}-{dungeon.maxLevel} lvl
                    </div>
                  </div>
                  {player.level < dungeon.minLevel && (
                    <div className="mt-2 text-center text-red-400 text-xs">
                      🔒 Потрібен {dungeon.minLevel} рівень
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Дослідження підземелля */
            <div>
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-fantasy-purple">
                      {DUNGEONS[selectedDungeon].emoji} {DUNGEONS[selectedDungeon].name}
                    </h3>
                    <div className="text-sm text-gray-400">Рівень {currentLevel} / {DUNGEONS[selectedDungeon].levels}</div>
                  </div>
                  <button
                    onClick={handleExit}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Вийти
                  </button>
                </div>

                {/* Прогрес */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-fantasy-purple h-2 rounded-full transition-all"
                    style={{ width: `${(currentLevel / DUNGEONS[selectedDungeon].levels) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Монстр */}
              {currentMonster && inBattle && (
                <div className="bg-fantasy-dark/50 border border-red-500/50 rounded-lg p-4 mb-4">
                  <div className="text-center mb-3">
                    <div className="text-6xl mb-2">{currentMonster.emoji}</div>
                    <div className="text-xl font-bold text-white">{currentMonster.name}</div>
                    <div className="text-sm text-gray-400">Рівень {currentMonster.level}</div>
                  </div>

                  {/* HP монстра */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400">HP</span>
                      <span className="text-white">{currentMonster.hp} / {currentMonster.maxHp}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
                    <div>
                      <div className="text-gray-400">Атака</div>
                      <div className="text-orange-400 font-bold">{currentMonster.attack}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Захист</div>
                      <div className="text-blue-400 font-bold">{currentMonster.defense}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Досвід</div>
                      <div className="text-green-400 font-bold">{currentMonster.expReward}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleAttack}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg"
                  >
                    ⚔️ Атакувати
                  </button>
                </div>
              )}

              {/* Кнопка дослідження */}
              {!inBattle && currentLevel <= DUNGEONS[selectedDungeon].levels && (
                <div className="text-center mb-4">
                  {currentLevel === 1 || currentMonster === null ? (
                    <button
                      onClick={handleExploreLevel}
                      className="px-6 py-3 bg-fantasy-purple hover:bg-purple-600 text-white rounded-lg font-bold text-lg"
                    >
                      🔍 Дослідити рівень {currentLevel}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextLevel}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg"
                    >
                      ➡️ Перейти на рівень {currentLevel + 1}
                    </button>
                  )}
                </div>
              )}

              {/* Лог бою */}
              {battleLog.length > 0 && (
                <div className="bg-fantasy-dark/50 border border-fantasy-purple/50 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2">📜 Лог подій:</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {battleLog.map((log, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

