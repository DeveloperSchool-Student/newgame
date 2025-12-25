import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';

// Типи досягнень
const ACHIEVEMENT_TYPES = {
  LEVEL: 'level',
  BOSS_KILL: 'boss_kill',
  GOLD: 'gold',
  QUEST: 'quest',
  PVP: 'pvp',
  CLAN: 'clan',
};

// Досягнення
const ACHIEVEMENTS = [
  // Досягнення за рівні
  {
    id: 'level_5',
    type: ACHIEVEMENT_TYPES.LEVEL,
    title: 'Новачок',
    description: 'Досягти 5 рівня',
    target: 5,
    reward: { gold: 100, experience: 50 },
    icon: '⭐',
    rarity: 'common',
  },
  {
    id: 'level_10',
    type: ACHIEVEMENT_TYPES.LEVEL,
    title: 'Досвідчений',
    description: 'Досягти 10 рівня',
    target: 10,
    reward: { gold: 300, experience: 150, crystals: 5 },
    icon: '🌟',
    rarity: 'rare',
  },
  {
    id: 'level_20',
    type: ACHIEVEMENT_TYPES.LEVEL,
    title: 'Ветеран',
    description: 'Досягти 20 рівня',
    target: 20,
    reward: { gold: 800, experience: 400, crystals: 15 },
    icon: '💫',
    rarity: 'epic',
  },
  {
    id: 'level_50',
    type: ACHIEVEMENT_TYPES.LEVEL,
    title: 'Легенда',
    description: 'Досягти 50 рівня',
    target: 50,
    reward: { gold: 2000, experience: 1000, crystals: 50 },
    icon: '👑',
    rarity: 'legendary',
  },
  // Досягнення за вбитих босів
  {
    id: 'boss_kill_1',
    type: ACHIEVEMENT_TYPES.BOSS_KILL,
    title: 'Перший бос',
    description: 'Вбити 1 боса',
    target: 1,
    reward: { gold: 200, experience: 100 },
    icon: '👹',
    rarity: 'common',
  },
  {
    id: 'boss_kill_10',
    type: ACHIEVEMENT_TYPES.BOSS_KILL,
    title: 'Мисливець на босів',
    description: 'Вбити 10 босів',
    target: 10,
    reward: { gold: 1000, experience: 500, crystals: 10 },
    icon: '⚔️',
    rarity: 'rare',
  },
  {
    id: 'boss_kill_50',
    type: ACHIEVEMENT_TYPES.BOSS_KILL,
    title: 'Елітний мисливець',
    description: 'Вбити 50 босів',
    target: 50,
    reward: { gold: 5000, experience: 2500, crystals: 50 },
    icon: '🗡️',
    rarity: 'epic',
  },
  {
    id: 'boss_kill_100',
    type: ACHIEVEMENT_TYPES.BOSS_KILL,
    title: 'Бог вбивств',
    description: 'Вбити 100 босів',
    target: 100,
    reward: { gold: 10000, experience: 5000, crystals: 100 },
    icon: '💀',
    rarity: 'legendary',
  },
  // Досягнення за золото
  {
    id: 'gold_1000',
    type: ACHIEVEMENT_TYPES.GOLD,
    title: 'Багач',
    description: 'Накопичити 1000 золота',
    target: 1000,
    reward: { gold: 500, experience: 250 },
    icon: '🪙',
    rarity: 'common',
  },
  {
    id: 'gold_10000',
    type: ACHIEVEMENT_TYPES.GOLD,
    title: 'Мільйонер',
    description: 'Накопичити 10000 золота',
    target: 10000,
    reward: { gold: 2000, experience: 1000, crystals: 20 },
    icon: '💰',
    rarity: 'rare',
  },
  {
    id: 'gold_100000',
    type: ACHIEVEMENT_TYPES.GOLD,
    title: 'Король золота',
    description: 'Накопичити 100000 золота',
    target: 100000,
    reward: { gold: 10000, experience: 5000, crystals: 100 },
    icon: '👑',
    rarity: 'legendary',
  },
  // Досягнення за квести
  {
    id: 'quest_10',
    type: ACHIEVEMENT_TYPES.QUEST,
    title: 'Шукач пригод',
    description: 'Завершити 10 квестів',
    target: 10,
    reward: { gold: 500, experience: 250, crystals: 5 },
    icon: '📜',
    rarity: 'rare',
  },
  {
    id: 'quest_50',
    type: ACHIEVEMENT_TYPES.QUEST,
    title: 'Майстер квестів',
    description: 'Завершити 50 квестів',
    target: 50,
    reward: { gold: 2000, experience: 1000, crystals: 25 },
    icon: '📖',
    rarity: 'epic',
  },
  // Досягнення за PvP
  {
    id: 'pvp_win_1',
    type: ACHIEVEMENT_TYPES.PVP,
    title: 'Перша перемога',
    description: 'Виграти 1 PvP дуель',
    target: 1,
    reward: { gold: 300, experience: 150 },
    icon: '⚔️',
    rarity: 'common',
  },
  {
    id: 'pvp_win_10',
    type: ACHIEVEMENT_TYPES.PVP,
    title: 'Гладиатор',
    description: 'Виграти 10 PvP дуелей',
    target: 10,
    reward: { gold: 1500, experience: 750, crystals: 15 },
    icon: '🏆',
    rarity: 'rare',
  },
  // Досягнення за клан
  {
    id: 'clan_join',
    type: ACHIEVEMENT_TYPES.CLAN,
    title: 'Команда',
    description: 'Приєднатися до клану',
    target: 1,
    reward: { gold: 200, experience: 100 },
    icon: '👥',
    rarity: 'common',
  },
];

