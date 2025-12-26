import { useState, useEffect, useCallback } from 'react';
import { useClanContext } from '../../contexts/ClanContext';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../UI/Toast';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { RESOURCES, WEAPONS, ARMOR, ACCESSORIES, CONSUMABLES } from '../../data/items';

export const ClanStorage = ({ isOpen, onClose, telegramId }) => {
  const { clan } = useClanContext();
  const { player, removeItem } = usePlayerContext();
  const { showToast } = useToast();
  const [storageItems, setStorageItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState(1);
  const [userRole, setUserRole] = useState('member');

  // Завантаження складу клану
  const loadStorage = useCallback(async () => {
    if (!clan?.id || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('clan_storage')
        .select('*, donated_by, donated_at')
        .eq('clan_id', clan.id)
        .order('donated_at', { ascending: false });

      if (error) throw error;
      setStorageItems(data || []);
    } catch (error) {
      console.error('Помилка завантаження складу:', error);
    }
  }, [clan?.id]);

  // Завантаження ролі користувача
  const loadUserRole = useCallback(async () => {
    if (!clan?.id || !telegramId || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('clan_roles')
        .select('role')
        .eq('clan_id', clan.id)
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserRole(data?.role || 'member');
    } catch (error) {
      console.error('Помилка завантаження ролі:', error);
    }
  }, [clan?.id, telegramId]);

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadStorage(), loadUserRole()]);
      setIsLoading(false);
    };

    loadData();
  }, [isOpen, loadStorage, loadUserRole]);

  // Realtime підписка
  useEffect(() => {
    if (!isOpen || !clan?.id || !supabase) return;

    const channel = supabase
      .channel(`clan-storage-${clan.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clan_storage',
          filter: `clan_id=eq.${clan.id}`,
        },
        () => {
          loadStorage();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, clan?.id, loadStorage]);

  // Донат предмета в склад
  const donateItem = async (itemId, quantity = 1) => {
    if (!clan?.id || !supabase) return;

    // Перевірка наявності предмета в інвентарі
    const playerItem = player.inventory.find(i => i.id === itemId);
    if (!playerItem || playerItem.quantity < quantity) {
      showToast('Недостатньо предметів', 'error');
      return;
    }

    try {
      // Видаляємо з інвентаря гравця
      removeItem(itemId, quantity);

      // Перевіряємо чи є вже такий предмет у складі
      const { data: existing } = await supabase
        .from('clan_storage')
        .select('*')
        .eq('clan_id', clan.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        // Оновлюємо кількість
        const { error } = await supabase
          .from('clan_storage')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Додаємо новий предмет
        const { error } = await supabase
          .from('clan_storage')
          .insert({
            clan_id: clan.id,
            item_id: itemId,
            quantity: quantity,
            donated_by: telegramId,
          });

        if (error) throw error;
      }

      // Логуємо активність
      await supabase.from('clan_activity_log').insert({
        clan_id: clan.id,
        actor_id: telegramId,
        action_type: 'donate',
        details: { item_id: itemId, quantity: quantity },
      });

      showToast('Предмет додано до складу клану', 'success');
      await loadStorage();
    } catch (error) {
      console.error('Помилка донату:', error);
      showToast('Не вдалося додати предмет', 'error');
    }
  };

  // Взяти предмет зі складу (тільки лідер та офіцери)
  const withdrawItem = async (storageId, itemId, quantity) => {
    if (!['leader', 'officer'].includes(userRole)) {
      showToast('Тільки лідер та офіцери можуть брати предмети', 'error');
      return;
    }

    if (!supabase) return;

    try {
      const storageItem = storageItems.find(i => i.id === storageId);
      if (!storageItem || storageItem.quantity < quantity) {
        showToast('Недостатньо предметів у складі', 'error');
        return;
      }

      // Оновлюємо кількість або видаляємо
      if (storageItem.quantity === quantity) {
        const { error } = await supabase
          .from('clan_storage')
          .delete()
          .eq('id', storageId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clan_storage')
          .update({ quantity: storageItem.quantity - quantity })
          .eq('id', storageId);

        if (error) throw error;
      }

      // Логуємо активність
      await supabase.from('clan_activity_log').insert({
        clan_id: clan.id,
        actor_id: telegramId,
        action_type: 'withdraw',
        details: { item_id: itemId, quantity: quantity },
      });

      showToast('Предмет взято зі складу', 'success');
      setSelectedItem(null);
      await loadStorage();
    } catch (error) {
      console.error('Помилка взяття предмета:', error);
      showToast('Не вдалося взяти предмет', 'error');
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
      common: 'text-gray-400 border-gray-500',
      uncommon: 'text-green-400 border-green-500',
      combat: 'text-blue-400 border-blue-500',
      epic: 'text-purple-400 border-purple-500',
      legendary: 'text-yellow-400 border-yellow-500',
      mythic: 'text-orange-400 border-orange-500',
      divine: 'text-white border-white',
    };
    return colors[rarity] || colors.common;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 rounded-xl border-2 border-amber-500 shadow-2xl overflow-hidden">
        {/* Заголовок */}
        <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 p-6 border-b-2 border-amber-400">
          <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <span>📦</span>
            Клановий склад - {clan?.name}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 text-3xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Інформація про права */}
            <div className="mb-4 p-4 bg-slate-800 rounded-lg border border-amber-500/30">
              <p className="text-white">
                <span className="font-bold">Ваша роль:</span>{' '}
                <span className="text-amber-400">{userRole}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {['leader', 'officer'].includes(userRole)
                  ? '✅ Ви можете брати предмети зі складу'
                  : '❌ Тільки лідер та офіцери можуть брати предмети'}
              </p>
            </div>

            {/* Склад */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {storageItems.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <p className="text-xl mb-2">📦</p>
                  <p>Склад клану порожній</p>
                  <p className="text-sm mt-2">Донатьте предмети, щоб заповнити склад</p>
                </div>
              ) : (
                storageItems.map((storageItem) => {
                  const itemInfo = getItemInfo(storageItem.item_id);
                  return (
                    <div
                      key={storageItem.id}
                      onClick={() => setSelectedItem(storageItem)}
                      className={`relative bg-slate-800 rounded-lg p-4 border-2 cursor-pointer hover:scale-105 transition-transform ${getRarityColor(
                        itemInfo.rarity
                      )} ${selectedItem?.id === storageItem.id ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      <div className="text-4xl text-center mb-2">{itemInfo.icon}</div>
                      <p className="text-sm font-semibold text-white text-center truncate">
                        {itemInfo.name}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        x{storageItem.quantity}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Панель дій для вибраного предмета */}
            {selectedItem && (
              <div className="mt-6 p-4 bg-slate-800 rounded-lg border-2 border-amber-500">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {getItemInfo(selectedItem.item_id).name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Доступно: {selectedItem.quantity} шт.
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {['leader', 'officer'].includes(userRole) && (
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      min="1"
                      max={selectedItem.quantity}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Math.max(1, Math.min(selectedItem.quantity, parseInt(e.target.value) || 1)))}
                      className="px-4 py-2 bg-slate-700 border border-amber-500/50 rounded-lg text-white w-24"
                    />
                    <button
                      onClick={() => withdrawItem(selectedItem.id, selectedItem.item_id, withdrawAmount)}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      📤 Взяти зі складу
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Донат з інвентаря */}
            <div className="mt-6">
              <h3 className="text-xl font-bold text-white mb-4">📥 Донатити зі свого інвентаря</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {player.inventory.filter(i => i.quantity > 0).map((item) => {
                  const itemInfo = getItemInfo(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => donateItem(item.id, 1)}
                      className={`relative bg-slate-800 rounded-lg p-4 border-2 cursor-pointer hover:scale-105 transition-transform ${getRarityColor(
                        itemInfo.rarity
                      )}`}
                    >
                      <div className="text-4xl text-center mb-2">{itemInfo.icon}</div>
                      <p className="text-sm font-semibold text-white text-center truncate">
                        {itemInfo.name}
                      </p>
                      <p className="text-xs text-gray-400 text-center mt-1">
                        x{item.quantity}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

