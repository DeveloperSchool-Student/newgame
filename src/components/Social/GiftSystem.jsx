import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { RESOURCES, WEAPONS, ARMOR, ACCESSORIES, CONSUMABLES } from '../../data/items';

// Спеціальні подарункові предмети
export const GIFT_ITEMS = {
  rose: { id: 'rose', name: 'Троянда', icon: '🌹', type: 'gift', rarity: 'common', basePrice: 50 },
  bouquet: { id: 'bouquet', name: 'Букет квітів', icon: '💐', type: 'gift', rarity: 'uncommon', basePrice: 150 },
  chocolate: { id: 'chocolate', name: 'Шоколад', icon: '🍫', type: 'gift', rarity: 'common', basePrice: 75 },
  cake: { id: 'cake', name: 'Торт', icon: '🎂', type: 'gift', rarity: 'uncommon', basePrice: 200 },
  gift_box: { id: 'gift_box', name: 'Подарункова коробка', icon: '🎁', type: 'gift', rarity: 'combat', basePrice: 300 },
  teddy_bear: { id: 'teddy_bear', name: 'Плюшевий ведмідь', icon: '🧸', type: 'gift', rarity: 'uncommon', basePrice: 250 },
  ring: { id: 'ring', name: 'Кільце', icon: '💍', type: 'gift', rarity: 'epic', basePrice: 1000 },
  crown: { id: 'crown', name: 'Корона', icon: '👑', type: 'gift', rarity: 'legendary', basePrice: 5000 },
  trophy: { id: 'trophy', name: 'Трофей', icon: '🏆', type: 'gift', rarity: 'epic', basePrice: 800 },
  medal: { id: 'medal', name: 'Медаль', icon: '🏅', type: 'gift', rarity: 'combat', basePrice: 500 },
};

