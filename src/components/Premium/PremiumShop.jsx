import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';

const PREMIUM_ITEMS = [
  {
    id: 'vip_7days',
    name: 'VIP статус (7 днів)',
    description: 'Подвійний досвід на 7 днів',
    stars: 100,
    type: 'vip',
    duration: 7, // днів
  },
  {
    id: 'vip_30days',
    name: 'VIP статус (30 днів)',
    description: 'Подвійний досвід на 30 днів',
    stars: 350,
    type: 'vip',
    duration: 30,
  },
  {
    id: 'heal_full',
    name: 'Миттєве відновлення',
    description: 'Повне відновлення HP та MP',
    stars: 50,
    type: 'heal',
  },
  {
    id: 'skin_dragon',
    name: 'Скін: Дракон',
    description: 'Епічний скін персонажа',
    stars: 200,
    type: 'skin',
    skinId: 'dragon',
  },
  {
    id: 'skin_knight',
    name: 'Скін: Лицар',
    description: 'Рідкісний скін персонажа',
    stars: 150,
    type: 'skin',
    skinId: 'knight',
  },
];

export const PremiumShop = ({ isOpen, onClose }) => {
  const { player, updateHealth, updateMana } = usePlayerContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const telegramId = tgUser?.id;

  const handlePurchase = useCallback(async (item) => {
    if (!telegramId || isProcessing) return;

    if (!window.Telegram?.WebApp?.openInvoice) {
      alert('Платежі доступні тільки в Telegram');
      return;
    }

    setIsProcessing(true);

    try {
      // Створюємо запис про покупку
      const { data: purchase, error: purchaseError } = await supabase
        .from('premium_purchases')
        .insert({
          telegram_id: telegramId.toString(),
          item_type: item.type,
          item_id: item.skinId || null,
          stars_amount: item.stars,
          status: 'pending',
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Помилка створення покупки:', purchaseError);
        alert('Помилка створення покупки');
        setIsProcessing(false);
        return;
      }

      // Відкриваємо інвойс через Telegram
      const invoice = {
        title: item.name,
        description: item.description,
        currency: 'XTR', // Telegram Stars
        prices: [
          {
            label: item.name,
            amount: item.stars * 100, // Telegram Stars в мінімальних одиницях
          },
        ],
        payload: JSON.stringify({ purchaseId: purchase.id, itemId: item.id }),
      };

      window.Telegram.WebApp.openInvoice(invoice, (status) => {
        if (status === 'paid') {
          // Обробка успішної оплати
          handlePurchaseSuccess(purchase.id, item);
        } else {
          // Обробка помилки оплати
          handlePurchaseFailed(purchase.id);
        }
        setIsProcessing(false);
      });
    } catch (error) {
      console.error('Помилка покупки:', error);
      alert('Помилка покупки');
      setIsProcessing(false);
    }
  }, [telegramId, isProcessing, player, updateHealth, updateMana]);

  const handlePurchaseSuccess = async (purchaseId, item) => {
    if (!supabase) return;

    try {
      // Оновлюємо статус покупки
      await supabase
        .from('premium_purchases')
        .update({ status: 'completed' })
        .eq('id', purchaseId);

      // Застосовуємо товар
      if (item.type === 'vip') {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + item.duration);

        await supabase
          .from('profiles')
          .update({
            vip_status: true,
            vip_expires_at: expiresAt.toISOString(),
          })
          .eq('telegram_id', telegramId.toString());

        alert(`VIP статус активовано на ${item.duration} днів!`);
      } else if (item.type === 'heal') {
        // Відновлюємо HP та MP
        const { data: profile } = await supabase
          .from('profiles')
          .select('max_health, max_mana')
          .eq('telegram_id', telegramId.toString())
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              health: profile.max_health,
              mana: profile.max_mana,
            })
            .eq('telegram_id', telegramId.toString());

          updateHealth(profile.max_health);
          updateMana(profile.max_mana);
          alert('HP та MP повністю відновлено!');
        }
      } else if (item.type === 'skin') {
        // Зберігаємо скін (можна додати в профіль)
        alert(`Скін "${item.name}" активовано!`);
      }
    } catch (error) {
      console.error('Помилка застосування товару:', error);
    }
  };

  const handlePurchaseFailed = async (purchaseId) => {
    if (!supabase) return;

    try {
      await supabase
        .from('premium_purchases')
        .update({ status: 'failed' })
        .eq('id', purchaseId);
    } catch (error) {
      console.error('Помилка оновлення статусу:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" onClick={onClose}>
      <div
        className="bg-fantasy-dark border-2 border-fantasy-purple rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-hidden glow-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-fantasy-purple/30 px-6 py-4 border-b border-fantasy-purple flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-fantasy-gold">💎 Преміум магазин</h2>
            <p className="text-xs text-gray-400">Покупка за Telegram Stars</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-fantasy-gold transition-colors text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREMIUM_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-fantasy-dark/50 border-2 border-fantasy-purple/30 rounded-lg p-4 hover:border-fantasy-purple transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-fantasy-gold">{item.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">{item.stars} ⭐</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={isProcessing}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                    isProcessing
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white'
                  }`}
                >
                  {isProcessing ? 'Обробка...' : 'Купити'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

