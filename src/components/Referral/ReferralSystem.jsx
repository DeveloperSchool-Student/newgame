import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';

export const ReferralSystem = ({ isOpen, onClose }) => {
  const { player, addGold, addItem } = usePlayerContext();
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ total: 0, rewarded: 0 });

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id;

  // Генерація реферального посилання
  useEffect(() => {
    if (telegramId) {
      const botUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || 'your_bot';
      const link = `https://t.me/${botUsername}?start=ref_${telegramId}`;
      setReferralLink(link);
    }
  }, [telegramId]);

  // Завантаження статистики рефералів
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadReferrals = async () => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_telegram_id', telegramId.toString())
          .order('created_at', { ascending: false });

        if (!error && data) {
          setReferrals(data);
          setStats({
            total: data.length,
            rewarded: data.filter((r) => r.reward_claimed).length,
          });
        }
      } catch (error) {
        console.error('Помилка завантаження рефералів:', error);
      }
    };

    loadReferrals();
  }, [isOpen, telegramId]);

  // Копіювання посилання
  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      alert('Посилання скопійовано!');
    } else {
      // Fallback для старих браузерів
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Посилання скопійовано!');
    }
  }, [referralLink]);

  // Поділитися через Telegram
  const handleShare = useCallback(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Приєднуйся до гри!')}`);
    } else {
      handleCopyLink();
    }
  }, [referralLink, handleCopyLink]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-md max-h-[90vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">Реферальна система</h2>
            <p className="text-xs text-gray-400">Запрошуй друзів та отримуй нагороди!</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-fantasy-gold">{stats.total}</div>
              <div className="text-sm text-gray-400">Запрошено</div>
            </div>
            <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-fantasy-gold">{stats.rewarded}</div>
              <div className="text-sm text-gray-400">Нагороджено</div>
            </div>
          </div>

          {/* Реферальне посилання */}
          <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
            <label className="block text-sm text-gray-400 mb-2">Ваше реферальне посилання</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-fantasy-dark border border-fantasy-purple/50 rounded-lg px-4 py-2 text-white text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-fantasy-purple hover:bg-fantasy-purple/80 text-white rounded-lg font-semibold"
              >
                Копіювати
              </button>
            </div>
            <button
              onClick={handleShare}
              className="w-full mt-3 px-4 py-2 bg-fantasy-green hover:bg-green-600 text-white rounded-lg font-semibold"
            >
              📤 Поділитися
            </button>
          </div>

          {/* Нагороди */}
          <div className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-fantasy-gold mb-3">Нагороди за запрошення</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-fantasy-gold">💰</span>
                <span>500 золота</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-fantasy-gold">🎁</span>
                <span>Унікальний предмет</span>
              </div>
            </div>
          </div>

          {/* Список рефералів */}
          {referrals.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-fantasy-gold mb-3">Ваші реферали</h3>
              <div className="space-y-2">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-white font-semibold">ID: {ref.referred_telegram_id.slice(0, 8)}...</div>
                      <div className="text-xs text-gray-400">
                        {new Date(ref.created_at).toLocaleDateString('uk-UA')}
                      </div>
                    </div>
                    {ref.reward_claimed && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Нагороджено</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Функція для обробки реферального посилання при старті
export const handleReferralStart = async (startParam) => {
  if (!startParam || !startParam.startsWith('ref_')) return null;

  const referrerId = startParam.replace('ref_', '');
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const currentUserId = tgUser?.id?.toString();

  if (!currentUserId || referrerId === currentUserId) return null;

  if (!supabase) return null;

  try {
    // Перевіряємо чи вже є реферал
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_telegram_id', currentUserId)
      .single();

    if (existing) return null; // Вже зареєстрований

    // Створюємо реферал
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_telegram_id: referrerId,
        referred_telegram_id: currentUserId,
        reward_claimed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Помилка створення реферала:', error);
      return null;
    }

    // Оновлюємо профіль нового гравця
    await supabase
      .from('profiles')
      .update({ referrer_id: referrerId })
      .eq('telegram_id', currentUserId);

    // Нагороджуємо реферера
    await rewardReferrer(referrerId);

    return data;
  } catch (error) {
    console.error('Помилка обробки реферала:', error);
    return null;
  }
};

// Функція для нагородження реферера
const rewardReferrer = async (referrerId) => {
  if (!supabase) return;

  try {
    // Перевіряємо чи вже нагороджено
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_telegram_id', referrerId)
      .eq('reward_claimed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!referral) return;

    // Оновлюємо статус нагороди
    await supabase
      .from('referrals')
      .update({ reward_claimed: true })
      .eq('id', referral.id);

    // Додаємо золото
    const { data: profile } = await supabase
      .from('profiles')
      .select('gold')
      .eq('telegram_id', referrerId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ gold: (profile.gold || 0) + 500 })
        .eq('telegram_id', referrerId);
    }

    // Додаємо унікальний предмет (приклад)
    const uniqueItem = {
      id: Date.now(),
      name: 'Меч Реферера',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'epic',
      quantity: 1,
      stats: { strength: 12 },
      basePrice: 200,
    };

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('items')
      .eq('telegram_id', referrerId)
      .single();

    if (currentProfile) {
      let items = [];
      if (currentProfile.items) {
        try {
          items = typeof currentProfile.items === 'string' ? JSON.parse(currentProfile.items) : currentProfile.items;
          if (!Array.isArray(items)) items = [];
        } catch (e) {
          console.error('Помилка парсингу items реферера:', e);
          items = [];
        }
      }
      items.push(uniqueItem);
      await supabase
        .from('profiles')
        .update({ items: JSON.stringify(items) })
        .eq('telegram_id', referrerId);
    }
  } catch (error) {
    console.error('Помилка нагородження реферера:', error);
  }
};

