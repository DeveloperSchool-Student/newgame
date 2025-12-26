import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';

// Типи квестів
const QUEST_TYPES = {
  DAILY: 'daily',
  PROVINCE_CAPTURE: 'province_capture',
  BOSS_KILL: 'boss_kill',
  GOLD_COLLECT: 'gold_collect',
  LEVEL_UP: 'level_up',
};

// Щоденні квести
const DAILY_QUESTS = [
  {
    id: 'daily_kill_boss',
    type: QUEST_TYPES.BOSS_KILL,
    title: 'Перемогти боса',
    description: 'Перемогти боса в підземеллі',
    target: 1,
    reward: { gold: 200, experience: 100 },
    icon: '👹',
  },
  {
    id: 'daily_collect_gold',
    type: QUEST_TYPES.GOLD_COLLECT,
    title: 'Зібрати золото',
    description: 'Зібрати 500 золотих монет',
    target: 500,
    reward: { gold: 150, experience: 75 },
    icon: '🪙',
  },
  {
    id: 'daily_explore',
    type: QUEST_TYPES.DAILY,
    title: 'Дослідити локацію',
    description: 'Дослідити 3 локації',
    target: 3,
    reward: { gold: 100, experience: 50 },
    icon: '🗺️',
  },
];

// Квести на захоплення провінцій
const PROVINCE_QUESTS = [
  {
    id: 'capture_dark_forest',
    type: QUEST_TYPES.PROVINCE_CAPTURE,
    title: 'Захопити Темний ліс',
    description: 'Захопити провінцію Темний ліс для свого королівства',
    target: 'darkForest',
    reward: { gold: 500, experience: 300, crystals: 10 },
    icon: '🌲',
  },
  {
    id: 'capture_forgotten_mines',
    type: QUEST_TYPES.PROVINCE_CAPTURE,
    title: 'Захопити Забуті шахти',
    description: 'Захопити провінцію Забуті шахти для свого королівства',
    target: 'forgottenMines',
    reward: { gold: 800, experience: 500, crystals: 20 },
    icon: '⛏️',
  },
];

