import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

// Типи навичок
const SKILL_TYPES = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
};

// Категорії навичок
const SKILL_CATEGORIES = {
  COMBAT: 'combat',
  DEFENSE: 'defense',
  UTILITY: 'utility',
  MAGIC: 'magic',
};

// Дерево навичок
const SKILL_TREE = [
  // Бойові навички
  {
    id: 'power_strike',
    name: 'Потужний удар',
    description: 'Збільшує шкоду від атаки на 20%',
    type: SKILL_TYPES.ACTIVE,
    category: SKILL_CATEGORIES.COMBAT,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [],
    effect: (level) => ({ damageMultiplier: 1 + level * 0.2 }),
    icon: '⚔️',
  },
  {
    id: 'critical_hit',
    name: 'Критичний удар',
    description: 'Збільшує шанс критичного удару на 5% за рівень',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.COMBAT,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [{ skillId: 'power_strike', level: 2 }],
    effect: (level) => ({ criticalChance: level * 0.05 }),
    icon: '💥',
  },
  {
    id: 'fury',
    name: 'Лютість',
    description: 'Активна навичка: подвійна шкода наступної атаки',
    type: SKILL_TYPES.ACTIVE,
    category: SKILL_CATEGORIES.COMBAT,
    maxLevel: 3,
    cost: { skillPoints: 2, mana: 30 },
    requirements: [{ skillId: 'critical_hit', level: 3 }],
    effect: (level) => ({ nextAttackMultiplier: 2.0, cooldown: 60 - level * 10 }),
    icon: '🔥',
  },
  // Захисні навички
  {
    id: 'iron_skin',
    name: 'Залізна шкіра',
    description: 'Збільшує захист на 10% за рівень',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.DEFENSE,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [],
    effect: (level) => ({ defenseMultiplier: 1 + level * 0.1 }),
    icon: '🛡️',
  },
  {
    id: 'regeneration',
    name: 'Регенерація',
    description: 'Відновлює 5 HP за секунду',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.DEFENSE,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [{ skillId: 'iron_skin', level: 2 }],
    effect: (level) => ({ healthRegen: level * 5 }),
    icon: '💚',
  },
  {
    id: 'shield',
    name: 'Щит',
    description: 'Активна навичка: блокує 50% шкоди на 10 секунд',
    type: SKILL_TYPES.ACTIVE,
    category: SKILL_CATEGORIES.DEFENSE,
    maxLevel: 3,
    cost: { skillPoints: 2, mana: 40 },
    requirements: [{ skillId: 'regeneration', level: 2 }],
    effect: (level) => ({ damageReduction: 0.5, duration: 10 + level * 2, cooldown: 120 }),
    icon: '🛡️',
  },
  // Утилітарні навички
  {
    id: 'treasure_hunter',
    name: 'Шукач скарбів',
    description: 'Збільшує шанс знайти рідкісні предмети на 10% за рівень',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.UTILITY,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [],
    effect: (level) => ({ rareItemChance: level * 0.1 }),
    icon: '💎',
  },
  {
    id: 'gold_finder',
    name: 'Золотошукач',
    description: 'Збільшує кількість знайденого золота на 20% за рівень',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.UTILITY,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [{ skillId: 'treasure_hunter', level: 2 }],
    effect: (level) => ({ goldMultiplier: 1 + level * 0.2 }),
    icon: '🪙',
  },
  // Магічні навички
  {
    id: 'mana_boost',
    name: 'Підсилення мани',
    description: 'Збільшує максимальну ману на 20 за рівень',
    type: SKILL_TYPES.PASSIVE,
    category: SKILL_CATEGORIES.MAGIC,
    maxLevel: 5,
    cost: { skillPoints: 1 },
    requirements: [],
    effect: (level) => ({ maxMana: level * 20 }),
    icon: '✨',
  },
  {
    id: 'fireball',
    name: 'Вогняна куля',
    description: 'Активна навичка: завдає магічної шкоди',
    type: SKILL_TYPES.ACTIVE,
    category: SKILL_CATEGORIES.MAGIC,
    maxLevel: 5,
    cost: { skillPoints: 2, mana: 25 },
    requirements: [{ skillId: 'mana_boost', level: 2 }],
    effect: (level) => ({ magicDamage: 50 + level * 20, cooldown: 30 }),
    icon: '🔥',
  },
];

