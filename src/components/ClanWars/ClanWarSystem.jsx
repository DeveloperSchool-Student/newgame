import { useState, useEffect, useCallback } from 'react';
import { useClanContext } from '../../contexts/ClanContext';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

const WAR_DURATION_HOURS = 24; // Тривалість війни в годинах
const WAR_COST = 5000; // Вартість оголошення війни

export const ClanWarSystem = ({ isOpen, onClose, telegramId }) => {
  const { clan, clanMembers } = useClanContext();
  const { player } = usePlayerContext();
  const { showToast } = useToast();
  const [activeWars, setActiveWars] = useState([]);
  const [warHistory, setWarHistory] = useState([]);
  const [targetClan, setTargetClan] = useState(null);
  const [allClans, setAllClans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Завантаження активних воєн
  useEffect(() => {
    if (!isOpen || !clan) return;

    const loadWars = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        // Завантажуємо активні війни
        const { data: wars } = await supabase
          .from('clan_wars')
          .select(`
            *,
            attacker_clan:clans!clan_wars_attacker_clan_id_fkey(id, name, tag),
            defender_clan:clans!clan_wars_defender_clan_id_fkey(id, name, tag)
          `)
          .or(`attacker_clan_id.eq.${clan.id},defender_clan_id.eq.${clan.id}`)
          .eq('status', 'active')
          .order('started_at', { ascending: false });

        setActiveWars(wars || []);

        // Завантажуємо історію воєн
        const { data: history } = await supabase
          .from('clan_wars')
          .select(`
            *,
            attacker_clan:clans!clan_wars_attacker_clan_id_fkey(id, name, tag),
            defender_clan:clans!clan_wars_defender_clan_id_fkey(id, name, tag)
          `)
          .or(`attacker_clan_id.eq.${clan.id},defender_clan_id.eq.${clan.id}`)
          .eq('status', 'finished')
          .order('ended_at', { ascending: false })
          .limit(10);

        setWarHistory(history || []);

        // Завантажуємо всі клани для вибору цілі
        const { data: clans } = await supabase
          .from('clans')
          .select('id, name, tag, level, member_count')
          .neq('id', clan.id)
          .order('level', { ascending: false });

        setAllClans(clans || []);
      } catch (error) {
        console.error('Помилка завантаження воєн:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWars();

    // Підписка на зміни воєн
    if (supabase) {
      const warChannel = supabase
        .channel(`clan-wars-${clan.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clan_wars',
            filter: `attacker_clan_id=eq.${clan.id},defender_clan_id=eq.${clan.id}`,
          },
          () => {
            loadWars();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(warChannel);
      };
    }
  }, [isOpen, clan]);

  // Оголошення війни
  const declareWar = useCallback(async () => {
    if (!targetClan || !clan || isProcessing) return;

    if (clan.bank < WAR_COST) {
      showToast('Недостатньо золота в банку клану', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('clan_wars')
        .insert({
          attacker_clan_id: clan.id,
          defender_clan_id: targetClan.id,
          status: 'active',
          started_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + WAR_DURATION_HOURS * 60 * 60 * 1000).toISOString(),
        });

      if (error) {
        showToast('Помилка оголошення війни', 'error');
        return;
      }

      // Списуємо золото з банку
      await supabase
        .from('clans')
        .update({ bank: clan.bank - WAR_COST })
        .eq('id', clan.id);

      showToast(`Війна оголошена клану ${targetClan.name}!`, 'success');
      setTargetClan(null);
    } catch (error) {
      console.error('Помилка оголошення війни:', error);
      showToast('Помилка оголошення війни', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [targetClan, clan, isProcessing, showToast]);

  // Участь у війні (бій)
  const participateInWar = useCallback(async (warId) => {
    if (!telegramId || isProcessing) return;

    setIsProcessing(true);
    try {
      // Додаємо участь гравця у війні
      const { error } = await supabase
        .from('clan_war_participants')
        .upsert({
          war_id: warId,
          telegram_id: telegramId.toString(),
          battles_won: 0,
          battles_lost: 0,
        }, {
          onConflict: 'war_id,telegram_id'
        });

      if (error) {
        showToast('Помилка участі у війні', 'error');
        return;
      }

      // Симуляція бою (в реальній грі це буде PvP бій)
      const battleResult = Math.random() > 0.5 ? 'win' : 'loss';
      
      if (battleResult === 'win') {
        const { data: participant } = await supabase
          .from('clan_war_participants')
          .select('battles_won')
          .eq('war_id', warId)
          .eq('telegram_id', telegramId.toString())
          .single();

        await supabase
          .from('clan_war_participants')
          .update({ battles_won: (participant?.battles_won || 0) + 1 })
          .eq('war_id', warId)
          .eq('telegram_id', telegramId.toString());

        // Отримуємо поточний рахунок
        const { data: war } = await supabase
          .from('clan_wars')
          .select('attacker_score')
          .eq('id', warId)
          .single();

        // Оновлюємо очки атакуючого клану
        await supabase
          .from('clan_wars')
          .update({ attacker_score: (war?.attacker_score || 0) + 1 })
          .eq('id', warId);
      } else {
        const { data: participant2 } = await supabase
          .from('clan_war_participants')
          .select('battles_lost')
          .eq('war_id', warId)
          .eq('telegram_id', telegramId.toString())
          .single();

        await supabase
          .from('clan_war_participants')
          .update({ battles_lost: (participant2?.battles_lost || 0) + 1 })
          .eq('war_id', warId)
          .eq('telegram_id', telegramId.toString());

        // Отримуємо поточний рахунок
        const { data: war2 } = await supabase
          .from('clan_wars')
          .select('defender_score')
          .eq('id', warId)
          .single();

        // Оновлюємо очки захищаючого клану
        await supabase
          .from('clan_wars')
          .update({ defender_score: (war2?.defender_score || 0) + 1 })
          .eq('id', warId);
      }

      showToast(battleResult === 'win' ? 'Перемога в бою!' : 'Поразка в бою', battleResult === 'win' ? 'success' : 'error');
    } catch (error) {
      console.error('Помилка участі у війні:', error);
      showToast('Помилка участі у війні', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [telegramId, isProcessing, showToast]);

  const isLeader = clan && clan.leader_id === telegramId?.toString();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">⚔️ Війни кланів</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження воєн..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Активні війни */}
            <div>
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Активні війни</h3>
              {activeWars.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  <p>Немає активних воєн</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeWars.map((war) => {
                    const isAttacker = war.attacker_clan_id === clan.id;
                    const opponent = isAttacker ? war.defender_clan : war.attacker_clan;
                    const ourScore = isAttacker ? war.attacker_score : war.defender_score;
                    const opponentScore = isAttacker ? war.defender_score : war.attacker_score;
                    const endsAt = new Date(war.ends_at);
                    const timeLeft = Math.max(0, endsAt - new Date());

                    return (
                      <div
                        key={war.id}
                        className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-500 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-white">
                              {isAttacker ? '⚔️ Атака' : '🛡️ Захист'}
                            </h4>
                            <p className="text-sm text-gray-400">
                              Проти: {opponent?.name} [{opponent?.tag}]
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Залишилось</div>
                            <div className="text-lg font-bold text-red-400">
                              {Math.floor(timeLeft / (1000 * 60 * 60))}г {Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))}хв
                            </div>
                          </div>
                        </div>

                        {/* Рахунок */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-center flex-1">
                            <div className="text-sm text-gray-400">Ваш клан</div>
                            <div className="text-2xl font-bold text-green-400">{ourScore}</div>
                          </div>
                          <div className="text-3xl font-bold text-white">VS</div>
                          <div className="text-center flex-1">
                            <div className="text-sm text-gray-400">Суперник</div>
                            <div className="text-2xl font-bold text-red-400">{opponentScore}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => participateInWar(war.id)}
                          disabled={isProcessing}
                          className="w-full py-2 px-4 bg-fantasy-purple hover:bg-purple-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                          {isProcessing ? 'Бій...' : 'Взяти участь у бою'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Оголошення війни (тільки для лідера) */}
            {isLeader && (
              <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
                <h3 className="text-xl font-bold text-fantasy-gold mb-4">Оголосити війну</h3>
                <div className="space-y-4">
                  <select
                    value={targetClan?.id || ''}
                    onChange={(e) => {
                      const selected = allClans.find((c) => c.id === e.target.value);
                      setTargetClan(selected || null);
                    }}
                    className="w-full bg-fantasy-dark border border-fantasy-purple/50 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Оберіть клан</option>
                    {allClans.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} [{c.tag}] - Рівень {c.level}
                      </option>
                    ))}
                  </select>

                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded p-3">
                    <div className="text-sm text-yellow-300">
                      Вартість: <span className="font-bold">{WAR_COST} 🪙</span>
                    </div>
                    <div className="text-sm text-yellow-300">
                      Банк клану: <span className="font-bold">{clan.bank || 0} 🪙</span>
                    </div>
                  </div>

                  <button
                    onClick={declareWar}
                    disabled={!targetClan || isProcessing || (clan.bank || 0) < WAR_COST}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Оголошення...' : 'Оголосити війну'}
                  </button>
                </div>
              </div>
            )}

            {/* Історія воєн */}
            {warHistory.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-fantasy-gold mb-4">Історія воєн</h3>
                <div className="space-y-2">
                  {warHistory.map((war) => {
                    const isAttacker = war.attacker_clan_id === clan.id;
                    const opponent = isAttacker ? war.defender_clan : war.attacker_clan;
                    const ourScore = isAttacker ? war.attacker_score : war.defender_score;
                    const opponentScore = isAttacker ? war.defender_score : war.attacker_score;
                    const won = ourScore > opponentScore;

                    return (
                      <div
                        key={war.id}
                        className={`bg-fantasy-dark/50 border rounded-lg p-3 ${
                          won ? 'border-green-500' : 'border-red-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">
                              {won ? '✅ Перемога' : '❌ Поразка'} проти {opponent?.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(war.ended_at).toLocaleDateString('uk-UA')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              <span className={won ? 'text-green-400' : 'text-red-400'}>
                                {ourScore}
                              </span>
                              {' : '}
                              <span className={won ? 'text-red-400' : 'text-green-400'}>
                                {opponentScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

