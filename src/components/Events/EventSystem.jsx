import { useState, useEffect, useCallback } from 'react';
import { usePlayerContext } from '../../contexts/PlayerContext';
import { supabase } from '../../lib/supabaseClient';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import { useToast } from '../UI/Toast';

// Типи подій
const EVENT_TYPES = {
  WEEKLY: 'weekly',
  HOLIDAY: 'holiday',
  SPECIAL: 'special',
};

// Спеціальні боси для подій
const EVENT_BOSSES = {
  valentine: {
    id: 'valentine_boss',
    name: 'Король Кохання',
    maxHP: 800,
    attack: 30,
    defense: 15,
    emoji: '💕',
    location: 'capital',
    reward: { gold: 1000, experience: 500, crystals: 50 },
  },
  newyear: {
    id: 'newyear_boss',
    name: 'Дух Нового Року',
    maxHP: 1000,
    attack: 35,
    defense: 20,
    emoji: '🎊',
    location: 'capital',
    reward: { gold: 1500, experience: 750, crystals: 100 },
  },
  easter: {
    id: 'easter_boss',
    name: 'Великодній Заєць',
    maxHP: 600,
    attack: 25,
    defense: 12,
    emoji: '🐰',
    location: 'darkForest',
    reward: { gold: 800, experience: 400, crystals: 40 },
  },
  halloween: {
    id: 'halloween_boss',
    name: 'Король Тіней',
    maxHP: 1200,
    attack: 40,
    defense: 25,
    emoji: '🎃',
    location: 'forgottenMines',
    reward: { gold: 2000, experience: 1000, crystals: 150 },
  },
};

// Тижневі події
const WEEKLY_EVENTS = [
  {
    id: 'double_gold',
    type: EVENT_TYPES.WEEKLY,
    name: 'Подвійне золото',
    description: 'Отримуйте подвійне золото за всі дії',
    bonus: { goldMultiplier: 2.0 },
    icon: '🪙',
    active: false,
  },
  {
    id: 'double_xp',
    type: EVENT_TYPES.WEEKLY,
    name: 'Подвійний досвід',
    description: 'Отримуйте подвійний досвід за всі дії',
    bonus: { xpMultiplier: 2.0 },
    icon: '⭐',
    active: false,
  },
  {
    id: 'reduced_costs',
    type: EVENT_TYPES.WEEKLY,
    name: 'Знижки в магазині',
    description: 'Всі товари в магазині на 30% дешевше',
    bonus: { shopDiscount: 0.3 },
    icon: '💰',
    active: false,
  },
];

// Святкові події
const HOLIDAY_CONFIG = {
  valentine: {
    id: 'valentine',
    name: 'День Святого Валентина',
    description: 'Спеціальний бос та подвійні нагороди',
    startMonth: 1, // February (0-indexed)
    startDay: 14,
    endMonth: 1,
    endDay: 16,
    boss: EVENT_BOSSES.valentine,
    bonus: { goldMultiplier: 1.5, xpMultiplier: 1.5 },
    icon: '💕',
  },
  newyear: {
    id: 'newyear',
    name: 'Новий Рік',
    description: 'Спеціальний бос та потрійні нагороди',
    startMonth: 11, // December
    startDay: 31,
    endMonth: 0, // January
    endDay: 2,
    boss: EVENT_BOSSES.newyear,
    bonus: { goldMultiplier: 3.0, xpMultiplier: 3.0 },
    icon: '🎊',
  },
  easter: {
    id: 'easter',
    name: 'Великдень',
    description: 'Спеціальний бос та подвійні нагороди',
    startMonth: 2, // March (approximate)
    startDay: 31,
    endMonth: 3, // April
    endDay: 2,
    boss: EVENT_BOSSES.easter,
    bonus: { goldMultiplier: 1.5, xpMultiplier: 1.5 },
    icon: '🐰',
  },
  halloween: {
    id: 'halloween',
    name: 'Хелловін',
    description: 'Спеціальний бос та подвійні нагороди',
    startMonth: 9, // October
    startDay: 31,
    endMonth: 10, // November
    endDay: 2,
    boss: EVENT_BOSSES.halloween,
    bonus: { goldMultiplier: 2.0, xpMultiplier: 2.0 },
    icon: '🎃',
  },
};

