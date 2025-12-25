import { useState, useEffect } from 'react';
import { useClanContext } from '../../contexts/ClanContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const ClanStatistics = ({ isOpen, onClose, clanId }) => {
  const { clan } = useClanContext();
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalGoldDonated: 0,
    totalBossesKilled: 0,
    averageLevel: 0,
    totalPvPWins: 0,
    totalPvPLosses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !clanId || !supabase) return;

    const loadClanStatistics = async () => {
      setIsLoading(true);
      try {
        // Завантажуємо всіх членів клану
        const { data: members } = await supabase
          .from('clan_members')
          .select('telegram_id')
          .eq('clan_id', clanId);

        if (!members || members.length === 0) {
          setIsLoading(false);
          return;
        }

        const memberIds = members.map((m) => m.telegram_id);

        // Завантажуємо статистику членів
        const { data: profiles } = await supabase
          .from('profiles')
          .select('level, bosses_killed, gold')
          .in('telegram_id', memberIds);

        // Завантажуємо PvP статистику
        const { data: pvpStats } = await supabase
          .from('pvp_ratings')
          .select('wins, losses')
          .in('telegram_id', memberIds);

        // Розраховуємо статистику
        const totalMembers = profiles?.length || 0;
        const totalBossesKilled = profiles?.reduce((sum, p) => sum + (p.bosses_killed || 0), 0) || 0;
        const averageLevel = profiles?.length > 0
          ? Math.round(profiles.reduce((sum, p) => sum + (p.level || 1), 0) / profiles.length)
          : 0;
        const totalPvPWins = pvpStats?.reduce((sum, p) => sum + (p.wins || 0), 0) || 0;
        const totalPvPLosses = pvpStats?.reduce((sum, p) => sum + (p.losses || 0), 0) || 0;

        setStats({
          totalMembers,
          totalGoldDonated: clan?.bank || 0,
          totalBossesKilled,
          averageLevel,
          totalPvPWins,
          totalPvPLosses,
        });
      } catch (error) {
        console.error('Помилка завантаження статистики клану:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClanStatistics();
  }, [isOpen, clanId, clan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">📊 Статистика клану</h2>
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
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Загальна статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Учасників</div>
                  <div className="text-2xl font-bold text-white">{stats.totalMembers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Середній рівень</div>
                  <div className="text-2xl font-bold text-fantasy-gold">{stats.averageLevel}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Вбито босів</div>
                  <div className="text-2xl font-bold text-red-400">{stats.totalBossesKilled}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Банк клану</div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalGoldDonated} 🪙</div>
                </div>
              </div>
            </div>

            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">PvP статистика</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Перемог</div>
                  <div className="text-2xl font-bold text-green-400">{stats.totalPvPWins}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Поразок</div>
                  <div className="text-2xl font-bold text-red-400">{stats.totalPvPLosses}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Вінрейт</div>
                  <div className="text-2xl font-bold text-fantasy-gold">
                    {stats.totalPvPWins + stats.totalPvPLosses > 0
                      ? Math.round((stats.totalPvPWins / (stats.totalPvPWins + stats.totalPvPLosses)) * 100)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

