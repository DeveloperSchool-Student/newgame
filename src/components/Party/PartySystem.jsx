import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const PartySystem = ({ isOpen, onClose, telegramId }) => {
  const { player } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('my_party'); // my_party, invites, find
  const [myParty, setMyParty] = useState(null);
  const [partyMembers, setPartyMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [availableParties, setAvailableParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Завантаження моєї партії
  const loadMyParty = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      // Перевіряємо чи є гравець у партії
      const { data: memberData, error: memberError } = await supabase
        .from('party_members')
        .select('party_id, role')
        .eq('telegram_id', telegramId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') throw memberError;

      if (memberData) {
        // Завантажуємо інформацію про партію
        const { data: partyData, error: partyError } = await supabase
          .from('parties')
          .select(`
            *,
            leader:profiles!parties_leader_id_fkey(telegram_id, name, level, avatar_url)
          `)
          .eq('id', memberData.party_id)
          .eq('status', 'active')
          .single();

        if (partyError && partyError.code !== 'PGRST116') throw partyError;

        if (partyData) {
          setMyParty({ ...partyData, my_role: memberData.role });

          // Завантажуємо учасників
          const { data: membersData, error: membersError } = await supabase
            .from('party_members')
            .select(`
              *,
              profile:profiles(telegram_id, name, level, avatar_url, health, maxHealth)
            `)
            .eq('party_id', partyData.id);

          if (membersError) throw membersError;
          setPartyMembers(membersData || []);
        } else {
          setMyParty(null);
          setPartyMembers([]);
        }
      } else {
        setMyParty(null);
        setPartyMembers([]);
      }
    } catch (error) {
      console.error('Помилка завантаження партії:', error);
    }
  }, [telegramId]);

  // Завантаження запрошень
  const loadInvites = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('party_invites')
        .select(`
          *,
          party:parties(id, name, leader_id),
          inviter:profiles!party_invites_inviter_id_fkey(telegram_id, name, level)
        `)
        .eq('invitee_id', telegramId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Помилка завантаження запрошень:', error);
    }
  }, [telegramId]);

  // Завантаження доступних партій
  const loadAvailableParties = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('parties')
        .select(`
          *,
          leader:profiles!parties_leader_id_fkey(telegram_id, name, level),
          members:party_members(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableParties(data || []);
    } catch (error) {
      console.error('Помилка завантаження партій:', error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadMyParty(), loadInvites(), loadAvailableParties()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadMyParty, loadInvites, loadAvailableParties]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !telegramId || !supabase) return;

    const channel = supabase
      .channel(`party-${telegramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_members',
        },
        () => loadMyParty()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'party_invites',
          filter: `invitee_id=eq.${telegramId}`,
        },
        () => loadInvites()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, telegramId, loadMyParty, loadInvites]);

  // Створити партію
  const createParty = async () => {
    if (!supabase || myParty) {
      showToast('Ви вже в партії', 'error');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('parties')
        .insert({
          leader_id: telegramId,
          name: `Партія ${player.name}`,
        })
        .select()
        .single();

      if (error) throw error;
      showToast('Партію створено', 'success');
      await loadMyParty();
    } catch (error) {
      console.error('Помилка створення партії:', error);
      showToast('Не вдалося створити партію', 'error');
    }
  };

  // Покинути партію
  const leaveParty = async () => {
    if (!myParty || !supabase) return;

    if (!window.confirm('Покинути партію?')) return;

    try {
      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', myParty.id)
        .eq('telegram_id', telegramId);

      if (error) throw error;
      showToast('Ви покинули партію', 'info');
      await loadMyParty();
    } catch (error) {
      console.error('Помилка виходу з партії:', error);
      showToast('Не вдалося покинути партію', 'error');
    }
  };

  // Пошук гравців для запрошення
  const handleSearch = async () => {
    if (!searchQuery.trim() || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('telegram_id, name, level, avatar_url')
        .neq('telegram_id', telegramId)
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Помилка пошуку:', error);
    }
  };

  // Запросити гравця
  const invitePlayer = async (playerId) => {
    if (!myParty || !supabase) return;

    try {
      const { error } = await supabase.from('party_invites').insert({
        party_id: myParty.id,
        inviter_id: telegramId,
        invitee_id: playerId,
      });

      if (error) throw error;
      showToast('Запрошення відправлено', 'success');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Помилка запрошення:', error);
      showToast('Не вдалося відправити запрошення', 'error');
    }
  };

  // Прийняти запрошення
  const acceptInvite = async (inviteId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('party_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (error) throw error;
      showToast('Запрошення прийнято', 'success');
      await loadMyParty();
      await loadInvites();
    } catch (error) {
      console.error('Помилка прийняття:', error);
      showToast('Не вдалося прийняти запрошення', 'error');
    }
  };

  // Відхилити запрошення
  const declineInvite = async (inviteId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('party_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;
      showToast('Запрошення відхилено', 'info');
      await loadInvites();
    } catch (error) {
      console.error('Помилка відхилення:', error);
    }
  };

  // Виганяти учасника (тільки лідер)
  const kickMember = async (memberId) => {
    if (!myParty || myParty.my_role !== 'leader' || !supabase) return;

    if (!window.confirm('Виганяти учасника?')) return;

    try {
      const { error } = await supabase
        .from('party_members')
        .delete()
        .eq('party_id', myParty.id)
        .eq('telegram_id', memberId);

      if (error) throw error;
      showToast('Учасника виганано', 'info');
      await loadMyParty();
    } catch (error) {
      console.error('Помилка вигнання:', error);
      showToast('Не вдалося виганяти учасника', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl border-2 border-blue-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-6 border-b-2 border-blue-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>👥</span>
            Система партій
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-blue-500">
          <button
            onClick={() => setActiveTab('my_party')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'my_party'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            👥 Моя партія
          </button>
          <button
            onClick={() => setActiveTab('invites')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors relative ${
              activeTab === 'invites'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📨 Запрошення ({invites.length})
            {invites.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {invites.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'find'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🔍 Знайти партію
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Моя партія */}
            {activeTab === 'my_party' && (
              <div>
                {!myParty ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-gray-400 mb-4">Ви не в партії</p>
                    <button
                      onClick={createParty}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors"
                    >
                      ➕ Створити партію
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Інформація про партію */}
                    <div className="bg-slate-800 rounded-lg p-6 border-2 border-blue-500 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white">{myParty.name}</h3>
                          <p className="text-sm text-gray-400">
                            Лідер: {myParty.leader.name} • Учасників: {partyMembers.length}/{myParty.max_members}
                          </p>
                        </div>
                        <button
                          onClick={leaveParty}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          🚪 Покинути
                        </button>
                      </div>

                      {/* Пошук гравців для запрошення (тільки для лідера) */}
                      {myParty.my_role === 'leader' && partyMembers.length < myParty.max_members && (
                        <div className="mb-4">
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                              placeholder="Запросити гравця..."
                              className="flex-1 px-4 py-2 bg-slate-700 border border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={handleSearch}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              🔍
                            </button>
                          </div>
                          {searchResults.length > 0 && (
                            <div className="space-y-2">
                              {searchResults.map((result) => (
                                <div
                                  key={result.telegram_id}
                                  className="flex items-center justify-between bg-slate-700 rounded-lg p-3"
                                >
                                  <span className="text-white">{result.name} (рівень {result.level})</span>
                                  <button
                                    onClick={() => invitePlayer(result.telegram_id)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                  >
                                    ➕ Запросити
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Учасники */}
                    <div className="space-y-3">
                      {partyMembers.map((member) => (
                        <div
                          key={member.telegram_id}
                          className="bg-slate-800 rounded-lg p-4 border border-blue-500/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                                {member.profile.avatar_url || '👤'}
                              </div>
                              <div>
                                <p className="font-bold text-white flex items-center gap-2">
                                  {member.profile.name}
                                  {member.role === 'leader' && <span className="text-yellow-400">👑</span>}
                                </p>
                                <p className="text-sm text-gray-400">
                                  Рівень {member.profile.level} • HP: {member.profile.health}/{member.profile.maxHealth}
                                </p>
                              </div>
                            </div>
                            {myParty.my_role === 'leader' && member.role !== 'leader' && (
                              <button
                                onClick={() => kickMember(member.telegram_id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                              >
                                🚫 Виганяти
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Запрошення */}
            {activeTab === 'invites' && (
              <div className="space-y-3">
                {invites.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">📭</p>
                    <p>Немає запрошень до партій</p>
                  </div>
                ) : (
                  invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="bg-slate-800 rounded-lg p-4 border border-blue-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">
                            Запрошення до партії: {invite.party.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            Від: {invite.inviter.name} (рівень {invite.inviter.level})
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptInvite(invite.id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            ✅ Прийняти
                          </button>
                          <button
                            onClick={() => declineInvite(invite.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          >
                            ❌ Відхилити
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Знайти партію */}
            {activeTab === 'find' && (
              <div className="space-y-3">
                {availableParties.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">🔍</p>
                    <p>Немає доступних партій</p>
                  </div>
                ) : (
                  availableParties.map((party) => (
                    <div
                      key={party.id}
                      className="bg-slate-800 rounded-lg p-4 border border-blue-500/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{party.name}</p>
                          <p className="text-sm text-gray-400">
                            Лідер: {party.leader.name} • Учасників: {party.members[0]?.count || 0}/{party.max_members}
                          </p>
                        </div>
                        <button
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          disabled
                        >
                          📨 Запит на вступ
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

