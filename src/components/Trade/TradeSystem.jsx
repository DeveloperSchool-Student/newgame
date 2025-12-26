import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { RESOURCES, WEAPONS, ARMOR, ACCESSORIES, CONSUMABLES } from '../../data/items';

export const TradeSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, removeItem, addItem, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('create'); // create, active, history
  const [activeTrades, setActiveTrades] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [myOffers, setMyOffers] = useState([]);
  const [myGoldOffer, setMyGoldOffer] = useState(0);
  const [partnerOffers, setPartnerOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Завантаження активних обмінів
  const loadActiveTrades = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          initiator:profiles!trades_initiator_id_fkey(telegram_id, name, level),
          partner:profiles!trades_partner_id_fkey(telegram_id, name, level)
        `)
        .or(`initiator_id.eq.${telegramId},partner_id.eq.${telegramId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveTrades(data || []);
    } catch (error) {
      console.error('Помилка завантаження обмінів:', error);
    }
  }, [telegramId]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await loadActiveTrades();
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadActiveTrades]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !telegramId || !supabase) return;

    const channel = supabase
      .channel(`trades-${telegramId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `initiator_id=eq.${telegramId}`,
        },
        () => loadActiveTrades()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `partner_id=eq.${telegramId}`,
        },
        () => loadActiveTrades()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, telegramId, loadActiveTrades]);

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

  // Створити обмін
  const createTrade = async (partnerId) => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          initiator_id: telegramId,
          partner_id: partnerId,
        })
        .select()
        .single();

      if (error) throw error;
      showToast('Обмін створено', 'success');
      setSelectedPartner(partnerId);
      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка створення обміну:', error);
      showToast('Не вдалося створити обмін', 'error');
    }
  };

  // Додати предмет до пропозиції
  const addItemToOffer = async (tradeId, itemId, quantity = 1) => {
    if (!supabase) return;

    const playerItem = player.inventory.find(i => i.id === itemId);
    if (!playerItem || playerItem.quantity < quantity) {
      showToast('Недостатньо предметів', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('trade_offers').insert({
        trade_id: tradeId,
        owner_id: telegramId,
        item_id: itemId,
        quantity: quantity,
      });

      if (error) throw error;
      showToast('Предмет додано', 'success');
      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка додавання предмета:', error);
      showToast('Не вдалося додати предмет', 'error');
    }
  };

  // Додати золото до пропозиції
  const addGoldToOffer = async (tradeId, amount) => {
    if (!supabase || amount <= 0 || amount > player.gold) return;

    try {
      const { error } = await supabase.from('trade_offers').insert({
        trade_id: tradeId,
        owner_id: telegramId,
        item_id: 'gold',
        gold_amount: amount,
      });

      if (error) throw error;
      showToast('Золото додано', 'success');
      setMyGoldOffer(0);
      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка додавання золота:', error);
      showToast('Не вдалося додати золото', 'error');
    }
  };

  // Підтвердити обмін
  const confirmTrade = async (tradeId, isInitiator) => {
    if (!supabase) return;

    try {
      const field = isInitiator ? 'initiator_confirmed' : 'partner_confirmed';
      const { error } = await supabase
        .from('trades')
        .update({ [field]: true })
        .eq('id', tradeId);

      if (error) throw error;

      // Перевіряємо чи обидві сторони підтвердили
      const { data: trade } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (trade && trade.initiator_confirmed && trade.partner_confirmed) {
        await completeTrade(tradeId);
      } else {
        showToast('Очікування підтвердження від партнера', 'info');
      }

      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка підтвердження:', error);
      showToast('Не вдалося підтвердити обмін', 'error');
    }
  };

  // Завершити обмін
  const completeTrade = async (tradeId) => {
    if (!supabase) return;

    try {
      // Отримуємо всі пропозиції
      const { data: offers, error: offersError } = await supabase
        .from('trade_offers')
        .select('*')
        .eq('trade_id', tradeId);

      if (offersError) throw offersError;

      // Обробляємо передачу предметів
      // (В реальному додатку це має бути транзакція на сервері)
      
      // Оновлюємо статус обміну
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', tradeId);

      if (updateError) throw updateError;

      showToast('Обмін успішно завершено!', 'success');
      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка завершення обміну:', error);
      showToast('Не вдалося завершити обмін', 'error');
    }
  };

  // Скасувати обмін
  const cancelTrade = async (tradeId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('trades')
        .update({ status: 'cancelled' })
        .eq('id', tradeId);

      if (error) throw error;
      showToast('Обмін скасовано', 'info');
      await loadActiveTrades();
    } catch (error) {
      console.error('Помилка скасування:', error);
    }
  };

  // Отримати інформацію про предмет
  const getItemInfo = (itemId) => {
    if (itemId === 'gold') return { name: 'Золото', icon: '🪙', rarity: 'common' };
    
    const allItems = {
      ...RESOURCES,
      ...Object.fromEntries(WEAPONS.map(w => [w.id, w])),
      ...Object.fromEntries(ARMOR.map(a => [a.id, a])),
      ...Object.fromEntries(ACCESSORIES.map(a => [a.id, a])),
      ...Object.fromEntries(CONSUMABLES.map(c => [c.id, c])),
    };
    return allItems[itemId] || { name: itemId, icon: '❓', rarity: 'common' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 rounded-xl border-2 border-green-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-6 border-b-2 border-green-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>💱</span>
            Система обміну
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-green-500">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            ➕ Створити обмін
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'active'
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🔄 Активні обміни ({activeTrades.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Створити обмін */}
            {activeTab === 'create' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3">🔍 Знайти гравця</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Введіть ім'я гравця..."
                      className="flex-1 px-4 py-2 bg-slate-800 border border-green-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Шукати
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={result.telegram_id}
                      className="bg-slate-800 rounded-lg p-4 border border-green-500/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                          {result.avatar_url || '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{result.name}</p>
                          <p className="text-sm text-gray-400">Рівень {result.level}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => createTrade(result.telegram_id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        💱 Запропонувати обмін
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Активні обміни */}
            {activeTab === 'active' && (
              <div className="space-y-4">
                {activeTrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">💱</p>
                    <p>Немає активних обмінів</p>
                  </div>
                ) : (
                  activeTrades.map((trade) => {
                    const isInitiator = trade.initiator_id === telegramId;
                    const partner = isInitiator ? trade.partner : trade.initiator;
                    const myConfirmed = isInitiator ? trade.initiator_confirmed : trade.partner_confirmed;
                    const partnerConfirmed = isInitiator ? trade.partner_confirmed : trade.initiator_confirmed;

                    return (
                      <div
                        key={trade.id}
                        className="bg-slate-800 rounded-lg p-6 border-2 border-green-500/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-white font-bold">
                              Обмін з: {partner.name} (рівень {partner.level})
                            </p>
                            <p className="text-sm text-gray-400">
                              Створено: {new Date(trade.created_at).toLocaleString('uk-UA')}
                            </p>
                          </div>
                          <button
                            onClick={() => cancelTrade(trade.id)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                          >
                            ❌ Скасувати
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-700 rounded-lg p-4">
                            <p className="text-white font-bold mb-2">
                              Ваша пропозиція {myConfirmed && '✅'}
                            </p>
                            {/* Тут має бути список пропозицій */}
                            <p className="text-gray-400 text-sm">Порожньо</p>
                          </div>
                          <div className="bg-slate-700 rounded-lg p-4">
                            <p className="text-white font-bold mb-2">
                              Пропозиція партнера {partnerConfirmed && '✅'}
                            </p>
                            <p className="text-gray-400 text-sm">Порожньо</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {!myConfirmed && (
                            <button
                              onClick={() => confirmTrade(trade.id, isInitiator)}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                              ✅ Підтвердити
                            </button>
                          )}
                          {myConfirmed && !partnerConfirmed && (
                            <p className="flex-1 text-center text-yellow-400 py-2">
                              ⏳ Очікування партнера...
                            </p>
                          )}
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

