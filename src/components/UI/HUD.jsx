import React, { useState } from 'react';

/**
 * HUD — адаптивна нижня панель.
 * - Основні кнопки завжди видимі.
 * - Додаткові кнопки ховаються в меню "Більше".
 */
export const HUD = ({
  onOpenInventory,
  onOpenCharacter,
  onOpenChat,
  onOpenClan,
  onOpenReferral,
  onOpenLeaderboard,
  onOpenPremium,
  onOpenAdmin,
  onOpenQuest,
  onOpenAchievements,
  onOpenPvP,
  onOpenStatistics,
  onOpenEvents,
  onOpenSkills,
  onOpenCrafting,
  onOpenClanWars,
  onOpenBattlePass,
  onOpenSubscription,
  onOpenMessaging,
  onOpenDungeon,
  onOpenPolitics,
  onOpenFriends,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const btnBase = 'hud-btn min-w-[52px] flex-shrink-0 flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg border transition-all hover:scale-105 active:scale-95 focus-visible:shadow-outline h-[60px]';
  const labelClass = 'text-[10px] font-bold text-white hidden sm:block uppercase tracking-tighter';

  // Основні кнопки (завжди внизу)
  const mainButtons = [
    {
      label: 'Герой',
      onClick: onOpenCharacter,
      icon: (
        <svg className="w-6 h-6 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      className: 'bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple'
    },
    {
      label: 'Сумка',
      onClick: onOpenInventory,
      icon: (
        <svg className="w-6 h-6 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      className: 'bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple'
    },
    {
      label: 'Чат',
      onClick: onOpenChat,
      icon: (
        <svg className="w-6 h-6 text-fantasy-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      className: 'bg-fantasy-purple/20 hover:bg-fantasy-purple/40 border-fantasy-purple'
    },
    {
      label: 'Клан',
      onClick: onOpenClan,
      icon: <span className="text-2xl">🛡️</span>,
      className: 'bg-green-600/20 hover:bg-green-600/40 border-green-500'
    },
    {
      label: 'Завдання',
      onClick: onOpenQuest,
      icon: <span className="text-2xl">📜</span>,
      className: 'bg-blue-600/20 hover:bg-blue-600/40 border-blue-500'
    }
  ];

  // Додаткові кнопки (в меню)
  const secondaryButtons = [
    { label: 'Друзі', onClick: onOpenFriends, icon: '🤝', className: 'bg-lime-600/20 hover:bg-lime-600/40 border-lime-500' },
    { label: 'Пошта', onClick: onOpenMessaging, icon: '✉️', className: 'bg-gray-600/20 hover:bg-gray-600/40 border-gray-500' },
    { label: 'Війна', onClick: onOpenClanWars, icon: '🚩', className: 'bg-purple-800/20 hover:bg-purple-800/40 border-purple-700' },
    { label: 'ПвП', onClick: onOpenPvP, icon: '⚔️', className: 'bg-red-700/20 hover:bg-red-700/40 border-red-600' },
    { label: 'Данж', onClick: onOpenDungeon, icon: '🏰', className: 'bg-emerald-800/20 hover:bg-emerald-800/40 border-emerald-700' },
    { label: 'Скіли', onClick: onOpenSkills, icon: '🎯', className: 'bg-cyan-600/20 hover:bg-cyan-600/40 border-cyan-500' },
    { label: 'Крафт', onClick: onOpenCrafting, icon: '🔨', className: 'bg-orange-600/20 hover:bg-orange-600/40 border-orange-500' },
    { label: 'Події', onClick: onOpenEvents, icon: '🎉', className: 'bg-pink-600/20 hover:bg-pink-600/40 border-pink-500' },
    { label: 'Стати', onClick: onOpenStatistics, icon: '📊', className: 'bg-indigo-600/20 hover:bg-indigo-600/40 border-indigo-500' },
    { label: 'Ачівки', onClick: onOpenAchievements, icon: '⭐', className: 'bg-amber-600/20 hover:bg-amber-600/40 border-amber-500' },
    { label: 'Рада', onClick: onOpenPolitics, icon: '🏛️', className: 'bg-sky-600/20 hover:bg-sky-600/40 border-sky-500' },
    { label: 'Топ', onClick: onOpenLeaderboard, icon: '🏆', className: 'bg-yellow-600/20 hover:bg-yellow-600/40 border-yellow-500' },
    { label: 'Друзі+', onClick: onOpenReferral, icon: '🤝', className: 'bg-teal-600/20 hover:bg-teal-600/40 border-teal-500' },
    { label: 'Пас', onClick: onOpenBattlePass, icon: '🎫', className: 'bg-violet-600/20 hover:bg-violet-600/40 border-violet-500' },
    { label: 'VIP', onClick: onOpenSubscription, icon: '👑', className: 'bg-blue-400/20 hover:bg-blue-400/40 border-blue-300' },
    { label: 'Крамниця', onClick: onOpenPremium, icon: '💎', className: 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-400' },
    { label: 'Адмін', onClick: onOpenAdmin, icon: '⚙️', className: 'bg-red-600/20 hover:bg-red-600/40 border-red-500' },
  ];

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      {/* Меню "Більше" backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Меню "Більше" popup */}
      <div
        className={`fixed bottom-[calc(80px+env(safe-area-inset-bottom))] left-2 right-2 sm:left-auto sm:right-2 sm:w-96 z-50 bg-gray-900/95 border border-fantasy-purple rounded-xl p-4 shadow-2xl transition-all duration-300 transform origin-bottom-right ${isMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
          }`}
      >
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
          {secondaryButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(btn.onClick)}
              className={`${btnBase} ${btn.className} w-full`}
            >
              <span className="text-xl sm:text-2xl">{btn.icon}</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white truncate w-full text-center">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Головна панель */}
      <div
        role="toolbar"
        aria-label="Головна панель"
        className="fixed bottom-0 left-0 right-0 z-50 bg-fantasy-dark/95 backdrop-blur-md border-t-2 border-fantasy-purple/50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between gap-1 p-2 sm:p-3 overflow-x-hidden max-w-4xl mx-auto">
          {mainButtons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`${btnBase} ${btn.className} flex-1`}
            >
              <div className="flex items-center justify-center p-0.5" >{btn.icon}</div>
              <span className={labelClass}>{btn.label}</span>
            </button>
          ))}

          {/* Кнопка "Меню" */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`${btnBase} bg-gray-700/50 hover:bg-gray-700/80 border-gray-500 flex-1`}
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            <div className="flex items-center justify-center p-0.5">
              {isMenuOpen ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </div>
            <span className={labelClass}>{isMenuOpen ? 'Закрити' : 'Меню'}</span>
          </button>
        </div>
      </div>
    </>
  );
};