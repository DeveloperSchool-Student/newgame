import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Місячна підписка',
    duration: 30, // днів
    price: 1000, // золота
    bonuses: {
      dailyGold: 100,
      dailyExperience: 50,
      goldMultiplier: 1.5,
      xpMultiplier: 1.5,
      shopDiscount: 0.1, // 10% знижка
    },
    icon: '💎',
  },
  {
    id: 'premium',
    name: 'Преміум підписка',
    duration: 30,
    price: 2000,
    bonuses: {
      dailyGold: 200,
      dailyExperience: 100,
      goldMultiplier: 2.0,
      xpMultiplier: 2.0,
      shopDiscount: 0.2, // 20% знижка
      vipAccess: true,
    },
    icon: '👑',
  },
];

export const SubscriptionSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold, addExperience } = usePlayerContext();
  const { showToast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);

  // Завантаження підписки
  useEffect(() => {
    if (!isOpen || !telegramId) return;

    const loadSubscription = async () => {
      setIsLoading(true);
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('telegram_id', telegramId.toString())
          .eq('status', 'active')
          .single();

        if (sub) {
          setSubscription(sub);
          
          // Перевіряємо чи отримано щоденну нагороду сьогодні
          const today = new Date().toDateString();
          const lastClaim = sub.last_daily_reward ? new Date(sub.last_daily_reward).toDateString() : null;
          setDailyRewardClaimed(today === lastClaim);
        }
      } catch (error) {
        console.error('Помилка завантаження підписки:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [isOpen, telegramId]);

  // Покупка підписки
  const purchaseSubscription = useCallback(async (plan) => {
    if (isProcessing || player.gold < plan.price) {
      showToast('Недостатньо золота', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration);

      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('telegram_id', telegramId.toString())
        .single();

      if (existingSub) {
        // Продовжуємо існуючу підписку
        const newExpiresAt = existingSub.status === 'active' && new Date(existingSub.expires_at) > new Date()
          ? new Date(new Date(existingSub.expires_at).getTime() + plan.duration * 24 * 60 * 60 * 1000)
          : expiresAt;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_id: plan.id,
            status: 'active',
            expires_at: newExpiresAt.toISOString(),
            last_daily_reward: null,
          })
          .eq('telegram_id', telegramId.toString());

        if (error) throw error;
      } else {
        // Створюємо нову підписку
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            telegram_id: telegramId.toString(),
            plan_id: plan.id,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            last_daily_reward: null,
          });

        if (error) throw error;
      }

      // Списуємо золото
      addGold(-plan.price);

      // Оновлюємо локальний стан
      const { data: updatedSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('telegram_id', telegramId.toString())
        .single();

      setSubscription(updatedSub);
      showToast(`Підписка "${plan.name}" активована!`, 'success');
    } catch (error) {
      console.error('Помилка покупки підписки:', error);
      showToast('Помилка покупки підписки', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [player.gold, isProcessing, telegramId, addGold, showToast]);

  // Отримання щоденної нагороди
  const claimDailyReward = useCallback(async () => {
    if (!subscription || dailyRewardClaimed || isProcessing) return;

    setIsProcessing(true);
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
      if (!plan) return;

      const bonuses = plan.bonuses;

      // Видаємо нагороди
      if (bonuses.dailyGold) {
        addGold(bonuses.dailyGold);
      }
      if (bonuses.dailyExperience) {
        addExperience(bonuses.dailyExperience);
      }

      // Оновлюємо підписку
      const { error } = await supabase
        .from('subscriptions')
        .update({
          last_daily_reward: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (error) throw error;

      setDailyRewardClaimed(true);
      showToast('Щоденна нагорода отримана!', 'success');
    } catch (error) {
      console.error('Помилка отримання нагороди:', error);
      showToast('Помилка отримання нагороди', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [subscription, dailyRewardClaimed, isProcessing, addGold, addExperience, showToast]);

  // Експортуємо бонуси для використання в грі
  useEffect(() => {
    if (subscription && subscription.status === 'active') {
      const expiresAt = new Date(subscription.expires_at);
      if (expiresAt > new Date()) {
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id);
        if (plan) {
          window.gameSubscription = {
            active: true,
            bonuses: plan.bonuses,
            expiresAt: subscription.expires_at,
          };
        }
      } else {
        // Підписка прострочена
        window.gameSubscription = { active: false };
      }
    } else {
      window.gameSubscription = { active: false };
    }
  }, [subscription]);

  if (!isOpen) return null;

  const activePlan = subscription
    ? SUBSCRIPTION_PLANS.find((p) => p.id === subscription.plan_id)
    : null;
  const isActive = subscription && subscription.status === 'active' && new Date(subscription.expires_at) > new Date();

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">💎 Підписки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Поточна підписка */}
            {isActive && activePlan && (
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      {activePlan.icon} {activePlan.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Дійсна до: {new Date(subscription.expires_at).toLocaleDateString('uk-UA')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Залишилось</div>
                    <div className="text-xl font-bold text-fantasy-gold">
                      {Math.ceil((new Date(subscription.expires_at) - new Date()) / (1000 * 60 * 60 * 24))} днів
                    </div>
                  </div>
                </div>

                {/* Бонуси */}
                <div className="bg-fantasy-dark/50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-fantasy-gold mb-2">Активні бонуси:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {activePlan.bonuses.goldMultiplier && (
                      <div className="text-gray-300">
                        🪙 Золото x{activePlan.bonuses.goldMultiplier}
                      </div>
                    )}
                    {activePlan.bonuses.xpMultiplier && (
                      <div className="text-gray-300">
                        ⭐ Досвід x{activePlan.bonuses.xpMultiplier}
                      </div>
                    )}
                    {activePlan.bonuses.shopDiscount && (
                      <div className="text-gray-300">
                        💰 Знижка {Math.round(activePlan.bonuses.shopDiscount * 100)}%
                      </div>
                    )}
                    {activePlan.bonuses.dailyGold && (
                      <div className="text-gray-300">
                        🎁 Щоденне золото: {activePlan.bonuses.dailyGold}
                      </div>
                    )}
                  </div>
                </div>

                {/* Щоденна нагорода */}
                {!dailyRewardClaimed && (
                  <button
                    onClick={claimDailyReward}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Отримання...' : 'Отримати щоденну нагороду'}
                  </button>
                )}
                {dailyRewardClaimed && (
                  <div className="text-center text-green-400 py-2">
                    ✅ Щоденна нагорода вже отримана сьогодні
                  </div>
                )}
              </div>
            )}

            {/* Доступні підписки */}
            <div>
              <h3 className="text-xl font-bold text-fantasy-gold mb-4">Доступні підписки</h3>
              <div className="space-y-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-fantasy-dark/50 border-2 border-fantasy-purple/30 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          {plan.icon} {plan.name}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Тривалість: {plan.duration} днів
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-fantasy-gold">{plan.price} 🪙</div>
                      </div>
                    </div>

                    {/* Бонуси */}
                    <div className="bg-fantasy-dark/50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-semibold text-fantasy-gold mb-2">Бонуси:</div>
                      <div className="space-y-1 text-sm text-gray-300">
                        {plan.bonuses.dailyGold && (
                          <div>🎁 Щоденне золото: {plan.bonuses.dailyGold}</div>
                        )}
                        {plan.bonuses.dailyExperience && (
                          <div>⭐ Щоденний досвід: {plan.bonuses.dailyExperience}</div>
                        )}
                        {plan.bonuses.goldMultiplier && (
                          <div>🪙 Множник золота: x{plan.bonuses.goldMultiplier}</div>
                        )}
                        {plan.bonuses.xpMultiplier && (
                          <div>⭐ Множник досвіду: x{plan.bonuses.xpMultiplier}</div>
                        )}
                        {plan.bonuses.shopDiscount && (
                          <div>💰 Знижка в магазині: {Math.round(plan.bonuses.shopDiscount * 100)}%</div>
                        )}
                        {plan.bonuses.vipAccess && (
                          <div>👑 VIP доступ</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => purchaseSubscription(plan)}
                      disabled={isProcessing || player.gold < plan.price}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                        player.gold >= plan.price && !isProcessing
                          ? 'bg-fantasy-purple hover:bg-purple-600 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? 'Обробка...' : 'Купити'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

