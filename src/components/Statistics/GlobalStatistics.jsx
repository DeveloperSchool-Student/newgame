import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const GlobalStatistics = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    onlinePlayers: 0,
    totalBossesKilled: 0,
    totalGoldInCirculation: 0,
    totalPvPBattles: 0,
    averageLevel: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !supabase) return;

    const loadGlobalStatistics = async () => {
      setIsLoading(true);
      try {
        // Загальна кількість гравців
        const { count: totalPlayers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Онлайн гравці (активні за останні 5 хвилин)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const { count: onlinePlayers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_seen', fiveMinutesAgo);

        // Загальна статистика
        const { data: profiles } = await supabase
          .from('profiles')
          .select('bosses_killed, gold, level');

        // PvP статистика
        const { data: pvpStats } = await supabase
          .from('pvp_ratings')
          .select('wins, losses');

        // Розраховуємо статистику
        const totalBossesKilled = profiles?.reduce((sum, p) => sum + (p.bosses_killed || 0), 0) || 0;
        const totalGoldInCirculation = profiles?.reduce((sum, p) => sum + (p.gold || 0), 0) || 0;
        const totalPvPBattles = pvpStats?.reduce((sum, p) => sum + (p.wins || 0) + (p.losses || 0), 0) || 0;
        const averageLevel = profiles?.length > 0
          ? Math.round(profiles.reduce((sum, p) => sum + (p.level || 1), 0) / profiles.length)
          : 0;

        setStats({
          totalPlayers: totalPlayers || 0,
          onlinePlayers: onlinePlayers || 0,
          totalBossesKilled,
          totalGoldInCirculation,
          totalPvPBattles,
          averageLevel,
        });
      } catch (error) {
        console.error('Помилка завантаження глобальної статистики:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGlobalStatistics();
    // Оновлюємо кожні 30 секунд
    const interval = setInterval(loadGlobalStatistics, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">🌍 Глобальна статистика</h2>
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
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Гравці</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Всього гравців</div>
                  <div className="text-2xl font-bold text-white">{stats.totalPlayers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Онлайн</div>
                  <div className="text-2xl font-bold text-green-400">{stats.onlinePlayers}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Середній рівень</div>
                  <div className="text-2xl font-bold text-fantasy-gold">{stats.averageLevel}</div>
                </div>
              </div>
            </div>

            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Бойова статистика</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Вбито босів</div>
                  <div className="text-2xl font-bold text-red-400">{stats.totalBossesKilled}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">PvP битв</div>
                  <div className="text-2xl font-bold text-blue-400">{stats.totalPvPBattles}</div>
                </div>
              </div>
            </div>

            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Економіка</h3>
              <div>
                <div className="text-sm text-gray-400">Золото в обігу</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.totalGoldInCirculation.toLocaleString()} 🪙</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

