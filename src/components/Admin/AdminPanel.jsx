import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useKingdomContext } from '../../contexts/KingdomContext';

// Отримуємо ID адміна з змінних оточення або використовуємо fallback
const ADMIN_TELEGRAM_ID = import.meta.env.VITE_ADMIN_TELEGRAM_ID || 'YOUR_ADMIN_TELEGRAM_ID';

export const AdminPanel = ({ isOpen, onClose }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [serverSettings, setServerSettings] = useState({
    xpMultiplier: 1.0,
  });
  const [announcementText, setAnnouncementText] = useState('');
  const [spawnLocation, setSpawnLocation] = useState('forgottenMines');
  const [onlineCount, setOnlineCount] = useState(0);
  const { resetWorld } = useKingdomContext();

  // Стани для управління гравцями
  const [targetTelegramId, setTargetTelegramId] = useState('');
  const [giveItemId, setGiveItemId] = useState('');
  const [giveItemQuantity, setGiveItemQuantity] = useState(1);
  const [giveGoldAmount, setGiveGoldAmount] = useState(0);
  const [giveCrystalsAmount, setGiveCrystalsAmount] = useState(0);
  const [selectedRaceChange, setSelectedRaceChange] = useState('human');
  const [statBoostType, setStatBoostType] = useState('strength');
  const [statBoostAmount, setStatBoostAmount] = useState(10);
  const [premiumDays, setPremiumDays] = useState(30);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id?.toString();

  // Перевірка доступу
  useEffect(() => {
    if (telegramId === ADMIN_TELEGRAM_ID) {
      setIsAuthorized(true);
      loadServerSettings();
      loadOnlineCount();
    } else {
      setIsAuthorized(false);
    }
  }, [telegramId]);

  // Завантаження налаштувань сервера
  const loadServerSettings = async () => {
    if (!supabase) return;

    try {
      const { data } = await supabase
        .from('server_settings')
        .select('*')
        .eq('key', 'xp_multiplier')
        .single();

      if (data) {
        setServerSettings({
          xpMultiplier: data.value || 1.0,
        });
      }
    } catch (error) {
      console.error('Помилка завантаження налаштувань:', error);
    }
  };

  // Завантаження кількості онлайн гравців
  const loadOnlineCount = async () => {
    if (!supabase) return;

    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_seen', fiveMinutesAgo);

      setOnlineCount(count || 0);
    } catch (error) {
      console.error('Помилка завантаження онлайн:', error);
    }
  };

  // Spawn Boss
  const handleSpawnBoss = useCallback(async () => {
    if (!supabase) return;

    try {
      // Отримуємо поточний HP боса
      const { data: currentData } = await supabase
        .from('world_state')
        .select('value')
        .eq('key', 'boss_hp')
        .single();

      let bossHPData = {};
      if (currentData?.value) {
        try {
          bossHPData = JSON.parse(currentData.value);
        } catch (e) {
          console.error('Помилка парсингу HP боса:', e);
          bossHPData = {};
        }
      }
      const bossMaxHP = 500; // Максимальний HP боса

      // Встановлюємо повний HP боса
      bossHPData[spawnLocation] = bossMaxHP;

      await supabase
        .from('world_state')
        .upsert({
          key: 'boss_hp',
          value: JSON.stringify(bossHPData),
        });

      alert(`Бос спавнено в локації ${spawnLocation}!`);
    } catch (error) {
      console.error('Помилка спавну боса:', error);
      alert('Помилка спавну боса');
    }
  }, [spawnLocation]);

  // Global Broadcast
  const handleBroadcast = useCallback(async () => {
    if (!announcementText.trim() || !supabase) return;

    try {
      await supabase
        .from('global_announcements')
        .insert({
          message: announcementText.trim(),
          created_by: telegramId,
          is_active: true,
        });

      setAnnouncementText('');
      alert('Анонс відправлено!');
    } catch (error) {
      console.error('Помилка відправки анонсу:', error);
      alert('Помилка відправки анонсу');
    }
  }, [announcementText, telegramId]);

  // Зміна множника досвіду
  const handleXPMultiplierChange = useCallback(async (multiplier) => {
    if (!supabase) return;

    try {
      await supabase
        .from('server_settings')
        .upsert({
          key: 'xp_multiplier',
          value: multiplier,
          updated_by: telegramId,
        });

      setServerSettings({ xpMultiplier: multiplier });
      alert(`Множник досвіду встановлено: x${multiplier}`);
    } catch (error) {
      console.error('Помилка зміни множника:', error);
      alert('Помилка зміни множника');
    }
  }, [telegramId]);

  // Рестарт світу - повернення всіх провінцій до початкового стану
  const handleResetWorld = useCallback(async () => {
    const confirm = window.confirm(
      '⚠️ УВАГА! Це поверне всі провінції та кордони до початкового стану. Продовжити?'
    );
    
    if (!confirm) return;

    try {
      const success = await resetWorld();
      if (success) {
        alert('✅ Світ успішно скинуто! Всі провінції повернуто до початкового стану.');
      } else {
        alert('❌ Помилка при скиданні світу. Перевірте логи.');
      }
    } catch (error) {
      console.error('Помилка рестарту світу:', error);
      alert('❌ Критична помилка при скиданні світу');
    }
  }, [resetWorld]);

  // === ФУНКЦІЇ УПРАВЛІННЯ ГРАВЦЯМИ ===

  // Зміна раси гравця
  const handleChangeRace = useCallback(async () => {
    if (!targetTelegramId || !supabase) {
      alert('Введіть Telegram ID гравця!');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ race: selectedRaceChange })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ Раса гравця ${targetTelegramId} змінена на ${selectedRaceChange}!`);
    } catch (error) {
      console.error('Помилка зміни раси:', error);
      alert('❌ Помилка зміни раси');
    }
  }, [targetTelegramId, selectedRaceChange]);

  // Видача предмета
  const handleGiveItem = useCallback(async () => {
    if (!targetTelegramId || !giveItemId || !supabase) {
      alert('Введіть Telegram ID та ID предмета!');
      return;
    }

    try {
      // Отримуємо поточний інвентар гравця
      const { data: profile } = await supabase
        .from('profiles')
        .select('items')
        .eq('telegram_id', targetTelegramId)
        .single();

      if (!profile) {
        alert('Гравця не знайдено!');
        return;
      }

      let inventory = [];
      try {
        inventory = profile.items ? (typeof profile.items === 'string' ? JSON.parse(profile.items) : profile.items) : [];
      } catch (e) {
        inventory = [];
      }

      // Створюємо новий предмет
      const newItem = {
        id: Date.now(),
        name: `Item ${giveItemId}`,
        type: 'special',
        rarity: 'legendary',
        quantity: parseInt(giveItemQuantity) || 1,
        adminGiven: true,
      };

      inventory.push(newItem);

      // Оновлюємо інвентар
      const { error } = await supabase
        .from('profiles')
        .update({ items: JSON.stringify(inventory) })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ Предмет ${giveItemId} (x${giveItemQuantity}) видано гравцю ${targetTelegramId}!`);
    } catch (error) {
      console.error('Помилка видачі предмета:', error);
      alert('❌ Помилка видачі предмета');
    }
  }, [targetTelegramId, giveItemId, giveItemQuantity]);

  // Видача золота
  const handleGiveGold = useCallback(async () => {
    if (!targetTelegramId || !giveGoldAmount || !supabase) {
      alert('Введіть Telegram ID та кількість золота!');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold')
        .eq('telegram_id', targetTelegramId)
        .single();

      if (!profile) {
        alert('Гравця не знайдено!');
        return;
      }

      const newGold = (profile.gold || 0) + parseInt(giveGoldAmount);

      const { error } = await supabase
        .from('profiles')
        .update({ gold: newGold })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ Видано ${giveGoldAmount} золота гравцю ${targetTelegramId}!`);
    } catch (error) {
      console.error('Помилка видачі золота:', error);
      alert('❌ Помилка видачі золота');
    }
  }, [targetTelegramId, giveGoldAmount]);

  // Видача кристалів
  const handleGiveCrystals = useCallback(async () => {
    if (!targetTelegramId || !giveCrystalsAmount || !supabase) {
      alert('Введіть Telegram ID та кількість кристалів!');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('crystals')
        .eq('telegram_id', targetTelegramId)
        .single();

      if (!profile) {
        alert('Гравця не знайдено!');
        return;
      }

      const newCrystals = (profile.crystals || 0) + parseInt(giveCrystalsAmount);

      const { error } = await supabase
        .from('profiles')
        .update({ crystals: newCrystals })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ Видано ${giveCrystalsAmount} кристалів гравцю ${targetTelegramId}!`);
    } catch (error) {
      console.error('Помилка видачі кристалів:', error);
      alert('❌ Помилка видачі кристалів');
    }
  }, [targetTelegramId, giveCrystalsAmount]);

  // Покращення характеристик
  const handleBoostStat = useCallback(async () => {
    if (!targetTelegramId || !statBoostAmount || !supabase) {
      alert('Введіть Telegram ID та кількість!');
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stats')
        .eq('telegram_id', targetTelegramId)
        .single();

      if (!profile) {
        alert('Гравця не знайдено!');
        return;
      }

      let stats = {};
      try {
        stats = profile.stats ? (typeof profile.stats === 'string' ? JSON.parse(profile.stats) : profile.stats) : {};
      } catch (e) {
        stats = { strength: 10, agility: 8, intelligence: 6, defense: 5 };
      }

      stats[statBoostType] = (stats[statBoostType] || 10) + parseInt(statBoostAmount);

      const { error } = await supabase
        .from('profiles')
        .update({ stats: JSON.stringify(stats) })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ ${statBoostType} +${statBoostAmount} для гравця ${targetTelegramId}!`);
    } catch (error) {
      console.error('Помилка покращення характеристик:', error);
      alert('❌ Помилка покращення характеристик');
    }
  }, [targetTelegramId, statBoostType, statBoostAmount]);

  // Видача преміуму
  const handleGivePremium = useCallback(async () => {
    if (!targetTelegramId || !premiumDays || !supabase) {
      alert('Введіть Telegram ID та кількість днів!');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(premiumDays));

      const { error } = await supabase
        .from('profiles')
        .update({
          vip_status: true,
          vip_expires_at: expiresAt.toISOString(),
        })
        .eq('telegram_id', targetTelegramId);

      if (error) throw error;
      alert(`✅ Преміум на ${premiumDays} днів видано гравцю ${targetTelegramId}!`);
    } catch (error) {
      console.error('Помилка видачі преміуму:', error);
      alert('❌ Помилка видачі преміуму');
    }
  }, [targetTelegramId, premiumDays]);

  if (!isOpen) return null;

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
        <div
          className="bg-fantasy-dark border-2 border-fantasy-red rounded-lg w-11/12 max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-fantasy-red mb-4">Доступ заборонено</h2>
          <p className="text-gray-400 mb-4">У вас немає доступу до адмін-панелі.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-fantasy-red hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            Закрити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-red rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-red/30 px-6 py-4 border-b border-fantasy-red flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-red">⚙️ Адмін-панель</h2>
            <p className="text-xs text-gray-400">Управління сервером</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-red transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Статистика */}
          <div className="bg-fantasy-dark/50 border border-fantasy-red/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-fantasy-red mb-3">Статистика</h3>
            <div className="text-white">
              <div>Онлайн гравців: <span className="text-fantasy-gold font-bold">{onlineCount}</span></div>
              <div className="mt-2">Множник досвіду: <span className="text-fantasy-gold font-bold">x{serverSettings.xpMultiplier}</span></div>
            </div>
            <button
              onClick={loadOnlineCount}
              className="mt-3 px-4 py-2 bg-fantasy-red/50 hover:bg-fantasy-red/70 text-white rounded-lg text-sm"
            >
              Оновити
            </button>
          </div>

          {/* Spawn Boss */}
          <div className="bg-fantasy-dark/50 border border-fantasy-red/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-fantasy-red mb-3">Spawn Boss</h3>
            <div className="space-y-3">
              <select
                value={spawnLocation}
                onChange={(e) => setSpawnLocation(e.target.value)}
                className="w-full bg-fantasy-dark border border-fantasy-red/50 rounded-lg px-4 py-2 text-white max-h-40 overflow-y-auto"
              >
                <option value="capital">Столиця</option>
                <option value="darkForest">Темний ліс</option>
                <option value="forgottenMines">Забуті шахти</option>
                <option value="mountainPeak">Гірська Вершина</option>
                <option value="seaPort">Морський Порт</option>
                <option value="shadowGate">Тіньова Брама</option>
                <option value="volcanoIsland">Вулканічний Острів</option>
                <option value="frostCastle">Крижаний Замок</option>
                <option value="holyTemple">Святий Храм</option>
                <option value="darkCitadel">Темна Цитадель</option>
                <option value="dragonNest">Гніздо Дракона</option>
                <option value="elfGrove">Ельфійська Гаща</option>
                <option value="dwarfForge">Двафійська Кузня</option>
                <option value="orcStronghold">Орочий Цитадель</option>
                <option value="skyGarden">Небесний Сад</option>
                <option value="abyssGate">Брама Безодні</option>
                <option value="mechFactory">Механічна Фабрика</option>
                <option value="wildGrove">Дика Гаща</option>
                <option value="crystalTower">Кристальна Вежа</option>
                <option value="stormPeak">Вершина Бурі</option>
                <option value="tradeHub">Торговий Хаб</option>
              </select>
              <button
                onClick={handleSpawnBoss}
                className="w-full px-4 py-2 bg-fantasy-red hover:bg-red-600 text-white rounded-lg font-semibold"
              >
                Спавнити боса
              </button>
            </div>
          </div>

          {/* Global Broadcast */}
          <div className="bg-fantasy-dark/50 border border-fantasy-red/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-fantasy-red mb-3">Global Broadcast</h3>
            <div className="space-y-3">
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Введіть текст анонсу..."
                className="w-full bg-fantasy-dark border border-fantasy-red/50 rounded-lg px-4 py-2 text-white min-h-[100px]"
              />
              <button
                onClick={handleBroadcast}
                disabled={!announcementText.trim()}
                className={`w-full px-4 py-2 rounded-lg font-semibold ${
                  announcementText.trim()
                    ? 'bg-fantasy-red hover:bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Відправити анонс
              </button>
            </div>
          </div>

          {/* Економічний контроль */}
          <div className="bg-fantasy-dark/50 border border-fantasy-red/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-fantasy-red mb-3">Множник досвіду</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleXPMultiplierChange(1.0)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  serverSettings.xpMultiplier === 1.0
                    ? 'bg-fantasy-red text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                x1.0
              </button>
              <button
                onClick={() => handleXPMultiplierChange(2.0)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  serverSettings.xpMultiplier === 2.0
                    ? 'bg-fantasy-red text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                x2.0
              </button>
              <button
                onClick={() => handleXPMultiplierChange(3.0)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  serverSettings.xpMultiplier === 3.0
                    ? 'bg-fantasy-red text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                x3.0
              </button>
            </div>
          </div>

          {/* ===  УПРАВЛІННЯ ГРАВЦЯМИ === */}
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-purple-300 mb-3">👤 Управління гравцями</h3>
            
            {/* Введення Telegram ID */}
            <div className="mb-4">
              <label className="block text-white text-sm font-semibold mb-2">Telegram ID гравця:</label>
              <input
                type="text"
                value={targetTelegramId}
                onChange={(e) => setTargetTelegramId(e.target.value)}
                placeholder="Наприклад: 123456789"
                className="w-full bg-fantasy-dark border border-purple-500/50 rounded-lg px-4 py-2 text-white"
              />
            </div>

            {/* Зміна раси */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-3">
              <h4 className="text-white font-semibold mb-2">🧬 Зміна раси</h4>
              <div className="flex gap-2">
                <select
                  value={selectedRaceChange}
                  onChange={(e) => setSelectedRaceChange(e.target.value)}
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="human">Людина</option>
                  <option value="elf">Ельф</option>
                  <option value="dwarf">Гном</option>
                  <option value="orc">Орк</option>
                  <option value="angel">Ангел</option>
                  <option value="demon">Демон</option>
                  <option value="dragonborn">Напівдракон</option>
                  <option value="beastkin">Звіролюд</option>
                  <option value="undead">Нежить</option>
                  <option value="elemental">Елементаль</option>
                </select>
                <button
                  onClick={handleChangeRace}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                >
                  Змінити
                </button>
              </div>
            </div>

            {/* Видача золота */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-3">
              <h4 className="text-white font-semibold mb-2">💰 Видача золота</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={giveGoldAmount}
                  onChange={(e) => setGiveGoldAmount(e.target.value)}
                  placeholder="Кількість"
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleGiveGold}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-semibold"
                >
                  Видати
                </button>
              </div>
            </div>

            {/* Видача кристалів */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-3">
              <h4 className="text-white font-semibold mb-2">💎 Видача кристалів</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={giveCrystalsAmount}
                  onChange={(e) => setGiveCrystalsAmount(e.target.value)}
                  placeholder="Кількість"
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleGiveCrystals}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold"
                >
                  Видати
                </button>
              </div>
            </div>

            {/* Видача предмета */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-3">
              <h4 className="text-white font-semibold mb-2">🎁 Видача предмета</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={giveItemId}
                  onChange={(e) => setGiveItemId(e.target.value)}
                  placeholder="ID/Назва предмета"
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
                <input
                  type="number"
                  value={giveItemQuantity}
                  onChange={(e) => setGiveItemQuantity(e.target.value)}
                  placeholder="Кільк."
                  className="w-20 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                onClick={handleGiveItem}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold"
              >
                Видати предмет
              </button>
            </div>

            {/* Покращення характеристик */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-3">
              <h4 className="text-white font-semibold mb-2">⚡ Покращення характеристик</h4>
              <div className="flex gap-2 mb-2">
                <select
                  value={statBoostType}
                  onChange={(e) => setStatBoostType(e.target.value)}
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="strength">Сила</option>
                  <option value="agility">Спритність</option>
                  <option value="intelligence">Інтелект</option>
                  <option value="defense">Захист</option>
                </select>
                <input
                  type="number"
                  value={statBoostAmount}
                  onChange={(e) => setStatBoostAmount(e.target.value)}
                  placeholder="+Кількість"
                  className="w-24 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
              </div>
              <button
                onClick={handleBoostStat}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
              >
                Покращити
              </button>
            </div>

            {/* Видача преміуму */}
            <div className="bg-fantasy-dark/50 rounded-lg p-3">
              <h4 className="text-white font-semibold mb-2">👑 Видача Premium</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={premiumDays}
                  onChange={(e) => setPremiumDays(e.target.value)}
                  placeholder="Днів"
                  className="flex-1 bg-fantasy-dark border border-purple-500/50 rounded px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleGivePremium}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-semibold"
                >
                  Видати VIP
                </button>
              </div>
            </div>
          </div>

          {/* Рестарт світу */}
          <div className="bg-fantasy-dark/50 border border-orange-500/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-orange-500 mb-3">⚠️ Рестарт світу</h3>
            <p className="text-gray-400 text-sm mb-3">
              Повертає всі провінції та кордони королівств до початкового стану. 
              Ця операція незворотна!
            </p>
            <button
              onClick={handleResetWorld}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔄 Скинути світ до початкового стану
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

