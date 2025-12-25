import { useState, useEffect, useCallback, memo } from 'react';
import { useToast } from '../UI/Toast';
import { useClanContext } from '../../contexts/ClanContext';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { saveProgress } from '../../lib/supabaseClient';

const CLAN_UPGRADES = {
  strongArmor: {
    id: 'strongArmor',
    name: 'Міцна броня',
    description: '+5% до захисту всіх учасників',
    cost: 500,
  },
  experiencedHunters: {
    id: 'experiencedHunters',
    name: 'Досвідчені мисливці',
    description: '+10% до досвіду за босів',
    cost: 1000,
  },
};

export const ClanManager = ({ isOpen, onClose, onOpenClanWars }) => {
  const { clan, clanMembers, createClan, applyToClan, leaveClan, donateGold, purchaseUpgrade } = useClanContext();
  const { player, addGold } = usePlayerContext();
  const { showToast } = useToast();
  const [allClans, setAllClans] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newClanName, setNewClanName] = useState('');
  const [newClanTag, setNewClanTag] = useState('');
  const [newClanDescription, setNewClanDescription] = useState('');
  const [donateAmount, setDonateAmount] = useState(0);
  const [selectedUpgrade, setSelectedUpgrade] = useState(null);
  const [isLoadingClans, setIsLoadingClans] = useState(true);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id;

  // Завантаження списку кланів
  useEffect(() => {
    if (!isOpen || clan) return;

    const loadClans = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('clans')
          .select('id, name, tag, level, description, leader_id')
          .order('level', { ascending: false })
          .limit(50);

        if (!error && data) {
          setAllClans(data);
        }
      } catch (error) {
        console.error('Помилка завантаження кланів:', error);
      }
    };

    loadClans();
  }, [isOpen, clan]);

  const handleCreateClan = useCallback(async () => {
    if (!newClanName.trim() || !newClanTag.trim() || player.gold < 1000) {
      return;
    }

    if (newClanTag.length < 3 || newClanTag.length > 4) {
      showToast('Тег клану повинен бути 3-4 символи', 'warning');
      return;
    }

    const created = await createClan(newClanName, newClanTag, newClanDescription, telegramId, 1000);
    if (created) {
      addGold(-1000);
      setIsCreating(false);
      setNewClanName('');
      setNewClanTag('');
      setNewClanDescription('');
    }
  }, [newClanName, newClanTag, newClanDescription, player.gold, telegramId, createClan, addGold]);

  const handleApplyToClan = useCallback(async (clanId) => {
    if (!telegramId) return;

    const success = await applyToClan(clanId, telegramId);
    if (success) {
      alert('Заявку подано!');
    } else {
      alert('Помилка подачі заявки');
    }
  }, [telegramId, applyToClan]);

  const handleLeaveClan = useCallback(async () => {
    if (!telegramId) return;

    // Підтвердження через Telegram
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(
        'Ви впевнені, що хочете покинути клан?',
        (confirmed) => {
          if (confirmed) {
            leaveClan(telegramId);
          }
        }
      );
    } else {
      if (confirm('Ви впевнені, що хочете покинути клан?')) {
        leaveClan(telegramId);
      }
    }
  }, [telegramId, leaveClan]);

  const handleDonate = useCallback(async () => {
    if (!clan || donateAmount <= 0 || player.gold < donateAmount) return;

    const success = await donateGold(clan.id, donateAmount);
    if (success) {
      addGold(-donateAmount);
      // Зберігаємо прогрес після донату
      if (telegramId) {
        await saveProgress(telegramId, { ...player, gold: player.gold - donateAmount });
      }
      setDonateAmount(0);
      alert(`Ви пожертвували ${donateAmount} золота в банк клану!`);
    }
  }, [clan, donateAmount, player.gold, donateGold, addGold]);

  const handlePurchaseUpgrade = useCallback(async () => {
    if (!clan || !selectedUpgrade) return;

    const upgrade = CLAN_UPGRADES[selectedUpgrade];
    if (!upgrade) return;

    // Підтвердження через Telegram
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(
        `Купити "${upgrade.name}" за ${upgrade.cost} золота з банку клану?`,
        async (confirmed) => {
          if (confirmed) {
            const success = await purchaseUpgrade(clan.id, upgrade.id, upgrade.cost);
            if (success) {
              setSelectedUpgrade(null);
              alert(`Покращення "${upgrade.name}" куплено!`);
            } else {
              alert('Недостатньо золота в банку клану');
            }
          }
        }
      );
    } else {
      if (confirm(`Купити "${upgrade.name}" за ${upgrade.cost} золота?`)) {
        const success = await purchaseUpgrade(clan.id, upgrade.id, upgrade.cost);
        if (success) {
          setSelectedUpgrade(null);
          alert(`Покращення "${upgrade.name}" куплено!`);
        } else {
          alert('Недостатньо золота в банку клану');
        }
      }
    }
  }, [clan, selectedUpgrade, purchaseUpgrade]);

  if (!isOpen) return null;

  const isLeader = clan && clan.leader_id === telegramId?.toString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-800 border-4 border-amber-600 rounded-2xl w-11/12 max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 69, 19, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(184, 134, 11, 0.2) 0%, transparent 50%)',
        }}
      >
        {/* Header - Середньовічний стиль */}
        <div className="bg-gradient-to-r from-amber-800 to-yellow-800 px-6 py-4 border-b-4 border-amber-600 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🛡️</div>
            <div>
              <h2 className="text-2xl font-bold text-amber-100">Управління Кланом</h2>
              <p className="text-xs text-amber-200">Гербова дошка</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-amber-50 transition-colors text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!clan ? (
            // Стан: без клану
            <div className="space-y-6">
              {!isCreating ? (
                <>
                  <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-4">⚔️</div>
                    <h3 className="text-xl font-bold text-amber-100 mb-2">Ви не в клані</h3>
                    <p className="text-amber-200 mb-6">Приєднайтеся до існуючого клану або створіть власний</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      disabled={player.gold < 1000}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${player.gold >= 1000
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Створити клан (1000 🪙)
                    </button>
                  </div>

                  {/* Список кланів */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-100 mb-4">Існуючі клани</h3>
                    <div className="space-y-3">
                      {allClans.map((c) => (
                        <div
                          key={c.id}
                          className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-300 font-bold">[{c.tag}]</span>
                              <span className="text-amber-100 font-semibold">{c.name}</span>
                            </div>
                            <p className="text-sm text-amber-200">{c.description || 'Немає опису'}</p>
                            <p className="text-xs text-amber-300 mt-1">Рівень: {c.level}</p>
                          </div>
                          <button
                            onClick={() => handleApplyToClan(c.id)}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-all"
                          >
                            Подати заявку
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Форма створення клану
                <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-amber-100 mb-4">Створити новий клан</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-amber-200 mb-2">Назва клану</label>
                      <input
                        type="text"
                        value={newClanName}
                        onChange={(e) => setNewClanName(e.target.value)}
                        className="w-full bg-amber-800 border border-amber-600 rounded-lg px-4 py-2 text-amber-100"
                        placeholder="Введіть назву"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 mb-2">Тег клану (3-4 символи)</label>
                      <input
                        type="text"
                        value={newClanTag}
                        onChange={(e) => setNewClanTag(e.target.value.toUpperCase().slice(0, 4))}
                        className="w-full bg-amber-800 border border-amber-600 rounded-lg px-4 py-2 text-amber-100"
                        placeholder="TAG"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block text-amber-200 mb-2">Опис</label>
                      <textarea
                        value={newClanDescription}
                        onChange={(e) => setNewClanDescription(e.target.value)}
                        className="w-full bg-amber-800 border border-amber-600 rounded-lg px-4 py-2 text-amber-100"
                        rows={3}
                        placeholder="Опишіть ваш клан"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCreateClan}
                        disabled={!newClanName.trim() || !newClanTag.trim() || player.gold < 1000}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${newClanName.trim() && newClanTag.trim() && player.gold >= 1000
                            ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        Створити (1000 🪙)
                      </button>
                      <button
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                      >
                        Скасувати
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Стан: в клані
            <div className="space-y-6">
              {/* Інформація про клан */}
              <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold text-lg">[{clan.tag}]</span>
                          <span className="text-amber-100 font-bold text-xl">{clan.name}</span>
                        </div>
                        {isLeader && (
                          <span className="text-xs text-amber-400">Ви лідер</span>
                        )}
                      </div>
                    </div>
                    <p className="text-amber-200 text-sm">{clan.description || 'Немає опису'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-amber-800/50 rounded-lg p-3 text-center">
                    <div className="text-amber-300 text-sm">Рівень</div>
                    <div className="text-amber-100 font-bold text-xl">{clan.level}</div>
                  </div>
                  <div className="bg-amber-800/50 rounded-lg p-3 text-center">
                    <div className="text-amber-300 text-sm">Досвід</div>
                    <div className="text-amber-100 font-bold text-xl">{clan.xp || 0}</div>
                  </div>
                  <div className="bg-amber-800/50 rounded-lg p-3 text-center">
                    <div className="text-amber-300 text-sm">Банк</div>
                    <div className="text-amber-100 font-bold text-xl">{clan.gold_bank || 0} 🪙</div>
                  </div>
                </div>
              </div>

              {/* Донат золота */}
              {isLeader && (
                <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-amber-100 mb-3">Пожертвувати золото</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={donateAmount || ''}
                      onChange={(e) => setDonateAmount(parseInt(e.target.value) || 0)}
                      className="flex-1 bg-amber-800 border border-amber-600 rounded-lg px-4 py-2 text-amber-100"
                      placeholder="Сума"
                      min="1"
                      max={player.gold}
                    />
                    <button
                      onClick={handleDonate}
                      disabled={donateAmount <= 0 || player.gold < donateAmount}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${donateAmount > 0 && player.gold >= donateAmount
                          ? 'bg-amber-600 hover:bg-amber-500 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      Пожертвувати
                    </button>
                  </div>
                </div>
              )}

              {/* Покращення клану */}
              {isLeader && (
                <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-4">
                  <h4 className="text-lg font-bold text-amber-100 mb-3">Покращення клану</h4>
                  <div className="space-y-3">
                    {Object.values(CLAN_UPGRADES).map((upgrade) => {
                      const isPurchased = (clan.upgrades || []).includes(upgrade.id);
                      return (
                        <div
                          key={upgrade.id}
                          className={`bg-amber-800/50 border-2 rounded-lg p-4 ${isPurchased ? 'border-green-600' : 'border-amber-600'
                            }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-amber-100 font-semibold">{upgrade.name}</span>
                                {isPurchased && (
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Активне</span>
                                )}
                              </div>
                              <p className="text-sm text-amber-200">{upgrade.description}</p>
                            </div>
                            {!isPurchased && (
                              <button
                                onClick={() => setSelectedUpgrade(upgrade.id)}
                                disabled={(clan.gold_bank || 0) < upgrade.cost}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${(clan.gold_bank || 0) >= upgrade.cost
                                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  }`}
                              >
                                {upgrade.cost} 🪙
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedUpgrade && (
                    <div className="mt-4 p-4 bg-amber-800/50 rounded-lg">
                      <p className="text-amber-200 mb-3">
                        Купити "{CLAN_UPGRADES[selectedUpgrade].name}"?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePurchaseUpgrade}
                          className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold"
                        >
                          Підтвердити
                        </button>
                        <button
                          onClick={() => setSelectedUpgrade(null)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Список учасників */}
              <div className="bg-amber-900/50 border-2 border-amber-700 rounded-lg p-4">
                <h4 className="text-lg font-bold text-amber-100 mb-3">
                  Учасники ({clanMembers.length})
                </h4>
                <div className="space-y-2">
                  {clanMembers.map((member) => (
                    <div
                      key={member.telegram_id}
                      className="bg-amber-800/50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center">
                            <span className="text-amber-200">{member.name?.[0] || '?'}</span>
                          </div>
                        )}
                        <div>
                          <div className="text-amber-100 font-semibold">{member.name}</div>
                          <div className="text-xs text-amber-300">Lv.{member.level}</div>
                        </div>
                      </div>
                      {member.telegram_id === clan.leader_id?.toString() && (
                        <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded">Лідер</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Кнопка війн */}
              {onOpenClanWars && (
                <button
                  onClick={onOpenClanWars}
                  className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-semibold transition-all mb-3"
                >
                  ⚔️ Війни кланів
                </button>
              )}

              {/* Кнопка виходу */}
              <button
                onClick={handleLeaveClan}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-all"
              >
                Покинути клан
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

