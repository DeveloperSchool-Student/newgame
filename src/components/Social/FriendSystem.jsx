import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';

export const FriendSystem = ({ isOpen, onClose, telegramId, onOpenMessaging }) => {
  const { player } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search, blocked
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [onlineStatuses, setOnlineStatuses] = useState({});

  // Завантаження друзів
  const loadFriends = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      // Завантажуємо прийняті дружби
      const { data: friendshipsData, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:profiles!friendships_user_id_fkey(telegram_id, name, level, avatar_url, kingdom, rank),
          friend:profiles!friendships_friend_id_fkey(telegram_id, name, level, avatar_url, kingdom, rank)
        `)
        .or(`user_id.eq.${telegramId},friend_id.eq.${telegramId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      const friendsList = friendshipsData?.map(f => {
        const isFriend = f.user_id === telegramId;
        return isFriend ? f.friend : f.user;
      }) || [];

      setFriends(friendsList);

      // Завантажуємо онлайн статуси друзів
      if (friendsList.length > 0) {
        const friendIds = friendsList.map(f => f.telegram_id);
        const { data: onlineData } = await supabase
          .from('online_players')
          .select('telegram_id, last_seen')
          .in('telegram_id', friendIds);

        const statuses = {};
        onlineData?.forEach(op => {
          const lastSeen = new Date(op.last_seen);
          const now = new Date();
          const diffMinutes = (now - lastSeen) / (1000 * 60);
          statuses[op.telegram_id] = diffMinutes < 5 ? 'online' : 'offline';
        });
        setOnlineStatuses(statuses);
      }
    } catch (error) {
      console.error('Помилка завантаження друзів:', error);
    }
  }, [telegramId]);

  // Завантаження запитів на дружбу
  const loadRequests = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user:profiles!friendships_user_id_fkey(telegram_id, name, level, avatar_url, kingdom, rank)
        `)
        .eq('friend_id', telegramId)
        .eq('status', 'pending');

      if (error) throw error;
      setRequests(data?.map(r => r.user) || []);
    } catch (error) {
      console.error('Помилка завантаження запитів:', error);
    }
  }, [telegramId]);

  // Завантаження заблокованих
  const loadBlocked = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:profiles!friendships_friend_id_fkey(telegram_id, name, level, avatar_url, kingdom, rank)
        `)
        .eq('user_id', telegramId)
        .eq('status', 'blocked');

      if (error) throw error;
      setBlocked(data?.map(b => b.friend) || []);
    } catch (error) {
      console.error('Помилка завантаження заблокованих:', error);
    }
  }, [telegramId]);

  // Початкове завантаження
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadFriends(), loadRequests(), loadBlocked()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadFriends, loadRequests, loadBlocked]);

  // Realtime підписка на оновлення
  useEffect(() => {
    if (!isOpen || !telegramId || !supabase) return;

    const channel = supabase
      .channel(`friendships-${telegramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `user_id=eq.${telegramId}`,
        },
        () => {
          loadFriends();
          loadRequests();
          loadBlocked();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `friend_id=eq.${telegramId}`,
        },
        () => {
          loadFriends();
          loadRequests();
          loadBlocked();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, telegramId, loadFriends, loadRequests, loadBlocked]);

  // Пошук гравців
  const handleSearch = async () => {
    if (!searchQuery.trim() || !supabase) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('telegram_id, name, level, avatar_url, kingdom, rank')
        .neq('telegram_id', telegramId)
        .ilike('name', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;

      // Фільтруємо результати, виключаючи існуючих друзів та запити
      const existingIds = [
        ...friends.map(f => f.telegram_id),
        ...requests.map(r => r.telegram_id),
      ];
      const filtered = data?.filter(p => !existingIds.includes(p.telegram_id)) || [];
      setSearchResults(filtered);
    } catch (error) {
      console.error('Помилка пошуку:', error);
      showToast('Помилка пошуку гравців', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Відправити запит на дружбу
  const sendFriendRequest = async (friendId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: telegramId,
          friend_id: friendId,
          status: 'pending',
        });

      if (error) throw error;
      showToast('Запит на дружбу відправлено', 'success');
      setSearchResults(prev => prev.filter(p => p.telegram_id !== friendId));
    } catch (error) {
      console.error('Помилка відправки запиту:', error);
      showToast('Не вдалося відправити запит', 'error');
    }
  };

  // Прийняти запит на дружбу
  const acceptRequest = async (userId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('user_id', userId)
        .eq('friend_id', telegramId);

      if (error) throw error;
      showToast('Запит прийнято', 'success');
      await loadFriends();
      await loadRequests();
    } catch (error) {
      console.error('Помилка прийняття запиту:', error);
      showToast('Не вдалося прийняти запит', 'error');
    }
  };

  // Відхилити запит на дружбу
  const rejectRequest = async (userId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', telegramId);

      if (error) throw error;
      showToast('Запит відхилено', 'success');
      await loadRequests();
    } catch (error) {
      console.error('Помилка відхилення запиту:', error);
    }
  };

  // Видалити друга
  const removeFriend = async (friendId) => {
    if (!supabase || !window.confirm('Видалити друга?')) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${telegramId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${telegramId})`);

      if (error) throw error;
      showToast('Друга видалено', 'success');
      await loadFriends();
    } catch (error) {
      console.error('Помилка видалення друга:', error);
      showToast('Не вдалося видалити друга', 'error');
    }
  };

  // Заблокувати гравця
  const blockPlayer = async (playerId) => {
    if (!supabase) return;

    try {
      // Видаляємо існуючу дружбу якщо є
      await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${telegramId},friend_id.eq.${playerId}),and(user_id.eq.${playerId},friend_id.eq.${telegramId})`);

      // Додаємо блокування
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: telegramId,
          friend_id: playerId,
          status: 'blocked',
        });

      if (error) throw error;
      showToast('Гравця заблоковано', 'success');
      await loadBlocked();
      await loadFriends();
    } catch (error) {
      console.error('Помилка блокування:', error);
      showToast('Не вдалося заблокувати гравця', 'error');
    }
  };

  // Розблокувати гравця
  const unblockPlayer = async (playerId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', telegramId)
        .eq('friend_id', playerId)
        .eq('status', 'blocked');

      if (error) throw error;
      showToast('Гравця розблоковано', 'success');
      await loadBlocked();
    } catch (error) {
      console.error('Помилка розблокування:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl border-2 border-purple-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6 border-b-2 border-purple-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>🤝</span>
            Друзі та соціальні зв'язки
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-purple-500">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'friends'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            👥 Друзі ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📨 Запити ({requests.length})
            {requests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'search'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🔍 Пошук
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'blocked'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🚫 Заблоковані ({blocked.length})
          </button>
        </div>

        {/* Контент */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Вкладка друзів */}
              {activeTab === 'friends' && (
                <div className="space-y-3">
                  {friends.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xl mb-2">😔</p>
                      <p>У вас ще немає друзів</p>
                      <p className="text-sm mt-2">Скористайтеся пошуком, щоб знайти друзів!</p>
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.telegram_id}
                        className="bg-slate-800 rounded-lg p-4 border border-purple-500/30 hover:border-purple-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                                {friend.avatar_url || '👤'}
                              </div>
                              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${
                                onlineStatuses[friend.telegram_id] === 'online' ? 'bg-green-500' : 'bg-gray-500'
                              }`} />
                            </div>
                            <div>
                              <p className="font-bold text-white flex items-center gap-2">
                                {friend.name}
                                <span className={`text-xs ${
                                  onlineStatuses[friend.telegram_id] === 'online' 
                                    ? 'text-green-400' 
                                    : 'text-gray-400'
                                }`}>
                                  {onlineStatuses[friend.telegram_id] === 'online' ? '🟢 онлайн' : '🔴 офлайн'}
                                </span>
                              </p>
                              <p className="text-sm text-gray-400">
                                Рівень {friend.level} • {friend.kingdom} • {friend.rank}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onOpenMessaging && onOpenMessaging(friend.telegram_id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                            >
                              💬 ЛС
                            </button>
                            <button
                              onClick={() => blockPlayer(friend.telegram_id)}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                            >
                              🚫
                            </button>
                            <button
                              onClick={() => removeFriend(friend.telegram_id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Вкладка запитів */}
              {activeTab === 'requests' && (
                <div className="space-y-3">
                  {requests.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xl mb-2">📭</p>
                      <p>Немає нових запитів на дружбу</p>
                    </div>
                  ) : (
                    requests.map((request) => (
                      <div
                        key={request.telegram_id}
                        className="bg-slate-800 rounded-lg p-4 border border-purple-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                              {request.avatar_url || '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white">{request.name}</p>
                              <p className="text-sm text-gray-400">
                                Рівень {request.level} • {request.kingdom}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => acceptRequest(request.telegram_id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              ✅ Прийняти
                            </button>
                            <button
                              onClick={() => rejectRequest(request.telegram_id)}
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

              {/* Вкладка пошуку */}
              {activeTab === 'search' && (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Введіть ім'я гравця..."
                      className="flex-1 px-4 py-2 bg-slate-800 border border-purple-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      {isSearching ? '⏳' : '🔍'} Шукати
                    </button>
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <div
                        key={result.telegram_id}
                        className="bg-slate-800 rounded-lg p-4 border border-purple-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                              {result.avatar_url || '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white">{result.name}</p>
                              <p className="text-sm text-gray-400">
                                Рівень {result.level} • {result.kingdom}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => sendFriendRequest(result.telegram_id)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          >
                            ➕ Додати у друзі
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Вкладка заблокованих */}
              {activeTab === 'blocked' && (
                <div className="space-y-3">
                  {blocked.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-xl mb-2">✅</p>
                      <p>Немає заблокованих гравців</p>
                    </div>
                  ) : (
                    blocked.map((blockedPlayer) => (
                      <div
                        key={blockedPlayer.telegram_id}
                        className="bg-slate-800 rounded-lg p-4 border border-red-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl">
                              {blockedPlayer.avatar_url || '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white">{blockedPlayer.name}</p>
                              <p className="text-sm text-gray-400">
                                Рівень {blockedPlayer.level}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => unblockPlayer(blockedPlayer.telegram_id)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            ✅ Розблокувати
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