export const QuestSystem = ({ isOpen, onClose, telegramId, onProvinceCapture }) => {
  const { player, addGold, addExperience, addItem } = usePlayerContext();
  const [quests, setQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [dailyResetTime, setDailyResetTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Завантаження квестів з бази даних
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadQuests = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          // Fallback до локальних квестів
          const allQuests = [...DAILY_QUESTS, ...PROVINCE_QUESTS];
          setQuests(allQuests);
          setCompletedQuests([]);
          setIsLoading(false);
          return;
        }

        // Перевіряємо чи потрібен скидання щоденних квестів
        await checkDailyReset();

        // Отримуємо активні та виконані (але не забрані) квести
        const { data: playerQuests, error } = await supabase
          .from('player_quests')
          .select('*')
          .eq('telegram_id', telegramId.toString())
          .in('status', ['active', 'completed']);

        if (error) {
          console.error('Помилка завантаження квестів:', error);
          const allQuests = [...DAILY_QUESTS, ...PROVINCE_QUESTS];
          setQuests(allQuests);
          setCompletedQuests([]);
          setIsLoading(false);
          return;
        }

        // Якщо немає квестів взагалі (навіть 'claimed' перевірили в checkDailyReset), створюємо нові
        if (!playerQuests || playerQuests.length === 0) {
          // Якщо це перший запуск, ініціалізуємо
          // Але checkDailyReset мав би це зробити. 
          // Якщо він нічого не створив (наприклад, вже є claimed квести), то тут буде пусто, і це ОК.
          // Але якщо ми тут, то можливо треба перевірити чи є claimed.
        }

        // Розподіляємо квести (active -> quests, completed -> completedQuests)
        const active = [];
        const completed = [];

        (playerQuests || []).forEach(pq => {
          const questTemplate = [...DAILY_QUESTS, ...PROVINCE_QUESTS].find(q => q.id === pq.quest_id);
          if (!questTemplate) return;

          const questObj = {
            ...questTemplate,
            progress: pq.progress || 0,
            questDbId: pq.id,
            status: pq.status
          };

          if (pq.status === 'completed') {
            completed.push(questObj);
          } else {
            active.push(questObj);
          }
        });

        setQuests(active);
        setCompletedQuests(completed);

        // Таймер (візуальний)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        setDailyResetTime(tomorrow);

        setIsLoading(false);
      } catch (error) {
        console.error('Помилка завантаження квестів:', error);
        setIsLoading(false);
      }
    };

    loadQuests();
  }, [isOpen, telegramId]);

  // Перевірка та ініціалізація щоденних квестів
  const checkDailyReset = async () => {
    if (!supabase || !telegramId) return;

    try {
      // Перевіряємо чи є БУДЬ-ЯКІ щоденні квести створені за останні 20 годин (приблизно "сьогодні")
      // Або просто перевіряємо, чи є квести з датою створення сьогодні
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: existingDailies, error } = await supabase
        .from('player_quests')
        .select('created_at')
        .eq('telegram_id', telegramId.toString())
        .eq('quest_type', QUEST_TYPES.DAILY)
        .gte('created_at', startOfDay.toISOString())
        .limit(1);

      if (error) throw error;

      // Якщо вже є квести за сьогодні (активні, виконані або забрані) - нічого не робимо
      if (existingDailies && existingDailies.length > 0) {
        return;
      }

      // Якщо немає - видаляємо старі та створюємо нові
      await initializeDailyQuests();

    } catch (error) {
      console.error('Помилка перевірки щоденних квестів:', error);
    }
  };

  const initializeDailyQuests = async () => {
    if (!supabase || !telegramId) {
      setQuests(DAILY_QUESTS);
      return;
    }

    try {
      // Видаляємо ВСІ старі щоденні квести
      await supabase
        .from('player_quests')
        .delete()
        .eq('telegram_id', telegramId.toString())
        .eq('quest_type', QUEST_TYPES.DAILY);

      // Створюємо нові щоденні квести
      const newQuests = DAILY_QUESTS.map((quest) => ({
        telegram_id: telegramId.toString(),
        quest_id: quest.id,
        quest_type: quest.type,
        progress: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('player_quests')
        .insert(newQuests);

      if (error) console.error("Error inserting quests", error);
    } catch (error) {
      console.error('Помилка ініціалізації квестів:', error);
    }
  };

  // Перевірка виконання квестів
  const checkQuestProgress = useCallback(async (questType, value, target) => {
    if (!telegramId) return;

    try {
      if (!supabase) return;

      // Оновлюємо прогрес квестів
      const { data: activeQuests, error } = await supabase
        .from('player_quests')
        .select('*')
        .eq('telegram_id', telegramId.toString())
        .eq('status', 'active')
        .eq('quest_type', questType);

      if (error || !activeQuests) return;

      for (const playerQuest of activeQuests) {
        const questTemplate = [...DAILY_QUESTS, ...PROVINCE_QUESTS].find(
          (q) => q.id === playerQuest.quest_id
        );
        if (!questTemplate) continue;

        let newProgress = playerQuest.progress || 0;
        let isCompleted = false;

        if (questType === QUEST_TYPES.BOSS_KILL) {
          newProgress += value;
          isCompleted = newProgress >= questTemplate.target;
        } else if (questType === QUEST_TYPES.GOLD_COLLECT) {
          newProgress = Math.max(newProgress, value);
          isCompleted = newProgress >= questTemplate.target;
        } else if (questType === QUEST_TYPES.PROVINCE_CAPTURE) {
          if (target === questTemplate.target) {
            newProgress = 1;
            isCompleted = true;
          }
        }

        if (isCompleted && playerQuest.status === 'active') {
          // Завершуємо квест
          await supabase
            .from('player_quests')
            .update({ status: 'completed', progress: newProgress })
            .eq('id', playerQuest.id);

          // Видаляємо з активних і додаємо до завершених
          setQuests((prev) => prev.filter((q) => q.questDbId !== playerQuest.id));
          setCompletedQuests((prev) => [...prev, { ...questTemplate, progress: newProgress }]);
        } else {
          // Оновлюємо прогрес
          await supabase
            .from('player_quests')
            .update({ progress: newProgress })
            .eq('id', playerQuest.id);

          // Оновлюємо локальний стан
          setQuests((prev) =>
            prev.map((q) =>
              q.questDbId === playerQuest.id ? { ...q, progress: newProgress } : q
            )
          );
        }
      }
    } catch (error) {
      console.error('Помилка перевірки прогресу квесту:', error);
    }
  }, [telegramId]);

  // Виконання квесту
  const claimQuestReward = useCallback(async (quest) => {
    if (!telegramId) return;

    try {
      // Оновлюємо статус на 'claimed' замість видалення
      if (supabase && quest.questDbId) {
        await supabase
          .from('player_quests')
          .update({ status: 'claimed' })
          .eq('id', quest.questDbId);
      }

      // Видаляємо з завершених
      setCompletedQuests((prev) => prev.filter((q) => q.id !== quest.id));

      // Нараховуємо нагороди
      if (quest.reward.gold) {
        addGold(quest.reward.gold);
      }
      if (quest.reward.experience) {
        addExperience(quest.reward.experience);
      }
      if (quest.reward.crystals) {
        // Додаємо кристали (потрібно додати метод в PlayerContext)
        // addCrystals(quest.reward.crystals);
      }

      // Зберігаємо прогрес
      if (telegramId) {
        await saveProgress(telegramId, player);
      }
    } catch (error) {
      console.error('Помилка виконання квесту:', error);
    }
  }, [telegramId, addGold, addExperience, player]);

  // Експортуємо функцію для перевірки квестів
  useEffect(() => {
    if (window.questSystem) {
      window.questSystem.checkProgress = checkQuestProgress;
    } else {
      window.questSystem = { checkProgress: checkQuestProgress };
    }
  }, [checkQuestProgress]);

  if (!isOpen) return null;

  const getProgressPercentage = (quest) => {
    if (quest.type === QUEST_TYPES.PROVINCE_CAPTURE) {
      return quest.progress >= 1 ? 100 : 0;
    }
    return Math.min(100, (quest.progress / quest.target) * 100);
  };

  const timeUntilReset = dailyResetTime
    ? Math.max(0, dailyResetTime.getTime() - Date.now())
    : 0;
  const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">📜 Квести</h2>
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
            <p className="text-gray-400">Завантаження квестів...</p>
          </div>
        ) : (
          <>
            {/* Таймер скидання щоденних квестів */}
            {dailyResetTime && (
              <div className="bg-fantasy-purple/20 border border-fantasy-purple rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-300">
                  Щоденні квести оновляться через: <span className="text-fantasy-gold font-bold">{hours}г {minutes}хв</span>
                </p>
              </div>
            )}

            {/* Активні квести */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Активні квести</h3>
              {quests.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Немає активних квестів</p>
              ) : (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-fantasy-dark/50 border border-fantasy-purple/50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{quest.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-1">{quest.title}</h4>
                          <p className="text-sm text-gray-400 mb-3">{quest.description}</p>

                          {/* Прогрес */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Прогрес</span>
                              <span>
                                {quest.type === QUEST_TYPES.PROVINCE_CAPTURE
                                  ? quest.progress >= 1
                                    ? '1/1'
                                    : '0/1'
                                  : `${quest.progress || 0}/${quest.target}`}
                              </span>
                            </div>
                            <div className="w-full bg-fantasy-dark rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-fantasy-purple to-fantasy-gold h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getProgressPercentage(quest)}%` }}
                              />
                            </div>
                          </div>

                          {/* Нагороди */}
                          <div className="flex gap-2 text-sm">
                            {quest.reward.gold && (
                              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                                🪙 {quest.reward.gold}
                              </span>
                            )}
                            {quest.reward.experience && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                ⭐ {quest.reward.experience}
                              </span>
                            )}
                            {quest.reward.crystals && (
                              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                                💎 {quest.reward.crystals}
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

            {/* Завершені квести */}
            {completedQuests.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-fantasy-gold mb-4">Завершені квести</h3>
                <div className="space-y-4">
                  {completedQuests.map((quest) => (
                    <div
                      key={quest.id}
                      className="bg-green-900/20 border border-green-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{quest.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-1">{quest.title}</h4>
                          <p className="text-sm text-gray-400 mb-3">{quest.description}</p>

                          {/* Нагороди */}
                          <div className="flex gap-2 text-sm mb-3">
                            {quest.reward.gold && (
                              <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                                🪙 {quest.reward.gold}
                              </span>
                            )}
                            {quest.reward.experience && (
                              <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                ⭐ {quest.reward.experience}
                              </span>
                            )}
                            {quest.reward.crystals && (
                              <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                                💎 {quest.reward.crystals}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => claimQuestReward(quest)}
                            className="btn-fantasy bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            Отримати нагороду
                          </button>
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

