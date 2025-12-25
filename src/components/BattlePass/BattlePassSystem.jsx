import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

const SEASON_DURATION_DAYS = 30; // Тривалість сезону
const BATTLE_PASS_COST = 500; // Вартість бойового пропуску

// Рівні бойового пропуску
const BATTLE_PASS_LEVELS = [
  { level: 1, xpRequired: 0, freeReward: { gold: 50 }, premiumReward: { gold: 100, crystals: 5 } },
  { level: 2, xpRequired: 100, freeReward: { gold: 75 }, premiumReward: { gold: 150, crystals: 10 } },
  { level: 3, xpRequired: 250, freeReward: { item: 'health_potion' }, premiumReward: { item: 'epic_sword' } },
  { level: 4, xpRequired: 450, freeReward: { gold: 100 }, premiumReward: { gold: 200, crystals: 15 } },
  { level: 5, xpRequired: 700, freeReward: { experience: 200 }, premiumReward: { experience: 500, crystals: 20 } },
  { level: 6, xpRequired: 1000, freeReward: { gold: 150 }, premiumReward: { gold: 300, crystals: 25 } },
  { level: 7, xpRequired: 1350, freeReward: { item: 'mana_potion' }, premiumReward: { item: 'epic_armor' } },
  { level: 8, xpRequired: 1750, freeReward: { gold: 200 }, premiumReward: { gold: 400, crystals: 30 } },
  { level: 9, xpRequired: 2200, freeReward: { experience: 300 }, premiumReward: { experience: 750, crystals: 35 } },
  { level: 10, xpRequired: 2700, freeReward: { gold: 500, crystals: 50 }, premiumReward: { gold: 1000, crystals: 100, item: 'legendary_sword' } },
];