export const EventSystem = ({ isOpen, onClose, telegramId }) => {
  const { player, addGold, addExperience } = usePlayerContext();
  const { showToast } = useToast();
  const [activeEvents, setActiveEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Перевірка активних подій
  useEffect(() => {
    if (!isOpen) return;

    const checkActiveEvents = () => {
      setIsLoading(true);
      const now = new Date();
      const active = [];

      // Перевіряємо тижневі події (ротація щотижня)
      const weekNumber = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
      const weeklyEvent = WEEKLY_EVENTS[weekNumber % WEEKLY_EVENTS.length];
      if (weeklyEvent) {
        active.push({ ...weeklyEvent, active: true });
      }

      // Перевіряємо святкові події
      Object.values(HOLIDAY_CONFIG).forEach((event) => {
        const currentYear = now.getFullYear();
        let startDate = new Date(currentYear, event.startMonth, event.startDay);
        let endDate = new Date(currentYear, event.endMonth, event.endDay);

        // Handle year wrap for New Year (Dec 31 - Jan 2)
        if (event.endMonth < event.startMonth) {
          if (now.getMonth() === event.endMonth) {
            // If we are in Jan, start was last year
            startDate.setFullYear(currentYear - 1);
          } else {
            // If we are in Dec, end is next year
            endDate.setFullYear(currentYear + 1);
          }
        }

        if (now >= startDate && now <= endDate) {
          active.push({ ...event, active: true, startDate: startDate.toISOString(), endDate: endDate.toISOString() });
        }
      });

      setActiveEvents(active);
      setIsLoading(false);
    };

    checkActiveEvents();
    // Перевіряємо кожну хвилину
    const interval = setInterval(checkActiveEvents, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Експортуємо активні бонуси для використання в грі
  useEffect(() => {
    if (window.gameEvents) {
      window.gameEvents.activeEvents = activeEvents;
      window.gameEvents.getBonus = (type) => {
        let multiplier = 1.0;
        activeEvents.forEach((event) => {
          if (event.bonus) {
            if (type === 'gold' && event.bonus.goldMultiplier) {
              multiplier *= event.bonus.goldMultiplier;
            } else if (type === 'xp' && event.bonus.xpMultiplier) {
              multiplier *= event.bonus.xpMultiplier;
            }
          }
        });
        return multiplier;
      };
    } else {
      window.gameEvents = {
        activeEvents,
        getBonus: (type) => {
          let multiplier = 1.0;
          activeEvents.forEach((event) => {
            if (event.bonus) {
              if (type === 'gold' && event.bonus.goldMultiplier) {
                multiplier *= event.bonus.goldMultiplier;
              } else if (type === 'xp' && event.bonus.xpMultiplier) {
                multiplier *= event.bonus.xpMultiplier;
              }
            }
          });
          return multiplier;
        },
      };
    }
  }, [activeEvents]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-fantasy-dark modal-backdrop flex items-center justify-center">
      <div className="bg-fantasy-dark/95 border-2 border-fantasy-purple rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-fantasy-gold">🎉 Події</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Завантаження подій..." />
          </div>
        ) : (
          <>
            {activeEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg">Наразі немає активних подій</p>
                <p className="text-gray-500 text-sm mt-2">Перевірте пізніше!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{event.icon || event.boss?.emoji}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">{event.name}</h3>
                        <p className="text-gray-300 mb-4">{event.description}</p>

                        {/* Бонуси */}
                        {event.bonus && (
                          <div className="bg-fantasy-dark/50 rounded-lg p-3 mb-4">
                            <div className="text-sm font-semibold text-fantasy-gold mb-2">Активні бонуси:</div>
                            <div className="flex flex-wrap gap-2">
                              {event.bonus.goldMultiplier && (
                                <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded text-sm">
                                  🪙 Золото x{event.bonus.goldMultiplier}
                                </span>
                              )}
                              {event.bonus.xpMultiplier && (
                                <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded text-sm">
                                  ⭐ Досвід x{event.bonus.xpMultiplier}
                                </span>
                              )}
                              {event.bonus.shopDiscount && (
                                <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded text-sm">
                                  💰 Знижка {Math.round(event.bonus.shopDiscount * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Спеціальний бос */}
                        {event.boss && (
                          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{event.boss.emoji}</span>
                              <div>
                                <div className="text-lg font-bold text-white">{event.boss.name}</div>
                                <div className="text-sm text-gray-400">
                                  Локація: {event.boss.location === 'capital' ? 'Столиця' :
                                    event.boss.location === 'darkForest' ? 'Темний ліс' :
                                      'Забуті шахти'}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                              HP: {event.boss.maxHP} | Атака: {event.boss.attack} | Захист: {event.boss.defense}
                            </div>
                            <div className="flex gap-2 text-sm">
                              {event.boss.reward.gold && (
                                <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded">
                                  🪙 {event.boss.reward.gold}
                                </span>
                              )}
                              {event.boss.reward.experience && (
                                <span className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded">
                                  ⭐ {event.boss.reward.experience}
                                </span>
                              )}
                              {event.boss.reward.crystals && (
                                <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                                  💎 {event.boss.reward.crystals}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Дати події */}
                        {event.startDate && event.endDate && (
                          <div className="text-xs text-gray-400 mt-2">
                            {new Date(event.startDate).toLocaleDateString('uk-UA')} - {new Date(event.endDate).toLocaleDateString('uk-UA')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Інформація про наступні події */}
            <div className="mt-6 bg-fantasy-dark/50 border border-fantasy-purple/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-fantasy-gold mb-3">Наступні події</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div>🪙 Подвійне золото - щотижня</div>
                <div>⭐ Подвійний досвід - щотижня</div>
                <div>💰 Знижки в магазині - щотижня</div>
                <div>💕 День Святого Валентина - 14-16 лютого</div>
                <div>🎊 Новий Рік - 31 грудня - 2 січня</div>
                <div>🐰 Великдень - 31 березня - 2 квітня</div>
                <div>🎃 Хелловін - 31 жовтня - 2 листопада</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

