import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const Leaderboard = ({ isOpen, onClose }) => {
  const [leaderboard, setLeaderboard] = useState({
    byLevel: [],
    byGold: [],
    byBosses: [],
  });
  const [activeTab, setActiveTab] = useState('level');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const loadLeaderboard = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      try {
        // Топ за рівнем
        const { data: byLevel } = await supabase
          .from('profiles')
          .select('name, level, kingdom, rank, bosses_killed')
          .order('level', { ascending: false })
          .limit(10);

        // Топ за золотом
        const { data: byGold } = await supabase
          .from('profiles')
          .select('name, level, gold, kingdom, rank')
          .order('gold', { ascending: false })
          .limit(10);

        // Топ за вбитими босами
        const { data: byBosses } = await supabase
          .from('profiles')
          .select('name, level, bosses_killed, kingdom, rank')
          .order('bosses_killed', { ascending: false })
          .limit(10);

        setLeaderboard({
          byLevel: byLevel || [],
          byGold: byGold || [],
          byBosses: byBosses || [],
        });
      } catch (error) {
        console.error('Помилка завантаження таблиці лідерів:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [isOpen]);

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const renderList = () => {
    let list = [];
    if (activeTab === 'level') list = leaderboard.byLevel;
    else if (activeTab === 'gold') list = leaderboard.byGold;
    else if (activeTab === 'bosses') list = leaderboard.byBosses;

    return (
      <div className="space-y-2">
        {list.map((player, index) => (
          <div
            key={index}
            className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-fantasy-gold w-8 text-center">
                {getRankEmoji(index)}
              </div>
              <div>
                <div className="text-white font-semibold">{player.name || 'Гравець'}</div>
                <div className="text-xs text-gray-400">
                  Lv.{player.level} • {player.kingdom || 'Без королівства'}
                </div>
              </div>
            </div>
            <div className="text-right">
              {activeTab === 'level' && (
                <div className="text-fantasy-gold font-bold">Рівень {player.level}</div>
              )}
              {activeTab === 'gold' && (
                <div className="text-fantasy-gold font-bold">{player.gold || 0} 🪙</div>
              )}
              {activeTab === 'bosses' && (
                <div className="text-fantasy-red font-bold">{player.bosses_killed || 0} 👹</div>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && !isLoading && (
          <div className="text-center text-gray-400 py-8">Немає даних</div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">🏆 Таблиця лідерів</h2>
            <p className="text-xs text-gray-400">Топ гравців сервера</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-fantasy-purple/30">
          <button
            onClick={() => setActiveTab('level')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              activeTab === 'level'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Рівень
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              activeTab === 'gold'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Золото
          </button>
          <button
            onClick={() => setActiveTab('bosses')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${
              activeTab === 'bosses'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Боси
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-fantasy-purple/30 border-t-fantasy-purple rounded-full animate-spin"></div>
            </div>
          ) : (
            renderList()
          )}
        </div>
      </div>
    </div>
  );
};