export const BattlePassSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold, addExperience, addItem } = usePlayerContext();
  const { showToast } = useToast();
  const [season, setSeason] = useState(null);
  const [battlePass, setBattlePass] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Завантаження сезону та бойового пропуску
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadBattlePass = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        // Отримуємо поточний сезон
        const { data: currentSeason } = await supabase
          .from('seasons')
          .select('*')
          .eq('status', 'active')
          .single();

        if (!currentSeason) {
          // Створюємо новий сезон якщо немає активного
          const seasonEnd = new Date();
          seasonEnd.setDate(seasonEnd.getDate() + SEASON_DURATION_DAYS);

          const { data: newSeason } = await supabase
            .from('seasons')
            .insert({
              name: `Сезон ${new Date().getFullYear()}-${new Date().getMonth() + 1}`,
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: seasonEnd.toISOString(),
            })
            .select()
            .single();

          setSeason(newSeason);
        } else {
          setSeason(currentSeason);
        }

        // Отримуємо бойовий пропуск гравця
        if (currentSeason || season) {
          const seasonId = currentSeason?.id || season?.id;
          const { data: pass } = await supabase
            .from('battle_passes')
            .select('*')
            .eq('telegram_id', telegramId.toString())
            .eq('season_id', seasonId)
            .single();

          if (pass) {
            setBattlePass(pass);
            setCurrentLevel(pass.current_level || 1);
            setCurrentXP(pass.current_xp || 0);
          } else {
            // Створюємо новий бойовий пропуск
            const { data: newPass } = await supabase
              .from('battle_passes')
              .insert({
                telegram_id: telegramId.toString(),
                season_id: seasonId,
                current_level: 1,
                current_xp: 0,
                is_premium: false,
                claimed_levels: [],
              })
              .select()
              .single();

            setBattlePass(newPass);
            setCurrentLevel(1);
            setCurrentXP(0);
          }
        }
      } catch (error) {
        console.error('Помилка завантаження бойового пропуску:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBattlePass();
    
    // Експортуємо функцію для додавання XP (глобально)
    if (typeof window !== 'undefined') {
      window.addBattlePassXP = async (xp) => {
        if (!battlePass || !season || !supabase) return;
        
        const newXP = (currentXP || 0) + xp;
        const nextLevel = BATTLE_PASS_LEVELS.find((l) => l.level > (currentLevel || 1));
        
        if (nextLevel && newXP >= nextLevel.xpRequired) {
          // Досягнуто новий рівень
          setCurrentLevel(nextLevel.level);
          setCurrentXP(newXP);
          
          await supabase
            .from('battle_passes')
            .update({
              current_level: nextLevel.level,
              current_xp: newXP,
            })
            .eq('id', battlePass.id);
        } else {
          setCurrentXP(newXP);
          
          await supabase
            .from('battle_passes')
            .update({ current_xp: newXP })
            .eq('id', battlePass.id);
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.addBattlePassXP;
      }
    };
  }, [isOpen, telegramId, season, battlePass, currentLevel, currentXP]);

  // Покупка преміум пропуску
  const purchasePremium = useCallback(async () => {
    if (!battlePass || isProcessing || player.gold < BATTLE_PASS_COST) {
      showToast('Недостатньо золота', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('battle_passes')
        .update({ is_premium: true })
        .eq('id', battlePass.id);

      if (error) {
        showToast('Помилка покупки преміум пропуску', 'error');
        return;
      }

      // Списуємо золото
      addGold(-BATTLE_PASS_COST);
      setBattlePass((prev) => ({ ...prev, is_premium: true }));
      showToast('Преміум пропуск активовано!', 'success');
    } catch (error) {
      console.error('Помилка покупки преміум:', error);
      showToast('Помилка покупки преміум пропуску', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [battlePass, player.gold, isProcessing, addGold, showToast]);

  // Отримання нагороди за рівень
  const claimReward = useCallback(async (level) => {
    if (!battlePass || isProcessing) return;

    const levelData = BATTLE_PASS_LEVELS.find((l) => l.level === level);
    if (!levelData) return;

    const claimedLevels = battlePass.claimed_levels || [];
    if (claimedLevels.includes(level)) {
      showToast('Нагорода вже отримана', 'warning');
      return;
    }

    if (currentLevel < level) {
      showToast('Рівень не досягнуто', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const reward = battlePass.is_premium ? levelData.premiumReward : levelData.freeReward;

      // Видаємо нагороду
      if (reward.gold) {
        addGold(reward.gold);
      }
      if (reward.experience) {
        addExperience(reward.experience);
      }
      if (reward.crystals) {
        // Додати кристали (потрібно додати метод в PlayerContext)
      }
      if (reward.item) {
        // Додати предмет (потрібно додати метод в PlayerContext)
      }

      // Оновлюємо бойовий пропуск
      const { error } = await supabase
        .from('battle_passes')
        .update({
          claimed_levels: [...claimedLevels, level],
        })
        .eq('id', battlePass.id);

      if (error) {
        showToast('Помилка отримання нагороди', 'error');
        return;
      }

      setBattlePass((prev) => ({
        ...prev,
        claimed_levels: [...claimedLevels, level],
      }));

      showToast('Нагорода отримана!', 'success');
    } catch (error) {
      console.error('Помилка отримання нагороди:', error);
      showToast('Помилка отримання нагороди', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [battlePass, currentLevel, isProcessing, addGold, addExperience, showToast]);

  // Розраховуємо прогрес до наступного рівня
  const getProgressToNextLevel = () => {
    const nextLevel = BATTLE_PASS_LEVELS.find((l) => l.level > currentLevel);
    if (!nextLevel) return { progress: 100, required: 0 };

    const currentLevelData = BATTLE_PASS_LEVELS.find((l) => l.level === currentLevel);
    const xpForCurrentLevel = currentLevelData?.xpRequired || 0;
    const xpForNextLevel = nextLevel.xpRequired;
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = currentXP - xpForCurrentLevel;

    return {
      progress: Math.min(100, (xpProgress / xpNeeded) * 100),
      required: xpNeeded,
      current: xpProgress,
    };
  };

  if (!isOpen) return null;

  const progress = getProgressToNextLevel();

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-fantasy-gold">🎮 Бойовий пропуск</h2>
            {season && (
              <p className="text-sm text-gray-400 mt-1">
                {season.name} • Залишилось: {Math.ceil((new Date(season.end_date) - new Date()) / (1000 * 60 * 60 * 24))} днів
              </p>
            )}
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
            <LoadingSpinner size="lg" text="Завантаження..." />
          </div>
        ) : (
          <>
            {/* Прогрес */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-bold text-white">Рівень {currentLevel}</div>
                <div className="text-sm text-gray-400">
                  {currentXP} / {BATTLE_PASS_LEVELS.find((l) => l.level === currentLevel + 1)?.xpRequired || 'MAX'} XP
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>

            {/* Преміум пропуск */}
            {!battlePass?.is_premium && (
              <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400">Преміум пропуск</h3>
                    <p className="text-sm text-gray-300">Отримайте ексклюзивні нагороди!</p>
                  </div>
                  <button
                    onClick={purchasePremium}
                    disabled={isProcessing || player.gold < BATTLE_PASS_COST}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {BATTLE_PASS_COST} 🪙
                  </button>
                </div>
              </div>
            )}

            {/* Рівні */}
            <div className="space-y-3">
              {BATTLE_PASS_LEVELS.map((levelData) => {
                const isUnlocked = currentLevel >= levelData.level;
                const isClaimed = battlePass?.claimed_levels?.includes(levelData.level);
                const canClaim = isUnlocked && !isClaimed;

                return (
                  <div
                    key={levelData.level}
                    className={`border-2 rounded-lg p-4 ${
                      isUnlocked
                        ? 'border-fantasy-purple bg-fantasy-dark/50'
                        : 'border-gray-600 bg-gray-900/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                        isUnlocked ? 'bg-fantasy-purple text-white' : 'bg-gray-700 text-gray-400'
                      }`}>
                        {levelData.level}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">Рівень {levelData.level}</div>
                            <div className="text-xs text-gray-400">{levelData.xpRequired} XP</div>
                          </div>
                          {isClaimed && (
                            <span className="text-green-400 text-sm">✅ Отримано</span>
                          )}
                        </div>

                        {/* Нагороди */}
                        <div className="flex gap-4">
                          <div className="flex-1 bg-blue-900/30 border border-blue-500/50 rounded p-2">
                            <div className="text-xs text-blue-300 mb-1">Безкоштовно</div>
                            <div className="text-sm text-white">
                              {levelData.freeReward.gold && `🪙 ${levelData.freeReward.gold}`}
                              {levelData.freeReward.experience && `⭐ ${levelData.freeReward.experience}`}
                              {levelData.freeReward.item && `📦 ${levelData.freeReward.item}`}
                            </div>
                          </div>
                          {battlePass?.is_premium && (
                            <div className="flex-1 bg-yellow-900/30 border border-yellow-500/50 rounded p-2">
                              <div className="text-xs text-yellow-300 mb-1">Преміум</div>
                              <div className="text-sm text-white">
                                {levelData.premiumReward.gold && `🪙 ${levelData.premiumReward.gold}`}
                                {levelData.premiumReward.experience && `⭐ ${levelData.premiumReward.experience}`}
                                {levelData.premiumReward.crystals && `💎 ${levelData.premiumReward.crystals}`}
                                {levelData.premiumReward.item && `📦 ${levelData.premiumReward.item}`}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {canClaim && (
                        <button
                          onClick={() => claimReward(levelData.level)}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-fantasy-purple hover:bg-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                          Отримати
                        </button>
                      )}
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

