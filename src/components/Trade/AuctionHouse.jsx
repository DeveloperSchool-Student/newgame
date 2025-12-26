import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { RESOURCES, WEAPONS, ARMOR, ACCESSORIES, CONSUMABLES } from '../../data/items';

export const AuctionHouse = ({ isOpen, onClose, telegramId }) => {
  const { player, removeItem, addItem, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('browse'); // browse, my_listings, create
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [bidAmount, setBidAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Створення нового лоту
  const [newListing, setNewListing] = useState({
    itemId: '',
    quantity: 1,
    startingPrice: 100,
    buyoutPrice: null,
    duration: 24, // години
  });

  // Завантаження активних лотів
  const loadListings = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('auction_listings')
        .select(`
          *,
          seller:profiles!auction_listings_seller_id_fkey(telegram_id, name, level)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Помилка завантаження лотів:', error);
    }
  }, []);

  // Завантаження моїх лотів
  const loadMyListings = useCallback(async () => {
    if (!telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('auction_listings')
        .select('*')
        .eq('seller_id', telegramId)
        .in('status', ['active', 'sold', 'expired'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMyListings(data || []);
    } catch (error) {
      console.error('Помилка завантаження моїх лотів:', error);
    }
  }, [telegramId]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadListings(), loadMyListings()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadListings, loadMyListings]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !supabase) return;

    const channel = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auction_listings',
        },
        () => {
          loadListings();
          loadMyListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, loadListings, loadMyListings]);

  // Створити лот
  const createListing = async () => {
    if (!newListing.itemId || !supabase) {
      showToast('Виберіть предмет', 'error');
      return;
    }

    const playerItem = player.inventory.find(i => i.id === newListing.itemId);
    if (!playerItem || playerItem.quantity < newListing.quantity) {
      showToast('Недостатньо предметів', 'error');
      return;
    }

    try {
      // Видаляємо предмет з інвентаря
      removeItem(newListing.itemId, newListing.quantity);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + newListing.duration);

      const { error } = await supabase.from('auction_listings').insert({
        seller_id: telegramId,
        item_id: newListing.itemId,
        quantity: newListing.quantity,
        starting_price: newListing.startingPrice,
        current_price: newListing.startingPrice,
        buyout_price: newListing.buyoutPrice || null,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      showToast('Лот створено', 'success');
      setNewListing({
        itemId: '',
        quantity: 1,
        startingPrice: 100,
        buyoutPrice: null,
        duration: 24,
      });
      await loadMyListings();
      setActiveTab('my_listings');
    } catch (error) {
      console.error('Помилка створення лоту:', error);
      showToast('Не вдалося створити лот', 'error');
      // Повертаємо предмет назад
      addItem(newListing.itemId, newListing.quantity);
    }
  };

  // Зробити ставку
  const placeBid = async (listingId, amount) => {
    if (!supabase || amount <= 0) return;

    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;

    if (amount <= listing.current_price) {
      showToast('Ставка має бути вищою за поточну ціну', 'error');
      return;
    }

    if (amount > player.gold) {
      showToast('Недостатньо золота', 'error');
      return;
    }

    try {
      const { error } = await supabase.from('auction_bids').insert({
        listing_id: listingId,
        bidder_id: telegramId,
        bid_amount: amount,
      });

      if (error) throw error;

      showToast('Ставку зроблено', 'success');
      setBidAmount(0);
      setSelectedListing(null);
      await loadListings();
    } catch (error) {
      console.error('Помилка ставки:', error);
      showToast(error.message || 'Не вдалося зробити ставку', 'error');
    }
  };

  // Викупити негайно
  const buyout = async (listingId) => {
    if (!supabase) return;

    const listing = listings.find(l => l.id === listingId);
    if (!listing || !listing.buyout_price) return;

    if (listing.buyout_price > player.gold) {
      showToast('Недостатньо золота', 'error');
      return;
    }

    try {
      // Оновлюємо статус лоту
      const { error: updateError } = await supabase
        .from('auction_listings')
        .update({ 
          status: 'sold', 
          ended_at: new Date().toISOString(),
          current_price: listing.buyout_price 
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Віднімаємо золото
      addGold(-listing.buyout_price);

      // Додаємо предмет
      addItem(listing.item_id, listing.quantity);

      // Комісія 5%
      const commission = Math.floor(listing.buyout_price * 0.05);
      const sellerAmount = listing.buyout_price - commission;

      showToast(`Предмет куплено за ${listing.buyout_price} золота`, 'success');
      await loadListings();
    } catch (error) {
      console.error('Помилка викупу:', error);
      showToast('Не вдалося викупити предмет', 'error');
    }
  };

  // Скасувати лот
  const cancelListing = async (listingId) => {
    if (!supabase) return;

    const listing = myListings.find(l => l.id === listingId);
    if (!listing || listing.status !== 'active') return;

    try {
      const { error } = await supabase
        .from('auction_listings')
        .update({ status: 'cancelled', ended_at: new Date().toISOString() })
        .eq('id', listingId);

      if (error) throw error;

      // Повертаємо предмет
      addItem(listing.item_id, listing.quantity);

      showToast('Лот скасовано, предмет повернуто', 'success');
      await loadMyListings();
    } catch (error) {
      console.error('Помилка скасування:', error);
      showToast('Не вдалося скасувати лот', 'error');
    }
  };

  // Отримати інформацію про предмет
  const getItemInfo = (itemId) => {
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

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Завершено';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}г ${minutes}хв`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-yellow-900 to-slate-900 rounded-xl border-2 border-yellow-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-yellow-600 to-orange-600 p-6 border-b-2 border-yellow-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>🏛️</span>
            Аукціонний дім
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex bg-slate-800 border-b border-yellow-500">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'browse'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            🔍 Огляд лотів
          </button>
          <button
            onClick={() => setActiveTab('my_listings')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'my_listings'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            📦 Мої лоти
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'create'
                ? 'bg-yellow-600 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            ➕ Створити лот
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Огляд лотів */}
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">🏛️</p>
                    <p>Немає активних лотів</p>
                  </div>
                ) : (
                  listings.map((listing) => {
                    const itemInfo = getItemInfo(listing.item_id);
                    return (
                      <div
                        key={listing.id}
                        className={`bg-slate-800 rounded-lg p-4 border-2 ${getRarityColor(itemInfo.rarity)}`}
                      >
                        <div className="text-center mb-3">
                          <div className="text-5xl mb-2">{itemInfo.icon}</div>
                          <p className="font-bold text-white">{itemInfo.name}</p>
                          <p className="text-sm text-gray-400">x{listing.quantity}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-white">
                            <span>Поточна ціна:</span>
                            <span className="font-bold text-yellow-400">{listing.current_price} 🪙</span>
                          </div>
                          {listing.buyout_price && (
                            <div className="flex justify-between text-white">
                              <span>Викуп:</span>
                              <span className="font-bold text-green-400">{listing.buyout_price} 🪙</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-400">
                            <span>Продавець:</span>
                            <span>{listing.seller.name}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Залишилось:</span>
                            <span>{getTimeRemaining(listing.expires_at)}</span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {listing.buyout_price && (
                            <button
                              onClick={() => buyout(listing.id)}
                              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                            >
                              💰 Викупити за {listing.buyout_price} 🪙
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedListing(listing);
                              setBidAmount(listing.current_price + 10);
                            }}
                            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            📈 Зробити ставку
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Мої лоти */}
            {activeTab === 'my_listings' && (
              <div className="space-y-4">
                {myListings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-xl mb-2">📦</p>
                    <p>У вас немає лотів</p>
                  </div>
                ) : (
                  myListings.map((listing) => {
                    const itemInfo = getItemInfo(listing.item_id);
                    return (
                      <div
                        key={listing.id}
                        className="bg-slate-800 rounded-lg p-4 border border-yellow-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{itemInfo.icon}</div>
                            <div>
                              <p className="font-bold text-white">{itemInfo.name} x{listing.quantity}</p>
                              <p className="text-sm text-gray-400">
                                Поточна ціна: <span className="text-yellow-400">{listing.current_price} 🪙</span>
                              </p>
                              <p className="text-xs text-gray-500">
                                Статус: {listing.status === 'active' ? '🟢 Активний' : listing.status === 'sold' ? '✅ Продано' : '❌ Завершено'}
                              </p>
                            </div>
                          </div>
                          {listing.status === 'active' && (
                            <button
                              onClick={() => cancelListing(listing.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              ❌ Скасувати
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Створити лот */}
            {activeTab === 'create' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-slate-800 rounded-lg p-6 border-2 border-yellow-500">
                  <h3 className="text-xl font-bold text-white mb-4">Створити новий лот</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Предмет</label>
                      <select
                        value={newListing.itemId}
                        onChange={(e) => setNewListing({ ...newListing, itemId: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
                      >
                        <option value="">Виберіть предмет...</option>
                        {player.inventory.filter(i => i.quantity > 0).map((item) => {
                          const info = getItemInfo(item.id);
                          return (
                            <option key={item.id} value={item.id}>
                              {info.icon} {info.name} (x{item.quantity})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Кількість</label>
                      <input
                        type="number"
                        min="1"
                        value={newListing.quantity}
                        onChange={(e) => setNewListing({ ...newListing, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Стартова ціна (золото)</label>
                      <input
                        type="number"
                        min="1"
                        value={newListing.startingPrice}
                        onChange={(e) => setNewListing({ ...newListing, startingPrice: parseInt(e.target.value) || 100 })}
                        className="w-full px-4 py-2 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Ціна викупу (опціонально)</label>
                      <input
                        type="number"
                        min="0"
                        value={newListing.buyoutPrice || ''}
                        onChange={(e) => setNewListing({ ...newListing, buyoutPrice: parseInt(e.target.value) || null })}
                        placeholder="Залиште порожнім для відсутності"
                        className="w-full px-4 py-2 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Тривалість (годин)</label>
                      <select
                        value={newListing.duration}
                        onChange={(e) => setNewListing({ ...newListing, duration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
                      >
                        <option value={12}>12 годин</option>
                        <option value={24}>24 години</option>
                        <option value={48}>48 годин</option>
                        <option value={72}>72 години</option>
                      </select>
                    </div>

                    <button
                      onClick={createListing}
                      className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-lg transition-colors"
                    >
                      🏛️ Створити лот
                    </button>

                    <p className="text-sm text-gray-400 text-center">
                      Комісія аукціону: 5% від ціни продажу
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Модальне вікно ставки */}
        {selectedListing && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border-2 border-yellow-500">
              <h3 className="text-xl font-bold text-white mb-4">Зробити ставку</h3>
              <p className="text-gray-300 mb-4">
                Поточна ціна: <span className="text-yellow-400 font-bold">{selectedListing.current_price} 🪙</span>
              </p>
              <input
                type="number"
                min={selectedListing.current_price + 1}
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 mb-4 bg-slate-700 border border-yellow-500/50 rounded-lg text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => placeBid(selectedListing.id, bidAmount)}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ✅ Підтвердити
                </button>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  ❌ Скасувати
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

