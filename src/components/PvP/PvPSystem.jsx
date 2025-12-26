import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const PvPSystem = ({ isOpen, onClose, telegramId, initialOpponent }) => {
  const { player, updateHealth, addGold, addExperience } = usePlayerContext();
  const [opponents, setOpponents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('duel'); // 'duel' або 'arena'
  const [arenaRanking, setArenaRanking] = useState([]);
  const [playerRating, setPlayerRating] = useState(1000);
  const [isInBattle, setIsInBattle] = useState(false);
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [playerHP, setPlayerHP] = useState(100);
  const [opponentHP, setOpponentHP] = useState(100);

  // Автоматичний старт дуелі з initialOpponent
  useEffect(() => {
    if (isOpen && initialOpponent && !isInBattle && !battleOpponent) {
      startDuel(initialOpponent);
    }
  }, [isOpen, initialOpponent]);

  // Завантаження опонентів та рейтингу
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    if (initialOpponent) {
      // Якщо ми вже маємо опонента, не потрібно вантажити список
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        // Завантажуємо гравців для дуелів (виключаючи себе)
        const { data: players, error } = await supabase
          .from('profiles')
          .select('telegram_id, name, level, kingdom, rank, avatar_url, bosses_killed')
          .neq('telegram_id', telegramId.toString())
          .order('level', { ascending: false })
          .limit(20);

        if (!error && players) {
          setOpponents(players);
        }

        // Завантажуємо рейтинг арени
        const { data: rankings, error: rankingError } = await supabase
          .from('pvp_ratings')
          .select('telegram_id, rating, wins, losses')
          .order('rating', { ascending: false })
          .limit(10);

        if (!rankingError && rankings) {
          // Отримуємо імена гравців
          const rankingsWithNames = await Promise.all(
            rankings.map(async (rank) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, level')
                .eq('telegram_id', rank.telegram_id)
                .single();
              return { ...rank, name: profile?.name || 'Гравець', level: profile?.level || 1 };
            })
          );
          setArenaRanking(rankingsWithNames);
        }

        // Завантажуємо рейтинг гравця
        const { data: playerRatingData } = await supabase
          .from('pvp_ratings')
          .select('rating, wins, losses')
          .eq('telegram_id', telegramId.toString())
          .single();

        if (playerRatingData) {
          setPlayerRating(playerRatingData.rating || 1000);
        }
      } catch (error) {
        console.error('Помилка завантаження PvP даних:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, telegramId, initialOpponent]);

  // Початок дуелі
  const startDuel = useCallback(async (opponent) => {
    if (isInBattle) return;

    setIsInBattle(true);
    setBattleOpponent(opponent);
    setBattleLog([]);
    setIsPlayerTurn(true);
    setPlayerHP(player.maxHealth);
    setOpponentHP(opponent.max_health || 100);

    addLog('⚔️ Дуель розпочато!');
    addLog(`Ваш опонент: ${opponent.name} (Рівень ${opponent.level})`);
  }, [isInBattle, player]);

  // Додавання повідомлення в лог
  const addLog = useCallback((message) => {
    setBattleLog((prev) => [...prev, { id: Date.now(), message, time: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  // Розрахунок шкоди
  const calculateDamage = useCallback((attack, defense) => {
    const baseDamage = attack - defense;
    const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% від базової шкоди
    const isCritical = Math.random() < 0.15; // 15% шанс критичного удару
    const damage = Math.max(1, Math.floor(baseDamage * randomFactor * (isCritical ? 2 : 1)));
    return { damage, isCritical };
  }, []);

  // Атака гравця
  const handlePlayerAttack = useCallback(() => {
    if (!isPlayerTurn || playerHP <= 0 || !battleOpponent) return;

    const playerAttack = player.stats.strength + (player.equippedItems.weapon?.stats?.strength || 0);
    const opponentDefense = 5; // Базова захист опонента

    const { damage, isCritical } = calculateDamage(playerAttack, opponentDefense);
    const newOpponentHP = Math.max(0, opponentHP - damage);
    setOpponentHP(newOpponentHP);

    addLog(
      `${isCritical ? '💥 КРИТИЧНИЙ УДАР! ' : ''}Ви завдали ${damage} шкоди! ${battleOpponent.name} втратив ${damage} HP.`
    );

    setIsPlayerTurn(false);

    // Перевірка на перемогу
    if (newOpponentHP <= 0) {
      addLog(`🎉 Ви перемогли ${battleOpponent.name}!`);
      handleDuelVictory();
      return;
    }

    // Хід опонента через 1 секунду
    setTimeout(() => {
      handleOpponentAttack();
    }, 1000);
  }, [isPlayerTurn, playerHP, opponentHP, battleOpponent, player, calculateDamage, addLog]);

  // Атака опонента
  const handleOpponentAttack = useCallback(() => {
    if (playerHP <= 0 || !battleOpponent) return;

    const opponentAttack = battleOpponent.level * 5; // Базова атака опонента
    const playerDefense = player.stats.defense + (player.equippedItems.armor?.stats?.defense || 0);

    const { damage, isCritical } = calculateDamage(opponentAttack, playerDefense);
    const newPlayerHP = Math.max(0, playerHP - damage);
    setPlayerHP(newPlayerHP);
    updateHealth(-damage);

    addLog(
      `${isCritical ? '💥 КРИТИЧНИЙ УДАР! ' : ''}${battleOpponent.name} завдав вам ${damage} шкоди!`
    );

    setIsPlayerTurn(true);

    // Перевірка на поразку
    if (newPlayerHP <= 0) {
      addLog('💀 Ви зазнали поразки...');
      handleDuelDefeat();
    }
  }, [playerHP, battleOpponent, player, calculateDamage, updateHealth, addLog]);

  // Перемога в дуелі
  const handleDuelVictory = useCallback(async () => {
    const goldReward = Math.floor(battleOpponent.level * 10);
    const expReward = Math.floor(battleOpponent.level * 5);

    addGold(goldReward);
    addExperience(expReward);

    // Оновлюємо статистику PvP
    if (supabase && telegramId) {
      try {
        const { data: existing } = await supabase
          .from('pvp_ratings')
          .select('*')
          .eq('telegram_id', telegramId.toString())
          .single();

        if (existing) {
          await supabase
            .from('pvp_ratings')
            .update({
              wins: (existing.wins || 0) + 1,
              rating: (existing.rating || 1000) + 20,
            })
            .eq('telegram_id', telegramId.toString());
        } else {
          await supabase
            .from('pvp_ratings')
            .insert({
              telegram_id: telegramId.toString(),
              wins: 1,
              losses: 0,
              rating: 1020,
            });
        }
      } catch (error) {
        console.error('Помилка оновлення PvP статистики:', error);
      }
    }

    // Зберігаємо прогрес
    if (telegramId) {
      await saveProgress(telegramId, player);
    }

    setTimeout(() => {
      setIsInBattle(false);
      setBattleOpponent(null);
      setBattleLog([]);
    }, 3000);
  }, [battleOpponent, addGold, addExperience, telegramId, player]);

  // Поразка в дуелі
  const handleDuelDefeat = useCallback(async () => {
    // Оновлюємо статистику PvP
    if (supabase && telegramId) {
      try {
        const { data: existing } = await supabase
          .from('pvp_ratings')
          .select('*')
          .eq('telegram_id', telegramId.toString())
          .single();

        if (existing) {
          await supabase
            .from('pvp_ratings')
            .update({
              losses: (existing.losses || 0) + 1,
              rating: Math.max(0, (existing.rating || 1000) - 10),
            })
            .eq('telegram_id', telegramId.toString());
        } else {
          await supabase
            .from('pvp_ratings')
            .insert({
              telegram_id: telegramId.toString(),
              wins: 0,
              losses: 1,
              rating: 990,
            });
        }
      } catch (error) {
        console.error('Помилка оновлення PvP статистики:', error);
      }
    }

    setTimeout(() => {
      setIsInBattle(false);
      setBattleOpponent(null);
      setBattleLog([]);
      setPlayerHP(player.maxHealth);
    }, 3000);
  }, [telegramId, player]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">⚔️ PvP Система</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-fantasy-purple/30 mb-6">
          <button
            onClick={() => setActiveTab('duel')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${activeTab === 'duel'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Дуелі
          </button>
          <button
            onClick={() => setActiveTab('arena')}
            className={`flex-1 px-4 py-3 font-semibold transition-all ${activeTab === 'arena'
                ? 'bg-fantasy-purple/20 text-fantasy-gold border-b-2 border-fantasy-gold'
                : 'text-gray-400 hover:text-white'
              }`}
          >
            Арена
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження..." />
          </div>
        ) : isInBattle ? (
          /* Бойовий екран */
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Гравець */}
              <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                <div className="text-sm text-gray-400 mb-2">Рівень {player.level}</div>
                <div className="w-full bg-fantasy-dark rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${(playerHP / player.maxHealth) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">HP: {playerHP}/{player.maxHealth}</div>
              </div>

              {/* Опонент */}
              {battleOpponent && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-white mb-2">{battleOpponent.name}</h3>
                  <div className="text-sm text-gray-400 mb-2">Рівень {battleOpponent.level}</div>
                  <div className="w-full bg-fantasy-dark rounded-full h-3 mb-2">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${(opponentHP / (battleOpponent.max_health || 100)) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">HP: {opponentHP}/{battleOpponent.max_health || 100}</div>
                </div>
              )}
            </div>

            {/* Лог битви */}
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 h-32 overflow-y-auto">
              <div className="space-y-1">
                {battleLog.map((log) => (
                  <div key={log.id} className="text-sm text-gray-300">
                    <span className="text-gray-500 text-xs">{log.time}</span> - {log.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопки дій */}
            {isPlayerTurn && playerHP > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={handlePlayerAttack}
                  className="btn-fantasy px-8 py-4 bg-fantasy-red hover:bg-red-600 text-white font-semibold rounded-lg"
                >
                  ⚔️ Атакувати
                </button>
              </div>
            )}

            {!isPlayerTurn && (
              <div className="text-center text-gray-400">
                Хід опонента...
              </div>
            )}
          </div>
        ) : activeTab === 'duel' ? (
          /* Список опонентів для дуелів */
          <div>
            <h3 className="text-xl font-bold text-fantasy-gold mb-4">Виберіть опонента</h3>
            {opponents.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Немає доступних опонентів</p>
            ) : (
              <div className="space-y-3">
                {opponents.map((opponent) => (
                  <div
                    key={opponent.telegram_id}
                    className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">⚔️</div>
                      <div>
                        <div className="text-lg font-bold text-white">{opponent.name}</div>
                        <div className="text-sm text-gray-400">
                          Рівень {opponent.level} • {opponent.kingdom || 'Без королівства'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startDuel(opponent)}
                      className="btn-fantasy px-6 py-2 bg-fantasy-red hover:bg-red-600 text-white rounded-lg font-semibold"
                    >
                      Викликати на дуель
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Арена - рейтинг */
          <div>
            <div className="bg-fantasy-purple/20 border border-fantasy-purple rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Ваш рейтинг</h3>
              <div className="text-3xl font-bold text-fantasy-gold">{playerRating}</div>
            </div>

            <h3 className="text-xl font-bold text-fantasy-gold mb-4">🏆 Топ арени</h3>
            {arenaRanking.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Немає даних</p>
            ) : (
              <div className="space-y-3">
                {arenaRanking.map((player, index) => (
                  <div
                    key={player.telegram_id}
                    className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-fantasy-gold w-8 text-center">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{player.name}</div>
                        <div className="text-sm text-gray-400">
                          Рівень {player.level} • Перемог: {player.wins || 0} • Поразок: {player.losses || 0}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-fantasy-gold">{player.rating || 1000}</div>
                      <div className="text-xs text-gray-400">Рейтинг</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