export const AchievementSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold, addExperience } = usePlayerContext();
  const [achievements, setAchievements] = useState([]);
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження досягнень з бази даних
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadAchievements = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          // Fallback до локальних досягнень
          setAchievements(ACHIEVEMENTS);
          setCompletedAchievements([]);
          setIsLoading(false);
          return;
        }

        // Отримуємо досягнення гравця
        const { data: playerAchievements, error } = await supabase
          .from('player_achievements')
          .select('*')
          .eq('telegram_id', telegramId.toString());

        if (error) {
          console.error('Помилка завантаження досягнень:', error);
          setAchievements(ACHIEVEMENTS);
          setCompletedAchievements([]);
          setIsLoading(false);
          return;
        }

        // Розділяємо на активні та завершені
        const completed = (playerAchievements || [])
          .filter((pa) => pa.status === 'completed' || pa.status === 'claimed')
          .map((pa) => {
            const achievement = ACHIEVEMENTS.find((a) => a.id === pa.achievement_id);
            return achievement ? { ...achievement, progress: pa.progress, dbId: pa.id, status: pa.status } : null;
          })
          .filter(Boolean);

        const active = ACHIEVEMENTS.filter((a) => {
          const playerAchievement = playerAchievements?.find((pa) => pa.achievement_id === a.id);
          return !playerAchievement || playerAchievement.status === 'active';
        }).map((a) => {
          const playerAchievement = playerAchievements?.find((pa) => pa.achievement_id === a.id);
          return {
            ...a,
            progress: playerAchievement?.progress || 0,
            dbId: playerAchievement?.id,
          };
        });

        setAchievements(active);
        setCompletedAchievements(completed);
        setIsLoading(false);
      } catch (error) {
        console.error('Помилка завантаження досягнень:', error);
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [isOpen, telegramId, player]);

  // Перевірка досягнень на основі даних гравця
  useEffect(() => {
    if (!isOpen || !telegramId || isLoading) return;

    const checkAchievements = async () => {
      if (!supabase) return;

      try {
        for (const achievement of achievements) {
          let currentProgress = achievement.progress || 0;
          let shouldUpdate = false;

          // Перевіряємо прогрес на основі типу досягнення
          if (achievement.type === ACHIEVEMENT_TYPES.LEVEL) {
            const newProgress = player.level;
            if (newProgress > currentProgress) {
              currentProgress = newProgress;
              shouldUpdate = true;
            }
          } else if (achievement.type === ACHIEVEMENT_TYPES.BOSS_KILL) {
            const newProgress = player.bossesKilled || 0;
            if (newProgress > currentProgress) {
              currentProgress = newProgress;
              shouldUpdate = true;
            }
          } else if (achievement.type === ACHIEVEMENT_TYPES.GOLD) {
            const newProgress = player.gold;
            if (newProgress > currentProgress) {
              currentProgress = newProgress;
              shouldUpdate = true;
            }
          } else if (achievement.type === ACHIEVEMENT_TYPES.CLAN) {
            if (player.clanId && currentProgress === 0) {
              currentProgress = 1;
              shouldUpdate = true;
            }
          }

          // Перевіряємо чи досягнення завершено
          const isCompleted = currentProgress >= achievement.target;

          if (shouldUpdate || isCompleted) {
            if (achievement.dbId) {
              // Оновлюємо існуючий запис
              await supabase
                .from('player_achievements')
                .update({
                  progress: currentProgress,
                  status: isCompleted ? 'completed' : 'active',
                })
                .eq('id', achievement.dbId);
            } else {
              // Створюємо новий запис
              const { data } = await supabase
                .from('player_achievements')
                .insert({
                  telegram_id: telegramId.toString(),
                  achievement_id: achievement.id,
                  progress: currentProgress,
                  status: isCompleted ? 'completed' : 'active',
                })
                .select()
                .single();

              if (data) {
                achievement.dbId = data.id;
              }
            }

            // Оновлюємо локальний стан
            if (isCompleted) {
              setAchievements((prev) => prev.filter((a) => a.id !== achievement.id));
              setCompletedAchievements((prev) => [...prev, { ...achievement, progress: currentProgress, status: 'completed' }]);
            } else {
              setAchievements((prev) =>
                prev.map((a) => (a.id === achievement.id ? { ...a, progress: currentProgress } : a))
              );
            }
          }
        }
      } catch (error) {
        console.error('Помилка перевірки досягнень:', error);
      }
    };

    checkAchievements();
  }, [isOpen, telegramId, player, achievements, isLoading]);

  // Виконання досягнення
  const claimAchievementReward = useCallback(async (achievement) => {
    if (!telegramId) return;

    try {
      // Оновлюємо статус досягнення
      if (supabase && achievement.dbId) {
        await supabase
          .from('player_achievements')
          .update({ status: 'claimed' })
          .eq('id', achievement.dbId);
      }

      // Видаляємо з завершених
      setCompletedAchievements((prev) => prev.filter((a) => a.id !== achievement.id));

      // Нараховуємо нагороди
      if (achievement.reward.gold) {
        addGold(achievement.reward.gold);
      }
      if (achievement.reward.experience) {
        addExperience(achievement.reward.experience);
      }
      if (achievement.reward.crystals) {
        // Додаємо кристали (потрібно додати метод в PlayerContext)
        // addCrystals(achievement.reward.crystals);
      }

      // Зберігаємо прогрес
      if (telegramId) {
        await saveProgress(telegramId, player);
      }
    } catch (error) {
      console.error('Помилка виконання досягнення:', error);
    }
  }, [telegramId, addGold, addExperience, player]);

  if (!isOpen) return null;

  const getProgressPercentage = (achievement) => {
    return Math.min(100, (achievement.progress / achievement.target) * 100);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-500 bg-gray-900/50';
      case 'uncommon':
        return 'border-green-500 bg-green-900/50';
      case 'combat':
        return 'border-blue-500 bg-blue-900/50';
      case 'epic':
        return 'border-purple-500 bg-purple-900/50';
      case 'legendary':
        return 'border-yellow-500 bg-yellow-900/50';
      case 'mythic':
        return 'border-orange-500 bg-orange-900/50';
      case 'divine':
        return 'border-white bg-gradient-to-br from-white/20 via-cyan-500/20 to-purple-500/20';
      default:
        return 'border-gray-500 bg-gray-900/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">🏆 Досягнення</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-fantasy-purple/30 border-t-fantasy-purple rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Завантаження досягнень...</p>
          </div>
        ) : (
          <>
            {/* Активні досягнення */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Активні досягнення</h3>
              {achievements.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Немає активних досягнень</p>
              ) : (
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-white">{achievement.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              achievement.rarity === 'common' ? 'bg-gray-600 text-gray-200' :
                              achievement.rarity === 'uncommon' ? 'bg-green-600 text-green-200' :
                              achievement.rarity === 'combat' ? 'bg-blue-600 text-blue-200' :
                              achievement.rarity === 'epic' ? 'bg-purple-600 text-purple-200' :
                              achievement.rarity === 'legendary' ? 'bg-yellow-600 text-yellow-200' :
                              achievement.rarity === 'mythic' ? 'bg-orange-600 text-orange-200' :
                              achievement.rarity === 'divine' ? 'bg-gradient-to-r from-white via-cyan-400 to-purple-400 text-white' :
                              'bg-gray-600 text-gray-200'
                            }`}>
                              {achievement.rarity === 'common' ? 'Звичайне' :
                               achievement.rarity === 'uncommon' ? 'Постійне' :
                               achievement.rarity === 'combat' ? 'Бойове' :
                               achievement.rarity === 'epic' ? 'Епічне' :
                               achievement.rarity === 'legendary' ? 'Легендарне' :
                               achievement.rarity === 'mythic' ? 'Міфічне' :
                               achievement.rarity === 'divine' ? 'Божественне' : 'Звичайне'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                          
                          {/* Прогрес */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Прогрес</span>
                              <span>{achievement.progress || 0}/{achievement.target}</span>
                            </div>
                            <div className="w-full bg-fantasy-dark rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-fantasy-purple to-fantasy-gold h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getProgressPercentage(achievement)}%` }}
                              />
                            </div>
                          </div>

                          {/* Нагороди */}
                          <div className="flex gap-2 text-sm">
                            {achievement.reward.gold && (
                              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                                🪙 {achievement.reward.gold}
                              </span>
                            )}
                            {achievement.reward.experience && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                ⭐ {achievement.reward.experience}
                              </span>
                            )}
                            {achievement.reward.crystals && (
                              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                                💎 {achievement.reward.crystals}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Завершені досягнення */}
            {completedAchievements.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-fantasy-gold mb-4">Завершені досягнення</h3>
                <div className="space-y-4">
                  {completedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)} ${
                        achievement.status === 'claimed' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold text-white">{achievement.title}</h4>
                            {achievement.status === 'claimed' && (
                              <span className="text-xs text-green-400">✓ Отримано</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
                          
                          {/* Нагороди */}
                          <div className="flex gap-2 text-sm mb-3">
                            {achievement.reward.gold && (
                              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                                🪙 {achievement.reward.gold}
                              </span>
                            )}
                            {achievement.reward.experience && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                ⭐ {achievement.reward.experience}
                              </span>
                            )}
                            {achievement.reward.crystals && (
                              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                                💎 {achievement.reward.crystals}
                              </span>
                            )}
                          </div>

                          {achievement.status !== 'claimed' && (
                            <button
                              onClick={() => claimAchievementReward(achievement)}
                              className="btn-fantasy bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                              Отримати нагороду
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