export const GiftSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, removeItem, addItem, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('send'); // send, received, history
  const [receivedGifts, setReceivedGifts] = useState([]);
  const [giftHistory, setGiftHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [giftMessage, setGiftMessage] = useState('');

  // Завантаження отриманих подарунків
  const loadReceivedGifts = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          sender:profiles!gifts_sender_id_fkey(telegram_id, name, level, avatar_url)
        `)
        .eq('receiver_id', telegramId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReceivedGifts(data || []);
    } catch (error) {
      console.error('Помилка завантаження подарунків:', error);
    }
  }, [telegramId]);

  // Завантаження історії
  const loadGiftHistory = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('gifts')
        .select(`
          *,
          sender:profiles!gifts_sender_id_fkey(telegram_id, name, level),
          receiver:profiles!gifts_receiver_id_fkey(telegram_id, name, level)
        `)
        .or(`sender_id.eq.${telegramId},receiver_id.eq.${telegramId}`)
        .in('status', ['accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setGiftHistory(data || []);
    } catch (error) {
      console.error('Помилка завантаження історії:', error);
    }
  }, [telegramId]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadReceivedGifts(), loadGiftHistory()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadReceivedGifts, loadGiftHistory]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !telegramId || !supabase) return;

    const channel = supabase
      .channel(`gifts-${telegramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gifts',
          filter: `receiver_id=eq.${telegramId}`,
        },
        () => {
          loadReceivedGifts();
          loadGiftHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, telegramId, loadReceivedGifts, loadGiftHistory]);

  // Пошук гравців
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

  // Відправити подарунок
  const sendGift = async () => {
    if (!selectedRecipient || !selectedItem || !supabase) {
      showToast('Виберіть отримувача та предмет', 'error');
      return;
    }

    // Перевіряємо наявність предмета
    const playerItem = player.inventory.find(i => i.id === selectedItem);
    if (!playerItem || playerItem.quantity < 1) {
      showToast('У вас немає цього предмета', 'error');
      return;
    }

    try {
      // Видаляємо предмет з інвентаря
      removeItem(selectedItem, 1);

      // Створюємо подарунок
      const { error } = await supabase.from('gifts').insert({
        sender_id: telegramId,
        receiver_id: selectedRecipient,
        item_id: selectedItem,
        message: giftMessage || null,
      });

      if (error) throw error;

      showToast('Подарунок відправлено!', 'success');
      setSelectedRecipient(null);
      setSelectedItem(null);
      setGiftMessage('');
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Помилка відправки подарунка:', error);
      showToast('Не вдалося відправити подарунок', 'error');
      // Повертаємо предмет назад
      addItem(selectedItem, 1);
    }
  };

  // Прийняти подарунок
  const acceptGift = async (giftId, itemId) => {
    if (!supabase) return;

    try {
      // Оновлюємо статус
      const { error: updateError } = await supabase
        .from('gifts')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', giftId);

      if (updateError) throw updateError;

      // Додаємо предмет в інвентар
      addItem(itemId, 1);

      showToast('Подарунок прийнято!', 'success');
      await loadReceivedGifts();
    } catch (error) {
      console.error('Помилка прийняття подарунка:', error);
      showToast('Не вдалося прийняти подарунок', 'error');
    }
  };

  // Відхилити подарунок
  const rejectGift = async (giftId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('gifts')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', giftId);

      if (error) throw error;
      showToast('Подарунок відхилено', 'info');
      await loadReceivedGifts();
    } catch (error) {
      console.error('Помилка відхилення подарунка:', error);
    }
  };

  // Отримати інформацію про предмет
  const getItemInfo = (itemId) => {
    if (GIFT_ITEMS[itemId]) return GIFT_ITEMS[itemId];
    
    const allItems = {
      ...RESOURCES,
      ...Object.fromEntries(WEAPONS.map(w => [w.id, w])),
      ...Object.fromEntries(ARMOR.map(a => [a.id, a])),
      ...Object.fromEntries(ACCESSORIES.map(a => [a.id, a])),
      ...Object.fromEntries(CONSUMABLES.map(c => [c.id, c])),
    };
    return allItems[itemId] || { name: itemId, icon: '❓', rarity: 'common' };
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-500',
      uncommon: 'border-green-500',
      combat: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-yellow-500',
      mythic: 'border-orange-500',
      divine: 'border-white',
    };
    return colors[rarity] || colors.common;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 rounded-xl border-2 border-pink-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 p-6 border-b-2 border-pink-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>🎁</span>
            Система подарунків
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-pink-500">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'send'
                ? 'bg-pink-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📤 Відправити
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors relative ${
              activeTab === 'received'
                ? 'bg-pink-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📥 Отримані ({receivedGifts.length})
            {receivedGifts.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {receivedGifts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-pink-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📜 Історія
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Відправити подарунок */}
            {activeTab === 'send' && (
              <div>
                {/* Пошук отримувача */}
                {!selectedRecipient && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-3">🔍 Виберіть отримувача</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Введіть ім'я гравця..."
                        className="flex-1 px-4 py-2 bg-slate-800 border border-pink-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                      />
                      <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        Шукати
                      </button>
                    </div>
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.telegram_id}
                          onClick={() => setSelectedRecipient(result.telegram_id)}
                          className="bg-slate-800 rounded-lg p-4 border border-pink-500/30 hover:border-pink-500 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl">
                              {result.avatar_url || '👤'}
                            </div>
                            <div>
                              <p className="font-bold text-white">{result.name}</p>
                              <p className="text-sm text-gray-400">Рівень {result.level}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Вибір предмета */}
                {selectedRecipient && !selectedItem && (
                  <div>
                    <button
                      onClick={() => setSelectedRecipient(null)}
                      className="mb-4 text-pink-400 hover:text-pink-300"
                    >
                      ← Назад до вибору отримувача
                    </button>
                    <h3 className="text-xl font-bold text-white mb-3">🎁 Виберіть подарунок</h3>
                    
                    {/* Спеціальні подарунки */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-2">Спеціальні подарунки (можна купити в магазині):</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {Object.values(GIFT_ITEMS).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={`bg-slate-800 rounded-lg p-3 border-2 cursor-pointer hover:scale-105 transition-transform ${getRarityColor(item.rarity)}`}
                          >
                            <div className="text-3xl text-center mb-1">{item.icon}</div>
                            <p className="text-xs text-white text-center truncate">{item.name}</p>
                            <p className="text-xs text-yellow-400 text-center">{item.basePrice} 🪙</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Предмети з інвентаря */}
                    <div>
                      <p className="text-sm text-gray-400 mb-2">З вашого інвентаря:</p>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {player.inventory.filter(i => i.quantity > 0).map((item) => {
                          const itemInfo = getItemInfo(item.id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem(item.id)}
                              className={`bg-slate-800 rounded-lg p-3 border-2 cursor-pointer hover:scale-105 transition-transform ${getRarityColor(itemInfo.rarity)}`}
                            >
                              <div className="text-3xl text-center mb-1">{itemInfo.icon}</div>
                              <p className="text-xs text-white text-center truncate">{itemInfo.name}</p>
                              <p className="text-xs text-gray-400 text-center">x{item.quantity}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Підтвердження відправки */}
                {selectedRecipient && selectedItem && (
                  <div className="bg-slate-800 rounded-lg p-6 border-2 border-pink-500">
                    <h3 className="text-xl font-bold text-white mb-4">✉️ Підтвердження відправки</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Подарунок:</p>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{getItemInfo(selectedItem).icon}</span>
                          <span className="text-white font-bold">{getItemInfo(selectedItem).name}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Повідомлення (опціонально):</label>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Додайте особисте повідомлення..."
                          rows="3"
                          className="w-full px-4 py-2 bg-slate-700 border border-pink-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={sendGift}
                          className="flex-1 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold transition-colors"
                        >
                          🎁 Відправити подарунок
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(null);
                            setGiftMessage('');
                          }}
                          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Отримані подарунки */}
            {activeTab === 'received' && (
              <div className="space-y-4">
                {receivedGifts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">📭</p>
                    <p>Немає нових подарунків</p>
                  </div>
                ) : (
                  receivedGifts.map((gift) => {
                    const itemInfo = getItemInfo(gift.item_id);
                    return (
                      <div
                        key={gift.id}
                        className="bg-slate-800 rounded-lg p-6 border-2 border-pink-500/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-5xl">{itemInfo.icon}</div>
                            <div>
                              <p className="font-bold text-white text-lg">{itemInfo.name}</p>
                              <p className="text-sm text-gray-400">
                                Від: {gift.sender.name} (рівень {gift.sender.level})
                              </p>
                            </div>
                          </div>
                        </div>
                        {gift.message && (
                          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                            <p className="text-sm text-gray-300 italic">"{gift.message}"</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptGift(gift.id, gift.item_id)}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            ✅ Прийняти
                          </button>
                          <button
                            onClick={() => rejectGift(gift.id)}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            ❌ Відхилити
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Історія */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {giftHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">📜</p>
                    <p>Історія порожня</p>
                  </div>
                ) : (
                  giftHistory.map((gift) => {
                    const itemInfo = getItemInfo(gift.item_id);
                    const isSent = gift.sender_id === telegramId;
                    const otherUser = isSent ? gift.receiver : gift.sender;
                    return (
                      <div
                        key={gift.id}
                        className="bg-slate-800 rounded-lg p-4 border border-pink-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{itemInfo.icon}</span>
                            <div>
                              <p className="text-white font-semibold">
                                {isSent ? '📤 Відправлено' : '📥 Отримано'}: {itemInfo.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {isSent ? 'Кому' : 'Від'}: {otherUser.name}
                              </p>
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            gift.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {gift.status === 'accepted' ? '✅ Прийнято' : '❌ Відхилено'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

