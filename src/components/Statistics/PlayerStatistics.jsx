import { useState, useEffect } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const PlayerStatistics = ({ isOpen, onClose, telegramId }) => {
  const { player } = usePlayerContext();
  const [stats, setStats] = useState({
    totalPlayTime: 0,
    monstersKilled: 0,
    questsCompleted: 0,
    pvpWins: 0,
    pvpLosses: 0,
    totalGoldEarned: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadStatistics = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          // Fallback статистика
          setStats({
            totalPlayTime: 0,
            monstersKilled: player.bossesKilled || 0,
            questsCompleted: 0,
            pvpWins: 0,
            pvpLosses: 0,
            totalGoldEarned: player.gold || 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
          });
          setIsLoading(false);
          return;
        }

        // Завантажуємо статистику з бази
        const { data: profile } = await supabase
          .from('profiles')
          .select('bosses_killed, created_at, last_seen')
          .eq('telegram_id', telegramId.toString())
          .single();

        // Завантажуємо PvP статистику
        const { data: pvpStats } = await supabase
          .from('pvp_ratings')
          .select('wins, losses')
          .eq('telegram_id', telegramId.toString())
          .single();

        // Завантажуємо квести
        const { data: completedQuests } = await supabase
          .from('player_quests')
          .select('id')
          .eq('telegram_id', telegramId.toString())
          .eq('status', 'completed');

        // Розраховуємо час гри
        let totalPlayTime = 0;
        if (profile?.created_at && profile?.last_seen) {
          const created = new Date(profile.created_at);
          const lastSeen = new Date(profile.last_seen);
          totalPlayTime = Math.floor((lastSeen - created) / 1000 / 60); // в хвилинах
        }

        setStats({
          totalPlayTime,
          monstersKilled: profile?.bosses_killed || player.bossesKilled || 0,
          questsCompleted: completedQuests?.length || 0,
          pvpWins: pvpStats?.wins || 0,
          pvpLosses: pvpStats?.losses || 0,
          totalGoldEarned: player.gold || 0,
          totalDamageDealt: 0, // Потрібно додати трекінг
          totalDamageTaken: 0, // Потрібно додати трекінг
        });
      } catch (error) {
        console.error('Помилка завантаження статистики:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, [isOpen, telegramId, player]);

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}г ${mins}хв`;
    }
    return `${mins}хв`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">📊 Статистика</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження статистики..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Загальна статистика */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Загальна статистика</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Час гри</div>
                  <div className="text-2xl font-bold text-white">{formatTime(stats.totalPlayTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Рівень</div>
                  <div className="text-2xl font-bold text-fantasy-gold">{player.level}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Вбито монстрів</div>
                  <div className="text-2xl font-bold text-red-400">{stats.monstersKilled}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Завершено квестів</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.questsCompleted}</div>
                </div>
              </div>
            </div>

            {/* PvP статистика */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">PvP статистика</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Перемог</div>
                  <div className="text-2xl font-bold text-green-400">{stats.pvpWins}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Поразок</div>
                  <div className="text-2xl font-bold text-red-400">{stats.pvpLosses}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Вінрейт</div>
                  <div className="text-2xl font-bold text-fantasy-gold">
                    {stats.pvpWins + stats.pvpLosses > 0
                      ? Math.round((stats.pvpWins / (stats.pvpWins + stats.pvpLosses)) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Економічна статистика */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Економіка</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Поточне золото</div>
                  <div className="text-2xl font-bold text-yellow-400">{player.gold} 🪙</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Зароблено всього</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalGoldEarned} 🪙</div>
                </div>
              </div>
            </div>

            {/* Характеристики */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Характеристики</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Сила</div>
                  <div className="text-xl font-bold text-red-400">{player.stats.strength}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Захист</div>
                  <div className="text-xl font-bold text-blue-400">{player.stats.defense}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Спритність</div>
                  <div className="text-xl font-bold text-green-400">{player.stats.agility}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Інтелект</div>
                  <div className="text-xl font-bold text-purple-400">{player.stats.intelligence}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

