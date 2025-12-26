import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { useKingdomContext } from '../../contexts/KingdomContext';
import { KINGDOM_POSITIONS, INTRIGUE_TYPES, LAW_TYPES, EVIDENCE_TYPES, checkPositionRequirements, calculateConspiracyStrength, calculateDetectionRisk } from '../../data/politics';
import { supabase } from '../../lib/supabaseClient';

export const PoliticsSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold } = usePlayerContext();
  const { provinces } = useKingdomContext();
  const [activeTab, setActiveTab] = useState('positions');
  const [kingdomPositions, setKingdomPositions] = useState({});
  const [applications, setApplications] = useState([]);
  const [laws, setLaws] = useState([]);
  const [myInvestigations, setMyInvestigations] = useState([]);
  const [myConspiracies, setMyConspiracies] = useState([]);
  const [availableConspiracies, setAvailableConspiracies] = useState([]);
  const [kingElection, setKingElection] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [targetId, setTargetId] = useState('');
  const [conspiracyName, setConspiracyName] = useState('');
  const [conspiracyGoal, setConspiracyGoal] = useState('');

  // Завантаження даних
  useEffect(() => {
    if (isOpen && player.kingdom) {
      loadKingdomData();
      checkKingElection();
    }
  }, [isOpen, player.kingdom]);

  const loadKingdomData = async () => {
    if (!supabase) return;

    try {
      // Завантаження посад
      const { data: positions } = await supabase
        .from('kingdom_positions')
        .select('*')
        .eq('kingdom_id', player.kingdom);

      if (positions) {
        const positionsMap = {};
        positions.forEach(pos => {
          positionsMap[pos.position_id] = pos;
        });
        setKingdomPositions(positionsMap);
      }

      // Завантаження заявок
      const { data: apps } = await supabase
        .from('position_applications')
        .select('*')
        .eq('kingdom_id', player.kingdom)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (apps) setApplications(apps);

      // Завантаження законів
      const { data: activeLaws } = await supabase
        .from('council_laws')
        .select('*')
        .eq('kingdom_id', player.kingdom)
        .eq('status', 'voting')
        .order('created_at', { ascending: false });

      if (activeLaws) setLaws(activeLaws);

      // Завантаження моїх розслідувань
      const { data: investigations } = await supabase
        .from('investigations')
        .select('*')
        .eq('initiator_id', telegramId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (investigations) setMyInvestigations(investigations);

      // Завантаження змов
      const { data: conspiracies } = await supabase
        .from('conspiracies')
        .select('*')
        .contains('members', [telegramId])
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (conspiracies) setMyConspiracies(conspiracies);

      // Завантаження доступних змов для приєднання
      const { data: availableConsp } = await supabase
        .from('conspiracies')
        .select('*')
        .eq('kingdom_id', player.kingdom)
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (availableConsp) setAvailableConspiracies(availableConsp);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    }
  };

  // Перевірка наявності короля та виборів
  const checkKingElection = async () => {
    if (!supabase) return;

    try {
      // Перевірка, чи є король
      const { data: king } = await supabase
        .from('kingdom_positions')
        .select('*')
        .eq('kingdom_id', player.kingdom)
        .eq('position_id', 'king')
        .single();

      if (!king || !king.holder_id) {
        // Немає короля - перевірити, чи є вибори
        const { data: election } = await supabase
          .from('king_elections')
          .select('*')
          .eq('kingdom_id', player.kingdom)
          .eq('status', 'active')
          .single();

        if (election) {
          setKingElection(election);
        } else {
          // Створити нові вибори
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 1); // 1 день на голосування

          const { data: newElection } = await supabase
            .from('king_elections')
            .insert({
              kingdom_id: player.kingdom,
              status: 'active',
              created_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

          if (newElection) setKingElection(newElection);
        }
      }
    } catch (error) {
      console.error('Помилка перевірки виборів:', error);
    }
  };

  // Створити розслідування
  const handleStartInvestigation = useCallback(async () => {
    if (!targetId || !supabase || !telegramId) {
      alert('❌ Введіть Telegram ID цілі!');
      return;
    }

    const intrigue = INTRIGUE_TYPES.investigation;
    
    if (player.gold < intrigue.cost) {
      alert(`❌ Недостатньо золота! Потрібно: ${intrigue.cost}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('investigations')
        .insert({
          kingdom_id: player.kingdom,
          initiator_id: telegramId,
          initiator_name: player.name,
          target_id: targetId,
          status: 'active',
          evidence_count: 0,
          evidence_required: intrigue.evidenceRequired,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + intrigue.duration * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (error) throw error;

      addGold(-intrigue.cost);
      alert(`✅ Розслідування розпочато! Потрібно ${intrigue.evidenceRequired} доказів протягом ${intrigue.duration} днів.`);
      loadKingdomData();
      setTargetId('');
    } catch (error) {
      console.error('Помилка створення розслідування:', error);
      alert('❌ Помилка створення розслідування');
    }
  }, [targetId, player, telegramId, addGold]);

  // Пошук доказів
  const handleSearchEvidence = useCallback(async (investigationId) => {
    if (!supabase) return;

    const intrigue = INTRIGUE_TYPES.searchEvidence;
    
    if (player.gold < intrigue.cost) {
      alert(`❌ Недостатньо золота! Потрібно: ${intrigue.cost}`);
      return;
    }

    try {
      // Перевірка кулдауну
      const { data: lastSearch } = await supabase
        .from('evidence_searches')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('searcher_id', telegramId)
        .order('searched_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSearch) {
        const timeSince = (new Date() - new Date(lastSearch.searched_at)) / (1000 * 60 * 60);
        if (timeSince < intrigue.cooldown) {
          alert(`❌ Зачекайте ${Math.ceil(intrigue.cooldown - timeSince)} годин до наступного пошуку`);
          return;
        }
      }

      // Випадковий результат пошуку
      const searchSuccess = Math.random() > 0.5; // 50% шанс знайти щось
      
      addGold(-intrigue.cost);

      if (searchSuccess) {
        // Випадковий тип доказу
        const evidenceTypes = Object.keys(EVIDENCE_TYPES);
        const randomType = evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)];
        const evidence = EVIDENCE_TYPES[randomType];

        // Додати доказ до розслідування
        const { error: evidenceError } = await supabase
          .from('investigation_evidence')
          .insert({
            investigation_id: investigationId,
            evidence_type: randomType,
            found_by: telegramId,
            found_at: new Date().toISOString(),
            description: `Знайдено: ${evidence.name}`,
          });

        if (evidenceError) throw evidenceError;

        // Оновити лічильник доказів
        await supabase.rpc('increment_investigation_evidence', { inv_id: investigationId });

        alert(`✅ Знайдено доказ: ${evidence.emoji} ${evidence.name}!`);
      } else {
        alert(`❌ Нічого не знайдено. Спробуйте пізніше.`);
      }

      // Записати спробу
      await supabase
        .from('evidence_searches')
        .insert({
          investigation_id: investigationId,
          searcher_id: telegramId,
          success: searchSuccess,
          searched_at: new Date().toISOString(),
        });

      loadKingdomData();
    } catch (error) {
      console.error('Помилка пошуку доказів:', error);
      alert('❌ Помилка пошуку доказів');
    }
  }, [player, telegramId, addGold]);

  // Створити змову
  const handleCreateConspiracy = useCallback(async () => {
    if (!conspiracyName || !conspiracyGoal || !targetId) {
      alert('❌ Заповніть всі поля!');
      return;
    }

    const intrigue = INTRIGUE_TYPES.createConspiracy;
    
    if (player.gold < intrigue.cost) {
      alert(`❌ Недостатньо золота! Потрібно: ${intrigue.cost}`);
      return;
    }

    if (!supabase || !telegramId) return;

    try {
      const { error } = await supabase
        .from('conspiracies')
        .insert({
          kingdom_id: player.kingdom,
          name: conspiracyName,
          goal: conspiracyGoal,
          target_id: targetId,
          creator_id: telegramId,
          members: [telegramId],
          member_names: [player.name],
          status: 'active',
          is_public: false,
          evidence_count: 0,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      addGold(-intrigue.cost);
      alert(`✅ Змова "${conspiracyName}" створена! Запросіть інших учасників.`);
      loadKingdomData();
      setConspiracyName('');
      setConspiracyGoal('');
      setTargetId('');
      setSelectedAction(null);
    } catch (error) {
      console.error('Помилка створення змови:', error);
      alert('❌ Помилка створення змови');
    }
  }, [conspiracyName, conspiracyGoal, targetId, player, telegramId, addGold]);

  // Приєднатися до змови
  const handleJoinConspiracy = useCallback(async (conspiracyId) => {
    const intrigue = INTRIGUE_TYPES.joinConspiracy;
    
    if (player.gold < intrigue.cost) {
      alert(`❌ Недостатньо золота! Потрібно: ${intrigue.cost}`);
      return;
    }

    if (!supabase || !telegramId) return;

    try {
      // Додати себе до масиву учасників
      const { error } = await supabase.rpc('add_conspiracy_member', {
        conspiracy_id: conspiracyId,
        member_id: telegramId,
        member_name: player.name,
      });

      if (error) throw error;

      addGold(-intrigue.cost);
      alert(`✅ Ви приєдналися до змови!`);
      loadKingdomData();
    } catch (error) {
      console.error('Помилка приєднання до змови:', error);
      alert('❌ Помилка приєднання до змови');
    }
  }, [player, telegramId, addGold]);

  // Виконати змову
  const handleExecuteConspiracy = useCallback(async (conspiracyId, conspiracy) => {
    if (!supabase) return;

    const strength = calculateConspiracyStrength(conspiracy);
    const detectionRisk = calculateDetectionRisk(conspiracy);

    const confirm = window.confirm(
      `Виконати змову?\n\nСила змови: ${strength}\nРизик викриття: ${detectionRisk}%\n\nПродовжити?`
    );

    if (!confirm) return;

    try {
      // Перевірити, чи достатньо учасників та доказів
      if ((conspiracy.members?.length || 0) < 3) {
        alert('❌ Потрібно мінімум 3 учасники!');
        return;
      }

      if ((conspiracy.evidence_count || 0) < 5) {
        alert('❌ Потрібно мінімум 5 доказів!');
        return;
      }

      // Виконання змови
      const success = strength > 80 && Math.random() > (detectionRisk / 100);

      if (success) {
        alert(`✅ Змова успішна! Ціль усунута.`);
        
        // Усунути ціль з посади
        await supabase
          .from('profiles')
          .update({ position: null, reputation: 0 })
          .eq('telegram_id', conspiracy.target_id);

        // Закрити змову
        await supabase
          .from('conspiracies')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', conspiracyId);
      } else {
        alert(`❌ Змова викрита! Всі учасники покарані.`);
        
        // Покарання для всіх учасників
        if (conspiracy.members) {
          for (const memberId of conspiracy.members) {
            await supabase
              .from('profiles')
              .update({ 
                position: null, 
                reputation: supabase.raw('GREATEST(reputation - 1000, 0)')
              })
              .eq('telegram_id', memberId);
          }
        }

        // Закрити змову
        await supabase
          .from('conspiracies')
          .update({ status: 'failed', completed_at: new Date().toISOString() })
          .eq('id', conspiracyId);
      }

      loadKingdomData();
    } catch (error) {
      console.error('Помилка виконання змови:', error);
      alert('❌ Помилка виконання змови');
    }
  }, []);

  // Балотуватися в королі
  const handleNominateForKing = useCallback(async () => {
    if (!kingElection || !supabase || !telegramId) return;

    const check = checkPositionRequirements('king', player);
    if (!check.valid) {
      alert(`❌ ${check.reason}`);
      return;
    }

    try {
      const { error } = await supabase
        .from('king_candidates')
        .insert({
          election_id: kingElection.id,
          candidate_id: telegramId,
          candidate_name: player.name,
          votes: 0,
          nominated_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert(`✅ Ви балотуєтеся на посаду короля!`);
      checkKingElection();
    } catch (error) {
      console.error('Помилка номінації:', error);
      alert('❌ Помилка номінації');
    }
  }, [kingElection, player, telegramId]);

  // Голосувати за короля
  const handleVoteForKing = useCallback(async (candidateId) => {
    if (!kingElection || !supabase || !telegramId) return;

    try {
      // Перевірити, чи вже голосував
      const { data: existingVote } = await supabase
        .from('king_votes')
        .select('*')
        .eq('election_id', kingElection.id)
        .eq('voter_id', telegramId)
        .single();

      if (existingVote) {
        alert('❌ Ви вже проголосували!');
        return;
      }

      // Додати голос
      const { error } = await supabase
        .from('king_votes')
        .insert({
          election_id: kingElection.id,
          candidate_id: candidateId,
          voter_id: telegramId,
          voted_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Оновити лічильник
      await supabase.rpc('increment_candidate_votes', { cand_id: candidateId });

      alert(`✅ Ваш голос зараховано!`);
      checkKingElection();
    } catch (error) {
      console.error('Помилка голосування:', error);
      alert('❌ Помилка голосування');
    }
  }, [kingElection, telegramId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-purple-500 rounded-lg w-11/12 max-w-5xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 px-6 py-4 border-b border-purple-500 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-purple-300">👑 Політика та Інтриги</h2>
            <p className="text-xs text-gray-400">Управління королівством {player.kingdom}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-500 transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Вибори короля (якщо активні) */}
        {kingElection && (
          <div className="bg-yellow-900/30 border-b border-yellow-500 px-6 py-3">
            <div className="text-yellow-300 font-bold mb-1">
              ⚠️ ВИБОРИ КОРОЛЯ! Голосування активне протягом 1 дня!
            </div>
            <div className="text-white text-sm">
              Балотуйтеся або голосуйте у вкладці "Вибори"
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-purple-500/50 bg-fantasy-dark/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('positions')}
            className={`flex-1 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'positions' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 Посади
          </button>
          <button
            onClick={() => setActiveTab('council')}
            className={`flex-1 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'council' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🏛️ Рада
          </button>
          <button
            onClick={() => setActiveTab('intrigue')}
            className={`flex-1 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
              activeTab === 'intrigue' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            🗡️ Інтриги
          </button>
          {kingElection && (
            <button
              onClick={() => setActiveTab('election')}
              className={`flex-1 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'election' ? 'bg-yellow-600 text-white' : 'text-yellow-400 hover:text-white'
              }`}
            >
              👑 Вибори
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Посади (без змін) */}
          {activeTab === 'positions' && (
            <div className="space-y-4">
              <div className="text-white mb-4">
                <h3 className="text-xl font-bold text-purple-300 mb-2">Доступні посади в королівстві</h3>
                <p className="text-sm text-gray-400">
                  Подайте заявку на посаду. Ваша поточна посада: {' '}
                  {player.position ? (
                    <span className="text-purple-400 font-bold">
                      {KINGDOM_POSITIONS[player.position]?.emoji} {KINGDOM_POSITIONS[player.position]?.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">Немає</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(KINGDOM_POSITIONS).slice(0, 6).map(([id, position]) => {
                  const check = checkPositionRequirements(id, player);

                  return (
                    <div
                      key={id}
                      className={`border-2 rounded-lg p-4 ${
                        check.valid ? 'border-purple-500 bg-purple-900/20' : 'border-gray-600 bg-gray-800/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-2xl mb-1">{position.emoji}</div>
                          <div className="text-white font-bold">{position.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400 text-sm">💰 {position.salary}/день</div>
                          <div className="text-purple-400 text-xs">⭐ {position.influence}</div>
                        </div>
                      </div>

                      <div className="text-gray-300 text-sm mb-2">{position.description}</div>

                      <div className="text-xs text-gray-400 mb-2">
                        {position.powers.slice(0, 3).map((power, idx) => (
                          <div key={idx}>• {power}</div>
                        ))}
                      </div>

                      {check.valid ? (
                        <button
                          onClick={() => alert('Подати заявку')}
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                        >
                          Подати заявку
                        </button>
                      ) : (
                        <div className="text-xs text-red-400 text-center py-2">{check.reason}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Рада (попередня версія) */}
          {activeTab === 'council' && (
            <div>
              <h3 className="text-xl font-bold text-purple-300 mb-4">Рада Королівства</h3>
              <div className="text-gray-400">
                Голосування за закони та управління королівством...
              </div>
            </div>
          )}

          {/* Нова система інтриг */}
          {activeTab === 'intrigue' && (
            <div className="space-y-6">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <div className="text-red-400 font-bold mb-2">⚠️ Нова система інтриг</div>
                <div className="text-gray-300 text-sm">
                  Інтриги тепер вимагають збору доказів та створення змов. Чим більше доказів та учасників - тим вищий шанс успіху!
                </div>
              </div>

              {/* Створити розслідування */}
              <div className="bg-fantasy-dark/50 border border-purple-500/50 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  Почати розслідування
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Почніть офіційне розслідування проти гравця. Потрібно зібрати докази протягом 3 днів.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Telegram ID цілі"
                    className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={handleStartInvestigation}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Почати (1000💰)
                  </button>
                </div>
              </div>

              {/* Мої розслідування */}
              {myInvestigations.length > 0 && (
                <div>
                  <h4 className="text-white font-bold mb-3">📂 Мої розслідування</h4>
                  <div className="space-y-2">
                    {myInvestigations.map((inv) => (
                      <div key={inv.id} className="bg-fantasy-dark/50 border border-blue-500/50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-white font-semibold">Ціль: {inv.target_id}</div>
                          <div className="text-sm text-gray-400">
                            Докази: {inv.evidence_count}/{inv.evidence_required}
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(inv.evidence_count / inv.evidence_required) * 100}%` }}
                          ></div>
                        </div>
                        <button
                          onClick={() => handleSearchEvidence(inv.id)}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold"
                        >
                          🔎 Шукати докази (500💰)
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Створити змову */}
              <div className="bg-fantasy-dark/50 border border-red-500/50 rounded-lg p-4">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🤝</span>
                  Створити змову
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Об'єднайтеся з іншими гравцями для спільних дій. Мінімум 3 учасники та 5 доказів для виконання.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={conspiracyName}
                    onChange={(e) => setConspiracyName(e.target.value)}
                    placeholder="Назва змови"
                    className="w-full bg-fantasy-dark border border-red-500/50 rounded px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={conspiracyGoal}
                    onChange={(e) => setConspiracyGoal(e.target.value)}
                    placeholder="Мета (наприклад: усунути короля)"
                    className="w-full bg-fantasy-dark border border-red-500/50 rounded px-3 py-2 text-white text-sm"
                  />
                  <input
                    type="text"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Telegram ID цілі"
                    className="w-full bg-fantasy-dark border border-red-500/50 rounded px-3 py-2 text-white text-sm"
                  />
                  <button
                    onClick={handleCreateConspiracy}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Створити змову (2000💰)
                  </button>
                </div>
              </div>

              {/* Мої змови */}
              {myConspiracies.length > 0 && (
                <div>
                  <h4 className="text-white font-bold mb-3">🤫 Мої змови</h4>
                  <div className="space-y-3">
                    {myConspiracies.map((consp) => {
                      const strength = calculateConspiracyStrength(consp);
                      const risk = calculateDetectionRisk(consp);

                      return (
                        <div key={consp.id} className="bg-fantasy-dark/50 border border-orange-500/50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-white font-bold">{consp.name}</div>
                              <div className="text-sm text-gray-400">{consp.goal}</div>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-green-400">💪 Сила: {strength}</div>
                              <div className="text-red-400">⚠️ Ризик: {risk}%</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-300 mb-2">
                            Учасники: {consp.members?.length || 0} | Докази: {consp.evidence_count || 0}
                          </div>
                          <button
                            onClick={() => handleExecuteConspiracy(consp.id, consp)}
                            disabled={(consp.members?.length || 0) < 3 || (consp.evidence_count || 0) < 5}
                            className={`w-full px-4 py-2 rounded-lg text-sm font-semibold ${
                              (consp.members?.length || 0) >= 3 && (consp.evidence_count || 0) >= 5
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            ⚔️ Виконати змову
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Вибори короля */}
          {activeTab === 'election' && kingElection && (
            <div>
              <h3 className="text-xl font-bold text-yellow-300 mb-4">👑 Вибори короля</h3>
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <div className="text-white font-semibold mb-2">
                  Королівство без короля! Виберіть нового правителя.
                </div>
                <div className="text-gray-400 text-sm">
                  Голосування завершиться: {new Date(kingElection.expires_at).toLocaleString('uk-UA')}
                </div>
              </div>

              <button
                onClick={handleNominateForKing}
                className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold mb-6"
              >
                Балотуватися в королі
              </button>

              <div className="text-white font-bold mb-3">Кандидати:</div>
              <div className="space-y-2">
                <div className="text-gray-400 text-center py-8">
                  Завантаження кандидатів...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