export const SkillSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, updateStats, updateMana, addItem } = usePlayerContext();
  const { showToast } = useToast();
  const [playerSkills, setPlayerSkills] = useState({});
  const [availableSkillPoints, setAvailableSkillPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Завантаження навичок гравця
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadSkills = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setPlayerSkills({});
          setAvailableSkillPoints(Math.max(0, player.level - 1));
          setIsLoading(false);
          return;
        }

        const { data: skillsData, error } = await supabase
          .from('player_skills')
          .select('*')
          .eq('telegram_id', telegramId.toString());

        if (error) {
          console.error('Помилка завантаження навичок:', error);
          setPlayerSkills({});
        } else {
          const skillsMap = {};
          (skillsData || []).forEach((skill) => {
            skillsMap[skill.skill_id] = skill.level || 0;
          });
          setPlayerSkills(skillsMap);
        }

        // Розраховуємо доступні очки навичок (1 за рівень, починаючи з рівня 2)
        const totalSkillPoints = Math.max(0, player.level - 1);
        const usedSkillPoints = Object.values(playerSkills).reduce((sum, level) => sum + level, 0);
        setAvailableSkillPoints(totalSkillPoints - usedSkillPoints);
      } catch (error) {
        console.error('Помилка завантаження навичок:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSkills();
  }, [isOpen, telegramId, player.level]);

  // Оновлення доступних очок навичок
  useEffect(() => {
    const totalSkillPoints = Math.max(0, player.level - 1);
    const usedSkillPoints = Object.values(playerSkills).reduce((sum, level) => sum + level, 0);
    setAvailableSkillPoints(totalSkillPoints - usedSkillPoints);
  }, [player.level, playerSkills]);

  // Перевірка вимог для навички
  const canLearnSkill = useCallback((skill) => {
    if (!skill.requirements || skill.requirements.length === 0) return true;
    
    return skill.requirements.every((req) => {
      const currentLevel = playerSkills[req.skillId] || 0;
      return currentLevel >= req.level;
    });
  }, [playerSkills]);

  // Вивчення навички
  const learnSkill = useCallback(async (skill) => {
    if (!telegramId) return;

    const currentLevel = playerSkills[skill.id] || 0;
    if (currentLevel >= skill.maxLevel) {
      showToast('Навичка вже вивчена до максимуму', 'warning');
      return;
    }

    if (!canLearnSkill(skill)) {
      showToast('Не виконано вимоги для вивчення навички', 'error');
      return;
    }

    if (availableSkillPoints < skill.cost.skillPoints) {
      showToast('Недостатньо очок навичок', 'error');
      return;
    }

    try {
      const newLevel = currentLevel + 1;
      
      if (supabase) {
        await supabase
          .from('player_skills')
          .upsert({
            telegram_id: telegramId.toString(),
            skill_id: skill.id,
            level: newLevel,
          }, {
            onConflict: 'telegram_id,skill_id'
          });
      }

      setPlayerSkills((prev) => ({ ...prev, [skill.id]: newLevel }));
      showToast(`Навичка "${skill.name}" вивчена до рівня ${newLevel}!`, 'success');

      // Застосовуємо ефекти навички
      const effect = skill.effect(newLevel);
      if (effect.maxMana) {
        // Оновлюємо максимальну ману (потрібно додати метод в PlayerContext)
      }
      if (effect.defenseMultiplier) {
        // Оновлюємо захист
      }

      // Зберігаємо прогрес
      if (telegramId) {
        await saveProgress(telegramId, player);
      }
    } catch (error) {
      console.error('Помилка вивчення навички:', error);
      showToast('Помилка вивчення навички', 'error');
    }
  }, [telegramId, playerSkills, availableSkillPoints, canLearnSkill, player, showToast]);

  // Фільтровані навички
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'all') return SKILL_TREE;
    return SKILL_TREE.filter((skill) => skill.category === activeCategory);
  }, [activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-fantasy-gold">🎯 Навички</h2>
            <div className="text-sm text-gray-400 mt-1">
              Доступно очок навичок: <span className="text-fantasy-gold font-bold">{availableSkillPoints}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження навичок..." />
          </div>
        ) : (
          <>
            {/* Категорії */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-fantasy-purple text-white'
                    : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                Всі
              </button>
              <button
                onClick={() => setActiveCategory(SKILL_CATEGORIES.COMBAT)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeCategory === SKILL_CATEGORIES.COMBAT
                    ? 'bg-red-600 text-white'
                    : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                ⚔️ Бойові
              </button>
              <button
                onClick={() => setActiveCategory(SKILL_CATEGORIES.DEFENSE)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeCategory === SKILL_CATEGORIES.DEFENSE
                    ? 'bg-blue-600 text-white'
                    : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                🛡️ Захисні
              </button>
              <button
                onClick={() => setActiveCategory(SKILL_CATEGORIES.UTILITY)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeCategory === SKILL_CATEGORIES.UTILITY
                    ? 'bg-yellow-600 text-white'
                    : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                💎 Утилітарні
              </button>
              <button
                onClick={() => setActiveCategory(SKILL_CATEGORIES.MAGIC)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                  activeCategory === SKILL_CATEGORIES.MAGIC
                    ? 'bg-purple-600 text-white'
                    : 'bg-fantasy-dark/50 text-gray-400 hover:text-white'
                }`}
              >
                ✨ Магічні
              </button>
            </div>

            {/* Дерево навичок */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map((skill) => {
                const currentLevel = playerSkills[skill.id] || 0;
                const canLearn = canLearnSkill(skill);
                const canUpgrade = availableSkillPoints >= skill.cost.skillPoints && currentLevel < skill.maxLevel;

                return (
                  <div
                    key={skill.id}
                    className={`border-2 rounded-lg p-4 ${
                      currentLevel > 0
                        ? 'border-green-500 bg-green-900/20'
                        : canLearn
                        ? 'border-fantasy-purple bg-fantasy-dark/50'
                        : 'border-gray-600 bg-gray-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{skill.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{skill.name}</h3>
                          <div className="text-sm text-gray-400">
                            Рівень {currentLevel}/{skill.maxLevel}
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{skill.description}</p>

                        {/* Прогрес */}
                        {currentLevel > 0 && (
                          <div className="mb-3">
                            <div className="w-full bg-fantasy-dark rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all"
                                style={{ width: `${(currentLevel / skill.maxLevel) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Вимоги */}
                        {skill.requirements && skill.requirements.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-gray-400 mb-1">Вимоги:</div>
                            {skill.requirements.map((req, idx) => {
                              const reqSkill = SKILL_TREE.find((s) => s.id === req.skillId);
                              const reqLevel = playerSkills[req.skillId] || 0;
                              const met = reqLevel >= req.level;
                              return (
                                <div
                                  key={idx}
                                  className={`text-xs ${met ? 'text-green-400' : 'text-red-400'}`}
                                >
                                  {reqSkill?.name} рівень {req.level} {met ? '✓' : '✗'}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Ефекти */}
                        {currentLevel > 0 && (
                          <div className="mb-3 bg-fantasy-dark/50 rounded p-2">
                            <div className="text-xs text-gray-400 mb-1">Ефекти:</div>
                            {(() => {
                              const effect = skill.effect(currentLevel);
                              return Object.entries(effect).map(([key, value]) => (
                                <div key={key} className="text-xs text-gray-300">
                                  {key === 'damageMultiplier' && `Шкода: x${value.toFixed(2)}`}
                                  {key === 'criticalChance' && `Крит: +${(value * 100).toFixed(0)}%`}
                                  {key === 'defenseMultiplier' && `Захист: x${value.toFixed(2)}`}
                                  {key === 'healthRegen' && `Регенерація: +${value} HP/сек`}
                                  {key === 'goldMultiplier' && `Золото: x${value.toFixed(2)}`}
                                  {key === 'maxMana' && `Макс. мана: +${value}`}
                                </div>
                              ));
                            })()}
                          </div>
                        )}

                        {/* Кнопка вивчення */}
                        <button
                          onClick={() => learnSkill(skill)}
                          disabled={!canLearn || !canUpgrade}
                          className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                            canLearn && canUpgrade
                              ? 'bg-fantasy-purple hover:bg-purple-600 text-white'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {currentLevel === 0
                            ? `Вивчити (${skill.cost.skillPoints} очок)`
                            : currentLevel < skill.maxLevel
                            ? `Покращити (${skill.cost.skillPoints} очок)`
                            : 'Максимальний рівень'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

