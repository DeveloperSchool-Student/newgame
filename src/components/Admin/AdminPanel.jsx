import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

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
                className="w-full bg-fantasy-dark border border-fantasy-red/50 rounded-lg px-4 py-2 text-white"
              >
                <option value="forgottenMines">Забуті шахти</option>
                <option value="darkForest">Темний ліс</option>
                <option value="capital">Столиця</option>
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
        </div>
      </div>
    </div>
  );
};

